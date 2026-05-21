'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { DragDropVerticalIcon, GitMergeIcon, Image01Icon } from '@hugeicons/core-free-icons';
import type { WorkspaceSurfaceApi } from '@/components/tools/tool-workspace';
import { getStudioAccent } from '@/components/tools/studio-accent';
import { TONE_STYLES } from '@/components/tools/tone-styles';
import type { SplitMode } from '@/lib/tool-runs/pdf-split';
import type { RotateAngle } from '@/lib/tool-runs/pdf-rotate';
import type { WatermarkPosition } from '@/lib/tool-runs/pdf-watermark';
import {
  computeRangeCardColSpans,
  computeRangeCardColSpansMobile,
  pairSingleWideIndices,
  rangeCardGridColSpan,
} from '@/lib/pdf-split-range-layout';

export function PdfMergeStudioSurface({ api }: { api: WorkspaceSurfaceApi }) {
  const { files, busy, draggedFileId, setDraggedFileId, reorderFilesInQueue, config } = api;
  const isReorderable = config.allowMultiple && files.length > 1 && !busy;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Merge order</p>
        <HugeiconsIcon icon={GitMergeIcon} size={16} strokeWidth={2} className={config.iconClass} />
      </div>
      <div className="flex min-h-[200px] flex-1 flex-wrap content-start items-stretch justify-center gap-3 sm:justify-start">
        {files.map((item, index) => (
          <div
            key={item.id}
            draggable={isReorderable}
            onDragStart={() => isReorderable && setDraggedFileId(item.id)}
            onDragOver={(e) => isReorderable && e.preventDefault()}
            onDrop={() => isReorderable && reorderFilesInQueue(item.id)}
            onDragEnd={() => setDraggedFileId(null)}
            className={clsx(
              'flex w-[min(100%,11rem)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-white/70 shadow-sm transition',
              draggedFileId === item.id && 'opacity-50',
              isReorderable && 'cursor-grab active:cursor-grabbing hover:border-border'
            )}
          >
            <div className="relative aspect-[3/4] w-full bg-muted/30">
              {item.preview?.status === 'ready' && item.preview.thumbUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.preview.thumbUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                  Preview…
                </div>
              )}
              <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-xs font-bold text-white shadow">
                {index + 1}
              </span>
            </div>
            <div className="border-t border-border/40 px-2 py-2">
              <p className="truncate text-center text-[11px] font-medium text-foreground" title={item.file.name}>
                {item.file.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function splitGroupsForBar(mode: SplitMode, pageCount: number): number[][] {
  const n = Math.max(1, pageCount);
  if (mode.kind === 'every') {
    const interval = Math.max(1, mode.interval);
    return Array.from({ length: Math.ceil(n / interval) }, (_, i) =>
      Array.from({ length: interval }, (_, j) => i * interval + j + 1).filter((p) => p <= n)
    ).filter((g) => g.length > 0);
  }
  return mode.ranges
    .map((r) => r.filter((p) => p >= 1 && p <= n))
    .filter((g) => g.length > 0);
}

function thumbForPage(
  st: WorkspaceSurfaceApi['gridByFileId'][string] | undefined,
  pageNum: number
) {
  return st?.thumbs.find((t) => t.pageNumber === pageNum);
}

function PageThumbCard({
  pageNum,
  thumb,
  highlight,
  size = 'default',
  fillCellHeight = false,
  inlineInGroup = false,
  captionTop = false,
  selectOutlineClass,
}: {
  pageNum: number;
  thumb?: { status: 'ready' | 'loading' | 'error'; thumbUrl?: string; error?: string };
  highlight?: 'select' | 'out' | 'none';
  selectOutlineClass?: string;
  /** Smaller thumb for dense range preview (side‑by‑side in a grid cell). */
  size?: 'default' | 'sm';
  /** Grow the preview area to use vertical space inside a range card. */
  fillCellHeight?: boolean;
  /** Fixed width in a range row (dense range preview). */
  inlineInGroup?: boolean;
  /** When true, “Page n” sits above the preview (split pages grid). */
  captionTop?: boolean;
}) {
  const sm = size === 'sm';
  /** Tight inset so object-contain has maximum room; avoids corner clipping vs heavy outer radius. */
  const pad = sm ? 'p-0.5' : 'p-1';
  const caption = (
    <p
      className={clsx(
        'shrink-0 text-center font-medium',
        highlight === 'out' ? 'text-muted-foreground' : 'text-foreground',
        sm ? 'text-[10px] leading-tight' : 'text-[11px]'
      )}
    >
      Page {pageNum}
    </p>
  );
  return (
    <div
      className={clsx(
        'flex min-w-0 flex-col gap-0.5',
        captionTop && 'gap-1',
        inlineInGroup
          ? clsx('shrink-0', sm ? 'w-[4.25rem]' : 'w-[6.75rem]', 'max-md:w-[4.25rem]')
          : clsx(
              'mx-auto flex',
              sm ? 'w-[4.25rem] max-w-[4.25rem] shrink-0' : 'w-full min-w-0 max-w-[6.75rem]',
              fillCellHeight && 'h-full min-h-0'
            )
      )}
    >
      {captionTop ? caption : null}
      <div
        className={clsx(
          'relative flex w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-border/50 bg-white shadow-sm',
          fillCellHeight
            ? 'min-h-[4.5rem] flex-1'
            : clsx(
                sm ? 'h-28' : 'h-40',
                'max-md:h-auto max-md:w-full max-md:max-w-[4.25rem] max-md:shrink-0 max-md:aspect-[85/110] max-md:mx-auto'
              ),
          highlight === 'select' && selectOutlineClass,
          highlight === 'out' &&
            'border-dashed border-muted-foreground/50 bg-muted/20 ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]'
        )}
      >
        <div
          className={clsx(
            'box-border flex min-h-0 w-full flex-1 items-center justify-center',
            pad,
            fillCellHeight && 'min-h-0 flex-1'
          )}
        >
          {thumb?.status === 'ready' && thumb.thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumb.thumbUrl}
              alt=""
              className={clsx(
                'h-auto w-auto max-h-full max-w-full object-contain object-center',
                highlight === 'out' && 'opacity-[0.88]'
              )}
              loading="lazy"
            />
          ) : thumb?.status === 'loading' || !thumb ? (
            <div className="h-full min-h-[4rem] w-full animate-pulse rounded-sm bg-muted/40" />
          ) : (
            <span className="px-1 text-center text-[9px] text-rose-600">{thumb.error ?? 'Preview failed'}</span>
          )}
        </div>
      </div>
      {!captionTop ? caption : null}
    </div>
  );
}

/** Range preview dashed cards: single-page groups (grid col-span set per card). */
const PDF_SPLIT_RANGE_CARD_CLASS =
  'flex h-full min-h-0 w-full min-w-0 flex-col gap-2 rounded-xl border-2 border-dashed border-zinc-400/65 bg-white/55 px-3 pb-2 pt-2 shadow-sm dark:border-zinc-500/60 dark:bg-muted/20';

/** Full-row multi on 6-column grid. */
const PDF_SPLIT_RANGE_CARD_ALONE_MULTI_CLASS =
  'col-span-6 grid h-full min-h-0 w-full min-w-0 grid-rows-[auto_minmax(0,1fr)] rounded-xl border-2 border-dashed border-zinc-400/65 bg-white/55 px-0 pb-2 pt-2 shadow-sm gap-y-2 dark:border-zinc-500/60 dark:bg-muted/20';

/** Multi paired with single on one row (4 of 6 cols). */
const PDF_SPLIT_RANGE_CARD_PAIR_MULTI_CLASS =
  'col-span-4 grid h-full min-h-0 w-full min-w-0 grid-rows-[auto_minmax(0,1fr)] rounded-xl border-2 border-dashed border-zinc-400/65 bg-white/55 px-0 pb-2 pt-2 shadow-sm gap-y-2 dark:border-zinc-500/60 dark:bg-muted/20';

/** Two equal halves; each thumb centered in its half (1.5+1.5 style positioning). */
const PDF_SPLIT_RANGE_MULTI_THUMBS_CLASS =
  'relative grid min-h-0 min-w-0 grid-cols-2 items-center gap-x-3 sm:gap-x-4';

const RANGE_GRID_COL_SPAN: Record<2 | 3 | 4 | 6, string> = {
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
};

export function PdfSplitStudioSurface({
  api,
  mode,
  splitTab,
  extractMode,
  mergeRangeOutputs,
  mergeExtractedIntoOne,
}: {
  api: WorkspaceSurfaceApi;
  mode: SplitMode;
  splitTab: 'range' | 'pages' | 'size';
  extractMode: 'all' | 'select';
  /** When true, range split produces one merged PDF (same count logic as the sidebar info banner). */
  mergeRangeOutputs: boolean;
  /** When true, pages export merges into one PDF. */
  mergeExtractedIntoOne: boolean;
}) {
  const file = api.files[0];
  const preview = file?.preview;
  const pageCount = preview?.pageCount ?? 0;
  /** Queue has a file but PDF.js preview has not returned page count yet (or is in flight). */
  const previewPending =
    !!file && pageCount <= 0 && preview?.status !== 'error' && preview?.status !== 'ready';
  const previewFailed = preview?.status === 'error';
  const st = file ? api.gridByFileId[file.id] : undefined;
  const order =
    st && st.order.length === pageCount && st.order.every((p) => p >= 1 && p <= pageCount)
      ? st.order
      : Array.from({ length: pageCount }, (_, i) => i + 1);
  const selectedSet = useMemo(() => {
    if (!st || pageCount <= 0) {
      return new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
    const raw = st.selected;
    if (raw.length === 0) return new Set<number>();
    if (!raw.every((p) => p >= 1 && p <= pageCount)) {
      return new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
    return new Set(raw);
  }, [st, pageCount]);
  const groups = pageCount > 0 && splitTab === 'range' ? splitGroupsForBar(mode, pageCount) : [];
  const rangeColSpans = useMemo(() => computeRangeCardColSpans(groups), [groups]);
  const rangeColSpansMobile = useMemo(() => computeRangeCardColSpansMobile(groups), [groups]);
  const pairSingleWide = useMemo(() => pairSingleWideIndices(rangeColSpans), [rangeColSpans]);
  const rangeOutputPdfCount =
    pageCount > 0 && splitTab === 'range' && groups.length > 0
      ? mergeRangeOutputs
        ? 1
        : groups.length
      : 0;
  const studioOutputFileCount =
    splitTab === 'range' && rangeOutputPdfCount > 0
      ? rangeOutputPdfCount
      : splitTab === 'pages' && pageCount > 0
        ? mergeExtractedIntoOne
          ? 1
          : extractMode === 'all'
            ? pageCount
            : selectedSet.size
        : 0;
  const studioMergeMode =
    splitTab === 'range' ? mergeRangeOutputs : splitTab === 'pages' ? mergeExtractedIntoOne : false;
  const studioOutputPillLabel =
    studioOutputFileCount > 0
      ? `${studioOutputFileCount} file${studioOutputFileCount === 1 ? '' : 's'}${studioMergeMode ? ' · Merge mode' : ''}`
      : null;
  const toneKey = api.config.tone;
  const studioAccent = getStudioAccent(toneKey);
  const scrollThumbStyle: CSSProperties | undefined =
    toneKey && TONE_STYLES[toneKey]
      ? ({
          '--queue-scrollbar-thumb': TONE_STYLES[toneKey].scrollbarThumb,
          '--queue-scrollbar-thumb-hover': TONE_STYLES[toneKey].scrollbarThumbHover,
        } as CSSProperties)
      : undefined;

  const studioPillClass =
    toneKey && TONE_STYLES[toneKey]?.studioInfoPill
      ? TONE_STYLES[toneKey].studioInfoPill
      : 'border-border/50 bg-muted/35 text-foreground ring-1 ring-border/40';
  const studioPillIconClass =
    toneKey && TONE_STYLES[toneKey]?.iconText ? TONE_STYLES[toneKey].iconText : 'text-muted-foreground';

  const selectThumbMode =
    splitTab === 'pages' && extractMode === 'select' && Boolean(api.config.pageGrid);
  const reorderThumbs = Boolean(selectThumbMode && api.config.pageGrid?.allowReorder);
  const [draggingFrom, setDraggingFrom] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => (event: DragEvent<HTMLDivElement>) => {
    setDraggingFrom(index);
    try {
      event.dataTransfer.setData('text/plain', String(index));
      event.dataTransfer.effectAllowed = 'move';
    } catch {
      /* ignore */
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingFrom(null);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropOn = useCallback(
    (fileId: string, toIndex: number) => (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('text/plain');
      const from = Number(raw);
      setDraggingFrom(null);
      if (!Number.isInteger(from) || from < 0 || from === toIndex) return;
      api.reorderPagesForFile(fileId, from, toIndex);
    },
    [api]
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2 basis-0 min-h-0 max-md:basis-auto max-md:gap-2.5">
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 px-3 pr-2 max-md:px-2.5 max-md:pr-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground max-md:text-xs">
          {splitTab === 'range' ? 'Split preview' : splitTab === 'pages' ? 'Page previews' : 'By size'}
        </p>
        {selectThumbMode && file ? (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api.selectAllPagesForFile(file.id);
              }}
              className={clsx(
                'inline-flex min-h-8 shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] font-medium shadow-sm transition hover:brightness-[0.97] active:scale-[0.99]',
                studioPillClass
              )}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api.selectNoPagesForFile(file.id);
              }}
              className={clsx(
                'inline-flex min-h-8 shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] font-medium shadow-sm transition hover:brightness-[0.97] active:scale-[0.99]',
                studioPillClass
              )}
            >
              Clear
            </button>
            <span
            className={clsx(
              'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 tabular-nums text-[11px] font-medium shadow-sm max-md:min-h-7 max-md:px-3',
              studioPillClass
            )}
          >
            {selectedSet.size}/{pageCount}
          </span>
          </div>
        ) : studioOutputPillLabel ? (
          <span
            className={clsx(
              'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm',
              studioPillClass
            )}
          >
            {studioOutputPillLabel}
          </span>
        ) : pageCount > 0 && splitTab === 'size' ? (
          <span
            className={clsx(
              'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm',
              studioPillClass
            )}
          >
            {pageCount} page{pageCount === 1 ? '' : 's'}
          </span>
        ) : previewPending ? (
          <span
            className={clsx(
              'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm animate-pulse',
              studioPillClass
            )}
          >
            Loading…
          </span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-start min-h-0 max-md:min-h-[min(56vh,26rem)]">
        {pageCount > 0 &&
        file &&
        !previewFailed &&
        !previewPending &&
        splitTab === 'range' &&
        groups.length > 0 ? (
          <div className="mb-1.5 min-w-0 shrink-0 px-3 pr-2 max-md:mb-1 max-md:px-2">
            <details className={clsx('rounded-2xl shadow-sm md:hidden', studioPillClass)}>
              <summary className="cursor-pointer list-none px-3 py-2.5 text-[11px] font-semibold leading-snug marker:content-none min-h-11 flex items-center [&::-webkit-details-marker]:hidden">
                {rangeOutputPdfCount} PDF{rangeOutputPdfCount === 1 ? '' : 's'} · tap for details
              </summary>
              <p className="border-t border-border/15 px-2.5 pb-2 pt-1.5 text-[10px] leading-snug text-muted-foreground">
                {mergeRangeOutputs
                  ? 'Each dashed group merges into one ordered PDF.'
                  : 'Each dashed box is one output file.'}
              </p>
            </details>
            <p
              className={clsx(
                'hidden w-full rounded-2xl px-3 py-2 text-left text-[11px] leading-snug shadow-sm md:block',
                studioPillClass
              )}
            >
              {mergeRangeOutputs
                ? `Preview shows each range group; they merge into one ordered PDF · ${rangeOutputPdfCount} PDF${rangeOutputPdfCount === 1 ? '' : 's'} will be created`
                : `Dashed boxes are output groups · ${rangeOutputPdfCount} PDF${rangeOutputPdfCount === 1 ? '' : 's'} will be created`}
            </p>
          </div>
        ) : null}
        {pageCount > 0 &&
        file &&
        !previewFailed &&
        !previewPending &&
        splitTab === 'pages' ? (
          <div className="mb-1.5 min-w-0 shrink-0 px-3 pr-2">
            <p
              className={clsx(
                'w-full rounded-2xl px-3 py-2 text-left text-[11px] leading-snug shadow-sm',
                studioPillClass
              )}
            >
              {selectThumbMode
                ? `Highlighted outline = included; dimmed = skipped. Click a page to toggle.${
                    reorderThumbs ? ' Drag the preview or the “Drag” row below to reorder.' : ''
                  }`
                : 'All pages are included. Choose “Select pages” to pick a subset.'}
            </p>
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {splitTab === 'size' ? (
        <p className="rounded-xl border border-border/50 bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
          Splitting by target file size is not available in this version.
        </p>
      ) : !file ? (
        <p className="rounded-xl border border-dashed border-border/50 bg-white/50 px-3 py-10 text-center text-sm text-muted-foreground">
          Add a PDF to preview every page and how outputs group.
        </p>
      ) : previewFailed ? (
        <p className="rounded-xl border border-dashed border-rose-200/80 bg-rose-50/80 px-3 py-10 text-center text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          {preview?.error ?? 'Could not load a preview of this PDF.'}
        </p>
      ) : previewPending ? (
        <p className="rounded-xl border border-dashed border-border/50 bg-white/50 px-3 py-10 text-center text-sm text-muted-foreground animate-pulse">
          Loading PDF preview…
        </p>
      ) : pageCount <= 0 ? (
        <p className="rounded-xl border border-dashed border-border/50 bg-white/50 px-3 py-10 text-center text-sm text-muted-foreground">
          This PDF has no readable pages, or the preview did not finish loading.
        </p>
      ) : splitTab === 'range' && groups.length > 0 ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="queue-list-scrollbar min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-y-contain px-3 py-1.5 pr-2"
            style={scrollThumbStyle}
          >
            <div className="grid min-w-0 grid-cols-6 items-stretch gap-x-3 gap-y-3 sm:gap-x-4 max-md:grid-cols-2 max-md:items-start max-md:gap-2">
              {groups.map((pages, gi) => {
                const lo = Math.min(...pages);
                const hi = Math.max(...pages);
                const isMultiPageRange = pages.length > 1;
                const logicalSpan = rangeColSpans[gi] ?? (isMultiPageRange ? 3 : 1);
                const gridSpan = rangeCardGridColSpan(logicalSpan, pairSingleWide.has(gi));
                const gridSpanClass = RANGE_GRID_COL_SPAN[gridSpan];
                const mobileSpan = rangeColSpansMobile[gi] ?? (isMultiPageRange ? 2 : 2);
                return logicalSpan === 3 && isMultiPageRange ? (
                  <div
                    key={`g-${gi}-${lo}-${hi}`}
                    className={clsx(
                      PDF_SPLIT_RANGE_CARD_ALONE_MULTI_CLASS,
                      'max-md:col-span-2 max-md:h-auto mobile-range-card max-md:gap-y-2.5'
                    )}
                  >
                    <p className="col-span-6 px-3 text-center text-[11px] font-semibold text-foreground">
                      Range {gi + 1}
                    </p>
                    <div className={clsx(PDF_SPLIT_RANGE_MULTI_THUMBS_CLASS, 'col-span-6 px-1 sm:px-2')}>
                      <div className="flex min-w-0 justify-center">
                        <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo)} highlight="none" inlineInGroup />
                      </div>
                      <div className="flex min-w-0 justify-center">
                        <PageThumbCard pageNum={hi} thumb={thumbForPage(st, hi)} highlight="none" inlineInGroup />
                      </div>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-lg font-medium leading-none text-muted-foreground"
                      >
                        …
                      </span>
                    </div>
                  </div>
                ) : isMultiPageRange && logicalSpan === 2 ? (
                  <div
                    key={`g-${gi}-${lo}-${hi}`}
                    className={clsx(
                      PDF_SPLIT_RANGE_CARD_PAIR_MULTI_CLASS,
                      'max-md:col-span-2 max-md:h-auto mobile-range-card max-md:gap-y-2.5'
                    )}
                  >
                    <p className="col-span-4 px-3 text-center text-[11px] font-semibold text-foreground">
                      Range {gi + 1}
                    </p>
                    <div className={clsx(PDF_SPLIT_RANGE_MULTI_THUMBS_CLASS, 'col-span-4 px-1 sm:px-2')}>
                      <div className="flex min-w-0 justify-center">
                        <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo)} highlight="none" inlineInGroup />
                      </div>
                      <div className="flex min-w-0 justify-center">
                        <PageThumbCard pageNum={hi} thumb={thumbForPage(st, hi)} highlight="none" inlineInGroup />
                      </div>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-lg font-medium leading-none text-muted-foreground"
                      >
                        …
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={`g-${gi}-${lo}-${hi}`}
                    className={clsx(
                      PDF_SPLIT_RANGE_CARD_CLASS,
                      gridSpanClass,
                      'max-md:h-auto max-md:items-center max-md:justify-center max-md:gap-2 max-md:py-2.5 mobile-range-card',
                      mobileSpan === 2 ? 'max-md:col-span-2' : 'max-md:col-span-1'
                    )}
                  >
                    <p className="shrink-0 text-center text-[11px] font-semibold text-foreground max-md:text-xs">
                      Range {gi + 1}
                    </p>
                    <div className="flex w-full min-w-0 flex-col items-center justify-center max-md:flex-none">
                      <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo)} highlight="none" inlineInGroup />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="queue-list-scrollbar min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-y-contain px-3 py-1.5 pr-2"
            style={scrollThumbStyle}
          >
            <div
              id={selectThumbMode && file ? `page-grid-${file.id}` : undefined}
              className="grid min-w-0 grid-cols-3 items-start justify-items-center gap-x-2 gap-y-3 sm:gap-x-3 max-md:grid-cols-2"
            >
              {order.map((pageNum, index) => {
                const thumb = thumbForPage(st, pageNum);
                const highlight = selectThumbMode
                  ? selectedSet.has(pageNum)
                    ? 'select'
                    : 'out'
                  : 'none';
                return (
                  <div
                    key={pageNum}
                    className={clsx(
                      'flex min-w-0 flex-col items-stretch',
                      reorderThumbs && draggingFrom === index && 'opacity-65'
                    )}
                    onDragOver={reorderThumbs ? handleDragOver : undefined}
                    onDrop={reorderThumbs && file ? handleDropOn(file.id, index) : undefined}
                  >
                    <div
                      draggable={reorderThumbs}
                      onDragStart={reorderThumbs ? handleDragStart(index) : undefined}
                      onDragEnd={reorderThumbs ? handleDragEnd : undefined}
                      role={selectThumbMode ? 'button' : undefined}
                      tabIndex={selectThumbMode ? 0 : undefined}
                      aria-label={
                        selectThumbMode && file
                          ? reorderThumbs
                            ? `Page ${pageNum}, press to include or exclude; drag preview or row below to reorder`
                            : `Page ${pageNum}, press to include or exclude`
                          : undefined
                      }
                      onClick={
                        selectThumbMode && file
                          ? () => api.togglePageSelection(file.id, pageNum)
                          : undefined
                      }
                      onKeyDown={
                        selectThumbMode && file
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                api.togglePageSelection(file.id, pageNum);
                              }
                            }
                          : undefined
                      }
                      className={clsx(
                        selectThumbMode && 'rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        reorderThumbs ? 'cursor-grab active:cursor-grabbing' : selectThumbMode && 'cursor-pointer'
                      )}
                    >
                      <PageThumbCard
                        pageNum={pageNum}
                        thumb={thumb}
                        highlight={highlight}
                        captionTop={splitTab === 'pages'}
                        selectOutlineClass={studioAccent.pageSelectOutline}
                      />
                    </div>
                    {reorderThumbs ? (
                      <div
                        draggable
                        onDragStart={handleDragStart(index)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                          'mt-1 flex w-full cursor-grab items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm outline-none transition hover:brightness-[0.97] focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
                          studioPillClass
                        )}
                        aria-label={`Drag to reorder page ${pageNum}`}
                      >
                        <HugeiconsIcon
                          icon={DragDropVerticalIcon}
                          size={12}
                          strokeWidth={2}
                          className={clsx('shrink-0', studioPillIconClass)}
                        />
                        <span>Drag</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export function PdfRotateStudioSurface({ api, angle }: { api: WorkspaceSurfaceApi; angle: RotateAngle }) {
  const file = api.files[0];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2">
      <div
        className="relative aspect-[3/4] w-[min(100%,14rem)] overflow-hidden rounded-2xl border border-border/50 bg-muted/20 shadow-md"
        style={{ perspective: '800px' }}
      >
        <div
          className="flex h-full w-full items-center justify-center bg-white/80 p-2 transition-transform duration-500"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {file?.preview?.status === 'ready' && file.preview.thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={file.preview.thumbUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
          ) : (
            <span className="text-xs text-muted-foreground">Cover preview</span>
          )}
        </div>
      </div>
      <p className="text-center text-[11px] text-muted-foreground">Live rotation preview ({angle}°)</p>
    </div>
  );
}

export function PdfWatermarkStudioSurface({
  api,
  text,
  position,
  opacity,
}: {
  api: WorkspaceSurfaceApi;
  text: string;
  position: WatermarkPosition;
  opacity: number;
}) {
  const file = api.files[0];
  const showTile = position === 'tile';

  return (
    <div className="flex flex-1 flex-col items-center gap-3 py-2">
      <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-slate-100 to-white shadow-inner">
        {file?.preview?.status === 'ready' && file.preview.thumbUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={file.preview.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Document</div>
        )}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
          style={{ opacity: Math.min(1, opacity + 0.15) }}
        >
          {showTile ? (
            <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center overflow-hidden rounded-md border border-dashed border-fuchsia-400/50 bg-fuchsia-500/10">
                  <span className="rotate-[-24deg] truncate px-0.5 text-[8px] font-bold uppercase tracking-tighter text-fuchsia-900">
                    {text.slice(0, 6)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span
              className={clsx(
                'max-w-[90%] truncate text-center font-bold uppercase tracking-wide text-fuchsia-900 drop-shadow-sm',
                position === 'center' && 'rotate-[-28deg] text-lg sm:text-xl',
                position === 'top' && 'self-start text-sm',
                position === 'bottom' && 'self-end text-sm'
              )}
            >
              {text || 'Watermark'}
            </span>
          )}
        </div>
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        Position: {position === 'tile' ? 'tiled grid' : position}
      </p>
    </div>
  );
}

export function PdfOrganizeStudioSurface({ api, order }: { api: WorkspaceSurfaceApi; order: string }) {
  const file = api.files[0];
  const st = file ? api.gridByFileId[file.id] : undefined;
  const thumbs = st?.thumbs ?? [];
  const orderStr = order.trim() || '(all pages, current order)';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-xl border border-border/50 bg-white/60 px-3 py-2 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Output page order</p>
        <p className="mt-1 break-words font-mono text-xs text-foreground">{orderStr}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {thumbs.length > 0
          ? thumbs.map((t) => (
              <div
                key={t.id}
                className="relative h-16 w-12 overflow-hidden rounded-lg border border-border/40 bg-muted/30"
              >
                {t.thumbUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={t.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
                    {t.pageNumber}
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                  {t.pageNumber}
                </span>
              </div>
            ))
          : file?.preview?.status === 'ready' && file.preview.thumbUrl ? (
              <div className="relative h-28 w-20 overflow-hidden rounded-xl border border-border/50 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.preview.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Page previews load here once the PDF is ready.</p>
            )}
      </div>
    </div>
  );
}

export function PdfToImagesStudioSurface({ api }: { api: WorkspaceSurfaceApi }) {
  const file = api.files[0];
  const st = file ? api.gridByFileId[file.id] : undefined;
  const thumbs = st?.thumbs ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <HugeiconsIcon icon={Image01Icon} size={14} strokeWidth={2} className={api.config.iconClass} />
        <span>Pages to export</span>
      </div>
      <div className="flex min-h-[120px] gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin]">
        {thumbs.length > 0 ? (
          thumbs.map((t) => (
            <div
              key={t.id}
              className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm"
            >
              {t.thumbUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={t.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                  {t.pageNumber}
                </div>
              )}
              <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {t.pageNumber}
              </span>
            </div>
          ))
        ) : file?.preview?.status === 'ready' && file.preview.thumbUrl ? (
          <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.preview.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <p className="self-center text-xs text-muted-foreground">Add a PDF — page previews appear here.</p>
        )}
      </div>
    </div>
  );
}
