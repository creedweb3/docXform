'use client';

import { useCallback } from 'react';
import { ToolWorkspace, type WorkspaceConfig, type WorkspaceFile } from '@/components/tools/tool-workspace';
import { rotatePdf, type RotateAngle, type RotateScope } from '@/lib/tool-runs/pdf-rotate';
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
  allowMultiple: false,
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
};

export function PdfRotateTool() {
  const [angle, setAngle] = useLocalSetting<RotateAngle>('docxform:pdf-rotate:angle', 90);
  const [scope, setScope] = useLocalSetting<RotateScope>('docxform:pdf-rotate:scope', 'all');

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
    </div>
  );

  const processFiles = useCallback(
    async (files: WorkspaceFile[], setProgress: (id: string, percent: number, message?: string) => void) => {
      if (!files.length) return files;
      const file = files[0];
      setProgress(file.id, 5, 'Rotating...');
      const rotated = await rotatePdf(file.file, angle, scope, (pct) => setProgress(file.id, pct, 'Rotating...'));
      return [
        {
          ...file,
          status: 'done',
          message: `Rotated ${scope} pages by ${angle}°`,
          outputs: [{ name: file.file.name.replace(/\.pdf$/i, '') + '-rotated.pdf', blob: rotated }],
        },
      ] as WorkspaceFile[];
    },
    [angle, scope]
  );

  const validateFiles = useCallback(
    (files: File[]) => validatePdfFiles(files, MAX_CONVERSION_FILE_SIZE_BYTES, MAX_CONVERSION_BATCH_FILES),
    []
  );

  return <ToolWorkspace config={config} actions={{ processFiles, validateFiles }} footer={footer} />;
}
