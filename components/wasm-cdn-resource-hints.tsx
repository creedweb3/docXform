'use client';

import { useEffect } from 'react';

/**
 * Adds dns-prefetch / preconnect for the WASM CDN host in production builds.
 * Keeps the hints client-side to avoid affecting SSR HTML when not desired.
 */
export function WasmCdnResourceHints() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    const head = document.head;
    const existing = head.querySelectorAll<HTMLLinkElement>('link[data-wasm-cdn-hint]');
    if (existing.length) return;

    const links: HTMLLinkElement[] = [];
    const add = (rel: string, href: string, crossOrigin?: string) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.dataset.wasmCdnHint = 'true';
      if (crossOrigin) link.crossOrigin = crossOrigin;
      head.appendChild(link);
      links.push(link);
    };

    add('dns-prefetch', 'https://wasm.docxform.com');
    add('preconnect', 'https://wasm.docxform.com', 'anonymous');

    return () => {
      links.forEach((l) => l.remove());
    };
  }, []);

  return null;
}
