'use client';

import { useCallback, useState } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { imagesToPdf, type ImageFit } from '@/lib/tool-runs/images-to-pdf';
import { validateImageFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';

const config: WorkspaceConfig = {
  title: 'Drop images to convert to PDF',
  hint: 'or click to browse - .jpg .jpeg .png - reorder before processing',
  accept: '.jpg,.jpeg,.png,.webp',
  allowMultiple: true,
  cardClass: 'converter-main-card-cyan',
  iconBoxClass: 'icon-box-cyan',
  iconClass: 'text-cyan-700',
  dragClass: 'ring-2 ring-cyan-300/50 bg-cyan-50/60 scale-[1.01]',
  primaryButtonClass: 'from-cyan-600 to-cyan-500',
  progressClass: 'from-cyan-400 to-teal-400',
};

export function ImagesToPdfTool() {
  const [fit, setFit] = useState<ImageFit>('fit');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-white/50 p-3 space-y-2 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground text-sm">Layout</p>
      <label className="flex items-center gap-2">
        <input type="radio" checked={fit === 'fit'} onChange={() => setFit('fit')} />
        Fit to page (best for large images)
      </label>
      <label className="flex items-center gap-2">
        <input type="radio" checked={fit === 'contain'} onChange={() => setFit('contain')} />
        Keep native size (centered)
      </label>
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const pdf = await imagesToPdf(
        files.map((f) => f.file),
        fit,
        (pct) => setProgress(files[0].id, pct, 'Building PDF...')
      );

      return [
        {
          ...files[0],
          status: 'done',
          message: 'Created PDF',
          outputs: [{ name: 'images.pdf', blob: pdf }],
        },
      ] as WorkspaceFile[];
    },
    [fit]
  );

  const validateFiles = useCallback(
    (files: File[]) => validateImageFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, validateFiles }} footer={footer} />;
}
