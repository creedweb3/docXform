import { PDFDocument } from 'pdf-lib';

/**
 * Reorder and/or delete pages locally. `orderedIndices` is an array of
 * zero-based page indices from the source PDF, in the desired output order.
 * Indices not listed are dropped from the output.
 */
export async function organizePdf(
  file: File,
  orderedIndices: number[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  if (!orderedIndices.length) {
    throw new Error('Select at least one page to keep.');
  }

  const srcBytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const total = source.getPageCount();

  const sanitized = orderedIndices.filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < total);
  if (!sanitized.length) {
    throw new Error('No valid pages selected.');
  }

  const out = await PDFDocument.create();
  const copied = await out.copyPages(source, sanitized);
  copied.forEach((page, index) => {
    out.addPage(page);
    onProgress?.(Math.round(((index + 1) / copied.length) * 100));
  });

  const saved = await out.save({ useObjectStreams: true });
  return new Blob([new Uint8Array(saved)], { type: 'application/pdf' });
}

/** Parse a UI input like "1,3,5-7" into a zero-based ordered index list. */
export function parsePageOrder(input: string, totalPages: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) return Array.from({ length: totalPages }, (_, i) => i);

  const result: number[] = [];
  const seen = new Set<number>();
  const tokens = trimmed.split(/[,\s]+/).filter(Boolean);

  for (const token of tokens) {
    if (token.includes('-')) {
      const [startRaw, endRaw] = token.split('-').map((part) => Number(part.trim()));
      if (!Number.isInteger(startRaw) || !Number.isInteger(endRaw)) {
        throw new Error(`Invalid range "${token}"`);
      }
      const [start, end] = startRaw <= endRaw ? [startRaw, endRaw] : [endRaw, startRaw];
      for (let page = start; page <= end; page += 1) {
        if (page < 1 || page > totalPages) {
          throw new Error(`Page ${page} is out of range (1-${totalPages}).`);
        }
        if (!seen.has(page - 1)) {
          seen.add(page - 1);
          result.push(page - 1);
        }
      }
    } else {
      const page = Number(token);
      if (!Number.isInteger(page) || page < 1 || page > totalPages) {
        throw new Error(`Page ${token} is out of range (1-${totalPages}).`);
      }
      if (!seen.has(page - 1)) {
        seen.add(page - 1);
        result.push(page - 1);
      }
    }
  }

  return result;
}
