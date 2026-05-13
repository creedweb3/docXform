import { PDFDocument, degrees } from 'pdf-lib';

export type RotateAngle = 90 | 180 | 270;
export type RotateScope = 'all' | 'odd' | 'even';

export async function rotatePdf(
  file: File,
  angle: RotateAngle,
  scope: RotateScope,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const matchesScope =
      scope === 'all' || (scope === 'odd' && pageNumber % 2 === 1) || (scope === 'even' && pageNumber % 2 === 0);
    if (!matchesScope) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
    onProgress?.(Math.round(((index + 1) / pages.length) * 100));
  });

  const saved = await pdf.save({ useObjectStreams: true });
  return new Blob([new Uint8Array(saved)], { type: 'application/pdf' });
}
