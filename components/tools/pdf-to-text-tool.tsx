'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { pdfToText } from '@/lib/tool-runs/pdf-to-text';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';
import { generatePdfPreview } from '@/lib/client-previews';

const tool = getToolBySlug('pdf-to-text')!;

const config = buildWorkspaceConfig(tool, {
  title: 'Drop a PDF to extract its text',
  hint: 'or click to browse - .pdf - text-only output, no OCR',
  accept: '.pdf',
  allowMultiple: true,
  queuedTitle: 'PDFs ready to extract',
  actionLabel: 'Extract',
  studioStageTitle: 'Selected PDFs',
  studioHint: (
    <>
      Pulls selectable text only — <strong>scanned</strong> PDFs need OCR first. Use the sidebar to choose a single transcript
      or per-page files.
    </>
  ),
});

type Mode = 'combined' | 'per-page';

export function PdfToTextTool() {
  const [mode, setMode] = useLocalSetting<Mode>('docxform:pdf-to-text:mode', 'combined');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-xs text-muted-foreground">
      <RadioGroup<Mode>
        name="pdf-to-text-mode"
        label="Output"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'combined', label: 'Single .txt file', description: 'Combined transcript with page breaks' },
          { value: 'per-page', label: 'Per-page .txt files', description: 'Zip with one file per page' },
        ]}
      />
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const results: WorkspaceFile[] = [];
      for (const file of files) {
        setProgress(file.id, 5, 'Extracting...');
        const result = await pdfToText(file.file, (pct) => setProgress(file.id, pct, 'Extracting...'));

        const baseName = file.file.name.replace(/\.pdf$/i, '');
        if (mode === 'combined') {
          const blob = new Blob([result.combined], { type: 'text/plain' });
          results.push({
            ...file,
            status: 'done',
            message: `Extracted ${result.pages.length} page(s)`,
            outputs: [{ name: `${baseName}.txt`, blob }],
          });
          continue;
        }

        const outputs = result.pages.map((page) => ({
          name: `${baseName}-page-${String(page.pageNumber).padStart(3, '0')}.txt`,
          blob: new Blob([page.text || '(no text on this page)'], { type: 'text/plain' }),
        }));

        results.push({
          ...file,
          status: 'done',
          message: `Extracted ${result.pages.length} page(s)`,
          outputs,
        });
      }
      return results;
    },
    [mode]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, zipName: 'pdf-text.zip', validateFiles, generatePreview: generatePdfPreview }}
      footer={footer}
    />
  );
}
