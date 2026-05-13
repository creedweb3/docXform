'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { convertDocumentFile } from '@/lib/client-document-converter';
import { validateDocxFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';

const config: WorkspaceConfig = {
  title: 'Drop DOCX files to convert to PPTX',
  hint: 'or click to browse - .docx - converts locally',
  accept: '.doc,.docx',
  allowMultiple: true,
  cardClass: 'converter-main-card-indigo',
  iconBoxClass: 'icon-box-indigo',
  iconClass: 'text-indigo-600',
  dragClass: 'ring-2 ring-indigo-300/50 bg-indigo-50/60 scale-[1.01]',
  primaryButtonClass: 'from-indigo-600 to-indigo-500',
  progressClass: 'from-indigo-400 to-sky-400',
};

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

  return <ToolWorkspace config={config} actions={{ processFiles, zipName: 'slides.zip', validateFiles }} />;
}
