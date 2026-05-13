'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { pdfToImages, type ImageFormat } from '@/lib/tool-runs/pdf-to-images';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('pdf-to-images')!;

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
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

export function PdfToImagesTool() {
  const [format, setFormat] = useLocalSetting<ImageFormat>('docxform:pdf-to-images:format', 'png');
  const [scale, setScale] = useLocalSetting<number>('docxform:pdf-to-images:scale', 1.5);

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-3 text-xs text-muted-foreground">
      <RadioGroup<ImageFormat>
        name="pdf-to-images-format"
        label="Image format"
        value={format}
        onChange={setFormat}
        options={[
          { value: 'png', label: 'PNG', description: 'Lossless, larger files' },
          { value: 'jpeg', label: 'JPEG', description: 'Smaller, slightly lossy' },
        ]}
      />
      <label className="flex items-center gap-2 text-foreground">
        Render scale
        <input
          type="number"
          min={0.5}
          max={3}
          step={0.1}
          value={scale}
          onChange={(event) => setScale(Math.min(3, Math.max(0.5, Number(event.target.value) || 1.5)))}
          className="w-20 rounded-lg border border-border/50 bg-card/80 px-2 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
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
