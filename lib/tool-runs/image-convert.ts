export type ImageOutputFormat = 'png' | 'jpeg' | 'webp';

export type ImageConvertResult = {
  name: string;
  blob: Blob;
};

const FORMAT_MIME: Record<ImageOutputFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const FORMAT_EXT: Record<ImageOutputFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
};

async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();
    return await createImageBitmap(image);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function convertImage(
  file: File,
  format: ImageOutputFormat,
  quality: number,
  onProgress?: (percent: number) => void
): Promise<ImageConvertResult> {
  if (typeof window === 'undefined') {
    throw new Error('Image conversion runs only in the browser.');
  }

  onProgress?.(10);
  const bitmap = await decodeToBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported in this browser.');

  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(bitmap, 0, 0);
  onProgress?.(60);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (out) => {
        if (!out) reject(new Error('Failed to encode image.'));
        else resolve(out);
      },
      FORMAT_MIME[format],
      format === 'png' ? undefined : Math.max(0.1, Math.min(1, quality))
    );
  });
  onProgress?.(100);

  return {
    name: file.name.replace(/\.[^.]+$/, '') + '.' + FORMAT_EXT[format],
    blob,
  };
}
