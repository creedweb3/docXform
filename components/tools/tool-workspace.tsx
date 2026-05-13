'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import JSZip from 'jszip';
import { formatBytes } from '@/lib/client-file-validation';
import {
  MAX_CONVERSION_BATCH_FILES,
  MAX_CONVERSION_FILE_SIZE_LABEL,
} from '@/lib/conversion-limits';
import { ToolIcon } from '@/components/tools/tool-icon';
import type { ToolDefinition } from '@/lib/tools';

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

const TONE_CHIP_CLASS: Record<ToolDefinition['tone'], string> = {
  emerald: 'border-emerald-200/70 bg-white/65',
  amber: 'border-amber-200/70 bg-white/65',
  teal: 'border-teal-200/70 bg-white/65',
  purple: 'border-purple-200/70 bg-white/65',
  cyan: 'border-cyan-200/70 bg-white/65',
  orange: 'border-orange-200/70 bg-white/65',
  indigo: 'border-indigo-200/70 bg-white/65',
  slate: 'border-slate-200/70 bg-white/65',
  rose: 'border-rose-200/70 bg-white/65',
  sky: 'border-sky-200/70 bg-white/65',
  violet: 'border-violet-200/70 bg-white/65',
  lime: 'border-lime-200/70 bg-white/65',
  fuchsia: 'border-fuchsia-200/70 bg-white/65',
};

const SPRING = { type: 'spring' as const, stiffness: 180, damping: 22 };
const CHIP_MOTION = { type: 'spring' as const, stiffness: 260, damping: 24 };
const ROW_EXPAND = { type: 'tween' as const, duration: 0.25, ease: 'easeOut' as const };

const TRANSIENT_NOTICE_DURATION = 1100;
const STANDARD_NOTICE_DURATION = 3600;

const CTA_FLEX_LAYOUT =
  'inline-flex min-h-12 min-w-0 flex-1 basis-0 select-none items-center justify-center gap-2 self-stretch rounded-xl box-border px-4 py-3 text-center text-xs font-semibold leading-snug';

function statusLabel(file: WorkspaceFile) {
  if (file.status === 'done') return 'Done';
  if (file.status === 'processing') return file.message ?? 'Processing';
  if (file.status === 'failed') return 'Failed';
  if (file.status === 'validating') return 'Checking';
  return 'Ready';
}

export function ToolWorkspace({ config, actions, subtitle, footer }: ToolWorkspaceProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const processStartedAtRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error' | 'success'; message: string } | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const chipClass = config.tone
    ? TONE_CHIP_CLASS[config.tone]
    : 'border-border/40 bg-white/65';
  const actionLabel = config.actionLabel ?? 'Process';
  const queuedTitle = config.queuedTitle ?? 'Files ready';

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

  const showNotice = useCallback(
    (
      kind: 'info' | 'error' | 'success',
      message: string,
      { autoClear = false, transient = false }: { autoClear?: boolean; transient?: boolean } = {}
    ) => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
      setNotice({ kind, message });
      if (autoClear) {
        noticeTimerRef.current = setTimeout(
          () => setNotice(null),
          transient ? TRANSIENT_NOTICE_DURATION : STANDARD_NOTICE_DURATION
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

  const pickFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const selected = Array.from(fileList);
      if (selected.length === 0) return;
      const mapped = selected.map<WorkspaceFile>((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'idle',
      }));
      setFiles((current) => [...current, ...mapped]);
      rememberRecentFiles(selected);
      showNotice(
        'success',
        `${selected.length} file${selected.length > 1 ? 's' : ''} added`,
        { autoClear: true, transient: true }
      );
    },
    [rememberRecentFiles, showNotice]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (busy) return;
      pickFiles(event.dataTransfer.files);
      setDragOver(false);
    },
    [busy, pickFiles]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (busy) return;
      pickFiles(event.target.files);
      event.target.value = '';
    },
    [busy, pickFiles]
  );

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

  const handleValidate = useCallback(async () => {
    if (!actions.validateFiles) return true;
    setBusy(true);
    try {
      const res = await actions.validateFiles(files.map((f) => f.file));
      if (!res.ok) {
        showNotice('error', res.message ?? 'Files not valid');
        return false;
      }
      return true;
    } finally {
      setBusy(false);
    }
  }, [actions, files, showNotice]);

  const handleProcess = useCallback(async () => {
    const ok = await handleValidate();
    if (!ok) return;

    setBusy(true);
    processStartedAtRef.current = Date.now();
    setFiles((current) =>
      current.map((f) => ({ ...f, status: 'processing', progress: 0, error: undefined }))
    );
    try {
      const next = await actions.processFiles(files, setProgress);
      setFiles(next);
      const failures = next.filter((f) => f.status === 'failed').length;
      if (failures === 0) {
        showNotice('success', 'All files processed', { autoClear: true });
        if (next.length > 1 || next.flatMap((f) => f.outputs ?? []).length > 1) {
          setToast({ kind: 'success', message: 'Batch complete. Your downloads are ready.' });
        }
      } else {
        showNotice('error', `${failures} file(s) failed`);
        setToast({ kind: 'error', message: `${failures} file(s) failed` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showNotice('error', message);
    } finally {
      setBusy(false);
      processStartedAtRef.current = null;
    }
  }, [actions, files, handleValidate, setProgress, showNotice]);

  const handleReset = useCallback(() => {
    setFiles([]);
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    setNotice(null);
    setToast(null);
  }, []);

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

  const outputs = useMemo(
    () => files.flatMap((f) => f.outputs ?? []).filter(Boolean),
    [files]
  );

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.file.size, 0),
    [files]
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

  const allDone = files.length > 0 && files.every((f) => f.status === 'done');
  const hasOutputs = outputs.length > 0;
  const downloadReady = hasOutputs && !busy;
  const downloadPrimary = allDone && !busy;
  const isBulkDownload = outputs.length > 1;
  const pendingCount = files.filter(
    (f) => f.status !== 'done' && f.status !== 'processing'
  ).length;
  const hasFiles = files.length > 0;

  const primaryCtaClass = `${CTA_FLEX_LAYOUT} bg-gradient-to-br ${config.primaryButtonClass} text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45`;
  const secondaryCtaClass = `${CTA_FLEX_LAYOUT} border border-border/40 bg-white/60 text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-45`;
  const downloadIdleCtaClass = `${CTA_FLEX_LAYOUT} border border-dashed border-slate-300/75 bg-slate-100 text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-100`;

  return (
    <div className="w-full space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
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
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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

      <AnimatePresence>
        {notice && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={CHIP_MOTION}
            className="flex justify-center px-2 py-0.5"
            aria-live="polite"
          >
            <span
              className={clsx(
                'inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-center text-[11px] leading-snug shadow-sm backdrop-blur-md',
                notice.kind === 'error'
                  ? 'border-red-200/80 bg-red-50/90 text-red-700'
                  : `${chipClass} text-muted-foreground`
              )}
            >
              {notice.kind === 'success' && (
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} className={config.iconClass} />
              )}
              {notice.kind === 'error' && (
                <HugeiconsIcon icon={RefreshIcon} size={12} strokeWidth={2} className="text-red-500" />
              )}
              {notice.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {hasFiles && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={CHIP_MOTION}
            className="px-2 py-0.5"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <motion.span
                layout
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur-md ${chipClass}`}
              >
                <HugeiconsIcon icon={File01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                {files.length} / {MAX_CONVERSION_BATCH_FILES} files
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

      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
            className="glass flex flex-col gap-3 rounded-3xl p-5 sm:p-6"
          >
            <div className="flex w-full flex-col gap-3 px-1">
              <div className="flex w-full flex-col gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
                <div className="min-w-0 w-full sm:w-auto sm:text-left">
                  <h3 className="text-sm font-semibold text-foreground">{queuedTitle}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    Queue: {files.length} of {MAX_CONVERSION_BATCH_FILES} files. Selected total:{' '}
                    {formatBytes(totalBytes)}.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy || (!config.allowMultiple && files.length >= 1)}
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

              <div className="flex flex-col gap-2" role="list" aria-label="Selected files">
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
                                transition={ROW_EXPAND}
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

              {footer}

              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={CHIP_MOTION}
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
