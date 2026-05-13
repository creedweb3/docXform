'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
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
// Use built-in crypto.randomUUID to avoid extra deps
import { formatBytes } from '@/lib/client-file-validation';
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
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
};

export function ToolWorkspace({ config, actions, subtitle, footer }: ToolWorkspaceProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const processStartedAtRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error' | 'success'; message: string } | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
    async (fileList: FileList | null) => {
      if (!fileList) return;
      const selected = Array.from(fileList);
      const mapped = selected.map<WorkspaceFile>((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'idle',
      }));
      setFiles((current) => [...current, ...mapped]);
      rememberRecentFiles(selected);
      setNotice({ kind: 'info', message: `${selected.length} file${selected.length > 1 ? 's' : ''} added` });
    },
    [rememberRecentFiles]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (busy) return;
      const fileList = event.dataTransfer.files;
      if (!fileList?.length) return;
      pickFiles(fileList);
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
      current.map((f) => (f.id === id ? { ...f, progress: clamped, message: message ? `${message}${eta}` : undefined } : f))
    );
  }, []);

  const handleValidate = useCallback(async () => {
    if (!actions.validateFiles) return true;
    setNotice(null);
    setBusy(true);
    try {
      const res = await actions.validateFiles(files.map((f) => f.file));
      if (!res.ok) {
        setNotice({ kind: 'error', message: res.message ?? 'Files not valid' });
      } else {
        setNotice({ kind: 'success', message: res.message ?? 'Files ready' });
      }
      return res.ok;
    } finally {
      setBusy(false);
    }
  }, [actions, files]);

  const handleProcess = useCallback(async () => {
    setNotice(null);
    const ok = await handleValidate();
    if (!ok) return;

    setBusy(true);
    processStartedAtRef.current = Date.now();
    setFiles((current) => current.map((f) => ({ ...f, status: 'processing', progress: 0 })));
    try {
      const next = await actions.processFiles(files, setProgress);
      setFiles(next);
      const failures = next.filter((f) => f.status === 'failed').length;
      if (failures === 0) {
        setNotice({ kind: 'success', message: 'All files processed' });
        if (next.length > 1 || next.flatMap((f) => f.outputs ?? []).length > 1) {
          setToast({ kind: 'success', message: 'Batch complete. Your downloads are ready.' });
        }
      } else {
        setNotice({ kind: 'error', message: `${failures} file(s) failed` });
        setToast({ kind: 'error', message: `${failures} file(s) failed` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setNotice({ kind: 'error', message });
    } finally {
      setBusy(false);
      processStartedAtRef.current = null;
    }
  }, [actions, files, handleValidate, setProgress]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setNotice(null);
    setToast(null);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  }, []);

  const handleReorder = useCallback((targetId: string) => {
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
  }, [draggedFileId]);

  const outputs = useMemo(
    () =>
      files.flatMap((f) => f.outputs ?? []).filter(Boolean),
    [files]
  );

  const handleDownload = useCallback(async () => {
    if (!outputs.length) return;
    if (outputs.length === 1) {
      const output = outputs[0];
      const url = URL.createObjectURL(output.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = output.name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  }, [actions.zipName, outputs]);

  const allDone = files.length > 0 && files.every((f) => f.status === 'done');

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      >
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
              <span className="inline-flex items-center gap-1.5 bg-card/50 rounded-full px-3 py-1.5 border border-border/30">
                <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className={config.iconClass} />
                Never uploaded to any server
              </span>
              {subtitle}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="flex justify-center px-2 py-0.5"
            aria-live="polite"
          >
            <span
              className={clsx(
                'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] shadow-sm backdrop-blur-md',
                notice.kind === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                notice.kind === 'info' && 'border-blue-100 bg-blue-50 text-blue-700',
                notice.kind === 'error' && 'border-rose-200 bg-rose-50 text-rose-700'
              )}
            >
              {notice.kind === 'success' && (
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} className="text-emerald-600" />
              )}
              {notice.kind === 'error' && (
                <HugeiconsIcon icon={RefreshIcon} size={12} strokeWidth={2} className="text-rose-600" />
              )}
              {notice.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-subtle rounded-2xl border border-border/50 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={2} className={config.iconClass} />
            Files
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-card/60 px-2.5 py-1 text-muted-foreground hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-label="Add files"
            >
              <HugeiconsIcon icon={Add01Icon} size={12} strokeWidth={2} />
              Add
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-card/60 px-2.5 py-1 text-muted-foreground hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleReset}
              disabled={busy || files.length === 0}
              aria-label="Clear all files"
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-2" role="list" aria-label="Selected files">
          {files.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex justify-center">
                {config.iconPair && config.tone ? (
                  <ToolIcon pair={config.iconPair} tone={config.tone} variant="tile" />
                ) : (
                  <HugeiconsIcon icon={Upload04Icon} size={28} strokeWidth={1.7} className={config.iconClass} />
                )}
              </div>
              <p className="text-xs text-muted-foreground">No files added yet.</p>
            </div>
          )}
          {files.map((item) => (
            <div
              key={item.id}
              role="listitem"
              draggable={!busy}
              onDragStart={() => setDraggedFileId(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleReorder(item.id)}
              onDragEnd={() => setDraggedFileId(null)}
              className={clsx(
                'flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-2 transition focus-within:ring-2 focus-within:ring-ring',
                draggedFileId === item.id && 'opacity-50'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{item.file.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(item.file.size)} · {item.message ?? item.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.progress !== undefined && (
                  <div className="w-20 h-2 rounded-full bg-muted overflow-hidden" aria-label={`${item.progress}% complete`}>
                    <div
                      className={clsx('h-full rounded-full bg-gradient-to-r', config.progressClass)}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === 'processing' && (
                  <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={2} className="animate-spin text-blue-500" />
                )}
                {item.status === 'done' && (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} strokeWidth={2} className="text-emerald-500" />
                )}
                <button
                  type="button"
                  className="rounded-lg border border-border/50 bg-card/60 p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  onClick={() => handleRemove(item.id)}
                  disabled={busy}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            className={clsx(
              'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-semibold leading-snug text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'bg-gradient-to-br',
              config.primaryButtonClass
            )}
            onClick={handleProcess}
            disabled={busy || files.length === 0}
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={2} className={clsx(busy && 'animate-spin')} />
            {busy ? 'Processing…' : 'Process'}
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-semibold leading-snug border border-border/50 bg-card/60 text-foreground transition-colors hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleDownload}
            disabled={!outputs.length || busy}
          >
            <HugeiconsIcon icon={Download01Icon} size={14} strokeWidth={2} />
            {outputs.length <= 1 ? 'Download' : 'Download ZIP'}
          </button>
        </div>
        {footer}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
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
