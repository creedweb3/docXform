'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { watermarkPdf, type WatermarkPosition } from '@/lib/tool-runs/pdf-watermark';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('pdf-watermark')!;

const config: WorkspaceConfig = {
  title: 'Drop a PDF to add a watermark',
  hint: 'or click to browse - .pdf - choose text, position, and color',
  accept: '.pdf',
  allowMultiple: false,
  cardClass: 'converter-main-card-fuchsia',
  iconBoxClass: 'icon-box-fuchsia',
  iconClass: 'text-fuchsia-700',
  dragClass: 'ring-2 ring-fuchsia-300/50 bg-fuchsia-50/60 scale-[1.01]',
  primaryButtonClass: 'from-fuchsia-600 to-fuchsia-500',
  progressClass: 'from-fuchsia-400 to-pink-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

function hexToRgb(hex: string) {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;
  return { r, g, b };
}

export function PdfWatermarkTool() {
  const [text, setText] = useLocalSetting<string>('docxform:pdf-watermark:text', 'CONFIDENTIAL');
  const [position, setPosition] = useLocalSetting<WatermarkPosition>('docxform:pdf-watermark:position', 'center');
  const [opacity, setOpacity] = useLocalSetting<number>('docxform:pdf-watermark:opacity', 0.25);
  const [fontSize, setFontSize] = useLocalSetting<number>('docxform:pdf-watermark:font-size', 64);
  const [color, setColor] = useLocalSetting<string>('docxform:pdf-watermark:color', '#0f172a');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-3 text-xs text-muted-foreground">
      <label htmlFor="pdf-watermark-text" className="block font-semibold text-foreground text-sm">
        Watermark text
      </label>
      <input
        id="pdf-watermark-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="w-full rounded-lg border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        maxLength={120}
      />
      <RadioGroup<WatermarkPosition>
        name="pdf-watermark-position"
        label="Position"
        value={position}
        onChange={setPosition}
        options={[
          { value: 'center', label: 'Center (diagonal)' },
          { value: 'tile', label: 'Tile (full page)' },
          { value: 'top', label: 'Top center' },
          { value: 'bottom', label: 'Bottom center' },
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-foreground">
          Opacity
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
          <span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span>
        </label>
        <label className="flex flex-col gap-1 text-foreground">
          Font size
          <input
            type="number"
            min={12}
            max={200}
            value={fontSize}
            onChange={(event) => setFontSize(Math.max(12, Math.min(200, Number(event.target.value) || 64)))}
            className="rounded-lg border border-border/50 bg-card/80 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-foreground">
        Color
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-8 w-12 cursor-pointer rounded-md border border-border/50"
        />
      </label>
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const file = files[0];
      setProgress(file.id, 5, 'Stamping...');
      const stamped = await watermarkPdf(
        file.file,
        {
          text,
          position,
          opacity,
          fontSize,
          color: hexToRgb(color),
        },
        (pct) => setProgress(file.id, pct, 'Stamping...')
      );
      return [
        {
          ...file,
          status: 'done',
          message: 'Watermark applied',
          outputs: [{ name: file.file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf', blob: stamped }],
        },
      ] as WorkspaceFile[];
    },
    [text, position, opacity, fontSize, color]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, validateFiles }} footer={footer} />;
}
