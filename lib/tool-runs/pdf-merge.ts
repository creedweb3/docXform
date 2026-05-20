import { PDFDocument } from 'pdf-lib';

export type MergePdfItem = { file: File; pages?: number[] };

function normalizeMergeItems(items: MergePdfItem[] | File[]): MergePdfItem[] {
  if (items.length === 0) return [];
  if (items[0] instanceof File) {
    return (items as File[]).map((file) => ({ file }));
  }
  return items as MergePdfItem[];
}

/**
 * Merge PDFs in order. Each item may include `pages` (1-based) to copy in that order;
 * omit or empty `pages` to include every page in file order.
 */
export async function mergePdfs(
  items: MergePdfItem[] | File[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const list = normalizeMergeItems(items);
  const out = await PDFDocument.create();
  let processed = 0;

  for (const { file, pages } of list) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const total = src.getPageCount();
    const indices =
      pages && pages.length > 0
        ? pages.map((p) => p - 1).filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < total)
        : src.getPageIndices();
    if (indices.length === 0) {
      processed += 1;
      onProgress?.(Math.round((processed / list.length) * 100));
      continue;
    }
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
    processed += 1;
    onProgress?.(Math.round((processed / list.length) * 100));
  }

  const merged = await out.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });
  return new Blob([new Uint8Array(merged)], { type: 'application/pdf' });
}
