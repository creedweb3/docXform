import { getWasmAssetBaseForCreatePaths } from '@/lib/wasm-asset-base';
import { wasmBinaryFetchUrl } from '@/lib/wasm-binary-urls';
import { getVersionedWasmBinPathPrefix } from '@/lib/wasm-revision';

/**
 * Absolute URLs used only for optional HTTP cache priming after LCP.
 * Uses the same URL rules as the document converter (`lib/wasm-binary-urls.ts`).
 */
export function buildWasmPrimeAbsoluteUrls(): { wasm: string; data: string } | null {
  if (typeof window === 'undefined') return null;

  const base = getWasmAssetBaseForCreatePaths();

  if (/^https?:\/\//i.test(base)) {
    return {
      wasm: wasmBinaryFetchUrl(base, 'soffice.wasm'),
      data: wasmBinaryFetchUrl(base, 'soffice.data'),
    };
  }

  const prefix = getVersionedWasmBinPathPrefix();
  return {
    wasm: wasmBinaryFetchUrl(prefix, 'soffice.wasm'),
    data: wasmBinaryFetchUrl(prefix, 'soffice.data'),
  };
}
