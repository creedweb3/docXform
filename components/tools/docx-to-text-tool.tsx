'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { docxToText, type DocxTextMode } from '@/lib/tool-runs/docx-to-text';
import { validateDocxFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('docx-to-text')!;

const config: WorkspaceConfig = {
  title: 'Drop DOCX files to extract text',
  hint: 'or click to browse - .docx - choose plain text or Markdown',
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

export function DocxToTextTool() {
  const [mode, setMode] = useLocalSetting<DocxTextMode>('docxform:docx-to-text:mode', 'markdown');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-xs text-muted-foreground">
      <RadioGroup<DocxTextMode>
        name="docx-to-text-mode"
        label="Output format"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'markdown', label: 'Markdown', description: 'Headings as #, bullets as -' },
          { value: 'txt', label: 'Plain text', description: 'One paragraph per line, no formatting' },
        ]}
      />
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      const results: WorkspaceFile[] = [];
      for (const item of files) {
        try {
          setProgress(item.id, 5, 'Extracting...');
          const out = await docxToText(item.file, mode, (pct) => setProgress(item.id, pct, 'Extracting...'));
          results.push({
            ...item,
            status: 'done',
            message: mode === 'markdown' ? 'Extracted Markdown' : 'Extracted text',
            outputs: [{ name: out.name, blob: out.blob }],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({ ...item, status: 'failed', error: message, message });
        }
      }
      return results;
    },
    [mode]
  );

  const validateFiles = useCallback(
    (files: File[]) => validateDocxFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'docx-as-text.zip', validateFiles }}
      footer={footer}
    />
  );
}
