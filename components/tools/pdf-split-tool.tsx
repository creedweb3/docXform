'use client';

import { useCallback, useState } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { parseRanges, splitPdf, type SplitMode } from '@/lib/tool-runs/pdf-split';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';

const tool = getToolBySlug('pdf-split')!;

const config: WorkspaceConfig = {
  title: 'Drop a PDF to split',
  hint: 'or click to browse - .pdf - choose ranges or every N pages',
  accept: '.pdf',
  allowMultiple: false,
  cardClass: 'converter-main-card-amber',
  iconBoxClass: 'icon-box-amber',
  iconClass: 'text-amber-700',
  dragClass: 'ring-2 ring-amber-300/50 bg-amber-50/60 scale-[1.01]',
  primaryButtonClass: 'from-amber-500 to-amber-400',
  progressClass: 'from-amber-400 to-orange-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

export function PdfSplitTool() {
  const [mode, setMode] = useState<SplitMode>({ kind: 'ranges', ranges: [[1]] });
  const [rangeInput, setRangeInput] = useState('1');
  const [interval, setInterval] = useState(1);

  const footer = (
    <div className="rounded-xl border border-border/50 bg-white/50 p-3 space-y-2 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground text-sm">Split options</p>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="split-mode"
            checked={mode.kind === 'ranges'}
            onChange={() => {
              setMode({ kind: 'ranges', ranges: parseRanges(rangeInput || '1') });
            }}
          />
          By ranges (e.g., 1-3,5,8)
        </label>
        {mode.kind === 'ranges' && (
          <input
            className="w-full rounded-lg border border-border/50 bg-white/80 px-3 py-2 text-sm text-foreground"
            value={rangeInput}
            onChange={(e) => {
              setRangeInput(e.target.value);
              try {
                setMode({ kind: 'ranges', ranges: parseRanges(e.target.value) });
              } catch {
                /* keep last valid */
              }
            }}
            placeholder="1-3,5,8"
          />
        )}
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="split-mode"
            checked={mode.kind === 'every'}
            onChange={() => setMode({ kind: 'every', interval: Math.max(1, interval) })}
          />
          Every N pages
        </label>
        {mode.kind === 'every' && (
          <input
            className="w-full rounded-lg border border-border/50 bg-white/80 px-3 py-2 text-sm text-foreground"
            type="number"
            min={1}
            value={interval}
            onChange={(e) => {
              const next = Math.max(1, Number(e.target.value) || 1);
              setInterval(next);
              setMode({ kind: 'every', interval: next });
            }}
          />
        )}
      </div>
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const file = files[0];

      const results = await splitPdf(file.file, mode, (pct) => setProgress(file.id, pct, 'Splitting...'));
      return [
        {
          ...file,
          status: 'done',
          message: `Created ${results.length} file(s)`,
          outputs: results.map((r) => ({ name: r.name, blob: r.blob })),
        },
      ] as WorkspaceFile[];
    },
    [mode]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace config={config} actions={{ processFiles, zipName: 'split-pages.zip', validateFiles }} footer={footer} />
  );
}
