'use client';

import { useEffect } from 'react';
import { getBrowserWorkerJsUrl, getWasmAssetBaseForCreatePaths } from '@/lib/wasm-asset-base';

declare global {
  interface Window {
    /** WASM URL prefix from NEXT_PUBLIC_WASM_ASSET_BASE at build time (`/wasm/` if unset). */
    __DOCXFORM_WASM_BASE__?: string;
  }
}

/** Mounts on every page so DevTools can use `window.__DOCXFORM_WASM_BASE__` without visiting a tool route. */
export function WasmEnvBridge() {
  useEffect(() => {
    window.__DOCXFORM_WASM_BASE__ = getWasmAssetBaseForCreatePaths();
    if (process.env.NEXT_PUBLIC_DEBUG_WASM === '1') {
      console.info('[DocXform] WASM asset base:', window.__DOCXFORM_WASM_BASE__);
      console.info('[DocXform] Worker script URL:', getBrowserWorkerJsUrl());
    }
  }, []);

  return null;
}
