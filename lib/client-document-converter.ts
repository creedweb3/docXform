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
} from '@/lib/wasm-asset-base';
import { subscribeConnectionEligibilityInvalidation } from '@/lib/converter-eligibility';
import { getCachedPerfProfile, getConverterTimeouts } from '@/lib/perf-profile';
import { getWasmAssetRevision, getVersionedWasmBinPathPrefix } from '@/lib/wasm-revision';

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

const FALLBACK_WASM_CDN_BASE = 'https://wasm.docxform.com/wasm/';

let connectionEligibilitySubscribed = false;

function converterTimeouts() {
  return getConverterTimeouts(getCachedPerfProfile());
}

/** Query-string cache bust for HTTPS WASM bases (path may not be versioned on CDN). */
function wasmBinaryUrlWithRevision(url: string): string {
  const key = '_wx';
  const v = encodeURIComponent(getWasmAssetRevision());
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${v}`;
}

function wasmBinaryFetchUrl(base: string, name: 'soffice.wasm' | 'soffice.data'): string {
  const resolved = resolveWasmUrl(base, name);
  if (/^https?:\/\//i.test(base)) {
    return wasmBinaryUrlWithRevision(resolved);
  }
  return resolved;
}

function withUrlParam(url: string, key: string, value: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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
function resolveWasmUrl(base: string, name: string): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  if (/^https?:\/\//i.test(normalizedBase)) {
    return new URL(name, normalizedBase).href;
  }
  if (typeof window !== 'undefined') {
    return new URL(name, `${window.location.origin}${normalizedBase}`).href;
  }
  return `${normalizedBase}${name}`;
}

async function probeCoreWasmAssets(base: string): Promise<void> {
  const crossOrigin = /^https?:\/\//i.test(base);
  const probeMs = converterTimeouts().wasmProbeMs;
  for (const name of ['soffice.wasm', 'soffice.data'] as const) {
    const url = wasmBinaryFetchUrl(base, name);
    try {
      const res = await fetchWithTimeout(
        url,
        {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        cache: 'no-store',
        },
        probeMs
      );
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
      const timeoutHint =
        e instanceof Error && e.name === 'AbortError'
          ? ` (request timed out after ${Math.round(probeMs / 1000)}s)`
          : '';
      throw new Error(
        `Cannot fetch ${name} from ${url}: ${inner}${timeoutHint}. ` +
          (crossOrigin
            ? 'Typical fix: CORS on your WASM CDN must include this exact page origin; redeploy after changing NEXT_PUBLIC_WASM_ASSET_BASE.'
            : 'Typical fix: add binaries under public/wasm/ or point NEXT_PUBLIC_WASM_ASSET_BASE at a deployed /wasm/ mirror.')
      );
    }
  }
}

async function resolveBinaryAssetBase(): Promise<string> {
  if (typeof window === 'undefined') return getWasmAssetBaseForCreatePaths();

  const base = getWasmAssetBaseForCreatePaths();
  const versioned = getVersionedWasmBinPathPrefix();

  const tryProbe = async (b: string) => {
    await probeCoreWasmAssets(b);
    return b;
  };

  if (base.startsWith('/wasm/')) {
    try {
      return await tryProbe(versioned);
    } catch (vErr) {
      try {
        return await tryProbe(base);
      } catch {
        /* fall through */
      }
      const primaryError = vErr;
      const canFallbackToCdn =
        process.env.NODE_ENV === 'production' &&
        base.startsWith('/wasm/') &&
        typeof window !== 'undefined';

      if (!canFallbackToCdn) {
        throw primaryError;
      }

      const envBase = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
      const fallbackBase =
        envBase && /^https?:\/\//i.test(envBase)
          ? (envBase.endsWith('/') ? envBase : `${envBase}/`)
          : FALLBACK_WASM_CDN_BASE;

      try {
        await probeCoreWasmAssets(fallbackBase);
        console.warn(
          `[docXform] Falling back to CDN WASM base because same-origin /wasm/ probe failed: ${String(
            primaryError
          )}`
        );
        return fallbackBase;
      } catch {
        throw primaryError;
      }
    }
  }

  try {
    return await tryProbe(base);
  } catch (primaryError) {
    const canFallbackToCdn =
      process.env.NODE_ENV === 'production' &&
      base.startsWith('/wasm/') &&
      typeof window !== 'undefined';

    if (!canFallbackToCdn) {
      throw primaryError;
    }

    const envBase = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
    const fallbackBase =
      envBase && /^https?:\/\//i.test(envBase)
        ? (envBase.endsWith('/') ? envBase : `${envBase}/`)
        : FALLBACK_WASM_CDN_BASE;

    try {
      await probeCoreWasmAssets(fallbackBase);
      console.warn(
        `[docXform] Falling back to CDN WASM base because same-origin /wasm/ probe failed: ${String(
          primaryError
        )}`
      );
      return fallbackBase;
    } catch {
      throw primaryError;
    }
  }
}

function getCdnBinaryBase(): string {
  const envBase = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
  if (envBase && /^https?:\/\//i.test(envBase)) {
    return envBase.endsWith('/') ? envBase : `${envBase}/`;
  }
  return FALLBACK_WASM_CDN_BASE;
}

function buildWasmPathsForBinaryBase(
  createWasmPaths: (base?: string) => {
    sofficeJs: string;
    sofficeWasm: string;
    sofficeData: string;
    sofficeWorkerJs: string;
  },
  binaryBase: string,
  attemptToken?: string
) {
  const wasmPaths = createWasmPaths('/wasm/');
  if (/^https?:\/\//i.test(binaryBase)) {
    const wasmUrl = wasmBinaryFetchUrl(binaryBase, 'soffice.wasm');
    const dataUrl = wasmBinaryFetchUrl(binaryBase, 'soffice.data');
    wasmPaths.sofficeWasm = attemptToken ? withUrlParam(wasmUrl, '_wr', attemptToken) : wasmUrl;
    wasmPaths.sofficeData = attemptToken ? withUrlParam(dataUrl, '_wr', attemptToken) : dataUrl;
  } else {
    const wasmUrl = wasmBinaryFetchUrl(binaryBase, 'soffice.wasm');
    const dataUrl = wasmBinaryFetchUrl(binaryBase, 'soffice.data');
    wasmPaths.sofficeWasm = attemptToken ? withUrlParam(wasmUrl, '_wr', attemptToken) : wasmUrl;
    wasmPaths.sofficeData = attemptToken ? withUrlParam(dataUrl, '_wr', attemptToken) : dataUrl;
  }
  return wasmPaths;
}

async function getConverter(onProgress?: ProgressHandler) {
  activeProgressHandler = onProgress ?? null;

  if (!converterPromise) {
    converterPromise = (async () => {
      activeProgressHandler?.({
        percent: 2,
        message: 'Probing WASM URLs (soffice.wasm / soffice.data)…',
      });
      const binaryBase = await resolveBinaryAssetBase();

      activeProgressHandler?.({
        percent: 8,
        message: 'Loading converter module and worker…',
      });

      const { WorkerBrowserConverter, createWasmPaths } = await import(
        '@matbee/libreoffice-converter/browser'
      );

      const createAndInitialize = async (base: string) => {
        const attemptToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const wasmPaths = buildWasmPathsForBinaryBase(createWasmPaths, base, attemptToken);
        const converter = new WorkerBrowserConverter({
          ...wasmPaths,
          browserWorkerJs: getBrowserWorkerJsUrl(),
          onProgress: emitProgress,
        });
        await withTimeout(
          converter.initialize(),
          converterTimeouts().initializeMs,
          'Converter initialization'
        );
        return converter;
      };

      try {
        const converter = await createAndInitialize(binaryBase);
        converterInstance = converter;
        return converter;
      } catch (primaryInitError) {
        const shouldTryCdnFallback =
          process.env.NODE_ENV === 'production' &&
          binaryBase.startsWith('/wasm/') &&
          typeof window !== 'undefined';

        if (!shouldTryCdnFallback) {
          throw primaryInitError;
        }

        const fallbackBase = getCdnBinaryBase();
        if (fallbackBase === binaryBase) {
          throw primaryInitError;
        }

        try {
          await probeCoreWasmAssets(fallbackBase);
          const converter = await createAndInitialize(fallbackBase);
          console.warn(
            `[docXform] Initialized converter via CDN fallback after same-origin init failed: ${String(
              primaryInitError
            )}`
          );
          converterInstance = converter;
          return converter;
        } catch {
          throw primaryInitError;
        }
      }
    })().catch((error) => {
      void resetConverter();
      throw error;
    });
  }

  return converterPromise;
}

export async function warmConverter(onProgress?: ProgressHandler) {
  if (typeof window !== 'undefined' && !connectionEligibilitySubscribed) {
    connectionEligibilitySubscribed = true;
    subscribeConnectionEligibilityInvalidation();
  }
  if (converterInstance !== null) {
    onProgress?.({ percent: 100, message: 'Converter ready' });
    return;
  }
  // Eligibility (network probe, save-data, etc.) is computed once in `DocumentConverter` before warm starts.
  // Do not await it here or every warm pays for a duplicate probe and extra "Preparing" latency.
  await getConverter(onProgress);
}

/** True after WASM init succeeded in this tab (survives client navigations between tool pages). */
export function isConverterSessionReady(): boolean {
  return converterInstance !== null;
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
  const conversionTimeoutMs = converterTimeouts().conversionMs;
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
        conversionTimeoutMs,
        'PDF to HTML conversion'
      );

      mapProgress(onProgress, 45, 99);
      result = await withTimeout(
        converter.convert(
          htmlResult.data,
          { inputFormat: 'html', outputFormat: 'docx' },
          replaceExtension(file.name, 'html')
        ),
        conversionTimeoutMs,
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
        conversionTimeoutMs,
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
    const lower = matbeeLine.toLowerCase();
    if (lower.includes('wasm_not_initialized') || lower.includes('load_failed')) {
      return 'Converter service is temporarily unavailable. Please refresh and try again shortly.';
    }
    if (lower.includes('unsupported_format')) {
      return 'This file type is not supported for this conversion.';
    }
    if (lower.includes('corrupted_document') || lower.includes('invalid_input')) {
      return 'This file appears invalid or damaged. Please try another file.';
    }
    return 'Conversion failed. Please try again in a moment.';
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
    return 'Converter is temporarily unavailable. Please refresh the page and try again.';
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
    return 'Converter files are currently unavailable. We are working on it - please try again shortly.';
  }

  if (lowerMessage.includes('importscripts') || lowerMessage.includes('workerglobalscope')) {
    return 'Converter service is temporarily unavailable. Please try again in a few minutes.';
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
    lowerMessage.includes('expected magic word') ||
    lowerMessage.includes('00 61 73 6d') ||
    lowerMessage.includes('3c 21 44 4f')
  ) {
    return 'The converter received a web page instead of the WASM file (often a stale browser cache on one hostname, or a blocker). Clear site data for this origin, try https://www.docxform.com, or use a private window; then reload.';
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
