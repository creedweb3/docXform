'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error' | 'success'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

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
      setNotice({ kind: 'info', message: `${selected.length} file${selected.length > 1 ? 's' : ''} added` });
    },
    []
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
    setFiles((current) =>
      current.map((f) => (f.id === id ? { ...f, progress: Math.min(100, Math.max(0, progress)), message } : f))
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
    setFiles((current) => current.map((f) => ({ ...f, status: 'processing', progress: 0 })));
    try {
      const next = await actions.processFiles(files, setProgress);
      setFiles(next);
      const failures = next.filter((f) => f.status === 'failed').length;
      if (failures === 0) {
        setNotice({ kind: 'success', message: 'All files processed' });
      } else {
        setNotice({ kind: 'error', message: `${failures} file(s) failed` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setNotice({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }, [actions, files, handleValidate, setProgress]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setNotice(null);
  }, []);

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

      <div className="glass-subtle rounded-2xl border border-white/60 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={2} className={config.iconClass} />
            Files
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-white/60 px-2.5 py-1 text-muted-foreground hover:text-foreground transition"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <HugeiconsIcon icon={Add01Icon} size={12} strokeWidth={2} />
              Add
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-white/60 px-2.5 py-1 text-muted-foreground hover:text-foreground transition"
              onClick={handleReset}
              disabled={busy || files.length === 0}
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {files.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">No files added yet.</p>
          )}
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/40 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{item.file.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(item.file.size)} · {item.message ?? item.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.progress !== undefined && (
                  <div className="w-20 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full', config.progressClass)}
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
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            className={clsx(
              'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-semibold leading-snug text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45',
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
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-semibold leading-snug border border-border/50 bg-white/60 text-foreground transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-45"
            onClick={handleDownload}
            disabled={!outputs.length || busy}
          >
            <HugeiconsIcon icon={Download01Icon} size={14} strokeWidth={2} />
            {outputs.length <= 1 ? 'Download' : 'Download ZIP'}
          </button>
        </div>
        {footer}
      </div>
    </div>
  );
}
