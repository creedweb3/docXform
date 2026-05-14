'use client';

import { useCallback } from 'react';
import {
  ToolWorkspace,
  type PdfPageGridProcessContext,
  type WorkspaceConfig,
  type WorkspaceFile,
  type WorkspaceSurfaceApi,
} from '@/components/tools/tool-workspace';
import { PdfRotateStudioSurface } from '@/components/tools/studio/pdf-tool-studio-surfaces';
import { rotatePdf, type RotateAngle, type RotateScope } from '@/lib/tool-runs/pdf-rotate';
import { parseRanges } from '@/lib/tool-runs/pdf-split';
import { generatePdfPreview } from '@/lib/client-previews';
import { validatePdfFiles } from '@/lib/tool-validations';
import { MAX_CONVERSION_BATCH_FILES, MAX_CONVERSION_FILE_SIZE_BYTES } from '@/lib/conversion-limits';
import { getToolBySlug } from '@/lib/tools';
import { RadioGroup } from '@/components/ui/radio-group';
import { useLocalSetting } from '@/lib/hooks/use-local-setting';

const tool = getToolBySlug('pdf-rotate')!;

const config: WorkspaceConfig = {
  title: 'Drop a PDF to rotate',
  hint: 'or click to browse - .pdf - rotate all, odd, or even pages',
  accept: '.pdf',
  allowMultiple: true,
  cardClass: 'converter-main-card-sky',
  iconBoxClass: 'icon-box-sky',
  iconClass: 'text-sky-700',
  dragClass: 'ring-2 ring-sky-300/50 bg-sky-50/60 scale-[1.01]',
  primaryButtonClass: 'from-sky-600 to-sky-500',
  progressClass: 'from-sky-400 to-blue-400',
  iconPair: tool.iconPair,
  tone: tool.tone,
  storageKey: tool.slug,
  queuedTitle: 'PDF ready to rotate',
  actionLabel: 'Rotate',
  pageGrid: { layout: 'perFile', allowReorder: false },
  studioHint: (
    <>
      The stage shows how the cover page will rotate. Use the <strong>Pages</strong> grid to rotate only specific pages
      when you need finer control.
    </>
  ),
};

export function PdfRotateTool() {
  const [angle, setAngle] = useLocalSetting<RotateAngle>('docxform:pdf-rotate:angle', 90);
  const [scope, setScope] = useLocalSetting<RotateScope>('docxform:pdf-rotate:scope', 'all');
  const [rangeInput, setRangeInput] = useLocalSetting<string>('docxform:pdf-rotate:ranges', '');

  const footer = (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-3 text-xs text-muted-foreground">
      <RadioGroup<`${RotateAngle}`>
        name="pdf-rotate-angle"
        label="Rotation angle"
        value={String(angle) as `${RotateAngle}`}
        onChange={(value) => setAngle(Number(value) as RotateAngle)}
        options={[
          { value: '90', label: '90° clockwise', description: 'Quarter turn right' },
          { value: '180', label: '180°', description: 'Flip upside down' },
          { value: '270', label: '270° clockwise', description: 'Quarter turn left' },
        ]}
      />
      <RadioGroup<RotateScope>
        name="pdf-rotate-scope"
        label="Pages to rotate"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'all', label: 'All pages' },
          { value: 'odd', label: 'Odd pages only' },
          { value: 'even', label: 'Even pages only' },
        ]}
      />
      <label className="flex flex-col gap-1">
        <span className="font-semibold text-foreground text-sm">Or enter page ranges (optional)</span>
        <input
          className="w-full rounded-lg border border-border/50 bg-white/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={rangeInput}
          onChange={(e) => setRangeInput(e.target.value)}
          placeholder="e.g. 1-3,5,8"
        />
        <span className="text-[11px] text-muted-foreground">
          If set, ranges override all/odd/even. Invalid ranges are ignored per file.
        </span>
      </label>
    </div>
  );

  const processFiles = useCallback(
    async (
      files: WorkspaceFile[],
      setProgress: (id: string, percent: number, message?: string) => void,
      pageGrid?: PdfPageGridProcessContext
    ) => {
      if (!files.length) return files;
      const results: WorkspaceFile[] = [];
      for (const file of files) {
        setProgress(file.id, 5, 'Rotating...');
        let selectedScope = scope;
        let ranges: number[][] | undefined;
        if (rangeInput.trim()) {
          try {
            ranges = parseRanges(rangeInput);
            selectedScope = 'all';
          } catch {
            ranges = undefined;
          }
        }
        const gridPages = pageGrid?.active ? pageGrid.orderedPagesByFileId[file.id] : undefined;
        const rotated = await rotatePdf(
          file.file,
          angle,
          selectedScope,
          (pct) => setProgress(file.id, pct, 'Rotating...'),
          ranges,
          gridPages && gridPages.length > 0 ? gridPages : undefined
        );
        results.push({
          ...file,
          status: 'done',
          message: `Rotated ${scope} pages by ${angle}°`,
          outputs: [{ name: file.file.name.replace(/\.pdf$/i, '') + '-rotated.pdf', blob: rotated }],
        });
      }
      return results;
    },
    [angle, scope, rangeInput]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  const studioSurface = useCallback(
    (api: WorkspaceSurfaceApi) => <PdfRotateStudioSurface api={api} angle={angle} />,
    [angle]
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
