/**
 * Shared file validation helpers for the in-browser tools.
 * All checks are client-side and avoid any external services.
 */

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPG_SIGNATURE = [0xff, 0xd8, 0xff];
const WEBP_SIGNATURE = [0x52, 0x49, 0x46, 0x46]; // "RIFF" then WEBP later
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];

export type ValidationResult = { ok: true; message?: string } | { ok: false; message: string };

async function readBytes(file: File, length: number) {
  return new Uint8Array(await file.slice(0, length).arrayBuffer());
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(/\\.0$/, '')} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1).replace(/\\.0$/, '')} KB`;
  return `${bytes} B`;
}

export async function validatePdfFiles(files: File[], maxSizeBytes: number, maxFiles: number): Promise<ValidationResult> {
  if (!files.length) return { ok: false, message: 'Add at least one PDF file.' };
  if (files.length > maxFiles) {
    return { ok: false, message: `You can queue up to ${maxFiles} files at a time.` };
  }

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  if (totalBytes > maxSizeBytes * files.length) {
    return {
      ok: false,
      message: `${files.length} files can use up to ${(maxSizeBytes * files.length) / 1024 / 1024} MB total.`,
    };
  }

  for (const file of files) {
    if (file.size === 0) return { ok: false, message: `${file.name} is empty.` };
    if (file.size > maxSizeBytes) {
      return { ok: false, message: `${file.name} is larger than ${formatBytes(maxSizeBytes)}.` };
    }
    const signature = await readBytes(file, PDF_SIGNATURE.length);
    if (!startsWith(signature, PDF_SIGNATURE)) {
      return { ok: false, message: `${file.name} does not look like a valid PDF.` };
    }
  }

  return { ok: true, message: `${files.length} file(s) ready` };
}

export async function validateImageFiles(
  files: File[],
  maxSizeBytes: number,
  maxFiles: number
): Promise<ValidationResult> {
  if (!files.length) return { ok: false, message: 'Add at least one image.' };
  if (files.length > maxFiles) return { ok: false, message: `You can queue up to ${maxFiles} images at a time.` };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  if (totalBytes > maxSizeBytes * files.length) {
    return {
      ok: false,
      message: `${files.length} files can use up to ${(maxSizeBytes * files.length) / 1024 / 1024} MB total.`,
    };
  }

  for (const file of files) {
    if (file.size === 0) return { ok: false, message: `${file.name} is empty.` };
    if (file.size > maxSizeBytes) {
      return { ok: false, message: `${file.name} is larger than ${formatBytes(maxSizeBytes)}.` };
    }
    const signature = await readBytes(file, 12);
    const isPng = startsWith(signature, PNG_SIGNATURE);
    const isJpg = startsWith(signature, JPG_SIGNATURE);
    const isWebp = startsWith(signature, WEBP_SIGNATURE);
    if (!isPng && !isJpg && !isWebp) {
      return { ok: false, message: `${file.name} is not a PNG, JPEG, or WebP image.` };
    }
  }

  return { ok: true, message: `${files.length} image(s) ready` };
}

export async function validateDocxFiles(files: File[], maxSizeBytes: number, maxFiles: number): Promise<ValidationResult> {
  if (!files.length) return { ok: false, message: 'Add at least one DOCX file.' };
  if (files.length > maxFiles) return { ok: false, message: `You can queue up to ${maxFiles} files at a time.` };

  for (const file of files) {
    if (file.size === 0) return { ok: false, message: `${file.name} is empty.` };
    if (file.size > maxSizeBytes) return { ok: false, message: `${file.name} is larger than ${formatBytes(maxSizeBytes)}.` };
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return { ok: false, message: `${file.name} is not a DOCX file.` };
    }
    const signature = await readBytes(file, ZIP_SIGNATURE.length);
    if (!startsWith(signature, ZIP_SIGNATURE)) {
      return { ok: false, message: `${file.name} does not look like a valid DOCX.` };
    }
  }

  return { ok: true, message: `${files.length} DOCX file(s) ready` };
}

export async function validatePptxFiles(files: File[], maxSizeBytes: number, maxFiles: number): Promise<ValidationResult> {
  if (!files.length) return { ok: false, message: 'Add at least one PPTX file.' };
  if (files.length > maxFiles) return { ok: false, message: `You can queue up to ${maxFiles} files at a time.` };

  for (const file of files) {
    if (file.size === 0) return { ok: false, message: `${file.name} is empty.` };
    if (file.size > maxSizeBytes) return { ok: false, message: `${file.name} is larger than ${formatBytes(maxSizeBytes)}.` };
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pptx') && !lower.endsWith('.ppt')) {
      return { ok: false, message: `${file.name} is not a PPTX/PPT file.` };
    }
    const signature = await readBytes(file, ZIP_SIGNATURE.length);
    if (!startsWith(signature, ZIP_SIGNATURE)) {
      return { ok: false, message: `${file.name} does not look like a valid PPTX.` };
    }
  }

  return { ok: true, message: `${files.length} presentation(s) ready` };
}
