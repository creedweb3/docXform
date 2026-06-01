'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceFile, type WorkspaceSurfaceApi } from '@/components/tools/tool-workspace';
import { StudioFlowAsideInfo } from '@/components/tools/studio/studio-flow-aside-info';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { convertDocumentFile } from '@/lib/client-document-converter';
import { validateDocxFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';

const tool = getToolBySlug('docx-to-pptx')!;

const config = buildWorkspaceConfig(tool, {
  title: 'Drop DOCX files to convert to PPTX',
  hint: 'or click to browse - .docx - converts locally',
  accept: '.doc,.docx',
  allowMultiple: true,
  queuedTitle: 'Documents ready to slide',
  actionLabel: 'Convert',
});

export function DocxToPptxTool() {
  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results = [];
      for (const item of files) {
        try {
          const converted = await convertDocumentFile(item.file, 'pptx', (progress) =>
            setProgress(item.id, progress.percent, progress.message)
          );
          results.push({
            ...item,
            status: 'done',
            message: 'Converted',
            outputs: [{ name: converted.name, blob: converted.blob }],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({ ...item, status: 'failed', error: message, message });
        }
      }
      return results as WorkspaceFile[];
    },
    []
  );

  const validateFiles = useCallback(
    (files: File[]) => validateDocxFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  const footer = useCallback(
    (api: WorkspaceSurfaceApi) =>
      api.inFlowStudio ? (
        <StudioFlowAsideInfo title="Output">
          <p>
            Each document becomes <strong className="text-foreground">PPTX</strong> locally. Layout is simplified —
            complex Word formatting may not carry over.
          </p>
        </StudioFlowAsideInfo>
      ) : null,
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'slides.zip', validateFiles }}
      footer={footer}
    />
  );
}
