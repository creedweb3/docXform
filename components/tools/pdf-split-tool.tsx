'use client';

import { useCallback, useRef, useState } from 'react';
import {
  ToolWorkspace,
  type PdfPageGridProcessContext,
  type WorkspaceConfig,
  type WorkspaceFile,
  type WorkspaceSurfaceApi,
} from '@/components/tools/tool-workspace';
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
import { StudioInfoBanner, StudioSegmentRow, StudioTabBar } from '@/components/tools/studio/studio-ui';

const tool = getToolBySlug('pdf-split')!;

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
    st && st.selected.length && st.selected.every((p) => p >= 1 && p <= pageCount)
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

const config: WorkspaceConfig = {
  title: 'Drop a PDF to split',
  hint: 'or click to browse - .pdf — range, fixed intervals, or pick pages',
  accept: '.pdf',
  allowMultiple: false,
  cardClass: 'converter-main-card-amber',
  iconBoxClass: 'icon-box-amber',
  iconClass: 'text-amber-700',
  dragClass: 'ring-2 ring-amber-300/50 bg-amber-50/60 scale-[1.01]',
  primaryButtonClass: 'from-amber-500 to-amber-400',
  progressClass: 'from-amber-400 to-orange-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
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
      specific pages — when <strong>Select pages</strong> is on, use the Pages panel beside the preview.
    </>
  ),
};

export function PdfSplitTool() {
  const [splitTab, setSplitTab] = useState<SplitSidebarTab>('range');
  const [rangeModeUi, setRangeModeUi] = useState<RangeModeUi>('custom');
  const [extractMode, setExtractMode] = useState<ExtractMode>('all');
  const [mergeExtractedIntoOne, setMergeExtractedIntoOne] = useState(false);
  const [mergeRangeOutputs, setMergeRangeOutputs] = useState(false);
  const [mode, setMode] = useState<SplitMode>({ kind: 'ranges', ranges: [[1]] });
  const [interval, setInterval] = useState(2);
  const pageCountRef = useRef(0);

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
      if (splitTab !== 'pages' || extractMode !== 'all') return;
      const file = api.files[0];
      const n = file?.preview?.pageCount ?? 0;
      if (!file || n <= 0) return;
      const st = api.gridByFileId[file.id];
      if (!st) return;
      if (!isFullPageSelection(st, n)) setExtractMode('select');
    },
    [splitTab, extractMode]
  );

  const footer = useCallback(
    (api: WorkspaceSurfaceApi) => {
      const file = api.files[0];
      const n = file?.preview?.pageCount ?? 0;
      pageCountRef.current = n;
      const st = file ? api.gridByFileId[file.id] : undefined;
      const ordered = orderedPagesFromGrid(st, n);
      const groups = n > 0 && splitTab === 'range' ? splitGroupsForBar(mode, n) : [];

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
                  ? 'Select at least one page in the Pages panel next to the preview.'
                  : `Selected pages export as separate files. ${outputPdfCount} PDF${outputPdfCount === 1 ? '' : 's'} will be created.`;

      return (
        <div className="space-y-5 text-xs text-muted-foreground">
          <section
            className="rounded-xl border border-border/45 bg-white/85 p-4 shadow-sm sm:p-5"
            aria-label="PDF split options"
          >
            <div className="mb-1">
              <StudioTabBar<SplitSidebarTab>
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
              <div className="mt-4 space-y-4 border-t border-border/35 pt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Range mode</h3>
                <StudioSegmentRow<RangeModeUi>
                  options={[
                    { id: 'custom', label: 'Custom' },
                    { id: 'fixed', label: 'Fixed' },
                    { id: 'smart', label: 'Smart', disabled: true },
                  ]}
                  value={rangeModeUi}
                  onChange={(id) => {
                    setRangeModeUi(id);
                    if (id === 'custom') {
                      setMode((prev) =>
                        prev.kind === 'ranges' ? prev : { kind: 'ranges', ranges: [[1]] }
                      );
                    } else if (id === 'fixed') {
                      setMode({ kind: 'every', interval: Math.max(1, interval) });
                    }
                  }}
                  activeClassName="bg-white text-amber-800 shadow-sm ring-2 ring-amber-500/80"
                />
                {rangeModeUi === 'custom' ? (
                  <div className="space-y-3">
                    {mode.kind === 'ranges' ? (
                      <div className="flex flex-col gap-1.5">
                        {mode.ranges.map((pages, idx) => {
                          const from = Math.min(...pages);
                          const to = Math.max(...pages);
                          return (
                            <div
                              key={`range-${idx}-${from}-${to}`}
                              aria-label={`Range ${idx + 1}`}
                              className="flex min-h-[1.75rem] flex-nowrap items-center gap-2 rounded-lg border border-border/40 bg-white/95 px-2 py-1 shadow-sm dark:bg-white/[0.07]"
                            >
                              <div
                                className="flex h-7 w-7 shrink-0 flex-none items-center justify-center rounded-md border border-amber-600/20 bg-amber-100 text-[11px] font-bold tabular-nums leading-none text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/55 dark:text-amber-50"
                                aria-hidden
                              >
                                {idx + 1}
                              </div>

                              <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-2 sm:gap-x-3">
                                <label className="flex min-w-0 items-center justify-end gap-1.5">
                                  <span className="w-10 shrink-0 text-right text-xs font-semibold leading-tight text-foreground/85">
                                    From
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={n > 0 ? n : undefined}
                                    className="box-border h-7 w-11 shrink-0 rounded-md border border-border/55 bg-white px-1 text-center text-xs font-medium tabular-nums leading-none text-foreground dark:bg-muted/40"
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
                                    className="box-border h-7 w-11 shrink-0 rounded-md border border-border/55 bg-white px-1 text-center text-xs font-medium tabular-nums leading-none text-foreground dark:bg-muted/40"
                                    value={to}
                                    onChange={(e) =>
                                      patchCustomRange(idx, 'to', Math.max(1, Number(e.target.value) || 1))
                                    }
                                  />
                                </label>
                              </div>

                              {mode.ranges.length > 1 ? (
                                <button
                                  type="button"
                                  className="box-border flex h-7 shrink-0 items-center rounded-md border border-border/50 bg-white/80 px-2 text-[9px] font-medium leading-none text-muted-foreground transition hover:border-amber-300/60 hover:bg-amber-50/90 hover:text-amber-950 dark:bg-transparent dark:hover:bg-amber-950/30 dark:hover:text-amber-100"
                                  onClick={() => removeCustomRange(idx)}
                                >
                                  Remove
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={addCustomRange}
                      className="w-full rounded-lg border border-amber-600/70 bg-white py-2 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-50/90"
                    >
                      + Add range
                    </button>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border/45 bg-white/70 px-2.5 py-2">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={mergeRangeOutputs}
                        onChange={(e) => setMergeRangeOutputs(e.target.checked)}
                      />
                      <span className="text-[11px] leading-relaxed text-foreground">
                        Merge all ranges into one PDF file.
                      </span>
                    </label>
                  </div>
                ) : rangeModeUi === 'fixed' ? (
                  <div className="mt-1 space-y-2">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold text-foreground">Split into page ranges of</span>
                      <input
                        className="w-full rounded-lg border border-border/50 bg-white px-3 py-2.5 text-sm text-foreground"
                        type="number"
                        min={1}
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
                  <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-3 text-[11px]">
                    Smart split is not available yet.
                  </p>
                )}
              </div>
            ) : splitTab === 'pages' ? (
              <div className="mt-4 space-y-4 border-t border-border/35 pt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Extract mode</h3>
                <StudioSegmentRow<ExtractMode>
                  options={[
                    { id: 'all', label: 'Extract all pages' },
                    { id: 'select', label: 'Select pages' },
                  ]}
                  value={extractMode}
                  onChange={(id) => {
                    setExtractMode(id);
                    if (id === 'all' && file) api.selectAllPagesForFile(file.id);
                  }}
                  activeClassName="bg-white text-amber-800 shadow-sm ring-2 ring-amber-500/80"
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/45 bg-white/70 px-3 py-3">
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
              <p className="mt-4 border-t border-border/35 pt-4 text-[11px] leading-relaxed text-muted-foreground">
                Size-based splitting is not available in this version. Use Range or Pages instead.
              </p>
            )}
          </section>

          <StudioInfoBanner>{bannerText}</StudioInfoBanner>
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
      <PdfSplitStudioSurface api={api} mode={mode} splitTab={splitTab} extractMode={extractMode} />
    ),
    [mode, splitTab, extractMode]
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
      showPageGridPanel={(surface) =>
        splitTab === 'pages' && extractMode === 'select' && !!(surface.files[0]?.preview?.pageCount)
      }
      onPageGridStateChange={handlePageGridStateChange}
    />
  );
}
