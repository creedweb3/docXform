'use client';

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import clsx from 'clsx';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Download01Icon } from '@hugeicons/core-free-icons';
import {
  ToolWorkspace,
  type PdfPageGridProcessContext,
  type WorkspaceFile,
  type WorkspaceSurfaceApi,
} from '@/components/tools/tool-workspace';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { PdfSplitStudioSurface } from '@/components/tools/studio/pdf-tool-studio-surfaces';
import {
  splitPdf,
  splitPdfBySelectedPages,
  splitPdfMergedFromPages,
  type SplitMode,
} from '@/lib/tool-runs/pdf-split';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { generatePdfPreview } from '@/lib/client-previews';
import { getStudioAccent } from '@/components/tools/studio-accent';
import { StudioInfoBanner, StudioSegmentRow, StudioTabBar } from '@/components/tools/studio/studio-ui';
import { TONE_STYLES } from '@/components/tools/tone-styles';

const tool = getToolBySlug('pdf-split')!;
const studioAccent = getStudioAccent(tool.tone);

const PDF_SPLIT_RANGE_SCROLL_STYLE = {
  '--queue-scrollbar-thumb': TONE_STYLES[tool.tone].scrollbarThumb,
  '--queue-scrollbar-thumb-hover': TONE_STYLES[tool.tone].scrollbarThumbHover,
} as CSSProperties;

/**
 * Up to this many ranges: list grows naturally. Beyond: rows scroll inside a fixed-height viewport.
 */
const RANGE_LIST_NATURAL_MAX_COUNT = 5;

/** Fixed outer height (rem) — ~5 rows + gaps; does not grow when more ranges are added. */
const RANGE_LIST_SCROLL_VIEWPORT_REM = 15.75;

function CustomPageRangeListViewport({
  scroll,
  scrollStyle,
  children,
}: {
  scroll: boolean;
  scrollStyle?: CSSProperties;
  children: ReactNode;
}) {
  if (!scroll) {
    return (
      <div className="flex shrink-0 flex-col gap-1.5 overflow-x-clip px-1" aria-label="Custom page ranges">
        {children}
      </div>
    );
  }
  return (
    <div className="w-full min-w-0 shrink-0" style={{ height: `${RANGE_LIST_SCROLL_VIEWPORT_REM}rem` }}>
      <div
        className="queue-list-scrollbar box-border h-full min-h-0 overflow-y-auto overscroll-y-contain px-1 py-1.5 [-webkit-overflow-scrolling:touch]"
        style={scrollStyle}
        aria-label="Custom page ranges"
      >
        <div className="flex flex-col gap-1.5">{children}</div>
      </div>
    </div>
  );
}

type SplitSidebarTab = 'range' | 'pages' | 'size';
type RangeModeUi = 'custom' | 'fixed' | 'smart';
type ExtractMode = 'all' | 'select';

function orderedPagesFromGrid(
  st: { order: number[]; selected: number[] } | undefined,
  pageCount: number
): number[] {
  if (pageCount <= 0) return [];
  const order =
    st && st.order.length === pageCount && st.order.every((p) => p >= 1 && p <= pageCount)
      ? st.order
      : Array.from({ length: pageCount }, (_, i) => i + 1);
  const selected =
    st &&
    (st.selected.length === 0 || st.selected.every((p) => p >= 1 && p <= pageCount))
      ? st.selected
      : Array.from({ length: pageCount }, (_, i) => i + 1);
  const sel = new Set(selected);
  return order.filter((p) => sel.has(p));
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
    .map((r) => r.filter((p) => p >= 1 && p <= pageCount))
    .filter((g) => g.length > 0);
}

function fullDocumentRange(pageCount: number): number[] {
  const n = Math.max(1, pageCount);
  return Array.from({ length: n }, (_, i) => i + 1);
}

function isFullPageSelection(
  st: { selected: number[]; order: number[] } | undefined,
  pageCount: number
): boolean {
  if (!st || pageCount <= 0) return false;
  if (st.selected.length !== pageCount) return false;
  const sel = new Set(st.selected);
  for (let p = 1; p <= pageCount; p += 1) {
    if (!sel.has(p)) return false;
  }
  return true;
}

const config = buildWorkspaceConfig(tool, {
  title: 'Drop a PDF to split',
  hint: 'or click to browse - .pdf — range, fixed intervals, or pick pages',
  accept: '.pdf',
  allowMultiple: false,
  hideQueueItemDownload: true,
  queuedTitle: 'PDF ready to split',
  actionLabel: 'Split',
  pageGrid: {
    layout: 'single',
    allowReorder: true,
    optionalSelectionForProcess: true,
    thumbRender: { maxWidth: 300, jpegQuality: 0.9 },
  },
  studioHint: (
    <>
      Use <strong>Range</strong> for classic splits (custom ranges or every N pages). Use <strong>Pages</strong> to export
      specific pages — with <strong>Select pages</strong>, click thumbnails to include or exclude, and use the drag row
      to reorder.
    </>
  ),
});

export function PdfSplitTool() {
  const [splitTab, setSplitTab] = useState<SplitSidebarTab>('range');
  const [rangeModeUi, setRangeModeUi] = useState<RangeModeUi>('custom');
  const [extractMode, setExtractMode] = useState<ExtractMode>('all');
  const [mergeExtractedIntoOne, setMergeExtractedIntoOne] = useState(false);
  const [mergeRangeOutputs, setMergeRangeOutputs] = useState(false);
  const [mode, setMode] = useState<SplitMode>({ kind: 'ranges', ranges: [[1]] });
  const [interval, setInterval] = useState(2);
  const pageCountRef = useRef(0);
  const defaultRangeAppliedForFileIdRef = useRef<string | null>(null);

  const applyDefaultRangeWhenPreviewReady = useCallback((api: WorkspaceSurfaceApi) => {
    const file = api.files[0];
    const n = file?.preview?.pageCount ?? 0;
    pageCountRef.current = n;
    if (!file) {
      defaultRangeAppliedForFileIdRef.current = null;
      return;
    }
    if (n <= 0 || defaultRangeAppliedForFileIdRef.current === file.id) return;
    defaultRangeAppliedForFileIdRef.current = file.id;
    setMode({ kind: 'ranges', ranges: [fullDocumentRange(n)] });
  }, []);

  const addCustomRange = useCallback(() => {
    setMode((prev) => {
      if (prev.kind !== 'ranges') return { kind: 'ranges', ranges: [[1]] };
      return { kind: 'ranges', ranges: [...prev.ranges, [1]] };
    });
  }, []);

  const removeCustomRange = useCallback((index: number) => {
    setMode((prev) => {
      if (prev.kind !== 'ranges' || prev.ranges.length <= 1) return prev;
      return { kind: 'ranges', ranges: prev.ranges.filter((_, i) => i !== index) };
    });
  }, []);

  const patchCustomRange = useCallback((index: number, field: 'from' | 'to', value: number) => {
    setMode((prev) => {
      if (prev.kind !== 'ranges') return prev;
      const cap = pageCountRef.current > 0 ? pageCountRef.current : 99_999;
      const rows = prev.ranges.map((pg) => ({
        from: Math.min(...pg),
        to: Math.max(...pg),
      }));
      const nextRows = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
      const ranges = nextRows.map((row) => {
        const a = Math.max(1, Math.min(row.from, row.to, cap));
        const b = Math.min(cap, Math.max(row.from, row.to, 1));
        if (a > b) return [1];
        return Array.from({ length: b - a + 1 }, (_, k) => a + k);
      });
      return { kind: 'ranges', ranges };
    });
  }, []);

  const handlePageGridStateChange = useCallback(
    (api: WorkspaceSurfaceApi) => {
      applyDefaultRangeWhenPreviewReady(api);
      if (splitTab !== 'pages' || extractMode !== 'all') return;
      const file = api.files[0];
      const n = file?.preview?.pageCount ?? 0;
      if (!file || n <= 0) return;
      const st = api.gridByFileId[file.id];
      if (!st) return;
      if (!isFullPageSelection(st, n)) setExtractMode('select');
    },
    [splitTab, extractMode, applyDefaultRangeWhenPreviewReady]
  );

  const footer = useCallback(
    (api: WorkspaceSurfaceApi) => {
      const file = api.files[0];
      const n = file?.preview?.pageCount ?? 0;
      pageCountRef.current = n;
      const st = file ? api.gridByFileId[file.id] : undefined;
      const ordered = orderedPagesFromGrid(st, n);
      const groups = n > 0 && splitTab === 'range' ? splitGroupsForBar(mode, n) : [];
      const rangeSplitComplete =
        api.allDone &&
        splitTab === 'range' &&
        rangeModeUi === 'custom' &&
        mode.kind === 'ranges' &&
        file?.status === 'done';
      const rangeOutputsByIndex =
        rangeSplitComplete &&
        !mergeRangeOutputs &&
        file.outputs &&
        file.outputs.length === mode.ranges.length
          ? file.outputs
          : null;
      const rangeRowsLocked = rangeSplitComplete;
      const rangeSettingsLocked =
        api.allDone && splitTab === 'range' && file?.status === 'done';

      let outputPdfCount = 0;
      if (splitTab === 'range' && n) {
        outputPdfCount = mergeRangeOutputs ? 1 : groups.length;
      } else if (splitTab === 'pages' && n) {
        if (mergeExtractedIntoOne) outputPdfCount = 1;
        else if (extractMode === 'all') outputPdfCount = n;
        else outputPdfCount = ordered.length;
      }

      const bannerText =
        splitTab === 'size'
          ? 'Choose Range or Pages to configure splitting.'
          : splitTab === 'range'
            ? n === 0
              ? 'Add a PDF to see how many output files your ranges will create.'
              : mergeRangeOutputs
                ? `All range groups will be merged into a single PDF in order. 1 PDF will be created.`
                : rangeModeUi === 'fixed' && mode.kind === 'every'
                  ? `This PDF will be split into files of ${mode.interval} page${mode.interval === 1 ? '' : 's'}. ${outputPdfCount} PDF${outputPdfCount === 1 ? '' : 's'} will be created.`
                  : `Range mode splits this file into separate PDFs by group. ${outputPdfCount} PDF${outputPdfCount === 1 ? '' : 's'} will be created.`
            : mergeExtractedIntoOne
              ? `Pages will be merged into one PDF. 1 PDF (${extractMode === 'all' ? n : ordered.length} page${
                  (extractMode === 'all' ? n : ordered.length) === 1 ? '' : 's'
                }).`
              : extractMode === 'all'
                ? `Each page becomes its own PDF unless merge is enabled. ${outputPdfCount} PDF${outputPdfCount === 1 ? '' : 's'} will be created.`
                : ordered.length === 0
                  ? 'Select at least one page in the preview area above.'
                  : `Selected pages export as separate files. ${outputPdfCount} PDF${outputPdfCount === 1 ? '' : 's'} will be created.`;

      return (
        <div className="flex w-full min-w-0 flex-col gap-5 text-xs text-muted-foreground max-md:gap-4">
          <section
            className="min-w-0 w-full shrink-0 overflow-x-visible rounded-2xl border border-border/30 bg-white/95 px-4 pb-5 pt-4 shadow-md ring-1 ring-black/[0.04] sm:px-5 sm:pb-6 dark:border-white/[0.08] dark:bg-zinc-950/50 dark:ring-white/[0.06] max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:px-0 max-md:pb-0 max-md:pt-0 max-md:shadow-none max-md:ring-0"
            aria-label="PDF split options"
          >
            <div className="mb-1 shrink-0">
              <StudioTabBar<SplitSidebarTab>
                tone={tool.tone}
                tabs={[
                  { id: 'range', label: 'Range' },
                  { id: 'pages', label: 'Pages' },
                  { id: 'size', label: 'Size', disabled: true, badge: 'Soon' },
                ]}
                value={splitTab}
                onChange={setSplitTab}
              />
            </div>

            {splitTab === 'range' ? (
              <div className="mt-4 flex min-w-0 flex-col gap-4 border-t border-border/15 pt-4">
                <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-foreground">Range mode</h3>
                <div className="shrink-0">
                  <StudioSegmentRow<RangeModeUi>
                    tone={tool.tone}
                    options={[
                      { id: 'custom', label: 'Custom' },
                      { id: 'fixed', label: 'Fixed' },
                      { id: 'smart', label: 'Smart', disabled: true },
                    ]}
                    value={rangeModeUi}
                    onChange={(id) => {
                      if (rangeSettingsLocked) return;
                      setRangeModeUi(id);
                      if (id === 'custom') {
                        setMode((prev) =>
                          prev.kind === 'ranges' ? prev : { kind: 'ranges', ranges: [[1]] }
                        );
                      } else if (id === 'fixed') {
                        setMode({ kind: 'every', interval: Math.max(1, interval) });
                      }
                    }}
                  />
                </div>
                {rangeModeUi === 'custom' ? (
                  <div className="flex min-w-0 flex-col gap-3">
                    {mode.kind === 'ranges' ? (
                      <CustomPageRangeListViewport
                        scroll={mode.ranges.length > RANGE_LIST_NATURAL_MAX_COUNT}
                        scrollStyle={
                          mode.ranges.length > RANGE_LIST_NATURAL_MAX_COUNT
                            ? PDF_SPLIT_RANGE_SCROLL_STYLE
                            : undefined
                        }
                      >
                        {mode.ranges.map((pages, idx) => {
                          const from = Math.min(...pages);
                          const to = Math.max(...pages);
                          const rangeOutput = rangeOutputsByIndex?.[idx];
                          const showRangeDownload = Boolean(rangeOutput);
                          const showRangeDelete = !rangeRowsLocked && mode.ranges.length > 1;
                          return (
                            <div
                              key={`range-${idx}-${from}-${to}`}
                              aria-label={`Range ${idx + 1}`}
                              className="flex shrink-0 min-h-[1.75rem] min-w-0 flex-nowrap items-center gap-2 rounded-lg max-md:rounded-2xl bg-muted/40 px-2 py-2 max-md:px-3 dark:bg-white/[0.06]"
                            >
                              <div className={studioAccent.rangeIndexBadge} aria-hidden>
                                {idx + 1}
                              </div>

                              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
                                <label className="flex min-w-0 items-center justify-end gap-1.5">
                                  <span className="w-10 shrink-0 text-right text-xs font-semibold leading-tight text-foreground/85">
                                    From
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={n > 0 ? n : undefined}
                                    disabled={rangeRowsLocked}
                                    className="box-border h-7 w-11 shrink-0 rounded-lg max-md:rounded-2xl max-md:h-9 border-0 bg-white/90 px-1 text-center text-xs font-medium tabular-nums leading-none text-foreground shadow-sm ring-1 ring-inset ring-black/[0.06] disabled:cursor-default disabled:opacity-60 dark:bg-zinc-900/80 dark:ring-white/10"
                                    value={from}
                                    onChange={(e) =>
                                      patchCustomRange(idx, 'from', Math.max(1, Number(e.target.value) || 1))
                                    }
                                  />
                                </label>
                                <label className="flex min-w-0 items-center justify-end gap-1.5">
                                  <span className="w-10 shrink-0 text-right text-xs font-semibold leading-tight text-foreground/85">
                                    To
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={n > 0 ? n : undefined}
                                    disabled={rangeRowsLocked}
                                    className="box-border h-7 w-11 shrink-0 rounded-lg max-md:rounded-2xl max-md:h-9 border-0 bg-white/90 px-1 text-center text-xs font-medium tabular-nums leading-none text-foreground shadow-sm ring-1 ring-inset ring-black/[0.06] disabled:cursor-default disabled:opacity-60 dark:bg-zinc-900/80 dark:ring-white/10"
                                    value={to}
                                    onChange={(e) =>
                                      patchCustomRange(idx, 'to', Math.max(1, Number(e.target.value) || 1))
                                    }
                                  />
                                </label>
                              </div>

                              {showRangeDownload && rangeOutput ? (
                                <button
                                  type="button"
                                  aria-label={`Download range ${idx + 1}`}
                                  title={`Download ${rangeOutput.name}`}
                                  className="box-border flex h-7 w-7 shrink-0 items-center justify-center rounded-lg max-md:rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.98]"
                                  onClick={() => api.downloadOutput(rangeOutput)}
                                >
                                  <HugeiconsIcon icon={Download01Icon} size={14} strokeWidth={2} aria-hidden />
                                </button>
                              ) : showRangeDelete ? (
                                <button
                                  type="button"
                                  aria-label={`Remove range ${idx + 1}`}
                                  title="Remove range"
                                  className="box-border flex h-7 w-7 shrink-0 items-center justify-center rounded-lg max-md:rounded-full text-muted-foreground transition hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/10"
                                  onClick={() => removeCustomRange(idx)}
                                >
                                  <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} aria-hidden />
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </CustomPageRangeListViewport>
                    ) : null}
                    {rangeRowsLocked ? (
                      <button
                        type="button"
                        onClick={() => api.prepareForResplit()}
                        className="w-full shrink-0 rounded-lg max-md:rounded-2xl border border-border/50 bg-white/80 px-3 py-2.5 text-[11px] font-semibold text-foreground shadow-sm ring-1 ring-inset ring-black/[0.04] transition hover:bg-white dark:bg-zinc-900/70 dark:ring-white/[0.06] dark:hover:bg-zinc-900"
                      >
                        Edit ranges
                      </button>
                    ) : (
                      <button type="button" onClick={addCustomRange} className={studioAccent.addRangeButton}>
                        + Add range
                      </button>
                    )}
                    <label
                      className={clsx(
                        'flex shrink-0 items-start gap-2.5 rounded-lg max-md:rounded-2xl bg-muted/40 px-3 py-3 max-md:py-3.5 ring-1 ring-inset ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/[0.06]',
                        rangeSettingsLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={mergeRangeOutputs}
                        disabled={rangeSettingsLocked}
                        onChange={(e) => setMergeRangeOutputs(e.target.checked)}
                      />
                      <span className="text-[11px] leading-relaxed text-foreground">
                        Merge all ranges into one PDF file.
                      </span>
                    </label>
                  </div>
                ) : rangeModeUi === 'fixed' ? (
                  <div className="mt-1 shrink-0 space-y-2">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold text-foreground">Split into page ranges of</span>
                      <input
                        className="w-full rounded-lg max-md:rounded-2xl border-0 bg-white/90 px-3 py-3 text-sm text-foreground shadow-sm ring-1 ring-inset ring-black/[0.06] disabled:cursor-default disabled:opacity-60 dark:bg-zinc-900/80 dark:ring-white/10"
                        type="number"
                        min={1}
                        disabled={rangeSettingsLocked}
                        value={interval}
                        onChange={(e) => {
                          const next = Math.max(1, Number(e.target.value) || 1);
                          setInterval(next);
                          setMode({ kind: 'every', interval: next });
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <p className="shrink-0 rounded-lg max-md:rounded-2xl bg-muted/35 px-3 py-3.5 text-[11px] ring-1 ring-inset ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/[0.06]">
                    Smart split is not available yet.
                  </p>
                )}
              </div>
            ) : splitTab === 'pages' ? (
              <div className="mt-4 shrink-0 space-y-4 border-t border-border/15 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Extract mode</h3>
                <StudioSegmentRow<ExtractMode>
                  tone={tool.tone}
                  options={[
                    { id: 'all', label: 'Extract all pages' },
                    { id: 'select', label: 'Select pages' },
                  ]}
                  value={extractMode}
                  onChange={(id) => {
                    setExtractMode(id);
                    if (id === 'all' && file) api.selectAllPagesForFile(file.id);
                  }}
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-lg max-md:rounded-2xl bg-muted/40 px-3 py-3.5 ring-1 ring-inset ring-black/[0.04] dark:bg-white/[0.05] dark:ring-white/[0.06]">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={mergeExtractedIntoOne}
                    onChange={(e) => setMergeExtractedIntoOne(e.target.checked)}
                  />
                  <span className="text-[11px] leading-relaxed text-foreground">
                    Merge extracted pages into one PDF file.
                  </span>
                </label>
                {extractMode === 'select' ? (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Use the <strong className="text-foreground">Pages</strong> panel next to the preview to include or
                    exclude pages. Drag page cards to change export order.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 shrink-0 border-t border-border/15 pt-4 text-[11px] leading-relaxed text-muted-foreground">
                Size-based splitting is not available in this version. Use Range or Pages instead.
              </p>
            )}
          </section>

          <div className="shrink-0 max-md:mt-1">
            <StudioInfoBanner tone={tool.tone}>{bannerText}</StudioInfoBanner>
          </div>
        </div>
      );
    },
    [
      splitTab,
      rangeModeUi,
      extractMode,
      mergeExtractedIntoOne,
      mergeRangeOutputs,
      mode,
      interval,
      addCustomRange,
      removeCustomRange,
      patchCustomRange,
    ]
  );

  const processFiles = useCallback(
    async (
      files: WorkspaceFile[],
      setProgress: (id: string, percent: number, message?: string) => void,
      pageGrid?: PdfPageGridProcessContext
    ) => {
      if (!files.length) return files;
      const file = files[0];
      const n = file.preview?.pageCount ?? 0;
      const fromGrid = pageGrid?.orderedPagesByFileId?.[file.id] ?? [];

      try {
        if (splitTab === 'range') {
          if (mergeRangeOutputs) {
            const groups = splitGroupsForBar(mode, n);
            const flat = groups.flat();
            if (!flat.length) throw new Error('No pages in ranges.');
            const merged = await splitPdfMergedFromPages(file.file, flat, (pct) =>
              setProgress(file.id, pct, 'Merging ranges...')
            );
            return [
              {
                ...file,
                status: 'done',
                message: 'Created merged PDF',
                outputs: [{ name: merged.name, blob: merged.blob }],
              },
            ] as WorkspaceFile[];
          }
          const results = await splitPdf(file.file, mode, (pct) => setProgress(file.id, pct, 'Splitting...'));
          return [
            {
              ...file,
              status: 'done',
              message: `Created ${results.length} file(s)`,
              outputs: results.map((r) => ({ name: r.name, blob: r.blob })),
            },
          ] as WorkspaceFile[];
        }

        if (splitTab === 'pages') {
          const pagesList = extractMode === 'all' ? Array.from({ length: n }, (_, i) => i + 1) : fromGrid;

          if (extractMode === 'select' && pagesList.length === 0) {
            throw new Error('Select at least one page in the Pages panel.');
          }

          if (mergeExtractedIntoOne) {
            const merged = await splitPdfMergedFromPages(file.file, pagesList, (pct) =>
              setProgress(file.id, pct, 'Merging...')
            );
            return [
              {
                ...file,
                status: 'done',
                message: 'Created merged PDF',
                outputs: [{ name: merged.name, blob: merged.blob }],
              },
            ] as WorkspaceFile[];
          }

          const perPage = await splitPdfBySelectedPages(file.file, pagesList, (pct) =>
            setProgress(file.id, pct, 'Splitting...')
          );
          return [
            {
              ...file,
              status: 'done',
              message: `Created ${perPage.length} file(s)`,
              outputs: perPage.map((r) => ({ name: r.name, blob: r.blob })),
            },
          ] as WorkspaceFile[];
        }

        throw new Error('Choose Range or Pages to split.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return [{ ...file, status: 'failed', error: message, message }] as WorkspaceFile[];
      }
    },
    [splitTab, mode, extractMode, mergeExtractedIntoOne, mergeRangeOutputs]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  const studioSurface = useCallback(
    (api: WorkspaceSurfaceApi) => (
      <PdfSplitStudioSurface
        api={api}
        mode={mode}
        splitTab={splitTab}
        extractMode={extractMode}
        mergeRangeOutputs={mergeRangeOutputs}
        mergeExtractedIntoOne={mergeExtractedIntoOne}
      />
    ),
    [mode, splitTab, extractMode, mergeRangeOutputs, mergeExtractedIntoOne]
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{
        processFiles,
        zipName: 'split-pages.zip',
        validateFiles,
        generatePreview: generatePdfPreview,
      }}
      footer={footer}
      studioSurface={studioSurface}
      showPageGridPanel={() => false}
      onPageGridStateChange={handlePageGridStateChange}
      mobileActionsInRail
      mobileRailTitle="Split settings"
      mobileRailTone={tool.tone}
    />
  );
}
