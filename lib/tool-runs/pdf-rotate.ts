import { PDFDocument, degrees } from 'pdf-lib';

function pageMatchesRanges(pageNumber: number, ranges?: number[][]) {
  if (!ranges || ranges.length === 0) return true;
  return ranges.some(([start, end]) => pageNumber >= start && pageNumber <= end);
}

export type RotateAngle = 90 | 180 | 270;
export type RotateScope = 'all' | 'odd' | 'even';

export async function rotatePdf(
  file: File,
  angle: RotateAngle,
  scope: RotateScope,
  onProgress?: (percent: number) => void,
  ranges?: number[][],
  /** When set (e.g. from PageGrid), only these 1-based page numbers are candidates for rotation. */
  gridPages?: number[]
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const gridSet = gridPages && gridPages.length > 0 ? new Set(gridPages) : null;

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    if (gridSet && !gridSet.has(pageNumber)) return;
    const matchesScope =
      scope === 'all' || (scope === 'odd' && pageNumber % 2 === 1) || (scope === 'even' && pageNumber % 2 === 0);
    if (!matchesScope || !pageMatchesRanges(pageNumber, ranges)) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
    onProgress?.(Math.round(((index + 1) / pages.length) * 100));
  });

  const saved = await pdf.save({ useObjectStreams: true });
  return new Blob([new Uint8Array(saved)], { type: 'application/pdf' });
}
