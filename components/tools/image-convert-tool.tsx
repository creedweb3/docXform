'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { convertImage, type ImageOutputFormat } from '@/lib/tool-runs/image-convert';
import { validateImageFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('image-convert')!;

const config = buildWorkspaceConfig(tool, {
  title: 'Drop images to convert',
  hint: 'or click to browse - .jpg .png .webp - swap formats locally',
  accept: '.jpg,.jpeg,.png,.webp',
  allowMultiple: true,
  queuedTitle: 'Images ready to convert',
  actionLabel: 'Convert',
});

export function ImageConvertTool() {
  const [format, setFormat] = useLocalSetting<ImageOutputFormat>('docxform:image-convert:format', 'jpeg');
  const [quality, setQuality] = useLocalSetting<number>('docxform:image-convert:quality', 0.85);

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-3 text-xs text-muted-foreground">
      <RadioGroup<ImageOutputFormat>
        name="image-convert-format"
        label="Target format"
        value={format}
        onChange={setFormat}
        options={[
          { value: 'jpeg', label: 'JPEG', description: 'Smaller, lossy, flattened to white' },
          { value: 'png', label: 'PNG', description: 'Lossless with transparency' },
          { value: 'webp', label: 'WebP', description: 'Modern format, great compression' },
        ]}
      />
      {format !== 'png' && (
        <label className="flex items-center gap-2 text-foreground">
          Quality
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
          <span className="text-xs text-muted-foreground">{Math.round(quality * 100)}%</span>
        </label>
      )}
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results: WorkspaceFile[] = [];
      for (const item of files) {
        try {
          setProgress(item.id, 5, 'Converting...');
          const converted = await convertImage(item.file, format, quality, (pct) =>
            setProgress(item.id, pct, 'Converting...')
          );
          results.push({
            ...item,
            status: 'done',
            message: `Converted to ${format.toUpperCase()}`,
            outputs: [converted],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({ ...item, status: 'failed', error: message, message });
        }
      }
      return results;
    },
    [format, quality]
  );

  const validateFiles = useCallback(
    (files: File[]) => validateImageFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'converted-images.zip', validateFiles }}
      footer={footer}
    />
  );
}
