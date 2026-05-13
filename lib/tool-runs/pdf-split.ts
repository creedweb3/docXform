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
