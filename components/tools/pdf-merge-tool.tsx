'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { mergePdfs } from '@/lib/tool-runs/pdf-merge';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';

const tool = getToolBySlug('pdf-merge')!;

const config: WorkspaceConfig = {
  title: 'Drop PDFs to merge',
  hint: 'or click to browse - .pdf - reorder before processing',
  accept: '.pdf',
  allowMultiple: true,
  cardClass: 'converter-main-card-emerald',
  iconBoxClass: 'icon-box-emerald',
  iconClass: 'text-emerald-600',
  dragClass: 'ring-2 ring-emerald-300/50 bg-emerald-50/60 scale-[1.01]',
  primaryButtonClass: 'from-emerald-600 to-emerald-500',
  progressClass: 'from-emerald-400 to-lime-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

export function PdfMergeTool() {
  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;

      const merged = await mergePdfs(
        files.map((f) => f.file),
        (pct) => setProgress(files[0].id, pct, 'Merging...')
      );

      return [
        {
          ...files[0],
          status: 'done',
          message: 'Merged',
          outputs: [{ name: 'merged.pdf', blob: merged }],
        } satisfies WorkspaceFile,
      ];
    },
    []
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, validateFiles }} />;
}
