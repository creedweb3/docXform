'use client';

import { useEffect } from 'react';

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7154775313079570';

declare global {
  interface Window {
    __docxformAdsenseLoaded?: boolean;
  }
}

export function AdsenseLoader() {
  useEffect(() => {
    if (window.__docxformAdsenseLoaded) return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${ADSENSE_SRC}"]`
    );
    if (existing) {
      window.__docxformAdsenseLoaded = true;
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const load = () => {
      if (cancelled || window.__docxformAdsenseLoaded) return;
      window.__docxformAdsenseLoaded = true;

      const script = document.createElement('script');
      script.src = ADSENSE_SRC;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    };

    const onFirstIntent = () => {
      removeIntentListeners();
      load();
    };

    const removeIntentListeners = () => {
      window.removeEventListener('pointerdown', onFirstIntent);
      window.removeEventListener('keydown', onFirstIntent);
      window.removeEventListener('scroll', onFirstIntent);
    };

    window.addEventListener('pointerdown', onFirstIntent, { passive: true, once: true });
    window.addEventListener('keydown', onFirstIntent, { passive: true, once: true });
    window.addEventListener('scroll', onFirstIntent, { passive: true, once: true });

    // Keep ads off the critical rendering path; still load eventually.
    timeoutId = window.setTimeout(load, 6000);
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(load, { timeout: 3500 });
    }

    return () => {
      cancelled = true;
      removeIntentListeners();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  return null;
}
