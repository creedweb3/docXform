'use client';

import { useCallback, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Shield01Icon } from '@hugeicons/core-free-icons';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { scrubDocx, type ScrubOptions } from '@/lib/tool-runs/docx-scrub';
import { validateDocxFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('docx-scrub')!;

const config: WorkspaceConfig = {
  title: 'Drop DOCX files to scrub',
  hint: 'or click to browse - .docx - removes comments and metadata locally',
  accept: '.docx',
  allowMultiple: true,
  cardClass: 'converter-main-card-slate',
  iconBoxClass: 'icon-box-slate',
  iconClass: 'text-slate-700',
  dragClass: 'ring-2 ring-slate-300/50 bg-slate-50/60 scale-[1.01]',
  primaryButtonClass: 'from-slate-700 to-slate-600',
  progressClass: 'from-slate-500 to-slate-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
};

export function DocxScrubTool() {
  const [options, setOptions] = useLocalSetting<ScrubOptions>('docxform:docx-scrub:options', {
    removeComments: true,
    removeProperties: true,
    removeCustomXml: false,
  });

  const subtitle = useMemo(
    () => (
      <span className="inline-flex items-center gap-1.5 bg-card/50 rounded-full px-3 py-1.5 border border-border/30">
        <HugeiconsIcon icon={Shield01Icon} size={12} strokeWidth={2} className="text-slate-700" />
        Cleans comments, properties, and custom XML locally
      </span>
    ),
    []
  );

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground text-sm">Scrub settings</p>
      {(
        [
          { key: 'removeComments' as const, label: 'Remove comments and people metadata' },
          { key: 'removeProperties' as const, label: 'Remove document properties' },
          { key: 'removeCustomXml' as const, label: 'Remove custom XML parts' },
        ]
      ).map((option) => (
        <label key={option.key} className="flex items-center gap-2 text-foreground">
          <input
            type="checkbox"
            checked={options[option.key]}
            onChange={(event) => setOptions({ ...options, [option.key]: event.target.checked })}
            className="h-4 w-4 cursor-pointer accent-slate-700"
          />
          {option.label}
        </label>
      ))}
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results: WorkspaceFile[] = [];

      for (const item of files) {
        setProgress(item.id, 5, 'Scrubbing...');
        try {
          const scrubbed = await scrubDocx(item.file, options);
          setProgress(item.id, 100, 'Done');
          results.push({
            ...item,
            status: 'done',
            message: 'Cleaned',
            outputs: [{ name: scrubbed.name, blob: scrubbed.blob }],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({
            ...item,
            status: 'failed',
            error: message,
            message,
          });
        }
      }

      return results;
    },
    [options]
  );

  const validateFiles = useCallback(
    (files: File[]) => validateDocxFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'scrubbed-documents.zip', validateFiles }}
      subtitle={subtitle}
      footer={footer}
    />
  );
}
