'use client';

import { useCallback } from 'react';
import {
  ToolWorkspace,
  type PdfPageGridProcessContext,
  type WorkspaceFile,
  type WorkspaceSurfaceApi,
} from '@/components/tools/tool-workspace';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { PdfMergeStudioSurface } from '@/components/tools/studio/pdf-tool-studio-surfaces';
import { mergePdfs } from '@/lib/tool-runs/pdf-merge';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { generatePdfPreview } from '@/lib/client-previews';

const tool = getToolBySlug('pdf-merge')!;

const config = buildWorkspaceConfig(tool, {
  title: 'Drop PDFs to merge',
  hint: 'or click to browse - .pdf - reorder before processing',
  accept: '.pdf',
  allowMultiple: true,
  queuedTitle: 'PDFs ready to merge',
  actionLabel: 'Merge',
  pageGrid: { layout: 'perFile', allowReorder: true },
  studioHint: (
    <>
      Drag PDFs on the stage to set merge order. Use the <strong>Pages</strong> panel below to omit or reorder pages
      inside each file before merging.
    </>
  ),
});

export function PdfMergeTool() {
  const processFiles = useCallback(
    async (
      files: WorkspaceFile[],
      setProgress: (id: string, percent: number, message?: string) => void,
      pageGrid?: PdfPageGridProcessContext
    ) => {
      if (!files.length) return files;

      const merged = await mergePdfs(
        files.map((f) => ({
          file: f.file,
          pages: pageGrid?.active ? pageGrid.orderedPagesByFileId[f.id] : undefined,
        })),
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

  const studioSurface = useCallback((api: WorkspaceSurfaceApi) => <PdfMergeStudioSurface api={api} />, []);

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, validateFiles, generatePreview: generatePdfPreview }}
      studioSurface={studioSurface}
    />
  );
}
