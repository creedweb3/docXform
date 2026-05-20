'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { unlockPdf } from '@/lib/tool-runs/pdf-unlock';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { generatePdfPreview } from '@/lib/client-previews';

const tool = getToolBySlug('pdf-unlock')!;

const config = buildWorkspaceConfig(tool, {
  title: 'Drop a PDF to remove permission locks',
  hint: 'or click to browse - .pdf - works for owner-restricted files you can already open',
  accept: '.pdf',
  allowMultiple: true,
  queuedTitle: 'PDFs ready to unlock',
  actionLabel: 'Unlock',
  studioStageTitle: 'Selected PDFs',
  studioHint: (
    <>
      Strips owner restrictions (print, copy, edit) on PDFs you can already open. Files that need a password to open are
      not supported here.
    </>
  ),
});

export function PdfUnlockTool() {
  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-xs text-muted-foreground">
      Owner restrictions (print/copy/edit) are stripped. PDFs that require a password to open cannot be unlocked here.
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results: WorkspaceFile[] = [];
      for (const item of files) {
        try {
          setProgress(item.id, 10, 'Unlocking...');
          const out = await unlockPdf(item.file, (pct) => setProgress(item.id, pct, 'Unlocking...'));
          results.push({
            ...item,
            status: 'done',
            message: 'Unlocked',
            outputs: [{ name: item.file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf', blob: out }],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({ ...item, status: 'failed', error: message, message });
        }
      }
      return results;
    },
    []
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'unlocked-pdfs.zip', validateFiles, generatePreview: generatePdfPreview }}
      footer={footer}
    />
  );
}
