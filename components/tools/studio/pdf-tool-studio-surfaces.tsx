'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { DragDropVerticalIcon, GitMergeIcon, Image01Icon } from '@hugeicons/core-free-icons';
import type { WorkspaceSurfaceApi } from '@/components/tools/tool-workspace';
import { StudioFlowPreviewInfoRow } from '@/components/tools/studio/studio-flow-chrome';
import { StudioScrollArea } from '@/components/tools/studio/studio-ui';
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
import {
  STUDIO_CARD,
  STUDIO_CARD_DRAG,
  STUDIO_CARD_INNER,
  STUDIO_EMPTY_STATE,
  STUDIO_INDEX_BADGE,
  STUDIO_INFO_STRIP,
  STUDIO_LABEL,
  STUDIO_RANGE_CARD,
  STUDIO_RANGE_CARD_GRID,
  STUDIO_RANGE_CARD_GRID_PAIR,
  STUDIO_RANGE_OUTLINE,
  STUDIO_PAGE_THUMB_IMG,
  STUDIO_PAGE_THUMB_SHELL,
  STUDIO_THUMB_AREA,
  STUDIO_SHELL_PILL,
} from '@/components/tools/studio/studio-theme';

export function PdfMergeStudioSurface({ api }: { api: WorkspaceSurfaceApi }) {
  const { files, busy, draggedFileId, setDraggedFileId, reorderFilesInQueue, config } = api;
  const isReorderable = config.allowMultiple && files.length > 1 && !busy;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className={STUDIO_LABEL}>Merge order</p>
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
              STUDIO_CARD,
              'w-[min(100%,11rem)] shrink-0',
              draggedFileId === item.id && 'opacity-50',
              isReorderable && STUDIO_CARD_DRAG
            )}
          >
            <div className={STUDIO_THUMB_AREA}>
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
              <span className={STUDIO_INDEX_BADGE}>{index + 1}</span>
            </div>
            <div className={clsx(STUDIO_CARD_INNER, 'px-2 py-2')}>
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
  pageNum: number,
  coverPreview?: { thumbUrl?: string; status?: string }
) {
  const fromGrid = st?.thumbs.find((t) => t.pageNumber === pageNum);
  if (fromGrid?.status === 'ready' && fromGrid.thumbUrl) return fromGrid;
  if (pageNum === 1 && coverPreview?.thumbUrl) {
    return { status: 'ready' as const, thumbUrl: coverPreview.thumbUrl };
  }
  return fromGrid;
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
  const imgBounds = fillCellHeight
    ? 'max-h-[min(12rem,42vh)] max-w-[min(9.5rem,100%)]'
    : sm
      ? 'max-h-28 max-w-[4.25rem]'
      : inlineInGroup
        ? 'max-h-36 max-w-[6.75rem]'
        : 'max-h-44 max-w-[9.5rem] max-md:max-h-40 max-md:max-w-[4.25rem]';

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
          ? 'mx-auto w-fit max-w-full shrink-0'
          : clsx(
              'mx-auto flex w-fit max-w-full',
              sm && 'shrink-0'
            )
      )}
    >
      {captionTop ? caption : null}
      <span
        className={clsx(
          STUDIO_PAGE_THUMB_SHELL,
          fillCellHeight && 'self-center',
          highlight === 'select' && selectOutlineClass,
          highlight === 'out' && 'opacity-75 ring-dashed ring-muted-foreground/40'
        )}
      >
        {thumb?.status === 'ready' && thumb.thumbUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumb.thumbUrl}
            alt=""
            className={clsx(STUDIO_PAGE_THUMB_IMG, imgBounds, highlight === 'out' && 'opacity-90')}
            loading="lazy"
          />
        ) : thumb?.status === 'loading' || !thumb ? (
          <span
            className={clsx(
              'block aspect-[85/110] animate-pulse bg-muted/40',
              imgBounds,
              'w-[5.5rem] max-w-full'
            )}
            aria-hidden
          />
        ) : (
          <span
            className={clsx(
              'flex items-center justify-center bg-white px-2 py-6 text-center text-[9px] text-rose-600 dark:bg-zinc-50',
              imgBounds,
              'w-[5.5rem] max-w-full'
            )}
          >
            {thumb.error ?? 'Preview failed'}
          </span>
        )}
      </span>
      {!captionTop ? caption : null}
    </div>
  );
}

/** Range preview dashed cards: single-page groups (grid col-span set per card). */
const PDF_SPLIT_RANGE_CARD_CLASS = clsx(STUDIO_RANGE_OUTLINE, STUDIO_RANGE_CARD);

/** Full-row multi on 6-column grid. */
const PDF_SPLIT_RANGE_CARD_ALONE_MULTI_CLASS = clsx(STUDIO_RANGE_OUTLINE, STUDIO_RANGE_CARD_GRID);

/** Multi paired with single on one row (4 of 6 cols). */
const PDF_SPLIT_RANGE_CARD_PAIR_MULTI_CLASS = clsx(STUDIO_RANGE_OUTLINE, STUDIO_RANGE_CARD_GRID_PAIR);

/** Two equal halves; each thumb centered in its half (1.5+1.5 style positioning). */
const PDF_SPLIT_RANGE_MULTI_THUMBS_CLASS =
  'relative grid min-w-0 grid-cols-2 items-start justify-items-center gap-x-3 sm:gap-x-4';

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
  /** Waiting for page count (pdf-lib probe) before range / page previews can render. */
  const previewPending = !!file && pageCount <= 0 && preview?.status === 'loading';
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

  const studioPillClass = clsx(STUDIO_SHELL_PILL, 'font-mono text-[11px] text-muted-foreground');
  /** Full-width hint strip — same horizontal span as the preview grid below. */
  const studioInfoStripClass = clsx(
    studioPillClass,
    'block w-full min-w-0 rounded-sm border px-3 py-2 text-left leading-snug'
  );
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

  const flowToolbar = api.inFlowStudio ? api.flowQueueToolbar : undefined;
  const showRangeInfoStrip =
    pageCount > 0 && Boolean(file) && !previewFailed && !previewPending && splitTab === 'range' && groups.length > 0;
  const showPagesInfoStrip =
    pageCount > 0 && Boolean(file) && !previewFailed && !previewPending && splitTab === 'pages';
  const showPreviewInfoStrip = showRangeInfoStrip || showPagesInfoStrip;

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-2 basis-0 max-md:basis-auto max-md:gap-2.5">
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 max-md:px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground max-md:text-xs">
          {splitTab === 'range' ? 'Split preview' : splitTab === 'pages' ? 'Page previews' : 'By size'}
        </p>
        {flowToolbar && !showPreviewInfoStrip ? (
          <div className="w-full max-w-[17.5rem] shrink-0">{flowToolbar}</div>
        ) : selectThumbMode && file ? (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api.selectAllPagesForFile(file.id);
              }}
              className={clsx(
                'studio-shell-pill inline-flex min-h-8 shrink-0 items-center justify-center rounded-sm border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide transition hover:bg-black/25',
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
                'studio-shell-pill inline-flex shrink-0 items-center rounded-sm border px-2.5 py-1 font-mono tabular-nums text-[10px] font-semibold max-md:min-h-7 max-md:px-3',
                studioPillClass
              )}
            >
              {selectedSet.size}/{pageCount}
            </span>
            {studioOutputPillLabel ? (
              <span
                className={clsx(
                  'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm max-md:min-h-7 max-md:px-3',
                  studioPillClass
                )}
              >
                {studioOutputPillLabel}
              </span>
            ) : null}
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

      <div
        className={clsx(
          'flex min-h-0 flex-1 flex-col',
          api.inFlowStudio ? 'overflow-hidden' : 'max-md:min-h-[min(56vh,26rem)]'
        )}
      >
        {showRangeInfoStrip ? (
          <StudioFlowPreviewInfoRow toolbar={flowToolbar}>
            <details className={clsx('w-full rounded-sm border md:hidden', studioPillClass)}>
              <summary className="cursor-pointer list-none px-3 py-2.5 text-[11px] font-semibold leading-snug marker:content-none min-h-11 flex items-center [&::-webkit-details-marker]:hidden">
                {rangeOutputPdfCount} PDF{rangeOutputPdfCount === 1 ? '' : 's'} · tap for details
              </summary>
              <p className="border-t border-border/15 px-2.5 pb-2 pt-1.5 text-[10px] leading-snug text-muted-foreground">
                {mergeRangeOutputs
                  ? 'Each dashed group merges into one ordered PDF.'
                  : 'Each dashed box is one output file.'}
              </p>
            </details>
            <p className={clsx(studioInfoStripClass, 'hidden md:block')}>
              {mergeRangeOutputs
                ? `Preview shows each range group; they merge into one ordered PDF · ${rangeOutputPdfCount} PDF${rangeOutputPdfCount === 1 ? '' : 's'} will be created`
                : `Dashed boxes are output groups · ${rangeOutputPdfCount} PDF${rangeOutputPdfCount === 1 ? '' : 's'} will be created`}
            </p>
          </StudioFlowPreviewInfoRow>
        ) : null}
        {showPagesInfoStrip ? (
          <StudioFlowPreviewInfoRow toolbar={flowToolbar}>
            <p className={studioInfoStripClass}>
              {selectThumbMode
                ? `Highlighted outline = included; dimmed = skipped. Click a page to toggle.${
                    reorderThumbs ? ' Drag the preview or the “Drag” row below to reorder.' : ''
                  }`
                : 'All pages are included. Choose “Select pages” to pick a subset.'}
            </p>
          </StudioFlowPreviewInfoRow>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {splitTab === 'size' ? (
        <p className={STUDIO_EMPTY_STATE}>
          Splitting by target file size is not available in this version.
        </p>
      ) : !file ? (
        <p className={STUDIO_EMPTY_STATE}>Add a PDF to preview every page and how outputs group.</p>
      ) : previewFailed ? (
        <p className={clsx(STUDIO_EMPTY_STATE, 'border-rose-500/30 text-rose-200/90')}>
          {preview?.error ?? 'Could not load a preview of this PDF.'}
        </p>
      ) : previewPending ? (
        <p className={clsx(STUDIO_EMPTY_STATE, 'animate-pulse')}>Loading PDF preview…</p>
      ) : pageCount <= 0 ? (
        <p className={STUDIO_EMPTY_STATE}>
          This PDF has no readable pages, or the preview did not finish loading.
        </p>
      ) : splitTab === 'range' && groups.length > 0 ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <StudioScrollArea
            measureKey={groups.length}
            className="flex-1 py-1"
            style={scrollThumbStyle}
          >
            <div className="grid min-w-0 grid-cols-6 items-start gap-x-4 gap-y-4 sm:gap-x-6 max-md:grid-cols-2 max-md:gap-3">
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
                      <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo, preview)} highlight="none" inlineInGroup />
                      <PageThumbCard pageNum={hi} thumb={thumbForPage(st, hi, preview)} highlight="none" inlineInGroup />
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
                      <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo, preview)} highlight="none" inlineInGroup />
                      <PageThumbCard pageNum={hi} thumb={thumbForPage(st, hi, preview)} highlight="none" inlineInGroup />
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
                      'max-md:gap-1.5 mobile-range-card',
                      mobileSpan === 2 ? 'max-md:col-span-2' : 'max-md:col-span-1'
                    )}
                  >
                    <p className="shrink-0 text-center text-[11px] font-semibold text-foreground max-md:text-xs">
                      Range {gi + 1}
                    </p>
                    <div className="flex w-full min-w-0 justify-center">
                      <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo, preview)} highlight="none" inlineInGroup />
                    </div>
                  </div>
                );
              })}
            </div>
          </StudioScrollArea>
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <StudioScrollArea
            measureKey={pageCount}
            className="flex-1 py-1"
            style={scrollThumbStyle}
          >
            <div
              id={selectThumbMode && file ? `page-grid-${file.id}` : undefined}
              className="grid min-w-0 grid-cols-3 items-start justify-items-center gap-x-2 gap-y-3 sm:gap-x-3 max-md:grid-cols-2"
            >
              {order.map((pageNum, index) => {
                const thumb = thumbForPage(st, pageNum, preview);
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
          </StudioScrollArea>
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
        className={clsx(STUDIO_THUMB_AREA, 'w-[min(100%,14rem)]')}
        style={{ perspective: '800px' }}
      >
        <div
          className="flex h-full w-full items-center justify-center bg-card/50 p-2 transition-transform duration-500"
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
      <div className={clsx(STUDIO_THUMB_AREA, 'w-full max-w-sm')}>
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
      <div className={STUDIO_INFO_STRIP}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Output page order</p>
        <p className="mt-1 break-words font-mono text-xs text-foreground">{orderStr}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {thumbs.length > 0
          ? thumbs.map((t) => (
              <span key={t.id} className={clsx(STUDIO_PAGE_THUMB_SHELL, 'relative shrink-0')}>
                {t.thumbUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={t.thumbUrl}
                    alt=""
                    className={clsx(STUDIO_PAGE_THUMB_IMG, 'max-h-16 max-w-12')}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={clsx(
                      STUDIO_PAGE_THUMB_IMG,
                      'flex max-h-16 w-12 items-center justify-center text-[9px] text-muted-foreground'
                    )}
                  >
                    {t.pageNumber}
                  </span>
                )}
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                  {t.pageNumber}
                </span>
              </span>
            ))
          : file?.preview?.status === 'ready' && file.preview.thumbUrl ? (
              <span className={STUDIO_PAGE_THUMB_SHELL}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.preview.thumbUrl}
                  alt=""
                  className={clsx(STUDIO_PAGE_THUMB_IMG, 'max-h-28 max-w-20')}
                  loading="lazy"
                />
              </span>
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
            <span key={t.id} className={clsx(STUDIO_PAGE_THUMB_SHELL, 'relative shrink-0')}>
              {t.thumbUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={t.thumbUrl}
                  alt=""
                  className={clsx(STUDIO_PAGE_THUMB_IMG, 'max-h-28 max-w-20')}
                  loading="lazy"
                />
              ) : (
                <span
                  className={clsx(
                    STUDIO_PAGE_THUMB_IMG,
                    'flex max-h-28 w-20 items-center justify-center text-[10px] text-muted-foreground'
                  )}
                >
                  {t.pageNumber}
                </span>
              )}
              <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {t.pageNumber}
              </span>
            </span>
          ))
        ) : file?.preview?.status === 'ready' && file.preview.thumbUrl ? (
          <span className={clsx(STUDIO_PAGE_THUMB_SHELL, 'shrink-0')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.preview.thumbUrl}
              alt=""
              className={clsx(STUDIO_PAGE_THUMB_IMG, 'max-h-28 max-w-20')}
              loading="lazy"
            />
          </span>
        ) : (
          <p className="self-center text-xs text-muted-foreground">Add a PDF — page previews appear here.</p>
        )}
      </div>
    </div>
  );
}
