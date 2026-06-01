'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Archive01Icon,
  ArrowLeft01Icon,
  Download01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import type { ConversionFlowRegistration } from '@/components/tools/conversion-flow-provider';
import { TermFrame } from '@/components/site/console/console-ui';
import { StudioFlowDuplicatePrompt } from '@/components/tools/studio/studio-flow-chrome';
import { StudioScrollArea } from '@/components/tools/studio/studio-ui';
import { formatBytes } from '@/lib/client-file-validation';
import {
  WORKSPACE_CTA_PRIMARY,
  WORKSPACE_CTA_SECONDARY,
  WORKSPACE_TOOLBAR_BTN,
} from '@/lib/site-design';
import clsx from 'clsx';

const OUTPUT_QUEUE_ACTION =
  'h-11 w-full min-w-0 !min-h-0 shrink-0 justify-center px-3 text-[10px] tracking-[0.1em]';

const OUTPUT_ARTIFACT_DOWNLOAD_BTN = clsx(
  WORKSPACE_TOOLBAR_BTN,
  'box-border h-9 w-full max-w-none min-w-0 justify-start gap-2 self-stretch px-3'
);

/** ~7 download rows fit in the flow artifacts pane per column; 2 cols ≈ 14 before scroll. */
const OUTPUT_DOWNLOADS_TWO_COLUMN_AFTER = 14;

function artifactDownloadsUseTwoColumns(count: number): boolean {
  return count > OUTPUT_DOWNLOADS_TWO_COLUMN_AFTER;
}

type ConversionFlowOutputProps = {
  registration: ConversionFlowRegistration;
};

export function ConversionFlowOutputView({ registration }: ConversionFlowOutputProps) {
  const {
    files,
    outputLabel,
    busy,
    isBulkDownload,
    onDownloadAll,
    onDownloadFile,
    onReset,
    allowAddMoreFiles,
    onOpenFilePicker,
    duplicatePrompt,
    onSkipDuplicates,
    onAddDuplicates,
  } = registration;

  const showDuplicatePrompt =
    duplicatePrompt &&
    onSkipDuplicates &&
    onAddDuplicates;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {showDuplicatePrompt ? (
        <StudioFlowDuplicatePrompt
          message={duplicatePrompt.message}
          onSkip={onSkipDuplicates}
          onAddAgain={onAddDuplicates}
        />
      ) : null}
      <TermFrame label="download.queue" className="shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDownloadAll()}
            disabled={busy || files.every((f) => !(f.outputs?.length ?? 0))}
            className={clsx(OUTPUT_QUEUE_ACTION, WORKSPACE_CTA_PRIMARY)}
          >
            <HugeiconsIcon
              icon={isBulkDownload ? Archive01Icon : Download01Icon}
              size={16}
              strokeWidth={2}
            />
            <span className="truncate">{isBulkDownload ? 'Download ZIP' : `Download ${outputLabel}`}</span>
          </button>
          {allowAddMoreFiles && onOpenFilePicker ? (
            <button
              type="button"
              onClick={onOpenFilePicker}
              disabled={busy}
              className={clsx(OUTPUT_QUEUE_ACTION, WORKSPACE_CTA_SECONDARY)}
            >
              Add more files
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              disabled={busy}
              className={clsx(OUTPUT_QUEUE_ACTION, WORKSPACE_CTA_SECONDARY)}
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={2} />
              Start again
            </button>
          )}
        </div>
      </TermFrame>

      <TermFrame
        label="artifacts"
        className="flex min-h-0 flex-1 flex-col overflow-hidden [&>p]:mb-3 [&>p]:shrink-0"
      >
        <ul
          className={clsx(
            'flex w-full min-w-0 flex-col gap-2',
            files.length === 1
              ? 'min-h-0 flex-1 overflow-hidden'
              : 'queue-list-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain'
          )}
        >
          {files.map((file) => {
            const outs = file.outputs ?? [];
            const singleArtifact = files.length === 1;
            return (
              <li
                key={file.id}
                className={clsx(
                  'flex w-full min-w-0 flex-col rounded-sm border border-[hsl(var(--brand-copper)/0.14)] bg-black/30 px-3 py-3',
                  singleArtifact && 'min-h-0 flex-1'
                )}
              >
                <div
                  className={clsx(
                    'flex w-full min-w-0 flex-col gap-3',
                    singleArtifact && 'min-h-0 flex-1'
                  )}
                >
                  <div className="w-full min-w-0 shrink-0">
                    <p className="truncate font-mono text-[12px] text-foreground" title={file.name}>
                      {file.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {formatBytes(file.size)} · {file.statusLabel}
                    </p>
                  </div>
                  {outs.length > 0 ? (
                    <ArtifactDownloadsScrollList
                      outs={outs}
                      fileName={file.name}
                      singleArtifact={singleArtifact}
                      onDownloadFile={onDownloadFile}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </TermFrame>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--brand-copper)/0.12)] pt-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
        >
          <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={2} />
          Start again
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-[hsl(var(--brand-copper))] transition hover:underline"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
          New session
        </button>
      </div>
    </div>
  );
}

type FlowOutputArtifact = NonNullable<
  ConversionFlowRegistration['files'][number]['outputs']
>[number];

function ArtifactDownloadsScrollList({
  outs,
  fileName,
  singleArtifact,
  onDownloadFile,
}: {
  outs: NonNullable<ConversionFlowRegistration['files'][number]['outputs']>;
  fileName: string;
  singleArtifact: boolean;
  onDownloadFile: (output: FlowOutputArtifact) => void;
}) {
  const twoColumn = artifactDownloadsUseTwoColumns(outs.length);

  return (
    <StudioScrollArea
      measureKey={`${outs.length}-${twoColumn ? '2' : '1'}`}
      aria-label={`Downloads for ${fileName}`}
      className={clsx('w-full min-w-0', singleArtifact ? 'min-h-0 flex-1' : 'max-h-40')}
    >
      <div
        className={clsx(
          'grid w-full min-w-0 gap-2',
          twoColumn ? 'grid-cols-2' : 'grid-cols-1'
        )}
        role="group"
      >
        {outs.map((out) => (
          <button
            key={out.name}
            type="button"
            onClick={() => onDownloadFile(out)}
            title={out.name}
            className={OUTPUT_ARTIFACT_DOWNLOAD_BTN}
          >
            <HugeiconsIcon icon={Download01Icon} size={14} strokeWidth={2} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">
              {outs.length > 1 ? out.name : 'Download'}
            </span>
          </button>
        ))}
      </div>
    </StudioScrollArea>
  );
}
