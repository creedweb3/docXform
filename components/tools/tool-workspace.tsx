'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Archive01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  Download01Icon,
  File01Icon,
  Pdf01Icon,
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
import { PageGrid, type PageThumb } from '@/components/tools/page-grid';
import type { ToolDefinition } from '@/lib/tools';
import { TONE_STYLES } from '@/components/tools/tone-styles';
import { StudioFabStack } from '@/components/tools/studio/studio-ui';
import { DefaultBatchStudioSurface } from '@/components/tools/studio/default-batch-studio-surface';
import { renderPdfPageThumbnails, revokePdfThumbUrls } from '@/lib/client-previews';

type Status = 'idle' | 'validating' | 'ready' | 'processing' | 'done' | 'failed';

export type WorkspaceFile = {
  id: string;
  file: File;
  status: Status;
  progress?: number;
  message?: string;
  error?: string;
  outputs?: Array<{ name: string; blob: Blob }>;
  preview?: {
    /** object URL for thumbnail (pdf first page or image) */
    thumbUrl?: string;
    /** number of pages (PDF) or frames (if ever added) */
    pageCount?: number;
    /** generic label e.g. PNG, JPEG */
    label?: string;
    /** 'loading' shows skeleton, 'ready' renders thumb, 'error' shows fallback chip */
    status?: 'loading' | 'ready' | 'error';
    error?: string;
  };
};

export type PdfPageGridLayout = 'perFile' | 'single';

export type WorkspacePageGridConfig = {
  layout: PdfPageGridLayout;
  /** Drag thumbnails to reorder output within each PDF (merge, organize, split). */
  allowReorder: boolean;
  /**
   * When true, Process does not require a non-empty page selection; the tool validates.
   * Used by PDF Split when the Range tab ignores grid selection for export.
   */
  optionalSelectionForProcess?: boolean;
  /** Higher values = sharper (slower) page thumbnails in the grid / studio strip. */
  thumbRender?: { maxWidth?: number; jpegQuality?: number };
};

/** Passed to `processFiles` when `config.pageGrid` is set. */
export type PdfPageGridProcessContext = {
  /** When false, tools treat PDFs as full documents. When true, use per-file page lists. */
  active: boolean;
  /** Workspace file id → ordered 1-based page numbers (subset + order). */
  orderedPagesByFileId: Record<string, number[]>;
};

type PerFileGridState = {
  order: number[];
  selected: number[];
  thumbs: PageThumb[];
  thumbsLoad: 'idle' | 'loading' | 'ready' | 'error';
  thumbsError?: string;
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
  /** Optional PDF page thumbnail grid (per-tool). */
  pageGrid?: WorkspacePageGridConfig;
  /** Shown in studio sidebar (e.g. drag-and-drop hint). */
  studioHint?: React.ReactNode;
  /** Label above the default file-card strip when no custom `studioSurface` is passed. */
  studioStageTitle?: string;
};

export type WorkspaceActions = {
  /**
   * Optional batch validator. Used at both add time (per file) and at process time
   * (full batch). Tools can keep returning the existing helper signature.
   */
  validateFiles?: (files: File[]) => Promise<{ ok: boolean; message?: string }>;
  processFiles: (
    files: WorkspaceFile[],
    setProgress: (id: string, progress: number, message?: string) => void,
    pageGrid?: PdfPageGridProcessContext
  ) => Promise<WorkspaceFile[]>;
  /**
   * Optional preview generator. Called per accepted file; return minimal metadata
   * including thumbUrl (object URL) and pageCount if available.
   */
  generatePreview?: (file: File) => Promise<WorkspaceFile['preview']>;
  zipName?: string;
};

/** API passed to `studioSurface` for custom “stage” UIs (merge board, split preview, etc.). */
export type WorkspaceSurfaceApi = {
  files: WorkspaceFile[];
  effectiveBatchMax: number;
  busy: boolean;
  config: WorkspaceConfig;
  draggedFileId: string | null;
  setDraggedFileId: (id: string | null) => void;
  reorderFilesInQueue: (targetId: string) => void;
  handleRemove: (id: string) => void;
  openFilePicker: () => void;
  sortFilesAlphabetically: () => void;
  /** True when this tool uses a PDF page grid and files are queued (always on; no separate toggle). */
  pageGridActive: boolean;
  expandedPageGridFileId: string | null;
  setExpandedPageGridFileId: React.Dispatch<React.SetStateAction<string | null>>;
  activePageGridFileId: string | null;
  gridByFileId: Record<string, PerFileGridState>;
  togglePageSelection: (fileId: string, pageNumber: number) => void;
  selectAllPagesForFile: (fileId: string) => void;
  selectNoPagesForFile: (fileId: string) => void;
  reorderPagesForFile: (fileId: string, fromIndex: number, toIndex: number) => void;
  pageGridToneClass: string;
};

type ToolWorkspaceProps = {
  config: WorkspaceConfig;
  actions: WorkspaceActions;
  /** Optional pill rendered alongside the default dropzone hint chips. */
  subtitle?: React.ReactNode;
  /** Settings panel rendered inside the queue card between the file list and CTAs. */
  footer?: React.ReactNode | ((api: WorkspaceSurfaceApi) => React.ReactNode);
  /**
   * Optional custom stage (merge board, split preview, etc.). When omitted, a default file-card strip is used.
   * With files queued, the workspace always uses the two-column studio shell (stage + sidebar).
   */
  studioSurface?: (api: WorkspaceSurfaceApi) => React.ReactNode;
  /** When provided and returns false, the PageGrid checklist is omitted (thumbnails may still load for studio previews). */
  showPageGridPanel?: (api: WorkspaceSurfaceApi) => boolean;
  /** Fires after the grid snapshot updates (selection, select-all/none, reorder). */
  onPageGridStateChange?: (api: WorkspaceSurfaceApi) => void;
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

/** File list gets its own scroll region (and themed scrollbar) after this many files. */
const QUEUE_SCROLL_AFTER_FILE_COUNT = 4;

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

function defaultPageOrder(pageCount: number): number[] {
  return Array.from({ length: pageCount }, (_, i) => i + 1);
}

function resolveOrderedPagesForFile(state: PerFileGridState | undefined, pageCount: number): number[] {
  if (pageCount <= 0) return [];
  const order = state?.order?.length === pageCount ? state.order : defaultPageOrder(pageCount);
  const selected =
    state?.selected?.length && state.selected.every((p) => p >= 1 && p <= pageCount)
      ? state.selected
      : defaultPageOrder(pageCount);
  const sel = new Set(selected);
  return order.filter((p) => sel.has(p));
}

function placeholderThumbs(order: number[]): PageThumb[] {
  return order.map((p) => ({
    id: `slot-${p}`,
    pageNumber: p,
    status: 'loading' as const,
  }));
}

function revokeGridStateThumbs(state: PerFileGridState | undefined) {
  if (!state?.thumbs?.length) return;
  const urls = state.thumbs
    .filter((t): t is PageThumb & { thumbUrl: string } => typeof t.thumbUrl === 'string' && t.thumbUrl.length > 0)
    .map((t) => ({ thumbUrl: t.thumbUrl }));
  revokePdfThumbUrls(urls);
}

export function ToolWorkspace({ config, actions, subtitle, footer, studioSurface, showPageGridPanel, onPageGridStateChange }: ToolWorkspaceProps) {
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
  const [expandedPageGridFileId, setExpandedPageGridFileId] = useState<string | null>(null);
  const [gridByFileId, setGridByFileId] = useState<Record<string, PerFileGridState>>({});
  const thumbAbortRef = useRef<AbortController | null>(null);
  const gridByFileIdRef = useRef(gridByFileId);

  useLayoutEffect(() => {
    gridByFileIdRef.current = gridByFileId;
  }, [gridByFileId]);

  const reducedMotion = useReducedMotion();
  const perfProfile = useMemo(() => getCachedPerfProfile(), []);
  const { spring, chipMotion, rowExpand } = useMemo(
    () => getMotionBudget(perfProfile, Boolean(reducedMotion)),
    [perfProfile, reducedMotion]
  );

  const toneStyle = config.tone ? TONE_STYLES[config.tone] : undefined;
  const chipClass = toneStyle?.chip ?? 'border-border/40 bg-white/65';
  const pageGridToneClass = toneStyle?.pageGridSelected ?? 'border-border/60 bg-muted/40 text-foreground';
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

  const hasFiles = files.length > 0;
  const pageGridActive = Boolean(config.pageGrid && hasFiles);

  const activePageGridFileId = useMemo(() => {
    if (!config.pageGrid || !hasFiles) return null;
    if (config.pageGrid.layout === 'single') return files[0]?.id ?? null;
    const firstId = files[0]?.id ?? null;
    if (expandedPageGridFileId && files.some((f) => f.id === expandedPageGridFileId)) {
      return expandedPageGridFileId;
    }
    return firstId;
  }, [config.pageGrid, expandedPageGridFileId, files, hasFiles]);

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
  const queueListUsesScrollRegion = files.length > QUEUE_SCROLL_AFTER_FILE_COUNT;
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

  useEffect(() => {
    if (!config.pageGrid) return;
    const ids = new Set(files.map((f) => f.id));
    queueMicrotask(() => {
      setGridByFileId((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (!ids.has(key)) {
            revokeGridStateThumbs(next[key]);
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });
  }, [config.pageGrid, files]);

  const thumbTargetKey = useMemo(() => {
    if (!config.pageGrid || busy || !hasFiles) return null;
    const id = activePageGridFileId;
    if (!id) return null;
    const wf = files.find((f) => f.id === id);
    const pageCount = wf?.preview?.pageCount ?? 0;
    if (!wf || pageCount <= 0) return null;
    return `${id}:${pageCount}:${wf.file.size}:${wf.file.lastModified}`;
  }, [activePageGridFileId, busy, config.pageGrid, files, hasFiles]);

  useEffect(() => {
    if (!thumbTargetKey || !activePageGridFileId) return;
    const wf = files.find((f) => f.id === activePageGridFileId);
    const pageCount = wf?.preview?.pageCount ?? 0;
    if (!wf || pageCount <= 0) return;

    thumbAbortRef.current?.abort();
    const ac = new AbortController();
    thumbAbortRef.current = ac;

    const curSnap = gridByFileIdRef.current[activePageGridFileId];
    const orderSnap =
      curSnap && curSnap.order.length === pageCount && curSnap.order.every((p) => p >= 1 && p <= pageCount)
        ? curSnap.order
        : defaultPageOrder(pageCount);
    const readyMatches =
      curSnap?.thumbsLoad === 'ready' &&
      curSnap.thumbs.length === orderSnap.length &&
      orderSnap.every((p, idx) => curSnap.thumbs[idx]?.pageNumber === p);
    if (readyMatches) {
      return () => {
        ac.abort();
      };
    }

    queueMicrotask(() => {
      setGridByFileId((prev) => {
        const cur = prev[activePageGridFileId];
        const order =
          cur && cur.order.length === pageCount && cur.order.every((p) => p >= 1 && p <= pageCount)
            ? cur.order
            : defaultPageOrder(pageCount);
        const selected =
          cur && cur.selected.length && cur.selected.every((p) => p >= 1 && p <= pageCount)
            ? cur.selected.filter((p) => p <= pageCount)
            : defaultPageOrder(pageCount);
        const alreadyReady =
          cur?.thumbsLoad === 'ready' &&
          cur.thumbs.length === order.length &&
          order.every((p, idx) => cur.thumbs[idx]?.pageNumber === p);
        if (alreadyReady) return prev;
        revokeGridStateThumbs(cur);
        return {
          ...prev,
          [activePageGridFileId]: {
            order,
            selected: selected.length ? selected : [...order],
            thumbs: placeholderThumbs(order),
            thumbsLoad: 'loading',
            thumbsError: undefined,
          },
        };
      });
    });

    void (async () => {
      try {
        const { thumbs: loaded } = await renderPdfPageThumbnails(wf.file, {
          signal: ac.signal,
          maxWidth: config.pageGrid?.thumbRender?.maxWidth ?? 168,
          jpegQuality: config.pageGrid?.thumbRender?.jpegQuality ?? 0.78,
        });
        if (ac.signal.aborted) return;
        const byPage = new Map(loaded.map((t) => [t.pageNumber, t.thumbUrl]));
        setGridByFileId((prev) => {
          const cur = prev[activePageGridFileId];
          if (!cur) return prev;
          const nextThumbs: PageThumb[] = cur.order.map((pageNum) => ({
            id: `page-${pageNum}`,
            pageNumber: pageNum,
            thumbUrl: byPage.get(pageNum),
            status: byPage.has(pageNum) ? 'ready' : 'error',
            error: byPage.has(pageNum) ? undefined : 'Preview failed',
          }));
          return {
            ...prev,
            [activePageGridFileId]: { ...cur, thumbs: nextThumbs, thumbsLoad: 'ready', thumbsError: undefined },
          };
        });
      } catch (err) {
        if (ac.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Preview failed';
        setGridByFileId((prev) => {
          const cur = prev[activePageGridFileId];
          if (!cur) return prev;
          return {
            ...prev,
            [activePageGridFileId]: {
              ...cur,
              thumbsLoad: 'error',
              thumbsError: message,
              thumbs: cur.order.map((p) => ({
                id: `page-${p}`,
                pageNumber: p,
                status: 'error' as const,
                error: message,
              })),
            },
          };
        });
      }
    })();

    return () => {
      ac.abort();
    };
  }, [
    activePageGridFileId,
    files,
    thumbTargetKey,
    config.pageGrid?.thumbRender?.maxWidth,
    config.pageGrid?.thumbRender?.jpegQuality,
  ]);

  useEffect(
    () => () => {
      thumbAbortRef.current?.abort();
      setGridByFileId((prev) => {
        for (const st of Object.values(prev)) {
          revokeGridStateThumbs(st);
        }
        return {};
      });
    },
    []
  );

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

        // Kick off preview generation if provided; mark loading.
        let preview: WorkspaceFile['preview'] | undefined;
        const previewId = crypto.randomUUID();
        if (actions.generatePreview) {
          preview = { status: 'loading' };
          actions
            .generatePreview(file)
            .then((result) => {
              setFiles((current) =>
                current.map((f) =>
                  f.id === previewId ? { ...f, preview: { ...result, status: 'ready' } } : f
                )
              );
            })
            .catch((err) => {
              const message = err instanceof Error ? err.message : 'Preview failed';
              setFiles((current) =>
                current.map((f) =>
                  f.id === previewId ? { ...f, preview: { status: 'error', error: message } } : f
                )
              );
            });
        }
        accepted.push({
          id: previewId,
          file,
          status: 'idle',
          preview,
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

  const selectPageGridFile = useCallback((id: string) => {
    setExpandedPageGridFileId(id);
  }, []);

  const togglePageSelection = useCallback((fileId: string, pageNumber: number) => {
    setGridByFileId((prev) => {
      const cur = prev[fileId];
      if (!cur) return prev;
      const sel = new Set(cur.selected);
      if (sel.has(pageNumber)) sel.delete(pageNumber);
      else sel.add(pageNumber);
      return { ...prev, [fileId]: { ...cur, selected: Array.from(sel).sort((a, b) => a - b) } };
    });
  }, []);

  const selectAllPagesForFile = useCallback((fileId: string) => {
    setGridByFileId((prev) => {
      const cur = prev[fileId];
      if (!cur) return prev;
      return { ...prev, [fileId]: { ...cur, selected: [...cur.order] } };
    });
  }, []);

  const selectNoPagesForFile = useCallback((fileId: string) => {
    setGridByFileId((prev) => {
      const cur = prev[fileId];
      if (!cur) return prev;
      return { ...prev, [fileId]: { ...cur, selected: [] } };
    });
  }, []);

  const reorderPagesForFile = useCallback((fileId: string, fromIndex: number, toIndex: number) => {
    setGridByFileId((prev) => {
      const cur = prev[fileId];
      if (!cur) return prev;
      const order = [...cur.order];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      return { ...prev, [fileId]: { ...cur, order } };
    });
  }, []);

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
      let pageGridCtx: PdfPageGridProcessContext | undefined;
      if (config.pageGrid) {
        pageGridCtx = {
          active: true,
          orderedPagesByFileId: Object.fromEntries(
            files.map((f) => {
              const n = f.preview?.pageCount ?? 0;
              return [f.id, n > 0 ? resolveOrderedPagesForFile(gridByFileId[f.id], n) : []];
            })
          ),
        };
        {
          const missingPreview = files.some((f) => !(f.preview?.pageCount && f.preview.pageCount > 0));
          if (missingPreview) {
            showNotice(
              'Wait for PDF previews to finish loading before processing with the page grid.',
              { kind: 'error', autoClear: true }
            );
            setBusy(false);
            setFiles((current) => current.map((f) => ({ ...f, status: 'idle', progress: undefined })));
            processStartedAtRef.current = null;
            return;
          }
          const requireSelection = config.pageGrid.optionalSelectionForProcess !== true;
          if (requireSelection) {
            const emptySelection = files.some((f) => {
              const n = f.preview?.pageCount ?? 0;
              if (!n) return false;
              return resolveOrderedPagesForFile(gridByFileId[f.id], n).length === 0;
            });
            if (emptySelection) {
              showNotice('Select at least one page for each PDF in the page grid.', {
                kind: 'error',
                autoClear: true,
              });
              setBusy(false);
              setFiles((current) => current.map((f) => ({ ...f, status: 'idle', progress: undefined })));
              processStartedAtRef.current = null;
              return;
            }
          }
        }
      }

      const next = await actions.processFiles(files, setProgress, pageGridCtx);
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
  }, [actions, config.pageGrid, files, gridByFileId, setProgress, showNotice]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDuplicatePrompt(null);
    setExpandedPageGridFileId(null);
    setGridByFileId((prev) => {
      for (const st of Object.values(prev)) {
        revokeGridStateThumbs(st);
      }
      return {};
    });
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

  const sortFilesAlphabetically = useCallback(() => {
    setFiles((cur) => [...cur].sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { sensitivity: 'base' })));
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const surfaceApi: WorkspaceSurfaceApi = useMemo(
    () => ({
      files,
      effectiveBatchMax,
      busy,
      config,
      draggedFileId,
      setDraggedFileId,
      reorderFilesInQueue: handleReorder,
      handleRemove,
      openFilePicker,
      sortFilesAlphabetically,
      pageGridActive,
      expandedPageGridFileId,
      setExpandedPageGridFileId,
      activePageGridFileId,
      gridByFileId,
      togglePageSelection,
      selectAllPagesForFile,
      selectNoPagesForFile,
      reorderPagesForFile,
      pageGridToneClass,
    }),
    [
      files,
      effectiveBatchMax,
      busy,
      config,
      draggedFileId,
      handleReorder,
      handleRemove,
      openFilePicker,
      sortFilesAlphabetically,
      pageGridActive,
      expandedPageGridFileId,
      activePageGridFileId,
      gridByFileId,
      togglePageSelection,
      selectAllPagesForFile,
      selectNoPagesForFile,
      reorderPagesForFile,
      pageGridToneClass,
    ]
  );

  const pageGridPanelVisible = useMemo(() => {
    if (!config.pageGrid || !activePageGridFileId) return false;
    if (showPageGridPanel && !showPageGridPanel(surfaceApi)) return false;
    const st = gridByFileId[activePageGridFileId];
    const wf = files.find((f) => f.id === activePageGridFileId);
    const pageCount = wf?.preview?.pageCount ?? 0;
    return !!(st && wf && pageCount > 0);
  }, [config.pageGrid, activePageGridFileId, showPageGridPanel, surfaceApi, gridByFileId, files]);

  const surfaceApiRef = useRef(surfaceApi);
  surfaceApiRef.current = surfaceApi;

  useEffect(() => {
    onPageGridStateChange?.(surfaceApiRef.current);
  }, [gridByFileId, onPageGridStateChange]);

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

  const renderResultChips = (item: WorkspaceFile) => {
    const chips: string[] = [];
    const outputs = item.outputs ?? [];
    if (outputs.length > 1) {
      chips.push(`${outputs.length} outputs`);
    }
    const beforeBytes = item.file.size;
    const afterBytes = outputs.reduce((total, out) => total + (out.blob?.size ?? 0), 0);
    if (afterBytes > 0 && beforeBytes > 0) {
      const saved = beforeBytes - afterBytes;
      const savedPct = Math.max(0, Math.round((saved / beforeBytes) * 100));
      chips.push(
        saved >= 0
          ? `${formatBytes(afterBytes)} (${savedPct}% smaller)`
          : `${formatBytes(afterBytes)}`
      );
    }
    if (item.preview?.pageCount) {
      chips.push(`${item.preview.pageCount} page${item.preview.pageCount === 1 ? '' : 's'}`);
    }
    return chips;
  };

  const renderPageGridPanel = () => {
    if (!config.pageGrid || !activePageGridFileId) return null;
    if (showPageGridPanel && !showPageGridPanel(surfaceApi)) return null;
    const st = gridByFileId[activePageGridFileId];
    const wf = files.find((f) => f.id === activePageGridFileId);
    const pageCount = wf?.preview?.pageCount ?? 0;
    if (!st || !wf || pageCount <= 0) return null;
    const byPage = new Map(st.thumbs.map((t) => [t.pageNumber, t]));
    const gridPages: PageThumb[] = st.order.map((p) => {
      const t = byPage.get(p);
      return (
        t ?? {
          id: `pending-${p}`,
          pageNumber: p,
          status: st.thumbsLoad === 'loading' ? ('loading' as const) : ('error' as const),
          error: st.thumbsError,
        }
      );
    });
    const selected = new Set(st.selected);
    return (
      <div id={`page-grid-${activePageGridFileId}`} className="px-1 pt-1">
        <p className="mb-2 text-center text-[11px] text-muted-foreground sm:text-left">
          {config.pageGrid.layout === 'perFile' ? (
            <>
              <span className="font-medium text-foreground">{wf.file.name}</span> — drag to reorder pages, uncheck to
              omit.
            </>
          ) : (
            <>Drag to reorder pages, uncheck to omit.</>
          )}
        </p>
        <PageGrid
          toneClass={pageGridToneClass}
          pages={gridPages}
          selected={selected}
          onToggle={(p) => togglePageSelection(activePageGridFileId, p)}
          onSelectAll={() => selectAllPagesForFile(activePageGridFileId)}
          onSelectNone={() => selectNoPagesForFile(activePageGridFileId)}
          reorderable={config.pageGrid.allowReorder}
          onReorder={
            config.pageGrid.allowReorder
              ? (from, to) => reorderPagesForFile(activePageGridFileId, from, to)
              : undefined
          }
          compact
        />
      </div>
    );
  };

  const renderQueueListScroll = () => (
    <div className="w-full min-w-0 shrink-0 overflow-x-clip">
      <div
        className="flex w-full min-w-0 flex-col gap-2 py-0.5 pr-1"
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
                'min-h-12 min-w-0 overflow-hidden rounded-xl border border-border/45 bg-white/60 px-2.5 py-2 box-border transition focus-within:ring-2 focus-within:ring-ring',
                draggedFileId === item.id && 'opacity-50',
                isReorderable && 'cursor-grab active:cursor-grabbing'
              )}
            >
              <div className="flex w-full items-center gap-2.5">
                <div className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg ${config.iconBoxClass} flex items-center justify-center`}>
                  {item.status === 'done' ? (
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={22}
                      strokeWidth={1.7}
                      className={config.iconClass}
                    />
                  ) : item.status === 'processing' ? (
                    <HugeiconsIcon
                      icon={RefreshIcon}
                      size={22}
                      strokeWidth={1.7}
                      className={clsx(config.iconClass, 'animate-spin')}
                    />
                  ) : /\.pdf$/i.test(item.file.name) ? (
                    <div
                      className={clsx(
                        'flex h-full w-full items-center justify-center rounded-lg bg-white/50',
                        item.preview?.status === 'loading' && 'animate-pulse'
                      )}
                    >
                      <HugeiconsIcon icon={Pdf01Icon} size={26} strokeWidth={1.55} className={config.iconClass} />
                    </div>
                  ) : item.preview?.status === 'ready' && item.preview.thumbUrl ? (
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      {/* Using img here intentionally to avoid Next.js image overhead for tiny thumbnails */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.preview.thumbUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : item.preview?.status === 'loading' ? (
                    <div className="h-full w-full animate-pulse rounded-lg bg-white/60" />
                  ) : (
                    <HugeiconsIcon icon={File01Icon} size={22} strokeWidth={1.7} className={config.iconClass} />
                  )}
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
                      {config.pageGrid?.layout === 'perFile' &&
                        pageGridActive &&
                        !busy &&
                        (item.preview?.pageCount ?? 0) > 0 && (
                          <button
                            type="button"
                            onClick={() => selectPageGridFile(item.id)}
                            className={clsx(
                              `inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${config.iconClass} hover:opacity-80`,
                              activePageGridFileId === item.id && 'ring-2 ring-offset-1 ring-offset-background ring-current/25'
                            )}
                            aria-pressed={activePageGridFileId === item.id}
                            aria-controls={`page-grid-${item.id}`}
                          >
                            Pages
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
                  {/* Result/preview chips */}
                  {item.status === 'done' || item.preview?.pageCount ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {renderResultChips(item).map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40"
                        >
                          {chip}
                        </span>
                      ))}
                      {item.preview?.status === 'error' && item.preview.error && (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600 border border-rose-200/70">
                          {item.preview.error}
                        </span>
                      )}
                    </div>
                  ) : null}
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
  );

  const renderQueueToolbar = () => (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-start">
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
  );

  const renderCtaRow = () => (
    <div className="flex w-full min-w-0 flex-col gap-2">
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
          <HugeiconsIcon icon={File01Icon} size={15} strokeWidth={2} className="shrink-0 opacity-60" />
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
  );

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
            <div
              className={clsx(
                'grid w-full gap-5 xl:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]',
                pageGridPanelVisible
                  ? 'lg:items-start'
                  : 'lg:items-stretch lg:min-h-[calc(100dvh-8rem)]'
              )}
            >
              <div
                className={clsx(
                  'relative flex min-w-0 flex-col gap-4 rounded-2xl border border-border/40 bg-[#f4f5f7] p-4 sm:p-6 dark:bg-muted/25',
                  pageGridPanelVisible
                    ? 'min-h-[min(52vh,28rem)] max-h-[calc(100dvh-9rem)] overflow-x-hidden overflow-y-hidden'
                    : 'h-full min-h-0 min-w-0 overflow-hidden'
                )}
              >
                {config.allowMultiple ? (
                  <StudioFabStack
                    fileCount={files.length}
                    maxFiles={effectiveBatchMax}
                    busy={busy}
                    onAdd={openFilePicker}
                    onSort={files.length > 1 ? sortFilesAlphabetically : undefined}
                    showSort
                    primaryButtonClass={config.primaryButtonClass}
                  />
                ) : null}
                <div
                  className={clsx(
                    'min-h-0 w-full min-w-0',
                    !pageGridPanelVisible && 'flex flex-1 flex-col'
                  )}
                >
                  {/* eslint-disable-next-line react-hooks/refs -- false positive: surfaceApi is state snapshot; refs only used when callers invoke picker */}
                  {studioSurface ? studioSurface(surfaceApi) : <DefaultBatchStudioSurface api={surfaceApi} />}
                </div>
                {renderPageGridPanel()}
              </div>
              <aside
                className={clsx(
                  'flex min-w-0 flex-col gap-4 rounded-2xl border border-border/50 bg-white/65 p-4 shadow-sm backdrop-blur-md sm:p-5 lg:sticky lg:top-36',
                  pageGridPanelVisible
                    ? 'min-h-0'
                    : 'h-full w-full min-h-0 overflow-x-clip overflow-y-visible'
                )}
              >
                {config.studioHint ? (
                  <div className="flex shrink-0 gap-2.5 overflow-hidden rounded-xl bg-sky-50/90 p-3 text-[11px] leading-relaxed text-sky-950 ring-1 ring-sky-200/50 dark:bg-sky-950/25 dark:text-sky-100 dark:ring-sky-500/25">
                    <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
                    <div className="min-w-0">{config.studioHint}</div>
                  </div>
                ) : null}
                <div className="shrink-0 border-b border-border/30 pb-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">{queuedTitle}</h2>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    Queue: {files.length} of {effectiveBatchMax} files. Selected total:{' '}
                    {formatBytes(totalBytes)}.
                  </p>
                </div>
                <div className="shrink-0">{renderQueueToolbar()}</div>
                <div
                  className={clsx(
                    'flex min-h-0 flex-col gap-4 overflow-x-clip',
                    !pageGridPanelVisible && 'min-h-0 flex-1'
                  )}
                >
                  <div
                    ref={queueListScrollRef}
                    className={clsx(
                      'w-full min-w-0 overflow-x-clip',
                      queueListUsesScrollRegion
                        ? clsx(
                            'min-h-0 shrink-0 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]',
                            pageGridPanelVisible ? 'max-h-[min(50vh,24rem)]' : 'max-h-72'
                          )
                        : 'shrink-0'
                    )}
                  >
                    {renderQueueListScroll()}
                  </div>
                  <div
                    className={clsx(
                      'flex w-full min-w-0 flex-col gap-3 pb-0.5',
                      !pageGridPanelVisible && 'shrink-0 overflow-x-clip'
                    )}
                  >
                    {/* eslint-disable-next-line react-hooks/refs -- false positive: surfaceApi snapshot; footer may read queue/grid only */}
                    {typeof footer === 'function' ? footer(surfaceApi) : footer}
                    {renderCtaRow()}
                  </div>
                </div>
              </aside>
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
