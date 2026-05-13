import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(files: File[], onProgress?: (percent: number) => void): Promise<Blob> {
  const out = await PDFDocument.create();
  let processed = 0;

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    processed += 1;
    onProgress?.(Math.round((processed / files.length) * 100));
  }

  const merged = await out.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });
  return new Blob([new Uint8Array(merged)], { type: 'application/pdf' });
}
