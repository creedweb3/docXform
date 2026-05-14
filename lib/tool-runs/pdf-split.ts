import { PDFDocument } from 'pdf-lib';

export type SplitMode = { kind: 'ranges'; ranges: number[][] } | { kind: 'every'; interval: number };

export type SplitResult = { name: string; blob: Blob };

export function parseRanges(input: string): number[][] {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => Number(n));
        if (Number.isNaN(start) || Number.isNaN(end) || start < 1 || end < start) {
          throw new Error(`Invalid range: ${part}`);
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      const page = Number(part);
      if (Number.isNaN(page) || page < 1) throw new Error(`Invalid page: ${part}`);
      return [page];
    });
}

export async function splitPdf(file: File, mode: SplitMode, onProgress?: (percent: number) => void): Promise<SplitResult[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const pageCount = src.getPageCount();

  const groups: number[][] =
    mode.kind === 'every'
      ? Array.from({ length: Math.ceil(pageCount / mode.interval) }, (_, i) =>
          Array.from({ length: mode.interval }, (_, j) => i * mode.interval + j + 1).filter((p) => p <= pageCount)
        )
      : mode.ranges.map((r) => r.filter((p) => p >= 1 && p <= pageCount));

  const results: SplitResult[] = [];

  for (let idx = 0; idx < groups.length; idx += 1) {
    const group = groups[idx];
    if (group.length === 0) continue;
    const out = await PDFDocument.create();
    const pages = await out.copyPages(
      src,
      group.map((p) => p - 1)
    );
    pages.forEach((p) => out.addPage(p));
    const saved = await out.save();
    results.push({
      name: `${file.name.replace(/\.pdf$/i, '')}-part-${idx + 1}.pdf`,
      blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    });
    onProgress?.(Math.round(((idx + 1) / groups.length) * 100));
  }

  return results;
}

/** One PDF per selected page, preserving `orderedPages` order (1-based). */
export async function splitPdfBySelectedPages(
  file: File,
  orderedPages: number[],
  onProgress?: (percent: number) => void
): Promise<SplitResult[]> {
  if (!orderedPages.length) return [];
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const pageCount = src.getPageCount();
  const results: SplitResult[] = [];
  let idx = 0;
  for (const p of orderedPages) {
    if (!Number.isInteger(p) || p < 1 || p > pageCount) continue;
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, [p - 1]);
    pages.forEach((page) => out.addPage(page));
    const saved = await out.save();
    results.push({
      name: `${file.name.replace(/\.pdf$/i, '')}-page-${String(p).padStart(3, '0')}.pdf`,
      blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    });
    idx += 1;
    onProgress?.(Math.round((idx / orderedPages.length) * 100));
  }
  return results;
}

/** Single PDF containing copies of `orderedPages` (1-based) in order. */
export async function splitPdfMergedFromPages(
  file: File,
  orderedPages: number[],
  onProgress?: (percent: number) => void
): Promise<SplitResult> {
  if (!orderedPages.length) throw new Error('No pages to merge');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const pageCount = src.getPageCount();
  const out = await PDFDocument.create();
  let done = 0;
  const valid = orderedPages.filter((p) => Number.isInteger(p) && p >= 1 && p <= pageCount);
  const total = valid.length;
  for (const p of orderedPages) {
    if (!Number.isInteger(p) || p < 1 || p > pageCount) continue;
    const pages = await out.copyPages(src, [p - 1]);
    pages.forEach((page) => out.addPage(page));
    done += 1;
    if (total > 0) onProgress?.(Math.round((done / total) * 100));
  }
  if (out.getPageCount() === 0) throw new Error('No valid pages to merge');
  const saved = await out.save();
  const base = file.name.replace(/\.pdf$/i, '');
  return {
    name: `${base}-merged.pdf`,
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
  };
}
