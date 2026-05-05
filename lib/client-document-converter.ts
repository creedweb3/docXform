'use client';

import type {
  ConversionResult,
  InputFormat,
  OutputFormat,
  WasmLoadProgress,
  WorkerBrowserConverter,
} from '@matbee/libreoffice-converter/browser';
import {
  getBrowserWorkerJsUrl,
  getWasmAssetBaseForCreatePaths,
  getWasmAssetFileUrl,
} from '@/lib/wasm-asset-base';

export interface ClientConversionProgress {
  percent: number;
  message: string;
}

export interface ConvertedDocument {
  name: string;
  blob: Blob;
  originalName: string;
}

type ProgressHandler = (progress: ClientConversionProgress) => void;

let converterPromise: Promise<WorkerBrowserConverter> | null = null;
let converterInstance: WorkerBrowserConverter | null = null;
let activeProgressHandler: ProgressHandler | null = null;
let conversionQueue: Promise<void> = Promise.resolve();

/** First load can pull large wasm/data from same-origin `/wasm/`; keep generous on slow links. */
const INITIALIZE_TIMEOUT_MS = 180_000;
const CONVERSION_TIMEOUT_MS = 240_000;

const MIME_TYPES: Record<OutputFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  html: 'text/html',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
};

function emitProgress(progress: WasmLoadProgress | ClientConversionProgress) {
  activeProgressHandler?.({
    percent: Math.max(0, Math.min(100, progress.percent)),
    message: progress.message,
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s.`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function resetConverter() {
  converterPromise = null;

  if (!converterInstance) {
    return;
  }

  const instance = converterInstance;
  converterInstance = null;

  try {
    await instance.destroy();
  } catch {
    // Ignore cleanup failures and allow a fresh instance on next run.
  }
}

/**
 * Fail fast with a clear message: repo `.gitignore` omits large `soffice.wasm` / `soffice.data`;
 * they must exist under `public/wasm/` for same-origin `/wasm/*` requests to succeed.
 */
async function assertCoreWasmAssetsReachable(): Promise<void> {
  if (typeof window === 'undefined') return;

  const base = getWasmAssetBaseForCreatePaths();
  const crossOrigin = /^https?:\/\//i.test(base);

  for (const name of ['soffice.wasm', 'soffice.data'] as const) {
    const url = getWasmAssetFileUrl(name);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
      });
      if (res.status !== 200 && res.status !== 206) {
        throw new Error(
          `WASM file returned HTTP ${res.status} for ${url}. ` +
            (crossOrigin
              ? 'Confirm objects exist on the WASM host and CORS allows this origin (scheme + host + port).'
              : 'Copy soffice.wasm and soffice.data into public/wasm/, or set NEXT_PUBLIC_WASM_ASSET_BASE for production (see .env.example).')
        );
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('WASM file returned')) throw e;
      const inner = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Cannot fetch ${name} from ${url}: ${inner}. ` +
          (crossOrigin
            ? 'Typical fix: CORS on your WASM CDN must include this exact page origin; redeploy after changing NEXT_PUBLIC_WASM_ASSET_BASE.'
            : 'Typical fix: add binaries under public/wasm/ or point NEXT_PUBLIC_WASM_ASSET_BASE at a deployed /wasm/ mirror.')
      );
    }
  }
}

async function getConverter(onProgress?: ProgressHandler) {
  activeProgressHandler = onProgress ?? null;

  if (!converterPromise) {
    converterPromise = (async () => {
      await assertCoreWasmAssetsReachable();

      const { WorkerBrowserConverter, createWasmPaths } = await import(
        '@matbee/libreoffice-converter/browser'
      );

      const converter = new WorkerBrowserConverter({
        ...createWasmPaths(getWasmAssetBaseForCreatePaths()),
        browserWorkerJs: getBrowserWorkerJsUrl(),
        onProgress: emitProgress,
      });

      await withTimeout(converter.initialize(), INITIALIZE_TIMEOUT_MS, 'Converter initialization');
      converterInstance = converter;
      return converter;
    })().catch((error) => {
      void resetConverter();
      throw error;
    });
  }

  return converterPromise;
}

export async function warmConverter(onProgress?: ProgressHandler) {
  await getConverter(onProgress);
}

function mapProgress(onProgress: ProgressHandler | undefined, start: number, end: number) {
  activeProgressHandler = ({ percent, message }) => {
    onProgress?.({
      percent: start + (Math.max(0, Math.min(100, percent)) / 100) * (end - start),
      message,
    });
  };
}

function getInputFormat(filename: string): InputFormat {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (
    ext === 'doc' ||
    ext === 'docx' ||
    ext === 'pdf' ||
    ext === 'rtf' ||
    ext === 'txt' ||
    ext === 'html' ||
    ext === 'htm'
  ) {
    return ext === 'htm' ? 'html' : ext;
  }

  return 'docx';
}

function replaceExtension(filename: string, outputFormat: OutputFormat) {
  const base = filename.includes('.')
    ? filename.slice(0, filename.lastIndexOf('.'))
    : filename;

  return `${base}.${outputFormat}`;
}

function bytesToBlob(bytes: Uint8Array, mimeType: string) {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: mimeType });
}

function assertValidOutput(result: ConversionResult, outputFormat: OutputFormat) {
  const bytes = result.data;

  if (outputFormat === 'pdf') {
    const startsWithPdf =
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d;

    if (!startsWithPdf) {
      throw new Error('Conversion did not produce a valid PDF file.');
    }
  }

  if (outputFormat === 'docx') {
    const startsWithZip =
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 0x03 &&
      bytes[3] === 0x04;

    if (!startsWithZip) {
      throw new Error('Conversion did not produce a valid DOCX file.');
    }
  }
}

export async function convertDocumentFile(
  file: File,
  outputFormat: OutputFormat,
  onProgress?: ProgressHandler
): Promise<ConvertedDocument> {
  const runConversion = async (): Promise<ConvertedDocument> => {
    activeProgressHandler = onProgress ?? null;
    emitProgress({ percent: 1, message: 'Preparing document...' });

    const converter = await getConverter(onProgress);
    const inputFormat = getInputFormat(file.name);
    const inputBytes = new Uint8Array(await file.arrayBuffer());

    emitProgress({ percent: 85, message: `Converting ${file.name}...` });

    let result: ConversionResult;

    if (inputFormat === 'pdf' && outputFormat === 'docx') {
      mapProgress(onProgress, 5, 45);
      const htmlResult = await withTimeout(
        converter.convert(
          inputBytes,
          { inputFormat: 'pdf', outputFormat: 'html' },
          file.name
        ),
        CONVERSION_TIMEOUT_MS,
        'PDF to HTML conversion'
      );

      mapProgress(onProgress, 45, 99);
      result = await withTimeout(
        converter.convert(
          htmlResult.data,
          { inputFormat: 'html', outputFormat: 'docx' },
          replaceExtension(file.name, 'html')
        ),
        CONVERSION_TIMEOUT_MS,
        'HTML to DOCX conversion'
      );
    } else {
      activeProgressHandler = onProgress ?? null;
      result = await withTimeout(
        converter.convert(
          inputBytes,
          {
            inputFormat,
            outputFormat,
            pdf: outputFormat === 'pdf' ? { quality: 95 } : undefined,
          },
          file.name
        ),
        CONVERSION_TIMEOUT_MS,
        'Document conversion'
      );
    }

    assertValidOutput(result, outputFormat);
    emitProgress({ percent: 100, message: 'Conversion complete' });

    return {
      name: replaceExtension(file.name, outputFormat),
      blob: bytesToBlob(result.data, result.mimeType || MIME_TYPES[outputFormat]),
      originalName: file.name,
    };
  };

  const queued = conversionQueue.then(runConversion, runConversion);
  conversionQueue = queued.then(() => undefined, () => undefined);

  try {
    return await queued;
  } catch (error) {
    await resetConverter();
    throw error;
  }
}

const MATBEE_ERROR_CODES = new Set([
  'UNKNOWN',
  'INVALID_INPUT',
  'UNSUPPORTED_FORMAT',
  'CORRUPTED_DOCUMENT',
  'PASSWORD_REQUIRED',
  'WASM_NOT_INITIALIZED',
  'CONVERSION_FAILED',
  'LOAD_FAILED',
]);

function matbeeConversionErrorLine(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null;
  const o = error as { code?: unknown; message?: unknown; details?: unknown };
  if (typeof o.code !== 'string' || !MATBEE_ERROR_CODES.has(o.code)) return null;
  const msg = typeof o.message === 'string' ? o.message.trim() : '';
  const det = typeof o.details === 'string' ? o.details.trim() : '';
  const parts = [o.code, msg, det ? `Details: ${det}` : ''].filter(Boolean);
  return parts.join(' — ');
}

export function conversionErrorMessage(error: unknown) {
  const matbeeLine = matbeeConversionErrorLine(error);
  if (matbeeLine) {
    const single = matbeeLine.replace(/\s+/g, ' ').trim();
    return single.length > 620 ? `${single.slice(0, 620).trim()}…` : single;
  }

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  const message = rawMessage.replace(/\s+/g, ' ').trim();
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('sharedarraybuffer') ||
    lowerMessage.includes('crossoriginisolated') ||
    lowerMessage.includes('cross-origin isolation')
  ) {
    return 'Browser blocked shared memory for the converter. Ensure the site is served with COOP/COEP (see next.config.js) and reload.';
  }

  if (lowerMessage.includes('worker load timeout')) {
    return 'The converter worker did not become ready within 10s (library limit). Check DevTools → Network for browser.worker.global.js and the console for worker errors; slow DNS or a blocked cross-origin worker often causes this.';
  }

  if (lowerMessage.includes('converter initialization')) {
    return 'The LibreOffice engine took too long to download or start (WASM + data are large). Use a stable connection, reload, or try again on a faster link.';
  }

  if (
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timeoput')
  ) {
    return 'Conversion timed out in your browser. Please retry with a smaller or simpler file.';
  }

  if (lowerMessage.includes('password') || lowerMessage.includes('encrypted')) {
    return 'This file appears to be password-protected or encrypted. Please unlock it and try again.';
  }

  if (
    lowerMessage.includes('corrupt') ||
    lowerMessage.includes('damaged') ||
    lowerMessage.includes('malformed')
  ) {
    return 'This file appears to be damaged or malformed. Please try a clean copy of the document.';
  }

  if (lowerMessage.includes('unsupported') || lowerMessage.includes('unknown format')) {
    return 'This file format is not supported by the browser converter.';
  }

  if (lowerMessage.includes('valid pdf')) {
    return 'Conversion did not produce a valid PDF. Please try a different source file.';
  }

  if (lowerMessage.includes('valid docx')) {
    return 'Conversion did not produce a valid DOCX. Please try a different source file.';
  }

  // Preflight / asset errors (must run before generic "failed to fetch" — those strings often include it).
  if (
    lowerMessage.includes('wasm file returned http') ||
    lowerMessage.includes('cannot fetch soffice.wasm') ||
    lowerMessage.includes('cannot fetch soffice.data')
  ) {
    return message.length > 520 ? `${message.slice(0, 520).trim()}…` : message;
  }

  if (
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('networkerror') ||
    (lowerMessage.includes('load') &&
      !lowerMessage.includes('upload') &&
      !lowerMessage.includes('download'))
  ) {
    return 'The converter engine could not load. Refresh the page and try again.';
  }

  if (
    lowerMessage.includes('cors') ||
    lowerMessage.includes('cross-origin') ||
    lowerMessage.includes('coep') ||
    lowerMessage.includes('corp')
  ) {
    return 'WASM blocked (CORS or security headers). Same-origin /wasm/ should not need CORS; check next.config.js COOP/COEP and any CDN headers on static assets.';
  }

  if (
    lowerMessage.includes('webassembly') ||
    lowerMessage.includes('wasm') ||
    lowerMessage.includes('instantiate') ||
    lowerMessage.includes('compileerror') ||
    lowerMessage.includes('linkerror') ||
    lowerMessage.includes('emscripten')
  ) {
    return 'WebAssembly failed to load or start. Open the browser console (F12), confirm public/wasm contains the full bundle, and restart `next dev` after adding files.';
  }

  if (!message) {
    return 'Conversion failed with no error text. Open the browser console (F12), retry, and look for errors from the converter or worker.';
  }

  // Long engine/stack messages used to be replaced by a misleading "smaller file" hint — show a prefix instead.
  if (message.length > 220) {
    return `${message.slice(0, 220).trim()}… (truncated — see F12 console for full error.)`;
  }

  return message;
}
