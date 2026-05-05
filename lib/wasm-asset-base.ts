/**
 * LibreOffice WASM is served from `/public/wasm/` at `/wasm/` by default.
 *
 * **Production (GitHub / Netlify):** `soffice.wasm` is often ~140MB (over GitHub’s 100MB file cap).
 * Either use **Git LFS** for `public/wasm/soffice.{wasm,data}` (see `.gitattributes`) or set
 * `NEXT_PUBLIC_WASM_ASSET_BASE` to an HTTPS URL of a folder that mirrors `/wasm/` (same filenames).
 *
 * **CORS:** if you use a separate origin for WASM, allow your site origin on that host (GET, HEAD).
 */
export function getWasmAssetBaseForCreatePaths(): string {
  const raw = process.env.NEXT_PUBLIC_WASM_ASSET_BASE?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.endsWith('/') ? raw : `${raw}/`;
  }
  return '/wasm/';
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
