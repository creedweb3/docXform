/**
 * Single source of truth for LibreOffice WASM binary revision (URL segment only — not a hash of R2 bytes).
 * Path `/wasm/bin/<revision>/soffice.{wasm,data}` is the browser cache key; bump the revision whenever R2
 * ships new soffice.wasm / soffice.data so clients fetch a new URL (see .env.example).
 * If `NEXT_PUBLIC_WASM_ASSET_REVISION` is unset, a fixed fallback string is used (stable URLs until you bump it).
 */
export function getWasmAssetRevision(): string {
  if (
    typeof process !== 'undefined' &&
    typeof process.env.NEXT_PUBLIC_WASM_ASSET_REVISION === 'string' &&
    process.env.NEXT_PUBLIC_WASM_ASSET_REVISION.trim() !== ''
  ) {
    return process.env.NEXT_PUBLIC_WASM_ASSET_REVISION.trim();
  }
  return '2026-05-06';
}

/** Same-origin directory prefix for versioned heavy binaries (middleware rewrites each file to CDN). */
export function getVersionedWasmBinPathPrefix(): string {
  const rev = getWasmAssetRevision();
  const safe = /^[a-zA-Z0-9._-]+$/.test(rev) ? rev : '2026-05-06';
  return `/wasm/bin/${safe}/`;
}
