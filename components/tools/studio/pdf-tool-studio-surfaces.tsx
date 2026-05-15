'use client';

import clsx from 'clsx';
import type { CSSProperties } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitMergeIcon, Image01Icon } from '@hugeicons/core-free-icons';
import type { WorkspaceSurfaceApi } from '@/components/tools/tool-workspace';
import { TONE_STYLES } from '@/components/tools/tone-styles';
import type { SplitMode } from '@/lib/tool-runs/pdf-split';
import type { RotateAngle } from '@/lib/tool-runs/pdf-rotate';
import type { WatermarkPosition } from '@/lib/tool-runs/pdf-watermark';

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
}: {
  pageNum: number;
  thumb?: { status: 'ready' | 'loading' | 'error'; thumbUrl?: string; error?: string };
  highlight?: 'select' | 'none';
  /** Smaller thumb for dense range preview (side‑by‑side in a grid cell). */
  size?: 'default' | 'sm';
  /** Grow the preview area to use vertical space inside a range card. */
  fillCellHeight?: boolean;
  /** Fixed width in a range row so thumbs stay grouped under `justify-center`. */
  inlineInGroup?: boolean;
}) {
  const sm = size === 'sm';
  return (
    <div
      className={clsx(
        'flex min-w-0 flex-col gap-0.5',
        inlineInGroup
          ? clsx('shrink-0', sm ? 'w-[4.25rem]' : 'w-[6.75rem]')
          : clsx(
              'mx-auto flex',
              sm ? 'w-[4.25rem] max-w-[4.25rem] shrink-0' : 'w-full min-w-0 max-w-[6.75rem]',
              fillCellHeight && 'h-full min-h-0'
            )
      )}
    >
      <div
        className={clsx(
          'relative flex w-full min-h-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-white shadow-sm',
          fillCellHeight ? 'min-h-[4.5rem] flex-1' : sm ? 'h-28' : 'h-40',
          highlight === 'select' && 'outline outline-2 outline-offset-2 outline-amber-500'
        )}
      >
        {thumb?.status === 'ready' && thumb.thumbUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={thumb.thumbUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
        ) : thumb?.status === 'loading' || !thumb ? (
          <div className="h-full w-full animate-pulse rounded-md bg-muted/40" />
        ) : (
          <span className="px-1 text-center text-[9px] text-rose-600">{thumb.error ?? 'Preview failed'}</span>
        )}
      </div>
      <p
        className={clsx(
          'shrink-0 text-center font-medium text-foreground',
          sm ? 'text-[10px] leading-tight' : 'text-[11px]'
        )}
      >
        Page {pageNum}
      </p>
    </div>
  );
}

export function PdfSplitStudioSurface({
  api,
  mode,
  splitTab,
  extractMode,
}: {
  api: WorkspaceSurfaceApi;
  mode: SplitMode;
  splitTab: 'range' | 'pages' | 'size';
  extractMode: 'all' | 'select';
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
  const selectedSet = new Set(
    st && st.selected.length && st.selected.every((p) => p >= 1 && p <= pageCount)
      ? st.selected
      : Array.from({ length: pageCount }, (_, i) => i + 1)
  );
  const groups = pageCount > 0 && splitTab === 'range' ? splitGroupsForBar(mode, pageCount) : [];
  const toneKey = api.config.tone;
  const scrollThumbStyle: CSSProperties | undefined =
    toneKey && TONE_STYLES[toneKey]
      ? ({
          '--queue-scrollbar-thumb': TONE_STYLES[toneKey].scrollbarThumb,
          '--queue-scrollbar-thumb-hover': TONE_STYLES[toneKey].scrollbarThumbHover,
        } as CSSProperties)
      : undefined;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2 basis-0 overflow-hidden">
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 px-3 pr-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {splitTab === 'range' ? 'Split preview' : splitTab === 'pages' ? 'Page previews' : 'By size'}
        </p>
        {pageCount > 0 ? (
          <span className="text-[11px] text-muted-foreground">
            {pageCount} page{pageCount === 1 ? '' : 's'}
          </span>
        ) : previewPending ? (
          <span className="text-[11px] text-muted-foreground animate-pulse">Loading…</span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-start overflow-hidden">
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
            <div className="grid min-w-0 grid-cols-3 items-start gap-x-3 gap-y-3 sm:gap-x-4">
              {groups.map((pages, gi) => {
                const lo = Math.min(...pages);
                const hi = Math.max(...pages);
                const isMultiPageRange = pages.length > 1;
                const nextGroup = groups[gi + 1];
                const multiSharesRowWithFollowingSingle =
                  isMultiPageRange && nextGroup != null && nextGroup.length === 1;
                return (
                  <div
                    key={`g-${gi}-${lo}-${hi}`}
                    className={clsx(
                      'flex flex-col gap-2 rounded-xl border-2 border-dashed border-zinc-400/65 bg-white/55 px-3 pb-2 pt-2 shadow-sm dark:border-zinc-500/60 dark:bg-muted/20',
                      isMultiPageRange
                        ? multiSharesRowWithFollowingSingle
                          ? 'col-span-2 min-w-0 w-full'
                          : 'col-span-3 min-w-0 w-full'
                        : 'min-w-0'
                    )}
                  >
                    <p className="text-center text-[11px] font-semibold text-foreground">Range {gi + 1}</p>
                    <div className="flex w-full items-center justify-center gap-2">
                      <PageThumbCard pageNum={lo} thumb={thumbForPage(st, lo)} highlight="none" inlineInGroup />
                      {isMultiPageRange ? (
                        <>
                          <span
                            aria-hidden
                            className="shrink-0 px-0.5 text-lg font-medium leading-none text-muted-foreground"
                          >
                            …
                          </span>
                          <PageThumbCard pageNum={hi} thumb={thumbForPage(st, hi)} highlight="none" inlineInGroup />
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="shrink-0 border-t border-border/20 px-3 pb-2 pt-2.5 text-center text-[11px] leading-snug text-muted-foreground">
            Dashed boxes are output groups · {groups.length} PDF{groups.length === 1 ? '' : 's'} will be created
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="queue-list-scrollbar min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-y-contain px-3 py-1.5 pr-2"
            style={scrollThumbStyle}
          >
            <div className="grid min-w-0 grid-cols-3 items-start justify-items-center gap-x-2 gap-y-3 sm:gap-x-3">
              {order.map((pageNum) => {
                const thumb = thumbForPage(st, pageNum);
                const showSelect = splitTab === 'pages' && extractMode === 'select' && selectedSet.has(pageNum);
                return (
                  <div key={pageNum} className="min-w-0">
                    <PageThumbCard
                      pageNum={pageNum}
                      thumb={thumb}
                      highlight={showSelect ? 'select' : 'none'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {splitTab === 'pages' ? (
            <p className="shrink-0 border-t border-border/20 px-3 pb-2 pt-2.5 text-center text-[11px] leading-snug text-muted-foreground">
              {extractMode === 'select'
                ? 'Outlined pages are included in the export. Use the Pages panel to toggle or reorder.'
                : 'All pages are included. Choose “Select pages” to pick a subset.'}
            </p>
          ) : null}
        </div>
      )}
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
