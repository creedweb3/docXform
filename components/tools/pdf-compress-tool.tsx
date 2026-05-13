'use client';

import { useCallback, useState } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { compressPdf } from '@/lib/tool-runs/pdf-compress';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES } from '@/lib/conversion-limits';

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
};

type Preset = 'light' | 'balanced' | 'max';

export function PdfCompressTool() {
  const [preset, setPreset] = useState<Preset>('balanced');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-white/50 p-3 space-y-2 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground text-sm">Quality presets</p>
      <label className="flex items-center gap-2">
        <input type="radio" checked={preset === 'light'} onChange={() => setPreset('light')} />
        Light (smallest, more image blur)
      </label>
      <label className="flex items-center gap-2">
        <input type="radio" checked={preset === 'balanced'} onChange={() => setPreset('balanced')} />
        Balanced (default)
      </label>
      <label className="flex items-center gap-2">
        <input type="radio" checked={preset === 'max'} onChange={() => setPreset('max')} />
        Max quality (slightly smaller)
      </label>
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
