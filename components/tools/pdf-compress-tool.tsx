'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { compressPdf } from '@/lib/tool-runs/pdf-compress';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('pdf-compress')!;

const config: WorkspaceConfig = {
  title: 'Drop a PDF to compress',
  hint: 'or click to browse - .pdf - choose a quality preset',
  accept: '.pdf',
  allowMultiple: false,
  cardClass: 'converter-main-card-teal',
  iconBoxClass: 'icon-box-teal',
  iconClass: 'text-teal-700',
  dragClass: 'ring-2 ring-teal-300/50 bg-teal-50/60 scale-[1.01]',
  primaryButtonClass: 'from-teal-600 to-teal-500',
  progressClass: 'from-teal-400 to-green-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

type Preset = 'light' | 'balanced' | 'max';

export function PdfCompressTool() {
  const [preset, setPreset] = useLocalSetting<Preset>('docxform:pdf-compress:preset', 'balanced');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-3 text-xs text-muted-foreground">
      <RadioGroup<Preset>
        name="pdf-compress-preset"
        label="Quality preset"
        value={preset}
        onChange={setPreset}
        options={[
          { value: 'light', label: 'Light', description: 'Smallest file, more image blur' },
          { value: 'balanced', label: 'Balanced', description: 'Default balance of size and quality' },
          { value: 'max', label: 'Max quality', description: 'Highest fidelity, smaller savings' },
        ]}
      />
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const file = files[0];
      setProgress(file.id, 5, 'Compressing...');
      const compressed = await compressPdf(file.file, preset, (pct) => setProgress(file.id, pct, 'Compressing...'));
      return [
        {
          ...file,
          status: 'done',
          message: 'Compressed',
          outputs: [{ name: file.file.name.replace(/\.pdf$/i, '') + '-compressed.pdf', blob: compressed }],
        },
      ] as WorkspaceFile[];
    },
    [preset]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, validateFiles }} footer={footer} />;
}
