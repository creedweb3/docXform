'use client';

import { useCallback, useState } from 'react';
import {
  ToolWorkspace,
  type PdfPageGridProcessContext,
  type WorkspaceFile,
  type WorkspaceSurfaceApi,
} from '@/components/tools/tool-workspace';
import { buildWorkspaceConfig } from '@/components/tools/tool-theme';
import { PdfOrganizeStudioSurface } from '@/components/tools/studio/pdf-tool-studio-surfaces';
import { organizePdf, parsePageOrder } from '@/lib/tool-runs/pdf-organize';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';
import { generatePdfPreview } from '@/lib/client-previews';

const tool = getToolBySlug('pdf-organize')!;

const config = buildWorkspaceConfig(tool, {
  title: 'Drop a PDF to reorder or trim pages',
  hint: 'or click to browse - .pdf - keep only the pages you list',
  accept: '.pdf',
  allowMultiple: false,
  queuedTitle: 'PDF ready to reorganize',
  actionLabel: 'Reorganize',
  pageGrid: { layout: 'single', allowReorder: true },
  studioHint: (
    <>
      The stage mirrors your page order string and cover previews. Use the <strong>Pages</strong> grid to pick pages
      visually; anything omitted from the list is removed from the output.
    </>
  ),
});

export function PdfOrganizeTool() {
  const [order, setOrder] = useLocalSetting<string>('docxform:pdf-organize:order', '');
  const [error, setError] = useState<string | null>(null);

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2 text-xs text-muted-foreground">
      <label htmlFor="pdf-organize-order" className="font-semibold text-foreground text-sm">
        Page order
      </label>
      <p>
        Enter pages in the desired order. Anything you leave out is removed. Use commas and ranges (e.g. <code>1,3,5-7</code>).
        Leave blank to keep every page in its current order.
      </p>
      <input
        id="pdf-organize-order"
        value={order}
        onChange={(event) => {
          setOrder(event.target.value);
          setError(null);
        }}
        placeholder="1, 3, 5-7"
        className="w-full rounded-lg border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {error && <p className="text-rose-600">{error}</p>}
    </div>
  );

  const processFiles = useCallback(
    async (
      files: WorkspaceFile[],
      setProgress: (id: string, percent: number, message?: string) => void,
      pageGrid?: PdfPageGridProcessContext
    ) => {
      if (!files.length) return files;
      const file = files[0];

      const arrayBuffer = await file.file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const sourcePdf = await PDFDocument.load(new Uint8Array(arrayBuffer), { ignoreEncryption: true });
      const totalPages = sourcePdf.getPageCount();

      let indices: number[];
      try {
        if (pageGrid?.active) {
          const picked = pageGrid.orderedPagesByFileId[file.id] ?? [];
          indices = picked.map((p) => p - 1);
        } else {
          indices = parsePageOrder(order, totalPages);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid page order';
        setError(message);
        return [{ ...file, status: 'failed', message, error: message }] as WorkspaceFile[];
      }

      if (!indices.length) {
        const message = 'Select at least one page to keep.';
        setError(message);
        return [{ ...file, status: 'failed', message, error: message }] as WorkspaceFile[];
      }

      setProgress(file.id, 10, `Building ${indices.length} page(s)...`);
      const rebuilt = await organizePdf(file.file, indices, (pct) => setProgress(file.id, pct, 'Building...'));

      return [
        {
          ...file,
          status: 'done',
          message: `Output has ${indices.length} page(s)`,
          outputs: [{ name: file.file.name.replace(/\.pdf$/i, '') + '-organized.pdf', blob: rebuilt }],
        },
      ] as WorkspaceFile[];
    },
    [order]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  const studioSurface = useCallback(
    (api: WorkspaceSurfaceApi) => <PdfOrganizeStudioSurface api={api} order={order} />,
    [order]
  );

  return (
    <ToolWorkspace
      config={config}
      actions={{ processFiles, validateFiles, generatePreview: generatePdfPreview }}
      footer={footer}
      studioSurface={studioSurface}
    />
  );
}
