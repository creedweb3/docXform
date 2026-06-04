'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Archive01Icon,
  Download01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import type { ConversionFlowRegistration } from '@/components/tools/conversion-flow-provider';
import { ConversionFlowArtifactsPanel } from '@/components/tools/conversion-flow-artifacts';
import { StudioFlowDuplicatePrompt } from '@/components/tools/studio/studio-flow-chrome';
import { STUDIO_LABEL } from '@/components/tools/studio/studio-theme';
import {
  WORKSPACE_CTA_PRIMARY,
  WORKSPACE_CTA_SECONDARY,
} from '@/lib/site-design';
import clsx from 'clsx';

const OUTPUT_QUEUE_ACTION =
  'h-11 w-full min-w-0 !min-h-0 shrink-0 justify-center px-3 text-[10px] tracking-[0.1em]';

type ConversionFlowOutputProps = {
  registration: ConversionFlowRegistration;
};

/** Output stage UI for every {@link ConversionProductShell} tool (pick → studio → output). */
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
    <div className="conversion-flow-output flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {showDuplicatePrompt ? (
        <StudioFlowDuplicatePrompt
          content={duplicatePrompt.content}
          onSkip={onSkipDuplicates}
          onAddAgain={onAddDuplicates}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ConversionFlowArtifactsPanel files={files} onDownloadFile={onDownloadFile} />
      </div>

      <section className="studio-shell-panel shrink-0 rounded-sm border p-4 sm:p-5">
        <p className={clsx(STUDIO_LABEL, 'mb-3 text-[hsl(var(--brand-copper))]')}>download.queue</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onDownloadAll()}
            disabled={busy || files.every((f) => !(f.outputs?.length ?? 0))}
            className={clsx(OUTPUT_QUEUE_ACTION, WORKSPACE_CTA_PRIMARY, 'w-full min-h-12')}
          >
            <HugeiconsIcon
              icon={isBulkDownload ? Archive01Icon : Download01Icon}
              size={16}
              strokeWidth={2}
            />
            <span className="truncate">{isBulkDownload ? 'Download ZIP' : `Download ${outputLabel}`}</span>
          </button>
          <div
            className={clsx(
              'grid gap-2',
              allowAddMoreFiles && onOpenFilePicker ? 'grid-cols-2' : 'grid-cols-1'
            )}
          >
            {allowAddMoreFiles && onOpenFilePicker ? (
              <button
                type="button"
                onClick={onOpenFilePicker}
                disabled={busy}
                className={clsx(OUTPUT_QUEUE_ACTION, WORKSPACE_CTA_SECONDARY)}
              >
                Add more files
              </button>
            ) : null}
            <button
              type="button"
              onClick={onReset}
              disabled={busy}
              className={clsx(OUTPUT_QUEUE_ACTION, WORKSPACE_CTA_SECONDARY)}
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={2} />
              Start again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
