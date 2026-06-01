'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
import { StudioNumStepper, StudioScrollArea, StudioSegmentRow, StudioTabBar } from '@/components/tools/studio/studio-ui';
import {
  STUDIO_CHECK_ROW,
  STUDIO_CHECKBOX,
  STUDIO_FIELD_ROW,
  STUDIO_HINT,
  STUDIO_SECONDARY_BTN,
} from '@/components/tools/studio/studio-theme';
import { TONE_STYLES } from '@/components/tools/tone-styles';

const tool = getToolBySlug('pdf-split')!;
const studioAccent = getStudioAccent(tool.tone);

const PDF_SPLIT_RANGE_SCROLL_STYLE = {
  '--queue-scrollbar-thumb': TONE_STYLES[tool.tone].scrollbarThumb,
  '--queue-scrollbar-thumb-hover': TONE_STYLES[tool.tone].scrollbarThumbHover,
} as CSSProperties;

/**
 * Legacy dropzone layout: up to this many ranges grow naturally; beyond that, fixed-height list scroll.
 * Flow studio uses {@link CustomPageRangeListViewport} `flexConstrained` instead (no count threshold).
 */
const RANGE_LIST_NATURAL_MAX_COUNT = 5;

const RANGE_LIST_SCROLL_VIEWPORT_REM = 15.75;

function CustomPageRangeListViewport({
  flexConstrained,
  scroll,
  scrollStyle,
  rowCount,
  children,
}: {
  /** Fill remaining rail height and scroll when rows overflow (conversion-flow studio). */
  flexConstrained?: boolean;
  scroll?: boolean;
  scrollStyle?: CSSProperties;
  rowCount?: number;
  children: ReactNode;
}) {
  const list = <div className="flex flex-col gap-1.5">{children}</div>;

  if (flexConstrained) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <StudioScrollArea
          measureKey={rowCount}
          aria-label="Custom page ranges"
          className="box-border min-h-0 flex-1 py-1.5 ps-1 [-webkit-overflow-scrolling:touch]"
          style={scrollStyle}
        >
          {list}
        </StudioScrollArea>
      </div>
    );
  }

  if (!scroll) {
    return (
      <div className="flex shrink-0 flex-col gap-1.5 overflow-x-clip px-1" aria-label="Custom page ranges">
        {children}
      </div>
    );
  }
  return (
    <div className="w-full min-w-0 shrink-0" style={{ height: `${RANGE_LIST_SCROLL_VIEWPORT_REM}rem` }}>
      <StudioScrollArea
        measureKey={rowCount}
        aria-label="Custom page ranges"
        className="box-border h-full py-1.5 ps-1 [-webkit-overflow-scrolling:touch]"
        style={scrollStyle}
      >
        {list}
      </StudioScrollArea>
    </div>
  );
}

type SplitSidebarTab = 'range' | 'pages' | 'size';
type RangeModeUi = 'custom' | 'fixed' | 'smart';
type ExtractMode = 'all' | 'select';

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

/** Clamps fixed-interval state when preview page count is known or shrinks. */
function ClampSplitIntervalEffect({
  pageCount,
  interval,
  onClamp,
}: {
  pageCount: number;
  interval: number;
  onClamp: (clamped: number) => void;
}) {
  useEffect(() => {
    if (pageCount <= 0 || interval <= pageCount) return;
    onClamp(pageCount);
  }, [pageCount, interval, onClamp]);
  return null;
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

  const clampIntervalToPageCount = useCallback((clamped: number) => {
    setInterval(clamped);
    setMode((m) => (m.kind === 'every' ? { kind: 'every', interval: clamped } : m));
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

      return (
        <div
          className={clsx(
            'flex w-full min-w-0 flex-col gap-5 text-xs text-muted-foreground max-md:gap-4',
            api.inFlowStudio && 'h-full min-h-0 overflow-hidden'
          )}
        >
          <section
            className={clsx(
              'min-w-0 w-full space-y-4 overflow-x-visible',
              api.inFlowStudio ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : 'shrink-0'
            )}
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
              <div
                className={clsx(
                  'mt-4 flex min-w-0 flex-col gap-4 border-t border-border/15 pt-4',
                  api.inFlowStudio && 'min-h-0 flex-1 overflow-hidden'
                )}
              >
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
                        const cap = n > 0 ? n : undefined;
                        const next =
                          cap != null ? Math.min(Math.max(1, interval), cap) : Math.max(1, interval);
                        setInterval(next);
                        setMode({ kind: 'every', interval: next });
                      }
                    }}
                  />
                </div>
                {rangeModeUi === 'custom' ? (
                  <div
                    className={clsx(
                      'flex min-w-0 flex-col gap-3',
                      api.inFlowStudio && mode.kind === 'ranges' && 'min-h-0 flex-1 overflow-hidden'
                    )}
                  >
                    {mode.kind === 'ranges' ? (
                      <CustomPageRangeListViewport
                        flexConstrained={api.inFlowStudio}
                        rowCount={mode.ranges.length}
                        scroll={
                          !api.inFlowStudio && mode.ranges.length > RANGE_LIST_NATURAL_MAX_COUNT
                        }
                        scrollStyle={PDF_SPLIT_RANGE_SCROLL_STYLE}
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
                              className={clsx(STUDIO_FIELD_ROW, 'max-md:px-3')}
                            >
                              <div className={studioAccent.rangeIndexBadge} aria-hidden>
                                {idx + 1}
                              </div>

                              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
                                <label className="flex min-w-0 items-center justify-end gap-1.5">
                                  <span className="w-10 shrink-0 text-right text-xs font-semibold leading-tight text-foreground/85">
                                    From
                                  </span>
                                  <StudioNumStepper
                                    ariaLabel={`Range ${idx + 1} from page`}
                                    min={1}
                                    max={n > 0 ? n : undefined}
                                    disabled={rangeRowsLocked}
                                    className="max-md:h-9"
                                    value={from}
                                    onChange={(v) => patchCustomRange(idx, 'from', v)}
                                  />
                                </label>
                                <label className="flex min-w-0 items-center justify-end gap-1.5">
                                  <span className="w-10 shrink-0 text-right text-xs font-semibold leading-tight text-foreground/85">
                                    To
                                  </span>
                                  <StudioNumStepper
                                    ariaLabel={`Range ${idx + 1} to page`}
                                    min={1}
                                    max={n > 0 ? n : undefined}
                                    disabled={rangeRowsLocked}
                                    className="max-md:h-9"
                                    value={to}
                                    onChange={(v) => patchCustomRange(idx, 'to', v)}
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
                        className={clsx(STUDIO_SECONDARY_BTN, 'shrink-0 max-md:py-3')}
                      >
                        Edit ranges
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={addCustomRange}
                        className={clsx(studioAccent.addRangeButton, 'shrink-0')}
                      >
                        + Add range
                      </button>
                    )}
                    <label
                      className={clsx(
                        STUDIO_CHECK_ROW,
                        'shrink-0',
                        rangeSettingsLocked ? 'cursor-not-allowed opacity-60' : undefined
                      )}
                    >
                      <input
                        type="checkbox"
                        className={STUDIO_CHECKBOX}
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
                  <div
                    className={clsx(
                      'studio-shell-panel mt-1 flex shrink-0 flex-col gap-2.5 rounded-sm border px-3 py-3',
                      rangeSettingsLocked ? 'cursor-not-allowed opacity-60' : undefined
                    )}
                  >
                    {n > 0 ? (
                      <ClampSplitIntervalEffect
                        pageCount={n}
                        interval={interval}
                        onClamp={clampIntervalToPageCount}
                      />
                    ) : null}
                    <p className="select-none text-[11px] font-semibold leading-relaxed text-foreground">
                      Split into page ranges of
                    </p>
                    <StudioNumStepper
                      fullWidth
                      ariaLabel="Pages per range"
                      min={1}
                      max={n > 0 ? n : undefined}
                      disabled={rangeSettingsLocked}
                      value={interval}
                      onChange={(next) => {
                        const capped = n > 0 ? Math.min(next, n) : next;
                        setInterval(capped);
                        setMode({ kind: 'every', interval: capped });
                      }}
                    />
                  </div>
                ) : (
                  <p className={clsx(STUDIO_HINT, 'max-md:py-3.5')}>
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
                <label className={clsx(STUDIO_CHECK_ROW, 'max-md:py-3.5')}>
                  <input
                    type="checkbox"
                    className={STUDIO_CHECKBOX}
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
      clampIntervalToPageCount,
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
