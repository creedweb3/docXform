'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
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
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import JSZip from 'jszip';
import { formatBytes } from '@/lib/client-file-validation';
import {
  MAX_CONVERSION_BATCH_FILES,
  MAX_CONVERSION_FILE_SIZE_BYTES,
  MAX_CONVERSION_FILE_SIZE_LABEL,
} from '@/lib/conversion-limits';
import { getCachedPerfProfile, getMotionBudget } from '@/lib/perf-profile';
import { ToolIcon } from '@/components/tools/tool-icon';
import type { ToolDefinition } from '@/lib/tools';
import { TONE_STYLES } from '@/components/tools/tone-styles';

type Status = 'idle' | 'validating' | 'ready' | 'processing' | 'done' | 'failed';

export type WorkspaceFile = {
  id: string;
  file: File;
  status: Status;
  progress?: number;
  message?: string;
  error?: string;
  outputs?: Array<{ name: string; blob: Blob }>;
};

export type WorkspaceConfig = {
  title: string;
  hint: string;
  accept: string;
  allowMultiple: boolean;
  cardClass: string;
  iconBoxClass: string;
  iconClass: string;
  dragClass: string;
  primaryButtonClass: string;
  progressClass: string;
  iconPair?: ToolDefinition['iconPair'];
  tone?: ToolDefinition['tone'];
  storageKey?: string;
  /** Title shown above the queue card once files are added (e.g. "PDF files ready"). */
  queuedTitle?: string;
  /** Verb used in the primary CTA (e.g. "Merge", "Compress"). Defaults to "Process". */
  actionLabel?: string;
};

export type WorkspaceActions = {
  /**
   * Optional batch validator. Used at both add time (per file) and at process time
   * (full batch). Tools can keep returning the existing helper signature.
   */
  validateFiles?: (files: File[]) => Promise<{ ok: boolean; message?: string }>;
  processFiles: (
    files: WorkspaceFile[],
    setProgress: (id: string, progress: number, message?: string) => void
  ) => Promise<WorkspaceFile[]>;
  zipName?: string;
};

type ToolWorkspaceProps = {
  config: WorkspaceConfig;
  actions: WorkspaceActions;
  /** Optional pill rendered alongside the default dropzone hint chips. */
  subtitle?: React.ReactNode;
  /** Settings panel rendered inside the queue card between the file list and CTAs. */
  footer?: React.ReactNode;
};

type NoticeKind = 'success' | 'info' | 'error';
type NoticeState = {
  message: string;
  kind: NoticeKind;
  autoClear: boolean;
  transient: boolean;
};
type DuplicatePrompt = { files: File[]; message: string };

const TRANSIENT_NOTICE_DURATION = 1100;
const DEFAULT_NOTICE_DURATION = 3500;
/** Only enable list scrolling (and scrollbar width sync) after this many files. */
const QUEUE_SCROLL_AFTER_FILE_COUNT = 6;

const CTA_FLEX_LAYOUT =
  'inline-flex min-h-12 min-w-0 flex-1 basis-0 select-none items-center justify-center gap-2 self-stretch rounded-xl box-border px-4 py-3 text-center text-xs font-semibold leading-snug';

function statusLabel(file: WorkspaceFile) {
  if (file.status === 'done') return 'Done';
  if (file.status === 'processing') return file.message ?? 'Processing';
  if (file.status === 'failed') return 'Failed';
  if (file.status === 'validating') return 'Checking';
  return 'Ready';
}

function summarizeMessages(messages: string[]) {
  if (messages.length === 0) return '';
  if (messages.length === 1) return messages[0];
  return `${messages[0]} ${messages.length - 1} more issue${
    messages.length > 2 ? 's' : ''
  } skipped.`;
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

function parseAcceptExtensions(accept: string): string[] {
  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.startsWith('.'));
}

function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  if (idx < 0) return '';
  return name.slice(idx).toLowerCase();
}

export function ToolWorkspace({ config, actions, subtitle, footer }: ToolWorkspaceProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const processStartedAtRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueListScrollRef = useRef<HTMLDivElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [queueScrollbarPadPx, setQueueScrollbarPadPx] = useState(0);

  const reducedMotion = useReducedMotion();
  const perfProfile = useMemo(() => getCachedPerfProfile(), []);
  const { spring, chipMotion, rowExpand } = useMemo(
    () => getMotionBudget(perfProfile, Boolean(reducedMotion)),
    [perfProfile, reducedMotion]
  );

  const toneStyle = config.tone ? TONE_STYLES[config.tone] : undefined;
  const chipClass = toneStyle?.chip ?? 'border-border/40 bg-white/65';
  const scrollbarThumb = toneStyle?.scrollbarThumb;
  const scrollbarThumbHover = toneStyle?.scrollbarThumbHover;
  const actionLabel = config.actionLabel ?? 'Process';
  const queuedTitle = config.queuedTitle ?? 'Files ready';
  const effectiveBatchMax = config.allowMultiple ? MAX_CONVERSION_BATCH_FILES : 1;
  const acceptExtensions = useMemo(
    () => parseAcceptExtensions(config.accept),
    [config.accept]
  );

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.file.size, 0),
    [files]
  );

  const outputs = useMemo(
    () => files.flatMap((f) => f.outputs ?? []).filter(Boolean),
    [files]
  );

  const allDone = files.length > 0 && files.every((f) => f.status === 'done');
  const hasOutputs = outputs.length > 0;
  const downloadReady = hasOutputs && !busy;
  const downloadPrimary = allDone && !busy;
  const isBulkDownload = outputs.length > 1;
  const pendingCount = files.filter(
    (f) => f.status !== 'done' && f.status !== 'processing'
  ).length;
  const hasFiles = files.length > 0;
  const queueListUsesScrollRegion = files.length > QUEUE_SCROLL_AFTER_FILE_COUNT;

  // ----- Notice & UI state derivation -----
  const inlineTransientSuccess = Boolean(
    notice?.transient && notice.kind === 'success' && hasFiles && notice.message
  );
  const showTopNoticeRow =
    isValidating || (!!notice && (!notice.transient || !hasFiles));
  const noticeKind: NoticeKind = isValidating ? 'info' : notice?.kind ?? 'info';
  const noticeToneClass =
    noticeKind === 'error'
      ? 'border-red-200/80 bg-red-50/90 text-red-700'
      : `${chipClass} text-muted-foreground`;
  const noticeIconClass = noticeKind === 'error' ? 'text-red-500' : config.iconClass;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    },
    []
  );

  // ResizeObserver-based scrollbar pad sync so CTA edges stay aligned with the queue list.
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
  }, [queueListUsesScrollRegion, files]);

  const resetInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const showNotice = useCallback(
    (
      message: string,
      {
        kind = 'info',
        autoClear = false,
        transient = false,
        duration,
      }: {
        kind?: NoticeKind;
        autoClear?: boolean;
        transient?: boolean;
        duration?: number;
      } = {}
    ) => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }

      if (!message) {
        setNotice(null);
        return;
      }

      setNotice({ message, kind, autoClear, transient });

      if (autoClear) {
        noticeTimerRef.current = setTimeout(
          () => {
            setNotice(null);
            noticeTimerRef.current = null;
          },
          duration ?? (transient ? TRANSIENT_NOTICE_DURATION : DEFAULT_NOTICE_DURATION)
        );
      }
    },
    []
  );

  const rememberRecentFiles = useCallback(
    (selected: File[]) => {
      if (typeof window === 'undefined' || !config.storageKey) return;
      const key = 'docxform:recent-tool-files';
      const stored = window.localStorage.getItem(key);
      const existing = stored ? (JSON.parse(stored) as Array<Record<string, unknown>>) : [];
      const next = [
        ...selected.map((file) => ({
          tool: config.storageKey,
          name: file.name,
          size: file.size,
          addedAt: new Date().toISOString(),
        })),
        ...existing,
      ].slice(0, 20);
      window.localStorage.setItem(key, JSON.stringify(next));
    },
    [config.storageKey]
  );

  // ----- Add files pipeline (per-file validation + duplicate detection + batch cap) -----
  const addFilesFromArray = useCallback(
    async (incoming: File[], allowDuplicateNames = false) => {
      if (busy || isValidating) {
        showNotice(
          'Wait for the current validation or operation to finish before adding more files.',
          { kind: 'error', autoClear: true }
        );
        resetInput();
        return;
      }

      if (incoming.length === 0) return;

      const remainingSlots = effectiveBatchMax - files.length;
      const messages: string[] = [];

      if (remainingSlots <= 0) {
        showNotice(
          effectiveBatchMax === 1
            ? 'This tool only accepts one file at a time. Remove the existing file first.'
            : `You can queue up to ${effectiveBatchMax} files at a time.`,
          { kind: 'error', autoClear: true }
        );
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

      const accepted: WorkspaceFile[] = [];
      const duplicateFiles: File[] = [];
      const queuedNames = new Set(
        files.map((item) => item.file.name.trim().toLowerCase())
      );

      for (const file of candidates) {
        // Empty file guard.
        if (file.size === 0) {
          messages.push(`${file.name} is empty.`);
          continue;
        }

        // Per-file size cap.
        if (file.size > MAX_CONVERSION_FILE_SIZE_BYTES) {
          messages.push(`${file.name} is larger than ${MAX_CONVERSION_FILE_SIZE_LABEL}.`);
          continue;
        }

        // Extension check vs config.accept (e.g. ".pdf", ".docx,.doc").
        if (acceptExtensions.length > 0) {
          const ext = fileExtension(file.name);
          if (!ext || !acceptExtensions.includes(ext)) {
            messages.push(
              `${file.name} is not a supported file type for this tool.`
            );
            continue;
          }
        }

        // Tool-specific magic-byte / structural validation.
        if (actions.validateFiles) {
          try {
            const result = await actions.validateFiles([file]);
            if (!result.ok) {
              messages.push(result.message ?? `${file.name} could not be validated.`);
              continue;
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            messages.push(`${file.name}: ${message}`);
            continue;
          }
        }

        // Duplicate-name detection (only against current queue).
        const normalizedName = file.name.trim().toLowerCase();
        if (!allowDuplicateNames && queuedNames.has(normalizedName)) {
          duplicateFiles.push(file);
          continue;
        }

        queuedNames.add(normalizedName);
        accepted.push({
          id: crypto.randomUUID(),
          file,
          status: 'idle',
        });
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
        const fallback =
          duplicateFiles.length > 0 ? '' : 'No supported files were added.';
        const message = summarizeMessages(messages) || fallback;
        if (message) {
          showNotice(message, { kind: 'error', autoClear: true });
        } else {
          showNotice('');
        }
        resetInput();
        return;
      }

      const nextCount = files.length + accepted.length;
      const nextTotalBytes =
        totalBytes + accepted.reduce((total, item) => total + item.file.size, 0);

      // Dynamic batch budget: file count * per-file limit.
      const dynamicBudget = nextCount * MAX_CONVERSION_FILE_SIZE_BYTES;
      if (nextTotalBytes > dynamicBudget) {
        showNotice(
          `${nextCount} files can use up to ${
            (dynamicBudget / 1024 / 1024).toFixed(0)
          } MB total.`,
          { kind: 'error', autoClear: true }
        );
        resetInput();
        return;
      }

      const addedLabel = `${accepted.length} file${accepted.length === 1 ? '' : 's'} added`;
      const issueSummary = summarizeMessages(messages);

      setFiles((current) => [...current, ...accepted]);
      rememberRecentFiles(accepted.map((a) => a.file));
      showNotice(
        issueSummary ? `${addedLabel}. ${issueSummary}` : addedLabel,
        issueSummary
          ? { kind: 'info', autoClear: true }
          : { kind: 'success', autoClear: true, transient: true }
      );
      resetInput();
    },
    [
      acceptExtensions,
      actions,
      busy,
      effectiveBatchMax,
      files,
      isValidating,
      rememberRecentFiles,
      resetInput,
      showNotice,
      totalBytes,
    ]
  );

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (file) incoming.push(file);
      }
      await addFilesFromArray(incoming);
    },
    [addFilesFromArray]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (busy) {
        setDragOver(false);
        return;
      }
      setDragOver(false);
      void addFiles(event.dataTransfer.files);
    },
    [addFiles, busy]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (busy) return;
      void addFiles(event.target.files);
    },
    [addFiles, busy]
  );

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
    const dupFiles = duplicatePrompt?.files ?? [];
    setDuplicatePrompt(null);
    void addFilesFromArray(dupFiles, true);
  }, [addFilesFromArray, duplicatePrompt?.files]);

  const setProgress = useCallback((id: string, progress: number, message?: string) => {
    const clamped = Math.min(100, Math.max(0, progress));
    const startedAt = processStartedAtRef.current;
    const elapsed = startedAt ? Date.now() - startedAt : 0;
    const eta =
      startedAt && clamped > 5 && clamped < 100
        ? ` · ~${Math.max(1, Math.round((elapsed / clamped) * (100 - clamped) / 1000))}s left`
        : '';
    setFiles((current) =>
      current.map((f) =>
        f.id === id ? { ...f, progress: clamped, message: message ? `${message}${eta}` : f.message } : f
      )
    );
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    // Batch-level validation at process time.
    if (actions.validateFiles) {
      setBusy(true);
      try {
        const res = await actions.validateFiles(files.map((f) => f.file));
        if (!res.ok) {
          showNotice(res.message ?? 'Files not valid', { kind: 'error', autoClear: true });
          return;
        }
      } finally {
        setBusy(false);
      }
    }

    setBusy(true);
    processStartedAtRef.current = Date.now();
    showNotice('');
    setFiles((current) =>
      current.map((f) => ({ ...f, status: 'processing', progress: 0, error: undefined }))
    );
    try {
      const next = await actions.processFiles(files, setProgress);
      setFiles(next);
      const failures = next.filter((f) => f.status === 'failed').length;
      if (failures === 0) {
        showNotice('All files processed', { kind: 'success', autoClear: true });
        if (next.length > 1 || next.flatMap((f) => f.outputs ?? []).length > 1) {
          setToast({ kind: 'success', message: 'Batch complete. Your downloads are ready.' });
        }
      } else {
        showNotice(`${failures} file(s) failed`, { kind: 'error', autoClear: true });
        setToast({ kind: 'error', message: `${failures} file(s) failed` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showNotice(message, { kind: 'error', autoClear: true });
    } finally {
      setBusy(false);
      processStartedAtRef.current = null;
    }
  }, [actions, files, setProgress, showNotice]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDuplicatePrompt(null);
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    setNotice(null);
    setToast(null);
    resetInput();
  }, [resetInput]);

  const handleRemove = useCallback((id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  }, []);

  const handleReorder = useCallback(
    (targetId: string) => {
      setFiles((current) => {
        if (!draggedFileId || draggedFileId === targetId) return current;
        const fromIndex = current.findIndex((item) => item.id === draggedFileId);
        const toIndex = current.findIndex((item) => item.id === targetId);
        if (fromIndex < 0 || toIndex < 0) return current;
        const next = [...current];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [draggedFileId]
  );

  const handleDownloadSingle = useCallback((output: { name: string; blob: Blob }) => {
    const url = URL.createObjectURL(output.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = output.name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!outputs.length) return;
    if (outputs.length === 1) {
      handleDownloadSingle(outputs[0]);
      return;
    }

    const zip = new JSZip();
    outputs.forEach((out) => zip.file(out.name, out.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = actions.zipName || 'outputs.zip';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [actions.zipName, handleDownloadSingle, outputs]);

  const primaryCtaClass = `${CTA_FLEX_LAYOUT} bg-gradient-to-br ${config.primaryButtonClass} text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45`;
  const secondaryCtaClass = `${CTA_FLEX_LAYOUT} border border-border/40 bg-white/60 text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-45`;
  const downloadIdleCtaClass = `${CTA_FLEX_LAYOUT} border border-dashed border-slate-300/75 bg-slate-100 text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-100`;

  return (
    <div className="w-full space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
        <div
          className={clsx(
            `${config.cardClass} rounded-3xl p-7 sm:p-8 transition-all duration-300`,
            dragOver && config.dragClass,
            busy ? 'cursor-default opacity-85' : 'cursor-pointer'
          )}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={busy ? -1 : 0}
          aria-label={config.title}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !busy) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => {
            if (!busy) inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={config.accept}
            multiple={config.allowMultiple}
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
              {config.iconPair && config.tone ? (
                <ToolIcon pair={config.iconPair} tone={config.tone} variant="tile" />
              ) : (
                <HugeiconsIcon icon={Upload04Icon} size={24} strokeWidth={1.5} className={config.iconClass} />
              )}
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
              {subtitle}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top notice row: only shown while validating or for non-transient notices, or before the queue exists. */}
      <AnimatePresence>
        {showTopNoticeRow && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={chipMotion}
            className="flex justify-center px-2 py-0.5"
            aria-live="polite"
          >
            {isValidating ? (
              <span
                className={clsx(
                  'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] shadow-sm backdrop-blur-md',
                  noticeToneClass
                )}
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={12}
                  strokeWidth={2}
                  className={`${noticeIconClass} animate-spin`}
                />
                Checking file type and size...
              </span>
            ) : (
              <span
                className={clsx(
                  'inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-center text-[11px] leading-snug shadow-sm backdrop-blur-md',
                  noticeToneClass
                )}
              >
                {notice?.kind === 'success' && (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} className={noticeIconClass} />
                )}
                {notice?.message}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single inline chip row: file count, total bytes, privacy. Transient success notice is rendered INLINE in this same row. */}
      <AnimatePresence mode="popLayout">
        {hasFiles && (
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
                    className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${chipClass} text-muted-foreground`}
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={12}
                      strokeWidth={2}
                      className={config.iconClass}
                    />
                    {notice.message}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.span
                layout
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${chipClass}`}
              >
                <HugeiconsIcon icon={File01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                {files.length} / {effectiveBatchMax} files
              </motion.span>
              <motion.span
                layout
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${chipClass}`}
              >
                {formatBytes(totalBytes)} selected
              </motion.span>
              <motion.span
                layout
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${chipClass}`}
              >
                <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                Private local processing
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate-name prompt: Skip / Add again. */}
      <AnimatePresence>
        {duplicatePrompt && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={chipMotion}
            className="flex justify-center px-2 py-0.5"
          >
            <div
              className={`flex w-full max-w-2xl flex-wrap items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-md sm:flex-nowrap sm:gap-2.5 ${chipClass}`}
            >
              <p className="min-w-0 flex-1 leading-snug">{duplicatePrompt.message}</p>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={handleSkipDuplicates}
                  className="rounded-full border border-border/40 bg-white/60 px-3 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-white/80"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleAddDuplicates}
                  className={`rounded-full bg-gradient-to-br ${config.primaryButtonClass} px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90`}
                >
                  Add again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasFiles && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="glass flex flex-col gap-3 rounded-3xl p-5 sm:p-6"
        >
          <div className="flex w-full flex-col gap-3 px-1">
            <div className="flex w-full flex-col gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
              <div className="min-w-0 w-full sm:w-auto sm:text-left">
                <h3 className="text-sm font-semibold text-foreground">{queuedTitle}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Queue: {files.length} of {effectiveBatchMax} files. Selected total:{' '}
                  {formatBytes(totalBytes)}.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy || files.length >= effectiveBatchMax}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-white/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
                  Add files
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-white/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                  Clear all
                </button>
              </div>
            </div>

            {/* Scroll only after QUEUE_SCROLL_AFTER_FILE_COUNT files; pad CTAs by measured scrollbar so edges stay aligned. */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2">
              <div
                ref={queueListScrollRef}
                className={clsx(
                  'min-h-0 w-full min-w-0 overflow-x-hidden',
                  queueListUsesScrollRegion
                    ? 'queue-list-scrollbar max-h-72 overflow-y-auto'
                    : 'max-h-none overflow-y-visible'
                )}
                style={
                  queueListUsesScrollRegion && scrollbarThumb && scrollbarThumbHover
                    ? ({
                        '--queue-scrollbar-thumb': scrollbarThumb,
                        '--queue-scrollbar-thumb-hover': scrollbarThumbHover,
                      } as CSSProperties)
                    : undefined
                }
              >
                <div
                  className="flex w-full min-w-0 flex-col gap-2 py-0.5 pr-4"
                  role="list"
                  aria-label="Selected files"
                >
                  {files.map((item) => {
                    const isReorderable = config.allowMultiple && files.length > 1 && !busy;
                    const itemOutput = item.outputs?.[0];
                    return (
                      <div
                        key={item.id}
                        role="listitem"
                        draggable={isReorderable}
                        onDragStart={() => isReorderable && setDraggedFileId(item.id)}
                        onDragOver={(event) => {
                          if (isReorderable) event.preventDefault();
                        }}
                        onDrop={() => isReorderable && handleReorder(item.id)}
                        onDragEnd={() => setDraggedFileId(null)}
                        className={clsx(
                          'min-h-12 rounded-xl border border-border/45 bg-white/60 px-2.5 py-2 box-border transition focus-within:ring-2 focus-within:ring-ring',
                          draggedFileId === item.id && 'opacity-50',
                          isReorderable && 'cursor-grab active:cursor-grabbing'
                        )}
                      >
                        <div className="flex w-full items-center gap-2.5">
                          <div className={`h-8 w-8 shrink-0 rounded-lg ${config.iconBoxClass} flex items-center justify-center`}>
                            <HugeiconsIcon
                              icon={
                                item.status === 'done'
                                  ? CheckmarkCircle01Icon
                                  : item.status === 'processing'
                                    ? RefreshIcon
                                    : File01Icon
                              }
                              size={15}
                              strokeWidth={1.7}
                              className={clsx(config.iconClass, item.status === 'processing' && 'animate-spin')}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                              <div className="min-w-0">
                                <p
                                  className="truncate text-xs font-medium text-foreground leading-tight"
                                  title={item.file.name}
                                >
                                  {item.file.name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                                  {formatBytes(item.file.size)} · {statusLabel(item)}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                                {itemOutput && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSingle(itemOutput)}
                                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${config.iconClass} hover:opacity-80`}
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
                            {item.status === 'processing' && item.progress !== undefined && (
                              <div
                                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60"
                                role="progressbar"
                                aria-valuenow={item.progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <motion.div
                                  className={`h-full rounded-full bg-gradient-to-r ${config.progressClass}`}
                                  animate={{ width: `${Math.min(item.progress, 100)}%` }}
                                  transition={rowExpand}
                                />
                              </div>
                            )}
                            {item.error && (
                              <p className="mt-2 text-[11px] leading-relaxed text-rose-600">{item.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {footer}

              <div
                className="flex w-full min-w-0 flex-col gap-2 pr-4 sm:flex-row sm:items-stretch"
                style={
                  queueListUsesScrollRegion
                    ? { paddingRight: `calc(1rem + ${queueScrollbarPadPx}px)` }
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    if (allDone) {
                      handleReset();
                    } else {
                      void handleProcess();
                    }
                  }}
                  disabled={allDone ? busy : busy || pendingCount === 0}
                  className={`${downloadPrimary ? secondaryCtaClass : primaryCtaClass} ${
                    downloadPrimary ? 'order-2 sm:order-2' : 'order-1 sm:order-1'
                  }`}
                >
                  <HugeiconsIcon
                    icon={busy || allDone ? RefreshIcon : File01Icon}
                    size={15}
                    strokeWidth={2}
                    className={clsx('shrink-0', busy && 'animate-spin')}
                  />
                  {busy
                    ? 'Processing…'
                    : allDone
                      ? 'Start again'
                      : `${actionLabel} ${pendingCount} ${pendingCount === 1 ? 'file' : 'files'}`}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={!downloadReady}
                  aria-busy={busy}
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
                  ) : busy ? (
                    <HugeiconsIcon
                      icon={RefreshIcon}
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 animate-spin opacity-70"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={File01Icon}
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 opacity-60"
                    />
                  )}
                  {busy
                    ? 'Your output will appear here shortly'
                    : hasOutputs
                      ? isBulkDownload
                        ? 'Download as ZIP'
                        : 'Download result'
                      : 'Almost there · hit ' + actionLabel}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={chipMotion}
            className={clsx(
              'fixed bottom-5 right-5 z-50 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl',
              toast.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
                : 'border-rose-200 bg-rose-50/90 text-rose-800'
            )}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
