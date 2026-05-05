/**
 * LibreOffice WASM assets (`soffice.*`, workers) normally live under `/public/wasm/`.
 * For production you can serve them from Cloudflare R2 (or any HTTPS URL) to shrink
 * the Netlify deploy and cache at the edge.
 *
 * Set `NEXT_PUBLIC_WASM_ASSET_BASE` to the **public URL of the wasm folder**, including
 * path, e.g. `https://pub-xxxxx.r2.dev/wasm` or `https://wasm.yourdomain.com/wasm`.
 * Omit or leave empty to keep using same-origin `/wasm/`.
 *
 * R2 checklist: public access (or signed URLs not supported here), CORS `GET` from your
 * site origin, `Content-Type: application/wasm` for `.wasm`, and for COEP sites add
 * `Cross-Origin-Resource-Policy: cross-origin` on object responses (Transform Rules).
 */
export function getWasmAssetBaseForCreatePaths(): string {
  const raw = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return '/wasm/';
  }
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export function getBrowserWorkerJsUrl(): string {
  return `${getWasmAssetBaseForCreatePaths()}browser.worker.global.js`;
}

/** Resolve an asset under the wasm folder to an absolute URL (client: uses `window.location` for same-origin `/wasm/`). */
export function getWasmAssetFileUrl(fileName: string): string {
  const base = getWasmAssetBaseForCreatePaths();
  const name = fileName.replace(/^\//, '');
  if (base.startsWith('http')) {
    return new URL(name, base).href;
  }
  if (typeof window !== 'undefined') {
    return new URL(name, `${window.location.origin}${base}`).href;
  }
  return `${base}${name}`;
}
