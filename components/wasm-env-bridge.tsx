'use client';

import { useEffect } from 'react';
import { getWasmAssetBaseForCreatePaths } from '@/lib/wasm-asset-base';

declare global {
  interface Window {
    /** Same-origin WASM URL prefix (always `/wasm/`). */
    __DOCXFORM_WASM_BASE__?: string;
  }
}

/** Mounts on every page so DevTools can use `window.__DOCXFORM_WASM_BASE__` without visiting a tool route. */
export function WasmEnvBridge() {
  useEffect(() => {
    window.__DOCXFORM_WASM_BASE__ = getWasmAssetBaseForCreatePaths();
  }, []);

  return null;
}
