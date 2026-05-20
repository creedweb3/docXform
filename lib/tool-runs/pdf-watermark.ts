import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export type WatermarkPosition = 'center' | 'tile' | 'top' | 'bottom';

export type WatermarkOptions = {
  text: string;
  position: WatermarkPosition;
  opacity: number; // 0-1
  fontSize: number;
  color: { r: number; g: number; b: number }; // 0-1 floats
};

export async function watermarkPdf(
  file: File,
  options: WatermarkOptions,
  onProgress?: (percent: number) => void,
  ranges?: number[][],
  /** When set, only these 1-based pages may receive the watermark (intersected with ranges). */
  gridPages?: number[]
): Promise<Blob> {
  if (!options.text.trim()) {
    throw new Error('Watermark text is required.');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();
  const color = rgb(options.color.r, options.color.g, options.color.b);
  const gridSet = gridPages && gridPages.length > 0 ? new Set(gridPages) : null;

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);
    const pageNumber = index + 1;
    if (gridSet && !gridSet.has(pageNumber)) {
      return;
    }
    const inRange =
      !ranges || ranges.length === 0 || ranges.some(([start, end]) => pageNumber >= start && pageNumber <= end);
    if (!inRange) {
      return;
    }

    if (options.position === 'tile') {
      const stepX = Math.max(textWidth * 1.4, 180);
      const stepY = Math.max(textHeight * 4, 140);
      for (let y = stepY / 2; y < height; y += stepY) {
        for (let x = stepX / 2; x < width; x += stepX) {
          page.drawText(options.text, {
            x,
            y,
            size: options.fontSize,
            font,
            color,
            opacity: options.opacity,
            rotate: degrees(-30),
          });
        }
      }
    } else if (options.position === 'top') {
      page.drawText(options.text, {
        x: (width - textWidth) / 2,
        y: height - options.fontSize - 24,
        size: options.fontSize,
        font,
        color,
        opacity: options.opacity,
      });
    } else if (options.position === 'bottom') {
      page.drawText(options.text, {
        x: (width - textWidth) / 2,
        y: 24,
        size: options.fontSize,
        font,
        color,
        opacity: options.opacity,
      });
    } else {
      page.drawText(options.text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: options.fontSize,
        font,
        color,
        opacity: options.opacity,
        rotate: degrees(-30),
      });
    }

    onProgress?.(Math.round(((index + 1) / pages.length) * 100));
  });

  const saved = await pdf.save({ useObjectStreams: true });
  return new Blob([new Uint8Array(saved)], { type: 'application/pdf' });
}
