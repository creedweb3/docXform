'use client';

import { useCallback } from 'react';
import {
  ToolWorkspace,
  type PdfPageGridProcessContext,
  type WorkspaceConfig,
  type WorkspaceFile,
  type WorkspaceSurfaceApi,
} from '@/components/tools/tool-workspace';
import { PdfToImagesStudioSurface } from '@/components/tools/studio/pdf-tool-studio-surfaces';
import { pdfToImages, type ImageFormat } from '@/lib/tool-runs/pdf-to-images';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';
import { generatePdfPreview } from '@/lib/client-previews';

const tool = getToolBySlug('pdf-to-images')!;

const config: WorkspaceConfig = {
  title: 'Drop a PDF to export pages as images',
  hint: 'or click to browse - .pdf - choose PNG or JPEG output',
  accept: '.pdf',
  allowMultiple: true,
  cardClass: 'converter-main-card-purple',
  iconBoxClass: 'icon-box-purple',
  iconClass: 'text-purple-700',
  dragClass: 'ring-2 ring-purple-300/50 bg-purple-50/60 scale-[1.01]',
  primaryButtonClass: 'from-purple-600 to-purple-500',
  progressClass: 'from-purple-400 to-indigo-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
  queuedTitle: 'PDFs ready to export',
  actionLabel: 'Export',
  pageGrid: { layout: 'perFile', allowReorder: false },
  studioHint: (
    <>
      The strip previews pages that will become images. Use the <strong>Pages</strong> grid to export only selected pages
      or change order.
    </>
  ),
};

export function PdfToImagesTool() {
  const [format, setFormat] = useLocalSetting<ImageFormat>('docxform:pdf-to-images:format', 'png');
  const [scale, setScale] = useLocalSetting<number>('docxform:pdf-to-images:scale', 1.5);
  const [jpegQuality, setJpegQuality] = useLocalSetting<number>('docxform:pdf-to-images:jpeg-quality', 0.92);

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
      {format === 'jpeg' && (
        <label className="flex items-center gap-2 text-foreground">
          JPEG quality
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.02}
            value={jpegQuality}
            onChange={(event) => setJpegQuality(Number(event.target.value))}
          />
          <span className="text-[11px] text-muted-foreground">{Math.round(jpegQuality * 100)}%</span>
        </label>
      )}
    </div>
  );

  const processFiles = useCallback(
    async (
      files: WorkspaceFile[],
      setProgress: (id: string, percent: number, message?: string) => void,
      pageGrid?: PdfPageGridProcessContext
    ) => {
      if (!files.length) return files;
      const results: WorkspaceFile[] = [];
      for (const file of files) {
        const pageList = pageGrid?.active ? pageGrid.orderedPagesByFileId[file.id] : undefined;
        const images = await pdfToImages(
          file.file,
          format,
          scale,
          (pct) => setProgress(file.id, pct, 'Rendering...'),
          pageList && pageList.length > 0 ? pageList : undefined,
          format === 'jpeg' ? jpegQuality : undefined
        );
        results.push({
          ...file,
          status: 'done',
          message: `Rendered ${images.length} page(s)`,
          outputs: images,
        });
      }
      return results;
    },
    [format, scale, jpegQuality]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  const studioSurface = useCallback((api: WorkspaceSurfaceApi) => <PdfToImagesStudioSurface api={api} />, []);

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'pages.zip', validateFiles, generatePreview: generatePdfPreview }}
      footer={footer}
      studioSurface={studioSurface}
    />
  );
}
