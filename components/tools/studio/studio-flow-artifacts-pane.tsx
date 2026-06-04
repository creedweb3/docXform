'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon } from '@hugeicons/core-free-icons';
import { StudioScrollArea } from '@/components/tools/studio/studio-ui';
import { STUDIO_LABEL } from '@/components/tools/studio/studio-theme';
import { formatBytes } from '@/lib/client-file-validation';
import clsx from 'clsx';

export type StudioFlowArtifactFile = {
  name: string;
  blob: Blob;
};

/** One source file and its output artifact(s) — split / batch output stage. */
export type StudioFlowArtifactGroup = {
  id: string;
  sourceName: string;
  sourceSize: number;
  statusLabel: string;
  files: StudioFlowArtifactFile[];
};

type DownloadRow = {
  key: string;
  label: string;
  file: StudioFlowArtifactFile;
};

const DOWNLOAD_ROW_BTN = clsx(
  'interactive-trigger inline-flex h-9 items-center gap-1.5 rounded-sm px-3',
  'font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'box-border w-full min-w-0 max-w-[min(100%,18rem)] justify-start gap-2',
  'border border-[hsl(var(--brand-copper)/0.32)] bg-[hsl(var(--brand-copper)/0.09)] text-white/90',
  'hover:border-[hsl(var(--brand-copper)/0.22)] hover:bg-[#080808] hover:text-[hsl(var(--brand-copper))]'
);

const TWO_COLUMN_AFTER = 14;

function useTwoColumns(count: number): boolean {
  return count > TWO_COLUMN_AFTER;
}

function buildFlatRows(groups: StudioFlowArtifactGroup[]): DownloadRow[] {
  return groups.flatMap((group) =>
    group.files.map((file) => ({
      key: `${group.id}-${file.name}`,
      label: file.name,
      file,
    }))
  );
}

function rowLabel(row: DownloadRow): string {
  return row.label;
}

/**
 * Output-stage artifacts pane (split, word-to-pdf, /tools/*).
 * Single studio panel; compact h-9 download rows — scroll when the list is long.
 */
export function StudioFlowArtifactsPane({
  groups,
  onDownload,
  label = 'artifacts',
  fillHeight = false,
}: {
  groups: StudioFlowArtifactGroup[];
  onDownload: (file: StudioFlowArtifactFile) => void;
  label?: string;
  /** Stretch panel + list to fill parent (output stage). */
  fillHeight?: boolean;
}) {
  const singleGroup = groups.length === 1;
  const group = singleGroup ? groups[0] : null;
  const flatBatch =
    groups.length > 1 && groups.every((g) => g.files.length <= 1);
  const needsGroupedLayout =
    groups.length > 1 && groups.some((g) => g.files.length > 1);

  const flatRows = flatBatch || singleGroup ? buildFlatRows(groups) : [];
  const singleArtifact = Boolean(group && group.files.length === 1);
  const compactPane = !fillHeight && flatRows.length === 1;
  const stretchList = fillHeight || !compactPane;

  return (
    <section
      className={clsx(
        'studio-shell-panel flex flex-col overflow-hidden rounded-sm border p-4 sm:p-5',
        fillHeight ? 'h-full min-h-0 flex-1' : compactPane ? 'shrink-0' : 'min-h-0 flex-1'
      )}
    >
      <p className={clsx(STUDIO_LABEL, 'mb-3 shrink-0 text-[hsl(var(--brand-copper))]')}>{label}</p>

      <div className={clsx('flex flex-col gap-3', stretchList ? 'min-h-0 flex-1' : 'shrink-0')}>
        {singleGroup && group && !singleArtifact ? (
          <StudioFlowArtifactSourceHeader group={group} />
        ) : flatBatch ? (
          <p className="shrink-0 font-mono text-[12px] text-foreground/80">
            {groups.length} files
            <span className="text-muted-foreground">
              {' '}
              · {groups[0]?.statusLabel ?? 'Done'}
            </span>
          </p>
        ) : null}

        {needsGroupedLayout ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain queue-list-scrollbar">
            {groups.map((g) => {
              if (g.files.length === 0) return null;
              return (
                <div key={g.id} className="flex min-w-0 flex-col gap-2">
                  <p className="truncate font-mono text-[11px] text-foreground/80" title={g.sourceName}>
                    {g.sourceName}
                  </p>
                  <StudioFlowArtifactDownloadGrid
                    rows={g.files.map((file) => ({
                      key: `${g.id}-${file.name}`,
                      label: file.name,
                      file,
                    }))}
                    fillHeight={false}
                    onDownload={onDownload}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <StudioFlowArtifactDownloadGrid
            rows={flatRows}
            fillHeight={stretchList}
            onDownload={onDownload}
          />
        )}
      </div>
    </section>
  );
}

function StudioFlowArtifactSourceHeader({ group }: { group: StudioFlowArtifactGroup }) {
  return (
    <div className="w-full min-w-0 shrink-0">
      <p className="truncate font-mono text-[12px] text-foreground/80" title={group.sourceName}>
        {group.sourceName}
      </p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {formatBytes(group.sourceSize)} · {group.statusLabel}
      </p>
    </div>
  );
}

function StudioFlowArtifactDownloadGrid({
  rows,
  fillHeight,
  onDownload,
}: {
  rows: DownloadRow[];
  fillHeight: boolean;
  onDownload: (file: StudioFlowArtifactFile) => void;
}) {
  const twoColumn = useTwoColumns(rows.length);

  return (
    <StudioScrollArea
      measureKey={`${rows.length}-${twoColumn ? '2' : '1'}-${fillHeight ? 'fill' : 'compact'}`}
      aria-label="Download artifacts"
      className={clsx(
        'w-full min-w-0',
        fillHeight ? 'flex min-h-0 flex-1 flex-col' : 'shrink-0'
      )}
    >
      <div
        className={clsx(
          'grid w-full min-w-0 content-start justify-items-start gap-2',
          twoColumn ? 'grid-cols-2' : 'grid-cols-1'
        )}
        role="group"
      >
        {rows.map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => onDownload(row.file)}
            title={row.label}
            aria-label={`Download ${row.label}`}
            className={clsx(DOWNLOAD_ROW_BTN, 'group')}
          >
            <HugeiconsIcon
              icon={Download01Icon}
              size={14}
              strokeWidth={2}
              className="shrink-0"
            />
            <span
              className={clsx(
                'min-w-0 flex-1 truncate text-left font-mono',
                rows.length === 1
                  ? 'text-[12px] normal-case'
                  : 'text-[11px] uppercase tracking-wide'
              )}
            >
              {rowLabel(row)}
            </span>
          </button>
        ))}
      </div>
    </StudioScrollArea>
  );
}
