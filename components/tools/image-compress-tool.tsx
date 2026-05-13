'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { compressImage, type CompressPreset } from '@/lib/tool-runs/image-compress';
import { validateImageFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('image-compress')!;

const config: WorkspaceConfig = {
  title: 'Drop images to compress',
  hint: 'or click to browse - .jpg .png .webp - encode optimized JPEGs locally',
  accept: '.jpg,.jpeg,.png,.webp',
  allowMultiple: true,
  cardClass: 'converter-main-card-emerald',
  iconBoxClass: 'icon-box-emerald',
  iconClass: 'text-emerald-700',
  dragClass: 'ring-2 ring-emerald-300/50 bg-emerald-50/60 scale-[1.01]',
  primaryButtonClass: 'from-emerald-600 to-emerald-500',
  progressClass: 'from-emerald-400 to-lime-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

export function ImageCompressTool() {
  const [preset, setPreset] = useLocalSetting<CompressPreset>('docxform:image-compress:preset', 'balanced');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-xs text-muted-foreground">
      <RadioGroup<CompressPreset>
        name="image-compress-preset"
        label="Preset"
        value={preset}
        onChange={setPreset}
        options={[
          { value: 'web', label: 'Web', description: 'Max 1600px, 70% quality' },
          { value: 'balanced', label: 'Balanced', description: 'Max 2200px, 78% quality' },
          { value: 'archive', label: 'Archive', description: 'Max 4000px, 85% quality' },
        ]}
      />
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results: WorkspaceFile[] = [];
      for (const item of files) {
        try {
          setProgress(item.id, 5, 'Compressing...');
          const compressed = await compressImage(item.file, preset, (pct) =>
            setProgress(item.id, pct, 'Compressing...')
          );
          const ratio = compressed.originalSize > 0 ? compressed.compressedSize / compressed.originalSize : 1;
          results.push({
            ...item,
            status: 'done',
            message: `Saved ${Math.max(0, Math.round((1 - ratio) * 100))}%`,
            outputs: [{ name: compressed.name, blob: compressed.blob }],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({ ...item, status: 'failed', error: message, message });
        }
      }
      return results;
    },
    [preset]
  );

  const validateFiles = useCallback(
    (files: File[]) => validateImageFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'compressed-images.zip', validateFiles }}
      footer={footer}
    />
  );
}
