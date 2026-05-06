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
      window.removeEventListener('touchstart', onFirstIntent);
    };

    window.addEventListener('pointerdown', onFirstIntent, { passive: true, once: true });
    window.addEventListener('keydown', onFirstIntent, { passive: true, once: true });
    window.addEventListener('touchstart', onFirstIntent, { passive: true, once: true });

    return () => {
      cancelled = true;
      removeIntentListeners();
    };
  }, []);

  return null;
}
