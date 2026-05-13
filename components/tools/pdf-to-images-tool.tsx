'use client';

import { useCallback, useState } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { pdfToImages, type ImageFormat } from '@/lib/tool-runs/pdf-to-images';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES } from '@/lib/conversion-limits';

const config: WorkspaceConfig = {
  title: 'Drop a PDF to export pages as images',
  hint: 'or click to browse - .pdf - choose PNG or JPEG output',
  accept: '.pdf',
  allowMultiple: false,
  cardClass: 'converter-main-card-purple',
  iconBoxClass: 'icon-box-purple',
  iconClass: 'text-purple-700',
  dragClass: 'ring-2 ring-purple-300/50 bg-purple-50/60 scale-[1.01]',
  primaryButtonClass: 'from-purple-600 to-purple-500',
  progressClass: 'from-purple-400 to-indigo-400',
};

export function PdfToImagesTool() {
  const [format, setFormat] = useState<ImageFormat>('png');
  const [scale, setScale] = useState(1.5);

  const footer = (
    <div className="rounded-xl border border-border/50 bg-white/50 p-3 space-y-2 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground text-sm">Export settings</p>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input type="radio" checked={format === 'png'} onChange={() => setFormat('png')} />
          PNG (best quality, larger)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} />
          JPEG (smaller)
        </label>
        <label className="flex items-center gap-2">
          Scale:
          <input
            type="number"
            min={0.5}
            max={3}
            step={0.1}
            value={scale}
            onChange={(e) => setScale(Math.min(3, Math.max(0.5, Number(e.target.value) || 1.5)))}
            className="w-20 rounded-lg border border-border/50 bg-white/80 px-2 py-1 text-sm text-foreground"
          />
        </label>
      </div>
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const file = files[0];
      const images = await pdfToImages(file.file, format, scale, (pct) => setProgress(file.id, pct, 'Rendering...'));

      return [
        {
          ...file,
          status: 'done',
          message: `Rendered ${images.length} page(s)`,
          outputs: images,
        },
      ] as WorkspaceFile[];
    },
    [format, scale]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, zipName: 'pages.zip', validateFiles }} footer={footer} />;
}
