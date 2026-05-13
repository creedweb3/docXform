'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { convertDocumentFile } from '@/lib/client-document-converter';
import { validatePptxFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';

const config: WorkspaceConfig = {
  title: 'Drop PPTX files to convert to PDF',
  hint: 'or click to browse - .pptx - slides rendered locally',
  accept: '.ppt,.pptx',
  allowMultiple: true,
  cardClass: 'converter-main-card-orange',
  iconBoxClass: 'icon-box-orange',
  iconClass: 'text-orange-600',
  dragClass: 'ring-2 ring-orange-300/50 bg-orange-50/60 scale-[1.01]',
  primaryButtonClass: 'from-orange-600 to-orange-500',
  progressClass: 'from-orange-400 to-amber-400',
};

export function PptxToPdfTool() {
  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results = [];
      for (const item of files) {
        try {
          const converted = await convertDocumentFile(item.file, 'pdf', (progress) =>
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
    (files: File[]) => validatePptxFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, zipName: 'slides.pdf.zip', validateFiles }} />;
}
