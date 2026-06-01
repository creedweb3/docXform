'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, DragEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  isConverterSessionReady,
  warmConverter,
  type ConvertedDocument,
} from '@/lib/client-document-converter';
import {
  MAX_CONVERSION_BATCH_FILES,
  MAX_CONVERSION_FILE_SIZE_LABEL,
} from '@/lib/conversion-limits';
import {
  WORKSPACE_CTA_IDLE,
  WORKSPACE_CTA_PRIMARY,
  WORKSPACE_CTA_SECONDARY,
  WORKSPACE_TOOLBAR_BTN,
} from '@/lib/site-design';
import {
  formatBytes,
  getDynamicBatchLimitLabel,
  validateBatchSize,
  validateConversionFile,
  type ConversionMode,
} from '@/lib/client-file-validation';
import type { QueuedFile } from '@/lib/converter-queue-types';
import { useConverterQueue } from '@/components/converter-queue-provider';
import {
  debugLogEligibility,
  getConverterEligibility,
  subscribeConnectionEligibilityInvalidation,
} from '@/lib/converter-eligibility';
import { getCachedPerfProfile, getMotionBudget, getWarmScheduling } from '@/lib/perf-profile';
import { reportConverterMetric } from '@/lib/converter-metrics-client';
import clsx from 'clsx';
import { flagshipConverterTheme } from '@/components/tools/tool-theme';
import { ConversionFlowStudioGrid } from '@/components/tools/studio/conversion-flow-studio-grid';
import { FlowBatchPreview } from '@/components/tools/studio/flow-batch-preview';
import {
  STUDIO_FLOW_CTA_STRETCH_COL,
  STUDIO_FLOW_QUEUE_ROW,
  STUDIO_FLOW_QUEUE_ROW_SELECTED,
  StudioFlowAsideLayout,
  StudioFlowCtaRow,
  StudioFlowDuplicatePrompt,
  StudioFlowRailHeader,
  StudioFlowRailToolbar,
} from '@/components/tools/studio/studio-flow-chrome';
import { StudioScrollArea } from '@/components/tools/studio/studio-ui';
import { useWorkspaceConversionFlow } from '@/components/tools/use-workspace-conversion-flow';

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

type WarmState = 'idle' | 'warming' | 'ready' | 'failed' | 'deferred';

/** Brief flash for “N files added” / duplicate skipped */
const TRANSIENT_NOTICE_DURATION = 900;
const DEFAULT_NOTICE_DURATION = 3500;
/** Only enable list scrolling (and scrollbar width sync) after this many files. */
const QUEUE_SCROLL_AFTER_FILE_COUNT = 6;

/** Disabled download-slot copy before conversion; one line picked at random after mount (client-only). */
const DOWNLOAD_IDLE_HINTS = [
  'Almost there • hit Convert',
  'Ready when you are',
  'One tap away',
] as const;

const converterConfig = {
  'word-to-pdf': {
    accept: '.docx,.doc',
    title: 'Drop your Word files here',
    hint: `or click to browse - .docx .doc - max ${MAX_CONVERSION_BATCH_FILES} files`,
    queuedTitle: 'Word files ready',
    outputFormat: 'pdf' as const,
    outputLabel: 'PDF',
    zipName: 'converted-pdfs.zip',
    ...flagshipConverterTheme('word-to-pdf'),
  },
  'pdf-to-word': {
    accept: '.pdf',
    title: 'Drop your PDF files here',
    hint: `or click to browse - .pdf - max ${MAX_CONVERSION_BATCH_FILES} files`,
    queuedTitle: 'PDF files ready',
    outputFormat: 'docx' as const,
    outputLabel: 'DOCX',
    zipName: 'converted-documents.zip',
    ...flagshipConverterTheme('pdf-to-word'),
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
  if (state === 'deferred') return 'Loads when you convert';
  return 'Ready on demand';
}

export function DocumentConverter({ mode }: DocumentConverterProps) {
  const config = converterConfig[mode];
  const reducedMotion = useReducedMotion();
  const perfProfile = useMemo(() => getCachedPerfProfile(), []);
  const { spring, chipMotion, rowExpand } = useMemo(
    () => getMotionBudget(perfProfile, Boolean(reducedMotion)),
    [perfProfile, reducedMotion]
  );
  const [items, setItems] = useConverterQueue(mode);
  const downloadIdleHintRollRef = useRef(false);
  const [downloadSecondaryIdleHint, setDownloadSecondaryIdleHint] = useState<
    (typeof DOWNLOAD_IDLE_HINTS)[number]
  >(DOWNLOAD_IDLE_HINTS[0]);
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
  const queueListScrollRef = useRef<HTMLDivElement>(null);
  const [queueScrollbarPadPx, setQueueScrollbarPadPx] = useState(0);
  const [focusedFileId, setFocusedFileId] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!isConverterSessionReady()) return;
    // Defer to next microtask to avoid setState during render of layout effect
    queueMicrotask(() => {
      setWarmState('ready');
      setWarmMessage('Converter ready');
      warmStartedRef.current = true;
    });
  }, []);

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
  const warmDeferred = warmState === 'deferred';
  const showQueueStatusRow = hasQueuedItems;
  const inlineTransientSuccess =
    Boolean(
      notice?.transient &&
        notice.kind === 'success' &&
        hasQueuedItems &&
        notice.message
    );
  const showTopNoticeRow =
    isValidating || (notice && (!notice.transient || !hasQueuedItems));
  const queueListUsesScrollRegion = items.length > QUEUE_SCROLL_AFTER_FILE_COUNT;
  const noticeKind = isValidating ? 'info' : notice?.kind ?? 'info';
  const noticeToneClass =
    noticeKind === 'error'
      ? 'border-red-500/35 bg-red-500/10 text-red-300'
      : `${config.chipClass} text-muted-foreground`;
  const noticeIconClass = noticeKind === 'error' ? 'text-red-400' : config.iconClass;

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
        reportConverterMetric({ event: 'warm_ready', mode });
      })
      .catch((err) => {
        warmStartedRef.current = false;
        console.error('[docXform] Converter warm-up failed:', err);
        setWarmState('failed');
        setWarmMessage('Converter warm-up unavailable');
        reportConverterMetric({
          event: 'warm_failed',
          mode,
          detail: conversionErrorMessage(err).slice(0, 500),
        });
        showNotice(conversionErrorMessage(err), { kind: 'error' });
      });
  }, [mode, showNotice]);

  useEffect(() => {
    subscribeConnectionEligibilityInvalidation();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    let idleId: number | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const runDecisionAndMaybeWarm = () => {
      if (cancelled) return;
      if (isConverterSessionReady()) {
        setWarmState('ready');
        setWarmMessage('Converter ready');
        warmStartedRef.current = true;
        return;
      }
      void (async () => {
        try {
          const eligibility = await getConverterEligibility();
          debugLogEligibility(eligibility);
          if (cancelled) return;
          if (!eligibility.autoPreload) {
            setWarmState('deferred');
            setWarmMessage(
              'Converter will load when you tap Convert — estimated wait is long on this connection or device.'
            );
            reportConverterMetric({ event: 'warm_deferred', mode });
            return;
          }
          startWarmConverter();
        } catch {
          if (!cancelled) startWarmConverter();
        }
      })();
    };

    const scheduleIdle = () => {
      const { idleTimeoutMs, fallbackMs } = getWarmScheduling(getCachedPerfProfile());
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(runDecisionAndMaybeWarm, { timeout: idleTimeoutMs });
      } else {
        fallbackTimer = globalThis.setTimeout(runDecisionAndMaybeWarm, fallbackMs);
      }
    };

    const onLoad = () => {
      if (!cancelled) scheduleIdle();
    };

    if (document.readyState === 'complete') {
      scheduleIdle();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', onLoad);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [mode, startWarmConverter]);

  useEffect(() => {
    if (downloadIdleHintRollRef.current) return;
    downloadIdleHintRollRef.current = true;
    const index = Math.floor(Math.random() * DOWNLOAD_IDLE_HINTS.length);
    setDownloadSecondaryIdleHint(DOWNLOAD_IDLE_HINTS[index]);
  }, []);

  useLayoutEffect(() => {
    const el = queueListScrollRef.current;
    if (!el || !queueListUsesScrollRegion) {
      setQueueScrollbarPadPx(0);
      return;
    }

    const update = () => {
      setQueueScrollbarPadPx(Math.max(0, el.offsetWidth - el.clientWidth));
    };

    update();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [queueListUsesScrollRegion, items]);

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
    [busy, items, mode, resetInput, setItems, showNotice, startWarmConverter, totalBytes]
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

  const handleRemove = useCallback(
    (id: string) => {
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const handleClear = useCallback(() => {
    setItems([]);
    setDuplicatePrompt(null);
    showNotice('');
    resetInput();
  }, [resetInput, setItems, showNotice]);

  const handleSkipDuplicates = useCallback(() => {
    const count = duplicatePrompt?.files.length ?? 0;
    setDuplicatePrompt(null);
    showNotice(
      count > 0 ? `${count} duplicate ${count === 1 ? 'file' : 'files'} skipped` : '',
      { kind: 'success', autoClear: true, transient: true }
    );
  }, [duplicatePrompt?.files, showNotice]);

  const handleAddDuplicates = useCallback(() => {
    const files = duplicatePrompt?.files ?? [];
    setDuplicatePrompt(null);
    void addFilesFromArray(files, true);
  }, [addFilesFromArray, duplicatePrompt?.files]);

  const runConversionForTargets = useCallback(
    async (queueSnapshot: QueuedFile[]) => {
      const targets = queueSnapshot.filter(
        (item) => item.status === 'queued' || item.status === 'failed'
      );

      if (targets.length === 0) return;

      setIsConverting(true);
      showNotice('');

      try {
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
            reportConverterMetric({ event: 'convert_success', mode, count: 1 });
          } catch (error) {
            const msg = conversionErrorMessage(error);
            reportConverterMetric({ event: 'convert_fail', mode, detail: msg.slice(0, 500) });
            setItems((current) =>
              current.map((item) =>
                item.id === target.id
                  ? {
                      ...item,
                      status: 'failed',
                      progress: 0,
                      message: undefined,
                      error: msg,
                    }
                  : item
              )
            );
          }
        }
      } finally {
        setIsConverting(false);
      }
    },
    [config.outputFormat, mode, showNotice, setItems]
  );

  const handleConvert = useCallback(async () => {
    if (!canConvert) return;
    await runConversionForTargets(items);
  }, [canConvert, items, runConversionForTargets]);

  const allConvertedSuccessfully =
    items.length > 0 && items.every((item) => item.status === 'converted');
  const downloadPrimary = allConvertedSuccessfully && !isConverting;
  const hasConvertedOutput = convertedItems.length > 0;
  const downloadReady = hasConvertedOutput && !isConverting;
  const primaryCtaClass = `flex w-full ${WORKSPACE_CTA_PRIMARY}`;
  const secondaryCtaClass = `flex w-full ${WORKSPACE_CTA_SECONDARY}`;
  const downloadIdleCtaClass = `flex w-full ${WORKSPACE_CTA_IDLE}`;
  const flowPrimaryCtaClass = `${STUDIO_FLOW_CTA_STRETCH_COL} ${WORKSPACE_CTA_PRIMARY}`;
  const flowSecondaryCtaClass = `${STUDIO_FLOW_CTA_STRETCH_COL} ${WORKSPACE_CTA_SECONDARY}`;
  const flowDownloadIdleCtaClass = `${STUDIO_FLOW_CTA_STRETCH_COL} ${WORKSPACE_CTA_IDLE}`;

  const handleDownloadSingle = useCallback((file: ConvertedDocument) => {
    reportConverterMetric({ event: 'download', mode, count: 1 });
    const url = URL.createObjectURL(file.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [mode]);

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
    reportConverterMetric({ event: 'download', mode, count: convertedItems.length });
    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = config.zipName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [config.zipName, convertedItems, handleDownloadSingle, mode]);

  const flowFiles = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        file: item.file,
        status:
          item.status === 'converted'
            ? 'done'
            : item.status === 'converting'
              ? 'processing'
              : item.status === 'failed'
                ? 'failed'
                : 'ready',
        message: item.message,
        outputs: item.output
          ? [{ name: item.output.name, blob: item.output.blob }]
          : undefined,
      })),
    [items]
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const { flowActive, stage: flowStage, showPick, showStudio, showOutput } =
    useWorkspaceConversionFlow({
      files: flowFiles,
      allDone: allConvertedSuccessfully,
      hasOutputs: convertedItems.length > 0,
      busy: isConverting,
      outputLabel: config.outputLabel,
      zipName: config.zipName,
      isBulkDownload: convertedItems.length > 1,
      onDownloadAll: handleDownloadAll,
      onDownloadFile: (output) =>
        handleDownloadSingle({
          name: output.name,
          blob: output.blob,
          originalName: output.name,
        }),
      onReset: handleClear,
      allowAddMoreFiles: true,
      onOpenFilePicker: openFilePicker,
      duplicatePrompt: duplicatePrompt ? { message: duplicatePrompt.message } : null,
      onSkipDuplicates: handleSkipDuplicates,
      onAddDuplicates: handleAddDuplicates,
    });

  const inFlowStudio = flowActive && flowStage === 'studio';

  useEffect(() => {
    if (!inFlowStudio) return;
    if (!items.length) {
      setFocusedFileId(null);
      return;
    }
    if (!focusedFileId || !items.some((item) => item.id === focusedFileId)) {
      setFocusedFileId(items[0].id);
    }
  }, [items, focusedFileId, inFlowStudio]);

  const renderDropZone = !flowActive || showPick;
  const renderStudioBlock = flowActive ? items.length > 0 && !showPick : items.length > 0;
  const showFlowPickChrome = !inFlowStudio;
  const isFlowStudioView = inFlowStudio;

  if (showOutput) {
    return (
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={isConverting}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={clsx(
        'w-full',
        flowActive && 'flex h-full min-h-0 flex-col',
        inFlowStudio && 'min-h-0 overflow-hidden',
        !flowActive && 'space-y-4'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={busy}
        aria-hidden
      />
      {renderDropZone ? (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className={clsx(flowActive && showPick && 'flex min-h-0 flex-1 flex-col')}
      >
        <div
          className={clsx(
            `${config.cardClass} rounded-sm transition-all duration-300`,
            flowActive &&
              flowStage === 'pick' &&
              'conversion-flow-drop-target flex min-h-0 flex-1 flex-col justify-center border border-[hsl(var(--brand-copper)/0.14)] bg-black/30 p-6 sm:p-8',
            (!flowActive || flowStage !== 'pick') && 'p-7 sm:p-8',
            dragOver && config.dragClass,
            isConverting ? 'cursor-default opacity-85' : 'cursor-pointer'
          )}
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
          <div className="flex flex-col items-center gap-5">
            <motion.div
              className={`w-14 h-14 rounded-sm ${config.iconBoxClass} flex items-center justify-center`}
              animate={dragOver ? { scale: 1.08 } : { scale: 1 }}
              transition={spring}
            >
              <HugeiconsIcon icon={Upload04Icon} size={24} strokeWidth={1.5} className={config.iconClass} />
            </motion.div>
            <div className="text-center space-y-1.5">
              <h2 className="text-base font-medium text-foreground">{config.title}</h2>
              <p className="text-xs text-muted-foreground">{config.hint}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border/70 bg-card/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]">
                <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                Never uploaded to any server
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border/70 bg-card/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]">
                {MAX_CONVERSION_FILE_SIZE_LABEL} per file
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      ) : null}

      <AnimatePresence>
        {showTopNoticeRow && !flowActive && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={chipMotion}
            className="flex justify-center px-2 py-0.5"
          >
            {isValidating ? (
              <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] shadow-sm backdrop-blur-md ${noticeToneClass}`}>
                <HugeiconsIcon icon={RefreshIcon} size={12} strokeWidth={2} className={`${noticeIconClass} animate-spin`} />
                Checking file type and size before conversion...
              </span>
            ) : (
              <span className={`inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-center text-[11px] leading-snug shadow-sm backdrop-blur-md ${noticeToneClass}`}>
                {notice?.kind === 'success' && (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} className={noticeIconClass} />
                )}
                {notice?.message}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {showQueueStatusRow && showFlowPickChrome && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={chipMotion}
            className="px-2 py-0.5"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <AnimatePresence mode="popLayout">
                {inlineTransientSuccess && notice && (
                  <motion.span
                    key={notice.message}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={chipMotion}
                    className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass} text-muted-foreground`}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} className={noticeIconClass} />
                    {notice.message}
                  </motion.span>
                )}
              </AnimatePresence>
                <motion.span layout className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                <HugeiconsIcon
                  icon={converterReady ? CheckmarkCircle01Icon : warmDeferred ? File01Icon : RefreshIcon}
                  size={12}
                  strokeWidth={2}
                  className={`${config.iconClass} ${converterReady || warmPreloadFailed || warmDeferred ? '' : 'animate-spin'}`}
                />
                {visibleConverterStatus}
              </motion.span>
              <motion.span layout className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                <HugeiconsIcon icon={File01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                {items.length} / {MAX_CONVERSION_BATCH_FILES} files
              </motion.span>
              <motion.span layout className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                {formatBytes(totalBytes)} selected
              </motion.span>
              <motion.span layout className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${config.chipClass}`}>
                <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                Private local conversion
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {duplicatePrompt && !isFlowStudioView ? (
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={chipMotion}
            className="flex justify-center px-2 py-0.5"
          >
            <StudioFlowDuplicatePrompt
              className="max-w-2xl"
              message={duplicatePrompt.message}
              onSkip={handleSkipDuplicates}
              onAddAgain={handleAddDuplicates}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {renderStudioBlock ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className={clsx(
            'relative z-0 flex min-h-0 w-full flex-col',
            isFlowStudioView
              ? 'h-full min-h-0 flex-1 gap-0 overflow-hidden bg-transparent p-0'
              : clsx(
                  'gap-3 rounded-sm border border-[hsl(var(--brand-copper)/0.18)] bg-black/30 p-5 sm:p-6',
                  flowActive && 'h-full min-h-0 flex-1'
                )
          )}
        >
          {isFlowStudioView ? (
            <ConversionFlowStudioGrid
              preview={
                <FlowBatchPreview
                  title="File preview"
                  topBanner={
                    duplicatePrompt ? (
                      <StudioFlowDuplicatePrompt
                        message={duplicatePrompt.message}
                        onSkip={handleSkipDuplicates}
                        onAddAgain={handleAddDuplicates}
                      />
                    ) : undefined
                  }
                  items={items.map((item, index) => ({
                    id: item.id,
                    name: item.file.name,
                    index,
                    meta: formatBytes(item.file.size),
                  }))}
                  iconBoxClass={config.iconBoxClass}
                  iconClass={config.iconClass}
                  showIndex={items.length > 1}
                  selectedId={focusedFileId}
                  onSelect={setFocusedFileId}
                />
              }
              aside={
                <StudioFlowAsideLayout
                  header={
                    <StudioFlowRailHeader
                      meta={
                        <>
                          {items.length} / {MAX_CONVERSION_BATCH_FILES} files · {formatBytes(totalBytes)}
                        </>
                      }
                      actions={
                        <StudioFlowRailToolbar>
                          <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={busy || items.length >= MAX_CONVERSION_BATCH_FILES}
                            className={WORKSPACE_TOOLBAR_BTN}
                          >
                            <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
                            Add files
                          </button>
                          <button
                            type="button"
                            onClick={handleClear}
                            disabled={busy}
                            className={WORKSPACE_TOOLBAR_BTN}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                            Clear all
                          </button>
                        </StudioFlowRailToolbar>
                      }
                    />
                  }
                  footer={
                    <StudioFlowCtaRow>
                      <button
                        type="button"
                        onClick={() => {
                          if (allConvertedSuccessfully) {
                            handleClear();
                          } else {
                            void handleConvert();
                          }
                        }}
                        disabled={allConvertedSuccessfully ? busy : isConverting || !canConvert}
                        className={downloadPrimary ? flowSecondaryCtaClass : flowPrimaryCtaClass}
                      >
                        <HugeiconsIcon
                          icon={isConverting || allConvertedSuccessfully ? RefreshIcon : File01Icon}
                          size={15}
                          strokeWidth={2}
                          className={`shrink-0 ${isConverting ? 'animate-spin' : ''}`}
                        />
                        {isConverting
                          ? 'Converting...'
                          : pendingCount > 0
                            ? `Convert ${pendingCount} ${pendingCount === 1 ? 'file' : 'files'}`
                            : allConvertedSuccessfully
                              ? 'Start again'
                              : 'All files converted'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDownloadAll()}
                        disabled={!downloadReady}
                        aria-busy={isConverting}
                        className={
                          downloadPrimary
                            ? flowPrimaryCtaClass
                            : downloadReady
                              ? flowSecondaryCtaClass
                              : flowDownloadIdleCtaClass
                        }
                      >
                        {downloadReady ? (
                          <HugeiconsIcon
                            icon={isBulkDownload ? Archive01Icon : Download01Icon}
                            size={15}
                            strokeWidth={2}
                            className="shrink-0"
                          />
                        ) : isConverting ? (
                          <HugeiconsIcon
                            icon={RefreshIcon}
                            size={15}
                            strokeWidth={2}
                            className="shrink-0 animate-spin opacity-70"
                          />
                        ) : (
                          <HugeiconsIcon icon={File01Icon} size={15} strokeWidth={2} className="shrink-0 opacity-60" />
                        )}
                        {isConverting
                          ? `Your ${config.outputLabel} will appear here shortly`
                          : hasConvertedOutput
                            ? isBulkDownload
                              ? 'Download converted ZIP'
                              : `Download ${config.outputLabel}`
                            : downloadSecondaryIdleHint}
                      </button>
                    </StudioFlowCtaRow>
                  }
                >
                  <StudioScrollArea
                    measureKey={items.length}
                    className="min-h-0 flex-1"
                    style={
                      {
                        '--queue-scrollbar-thumb': config.queueScrollbarThumb,
                        '--queue-scrollbar-thumb-hover': config.queueScrollbarThumbHover,
                      } as CSSProperties
                    }
                  >
                    <div className="flex w-full min-w-0 flex-col gap-2 py-0.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setFocusedFileId(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setFocusedFileId(item.id);
                            }
                          }}
                          className={clsx(
                            STUDIO_FLOW_QUEUE_ROW,
                            'cursor-pointer text-left',
                            focusedFileId === item.id && STUDIO_FLOW_QUEUE_ROW_SELECTED
                          )}
                        >
                            <div className="flex w-full items-center gap-2.5">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconBoxClass}`}
                              >
                                <HugeiconsIcon
                                  icon={
                                    item.status === 'converted'
                                      ? CheckmarkCircle01Icon
                                      : item.status === 'converting'
                                        ? RefreshIcon
                                        : File01Icon
                                  }
                                  size={22}
                                  strokeWidth={1.7}
                                  className={`${config.iconClass} ${item.status === 'converting' ? 'animate-spin' : ''}`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p
                                      className="truncate text-xs font-medium leading-tight text-foreground"
                                      title={item.file.name}
                                    >
                                      {item.file.name}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                                      {formatBytes(item.file.size)} · {statusLabel(item)}
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    {item.output ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadSingle(item.output as ConvertedDocument);
                                        }}
                                        className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium ${config.linkClass}`}
                                      >
                                        <HugeiconsIcon icon={Download01Icon} size={12} strokeWidth={2} />
                                        Download
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item.id);
                                      }}
                                      disabled={busy}
                                      aria-label={`Remove ${item.file.name}`}
                                      className="inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                                    </button>
                                  </div>
                                </div>
                                {item.status === 'converting' ? (
                                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                                    <motion.div
                                      className={`h-full rounded-full bg-gradient-to-r ${config.progressClass}`}
                                      animate={{ width: `${Math.min(item.progress, 100)}%` }}
                                      transition={rowExpand}
                                    />
                                  </div>
                                ) : null}
                                {item.error ? (
                                  <p className="mt-2 text-[11px] leading-relaxed text-rose-600">{item.error}</p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </StudioScrollArea>
                </StudioFlowAsideLayout>
              }
            />
          ) : (
          <div className="flex w-full flex-col gap-3 px-1">
            <div
              className={clsx(
                'flex w-full shrink-0 flex-wrap items-center gap-2 border-b border-[hsl(var(--brand-copper)/0.12)] pb-3',
                'flex-col gap-3 border-0 pb-0 text-center sm:flex-row sm:items-start sm:justify-between sm:border-b sm:border-[hsl(var(--brand-copper)/0.12)] sm:pb-3 sm:text-left'
              )}
            >
              <div className="min-w-0 w-full sm:w-auto sm:text-left">
                <h3 className="font-mono text-xs font-medium uppercase tracking-wide text-foreground">
                  {config.queuedTitle}
                </h3>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
                  Queue: {items.length} of {MAX_CONVERSION_BATCH_FILES} files. Selected total:{' '}
                  {formatBytes(totalBytes)} / {getDynamicBatchLimitLabel(items.length)} allowed for these{' '}
                  {selectedFilesLabel(items.length)}.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy || items.length >= MAX_CONVERSION_BATCH_FILES}
                  className={WORKSPACE_TOOLBAR_BTN}
                >
                  <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
                  Add files
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={busy}
                  className={WORKSPACE_TOOLBAR_BTN}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                  Clear all
                </button>
              </div>
            </div>

            {/* Scroll only after QUEUE_SCROLL_AFTER_FILE_COUNT files; pad list + CTAs together when scrollbar shows. */}
            <div
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2"
              style={
                queueListUsesScrollRegion
                  ? { paddingRight: `calc(1rem + ${queueScrollbarPadPx}px)` }
                  : undefined
              }
            >
              <div
                ref={queueListScrollRef}
                className={`min-h-0 w-full min-w-0 overflow-x-hidden ${
                  queueListUsesScrollRegion
                    ? 'queue-list-scrollbar max-h-72 overflow-y-auto'
                    : 'max-h-none overflow-y-visible'
                }`}
                style={
                  queueListUsesScrollRegion
                    ? ({
                        '--queue-scrollbar-thumb': config.queueScrollbarThumb,
                        '--queue-scrollbar-thumb-hover':
                          config.queueScrollbarThumbHover,
                      } as CSSProperties)
                    : undefined
                }
              >
                <div className="flex w-full min-w-0 flex-col gap-2 py-0.5">
                {items.map((item) => (
              <div
                key={item.id}
                className="box-border min-h-12 w-full rounded-sm border border-border/70 bg-card/40 px-2.5 py-2"
              >
                <div className="flex w-full items-center gap-2.5">
                  <div className={`h-8 w-8 shrink-0 rounded-sm ${config.iconBoxClass} flex items-center justify-center`}>
                    <HugeiconsIcon
                      icon={item.status === 'converted' ? CheckmarkCircle01Icon : item.status === 'converting' ? RefreshIcon : File01Icon}
                      size={15}
                      strokeWidth={1.7}
                      className={`${config.iconClass} ${item.status === 'converting' ? 'animate-spin' : ''}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground leading-tight" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                          {formatBytes(item.file.size)} - {statusLabel(item)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                        {item.output && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item.output as ConvertedDocument)}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11px] font-medium ${config.linkClass}`}
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
                          className="inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    {item.status === 'converting' && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${config.progressClass}`}
                          animate={{ width: `${Math.min(item.progress, 100)}%` }}
                          transition={rowExpand}
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
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:items-stretch">
            <button
              type="button"
              onClick={() => {
                if (allConvertedSuccessfully) {
                  handleClear();
                } else {
                  void handleConvert();
                }
              }}
              disabled={
                allConvertedSuccessfully ? busy : isConverting || !canConvert
              }
              className={`${downloadPrimary ? secondaryCtaClass : primaryCtaClass} ${downloadPrimary ? 'order-2 sm:order-2' : 'order-1 sm:order-1'}`}
            >
              <HugeiconsIcon
                icon={isConverting || allConvertedSuccessfully ? RefreshIcon : File01Icon}
                size={15}
                strokeWidth={2}
                className={`shrink-0 ${isConverting ? 'animate-spin' : ''}`}
              />
              {isConverting
                ? 'Converting...'
                : pendingCount > 0
                  ? `Convert ${pendingCount} ${pendingCount === 1 ? 'file' : 'files'}`
                  : allConvertedSuccessfully
                    ? 'Start again'
                    : 'All files converted'}
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadAll()}
              disabled={!downloadReady}
              aria-busy={isConverting}
              className={`${
                downloadPrimary
                  ? primaryCtaClass
                  : downloadReady
                    ? secondaryCtaClass
                    : downloadIdleCtaClass
              } ${downloadPrimary ? 'order-1 sm:order-1' : 'order-2 sm:order-2'}`}
            >
              {downloadReady ? (
                <HugeiconsIcon
                  icon={isBulkDownload ? Archive01Icon : Download01Icon}
                  size={15}
                  strokeWidth={2}
                  className="shrink-0"
                />
              ) : isConverting ? (
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={15}
                  strokeWidth={2}
                  className="shrink-0 animate-spin opacity-70"
                />
              ) : (
                <HugeiconsIcon icon={File01Icon} size={15} strokeWidth={2} className="shrink-0 opacity-60" />
              )}
              {isConverting
                ? `Your ${config.outputLabel} will appear here shortly`
                : hasConvertedOutput
                  ? isBulkDownload
                    ? 'Download converted ZIP'
                    : `Download ${config.outputLabel}`
                  : downloadSecondaryIdleHint}
            </button>
            </div>
            </div>
          </div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
