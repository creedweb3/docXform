'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Archive01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  Download01Icon,
  File01Icon,
  RefreshIcon,
  Shield01Icon,
  Upload04Icon,
} from '@hugeicons/core-free-icons';
import {
  convertDocumentFile,
  conversionErrorMessage,
  warmConverter,
  type ConvertedDocument,
} from '@/lib/client-document-converter';
import {
  MAX_CONVERSION_BATCH_FILES,
  MAX_CONVERSION_FILE_SIZE_LABEL,
} from '@/lib/conversion-limits';
import {
  formatBytes,
  getDynamicBatchLimitLabel,
  validateBatchSize,
  validateConversionFile,
  type ConversionMode,
} from '@/lib/client-file-validation';

type QueueStatus = 'queued' | 'converting' | 'converted' | 'failed';

interface QueuedFile {
  id: string;
  file: File;
  status: QueueStatus;
  progress: number;
  message?: string;
  error?: string;
  output?: ConvertedDocument;
}

interface DocumentConverterProps {
  mode: ConversionMode;
}

interface DuplicatePrompt {
  files: File[];
  message: string;
}

type NoticeKind = 'success' | 'info' | 'error';

interface NoticeState {
  message: string;
  kind: NoticeKind;
  autoClear: boolean;
  transient: boolean;
}

interface ShowNoticeOptions {
  kind?: NoticeKind;
  autoClear?: boolean;
  duration?: number;
  transient?: boolean;
}

type WarmState = 'idle' | 'warming' | 'ready' | 'failed';

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 };
const TRANSIENT_NOTICE_DURATION = 1600;
const DEFAULT_NOTICE_DURATION = 3500;

const converterConfig = {
  'word-to-pdf': {
    accept: '.docx,.doc',
    title: 'Drop your Word files here',
    hint: `or click to browse - .docx .doc - max ${MAX_CONVERSION_BATCH_FILES} files`,
    queuedTitle: 'Word files ready',
    outputFormat: 'pdf' as const,
    outputLabel: 'PDF',
    zipName: 'converted-pdfs.zip',
    cardClass: 'converter-main-card-blue',
    iconBoxClass: 'icon-box-blue',
    iconClass: 'text-blue-500',
    dragClass: 'ring-2 ring-blue-300/50 bg-blue-50/60 scale-[1.01]',
    primaryButtonClass: 'from-blue-600 to-blue-500',
    progressClass: 'from-blue-400 to-cyan-400',
    linkClass: 'text-blue-600 hover:text-blue-700',
    chipClass: 'border-blue-200/70 bg-white/65',
  },
  'pdf-to-word': {
    accept: '.pdf',
    title: 'Drop your PDF files here',
    hint: `or click to browse - .pdf - max ${MAX_CONVERSION_BATCH_FILES} files`,
    queuedTitle: 'PDF files ready',
    outputFormat: 'docx' as const,
    outputLabel: 'DOCX',
    zipName: 'converted-documents.zip',
    cardClass: 'converter-main-card-rose',
    iconBoxClass: 'icon-box-rose',
    iconClass: 'text-rose-400',
    dragClass: 'ring-2 ring-rose-300/50 bg-rose-50/60 scale-[1.01]',
    primaryButtonClass: 'from-rose-600 to-rose-500',
    progressClass: 'from-rose-400 to-pink-400',
    linkClass: 'text-rose-600 hover:text-rose-700',
    chipClass: 'border-rose-200/70 bg-white/65',
  },
} satisfies Record<ConversionMode, Record<string, string> & {
  outputFormat: 'pdf' | 'docx';
}>;

function createQueuedFile(file: File, id: string): QueuedFile {
  return {
    id,
    file,
    status: 'queued',
    progress: 0,
  };
}

function statusLabel(file: QueuedFile) {
  if (file.status === 'converted') return 'Converted';
  if (file.status === 'converting') return file.message || 'Converting';
  if (file.status === 'failed') return 'Failed';
  return 'Queued';
}

function summarizeMessages(messages: string[]) {
  if (messages.length === 0) return '';
  if (messages.length === 1) return messages[0];
  return `${messages[0]} ${messages.length - 1} more issue${messages.length > 2 ? 's' : ''} skipped.`;
}

function duplicateMessage(files: File[]) {
  const names = Array.from(new Set(files.map((file) => file.name)));

  if (names.length === 1) {
    return `${names[0]} is already in the queue. Add it again or skip the duplicate?`;
  }

  const preview = names.slice(0, 2).join(', ');
  const extra = names.length > 2 ? ` and ${names.length - 2} more` : '';
  return `${preview}${extra} are already in the queue. Add them again or skip the duplicates?`;
}

function selectedFilesLabel(fileCount: number) {
  return `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;
}

function converterStatusLabel(state: WarmState) {
  if (state === 'ready') return 'Converter ready';
  if (state === 'failed') return 'Service unavailable';
  if (state === 'warming') return 'Preparing converter';
  return 'Ready on demand';
}

export function DocumentConverter({ mode }: DocumentConverterProps) {
  const config = converterConfig[mode];
  const [items, setItems] = useState<QueuedFile[]>([]);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);
  const [warmMessage, setWarmMessage] = useState('');
  const [warmState, setWarmState] = useState<WarmState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileIdRef = useRef(0);
  const warmStartedRef = useRef(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalBytes = useMemo(
    () => items.reduce((total, item) => total + item.file.size, 0),
    [items]
  );
  const convertedItems = items.filter((item) => item.output);
  const pendingCount = items.filter(
    (item) => item.status === 'queued' || item.status === 'failed'
  ).length;
  const busy = isValidating || isConverting;
  const canConvert = pendingCount > 0 && !busy;
  const isBulkDownload = convertedItems.length > 1;
  const hasQueuedItems = items.length > 0;
  const visibleConverterStatus = converterStatusLabel(warmState);
  const converterReady = warmState === 'ready';
  const warmPreloadFailed = warmState === 'failed';
  const showChips = hasQueuedItems && !notice?.transient;
  const noticeKind = isValidating ? 'info' : notice?.kind ?? 'info';
  const noticeToneClass =
    noticeKind === 'error'
      ? 'border-red-200/80 bg-red-50/90 text-red-700'
      : `${config.chipClass} text-muted-foreground`;
  const noticeIconClass = noticeKind === 'error' ? 'text-red-500' : config.iconClass;

  const resetInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const showNotice = useCallback((message: string, options: ShowNoticeOptions = {}) => {
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }

    if (!message) {
      setNotice(null);
      return;
    }

    const autoClear = options.autoClear ?? false;
    const transient = options.transient ?? false;

    setNotice({
      message,
      kind: options.kind ?? 'info',
      autoClear,
      transient,
    });

    if (autoClear) {
      noticeTimerRef.current = setTimeout(() => {
        setNotice(null);
        noticeTimerRef.current = null;
      }, options.duration ?? (transient ? TRANSIENT_NOTICE_DURATION : DEFAULT_NOTICE_DURATION));
    }
  }, []);

  const startWarmConverter = useCallback(() => {
    if (warmStartedRef.current) return;

    warmStartedRef.current = true;
    setWarmState('warming');
    setWarmMessage('Preparing converter in the background...');

    void warmConverter(({ message }) => {
      setWarmMessage(message);
    })
      .then(() => {
        setWarmState('ready');
        setWarmMessage('Converter ready');
      })
      .catch((err) => {
        warmStartedRef.current = false;
        console.error('[DocXform] Converter warm-up failed:', err);
        setWarmState('failed');
        setWarmMessage('Converter warm-up unavailable');
        showNotice(conversionErrorMessage(err), { kind: 'error' });
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const warm = () => {
      if (!cancelled) startWarmConverter();
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 1800 });
    } else {
      fallbackTimer = setTimeout(warm, 500);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [startWarmConverter]);

  const addFilesFromArray = useCallback(
    async (incoming: File[], allowDuplicateNames = false) => {
      if (busy) {
        showNotice('Wait for the current validation or conversion to finish before adding more files.');
        resetInput();
        return;
      }

      if (incoming.length === 0) return;

      const remainingSlots = MAX_CONVERSION_BATCH_FILES - items.length;
      const messages: string[] = [];

      if (remainingSlots <= 0) {
        showNotice(`You can queue up to ${MAX_CONVERSION_BATCH_FILES} files at a time.`, {
          kind: 'error',
        });
        resetInput();
        return;
      }

      const candidates = incoming.slice(0, remainingSlots);
      if (incoming.length > remainingSlots) {
        messages.push(
          `Only ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'} can be added.`
        );
      }

      setIsValidating(true);

      const accepted: QueuedFile[] = [];
      const duplicateFiles: File[] = [];
      const queuedNames = new Set(
        items.map((item) => item.file.name.trim().toLowerCase())
      );

      for (const file of candidates) {
        const result = await validateConversionFile(file, mode);
        if (!result.ok) {
          messages.push(result.message ?? `${file.name} could not be validated.`);
          continue;
        }

        const normalizedName = file.name.trim().toLowerCase();
        if (!allowDuplicateNames && queuedNames.has(normalizedName)) {
          duplicateFiles.push(file);
          continue;
        }

        queuedNames.add(normalizedName);
        fileIdRef.current += 1;
        accepted.push(createQueuedFile(file, `${Date.now()}-${fileIdRef.current}`));
      }

      setIsValidating(false);

      if (duplicateFiles.length > 0) {
        setDuplicatePrompt({
          files: duplicateFiles,
          message: duplicateMessage(duplicateFiles),
        });
      } else {
        setDuplicatePrompt(null);
      }

      if (accepted.length === 0) {
        showNotice(
          summarizeMessages(messages) ||
            (duplicateFiles.length > 0 ? '' : 'No supported files were added.'),
          { kind: 'error' }
        );
        resetInput();
        return;
      }

      const nextCount = items.length + accepted.length;
      const nextTotalBytes =
        totalBytes + accepted.reduce((total, item) => total + item.file.size, 0);
      const batchValidation = validateBatchSize(nextCount, nextTotalBytes);

      if (!batchValidation.ok) {
        showNotice(batchValidation.message ?? 'This batch is too large.', {
          kind: 'error',
        });
        resetInput();
        return;
      }

      const addedLabel = `${accepted.length} file${accepted.length === 1 ? '' : 's'} added`;
      const issueSummary = summarizeMessages(messages);

      setItems((current) => [...current, ...accepted]);
      showNotice(
        issueSummary ? `${addedLabel}. ${issueSummary}` : addedLabel,
        issueSummary
          ? { kind: 'info', autoClear: true }
          : { kind: 'success', autoClear: true, transient: true }
      );
      resetInput();
      startWarmConverter();
    },
    [busy, items, mode, resetInput, showNotice, startWarmConverter, totalBytes]
  );

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;

      const incoming: File[] = [];
      for (let index = 0; index < fileList.length; index++) {
        const file = fileList.item(index);
        if (file) incoming.push(file);
      }

      await addFilesFromArray(incoming);
    },
    [addFilesFromArray]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      void addFiles(event.dataTransfer.files);
    },
    [addFiles]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      void addFiles(event.target.files);
    },
    [addFiles]
  );

  const handleRemove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const handleClear = useCallback(() => {
    setItems([]);
    setDuplicatePrompt(null);
    showNotice('');
    resetInput();
  }, [resetInput, showNotice]);

  const handleSkipDuplicates = useCallback(() => {
    const count = duplicatePrompt?.files.length ?? 0;
    setDuplicatePrompt(null);
    showNotice(
      count > 0
        ? `${count} duplicate ${count === 1 ? 'file' : 'files'} skipped`
        : '',
      { kind: 'success', autoClear: true, transient: true }
    );
  }, [duplicatePrompt?.files.length, showNotice]);

  const handleAddDuplicates = useCallback(() => {
    const files = duplicatePrompt?.files ?? [];
    setDuplicatePrompt(null);
    void addFilesFromArray(files, true);
  }, [addFilesFromArray, duplicatePrompt?.files]);

  const handleConvert = useCallback(async () => {
    if (!canConvert) return;

    const targets = items.filter(
      (item) => item.status === 'queued' || item.status === 'failed'
    );

    if (targets.length === 0) return;

    setIsConverting(true);
    showNotice('');

    for (const target of targets) {
      setItems((current) =>
        current.map((item) =>
          item.id === target.id
            ? {
                ...item,
                status: 'converting',
                progress: 0,
                message: 'Preparing document...',
                error: undefined,
                output: undefined,
              }
            : item
        )
      );

      try {
        const converted = await convertDocumentFile(
          target.file,
          config.outputFormat,
          ({ percent, message }) => {
            setItems((current) =>
              current.map((item) =>
                item.id === target.id
                  ? {
                      ...item,
                      progress: Math.min(99, percent),
                      message,
                    }
                  : item
              )
            );
          }
        );

        setItems((current) =>
          current.map((item) =>
            item.id === target.id
              ? {
                  ...item,
                  status: 'converted',
                  progress: 100,
                  message: 'Conversion complete',
                  output: converted,
                }
              : item
          )
        );
      } catch (error) {
        setItems((current) =>
          current.map((item) =>
            item.id === target.id
              ? {
                  ...item,
                  status: 'failed',
                  progress: 0,
                  message: undefined,
                  error: conversionErrorMessage(error),
                }
              : item
          )
        );
      }
    }

    setIsConverting(false);
  }, [canConvert, config.outputFormat, items, showNotice]);

  const handleDownloadSingle = useCallback((file: ConvertedDocument) => {
    const url = URL.createObjectURL(file.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (convertedItems.length === 0) return;

    if (convertedItems.length === 1 && convertedItems[0].output) {
      handleDownloadSingle(convertedItems[0].output);
      return;
    }

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    convertedItems.forEach((item) => {
      if (item.output) {
        zip.file(item.output.name, item.output.blob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = config.zipName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [config.zipName, convertedItems, handleDownloadSingle]);

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div
          className={`${config.cardClass} rounded-3xl p-7 sm:p-8 transition-all duration-300 ${
            dragOver ? config.dragClass : ''
          } ${busy ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
          onDragOver={(event) => {
            event.preventDefault();
            startWarmConverter();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onPointerEnter={startWarmConverter}
          onTouchStart={startWarmConverter}
          onClick={() => {
            startWarmConverter();
            if (!busy) inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={config.accept}
            multiple
            onChange={handleInputChange}
            className="hidden"
            disabled={busy}
          />
          <div className="flex flex-col items-center gap-5">
            <motion.div
              className={`w-14 h-14 rounded-2xl ${config.iconBoxClass} flex items-center justify-center`}
              animate={dragOver ? { scale: 1.08 } : { scale: 1 }}
              transition={spring}
            >
              <HugeiconsIcon icon={Upload04Icon} size={24} strokeWidth={1.5} className={config.iconClass} />
            </motion.div>
            <div className="text-center space-y-1.5">
              <h2 className="text-base font-semibold text-foreground">{config.title}</h2>
              <p className="text-xs text-muted-foreground">{config.hint}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 border border-border/30">
                <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                Never uploaded to any server
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 border border-border/30">
                {MAX_CONVERSION_FILE_SIZE_LABEL} per file
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {(notice || isValidating || duplicatePrompt) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex justify-center px-2 py-0.5"
          >
            {duplicatePrompt ? (
              <div className={`flex w-fit max-w-full flex-col gap-3 rounded-2xl border px-4 py-3 text-xs text-muted-foreground shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between ${config.chipClass}`}>
                <p className="leading-relaxed">{duplicatePrompt.message}</p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleSkipDuplicates}
                    className="rounded-lg border border-border/40 bg-white/60 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-white/80"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDuplicates}
                    className={`rounded-lg bg-gradient-to-br ${config.primaryButtonClass} px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90`}
                  >
                    Add again
                  </button>
                </div>
              </div>
            ) : isValidating ? (
              <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] shadow-sm backdrop-blur-md ${noticeToneClass}`}>
                <HugeiconsIcon icon={RefreshIcon} size={12} strokeWidth={2} className={`${noticeIconClass} animate-spin`} />
                Checking file type and size before conversion...
              </span>
            ) : (
              <span className={`inline-flex max-w-full items-center justify-center gap-1.5 border px-3 py-1.5 text-center text-[11px] leading-relaxed shadow-sm backdrop-blur-md ${notice?.transient ? 'rounded-full' : 'rounded-2xl'} ${noticeToneClass}`}>
                {notice?.kind === 'success' && (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} className={noticeIconClass} />
                )}
                {notice?.message}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChips && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-2 py-0.5"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                <HugeiconsIcon
                  icon={converterReady ? CheckmarkCircle01Icon : RefreshIcon}
                  size={12}
                  strokeWidth={2}
                  className={`${config.iconClass} ${converterReady || warmPreloadFailed ? '' : 'animate-spin'}`}
                />
                {visibleConverterStatus}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                <HugeiconsIcon icon={File01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                {items.length} / {MAX_CONVERSION_BATCH_FILES} files
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                {formatBytes(totalBytes)} selected
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                Private local conversion
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="glass rounded-3xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{config.queuedTitle}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                Queue: {items.length} of {MAX_CONVERSION_BATCH_FILES} files. Selected total: {formatBytes(totalBytes)} / {getDynamicBatchLimitLabel(items.length)} allowed for these {selectedFilesLabel(items.length)}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy || items.length >= MAX_CONVERSION_BATCH_FILES}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-white/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
                Add files
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={busy}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-white/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                Clear all
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/35 bg-white/55 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-9 w-9 shrink-0 rounded-xl ${config.iconBoxClass} flex items-center justify-center`}>
                    <HugeiconsIcon
                      icon={item.status === 'converted' ? CheckmarkCircle01Icon : item.status === 'converting' ? RefreshIcon : File01Icon}
                      size={17}
                      strokeWidth={1.7}
                      className={`${config.iconClass} ${item.status === 'converting' ? 'animate-spin' : ''}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatBytes(item.file.size)} - {statusLabel(item)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {item.output && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item.output as ConvertedDocument)}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${config.linkClass}`}
                          >
                            <HugeiconsIcon icon={Download01Icon} size={12} strokeWidth={2} />
                            Download
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={busy}
                          aria-label={`Remove ${item.file.name}`}
                          className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    {item.status === 'converting' && (
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${config.progressClass}`}
                          animate={{ width: `${Math.min(item.progress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    {item.error && (
                      <p className="mt-2 text-[11px] leading-relaxed text-rose-600">
                        {item.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleConvert()}
              disabled={!canConvert}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${config.primaryButtonClass} px-4 py-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45`}
            >
              <HugeiconsIcon icon={isConverting ? RefreshIcon : File01Icon} size={15} strokeWidth={2} className={isConverting ? 'animate-spin' : ''} />
              {isConverting
                ? 'Converting...'
                : pendingCount > 0
                  ? `Convert ${pendingCount} ${pendingCount === 1 ? 'file' : 'files'}`
                  : 'All files converted'}
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadAll()}
              disabled={convertedItems.length === 0 || isConverting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/40 bg-white/60 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <HugeiconsIcon icon={isBulkDownload ? Archive01Icon : Download01Icon} size={15} strokeWidth={2} />
              {isBulkDownload ? 'Download converted ZIP' : `Download ${config.outputLabel}`}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
