'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** True when `el` has vertical overflow (scrollbar visible / needed). */
function elementScrollsY(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 1;
}

/**
 * Tracks whether a scroll container needs vertical overflow.
 * Use to apply end padding only when a scrollbar is present.
 */
export function useVerticalScrollOverflow(deps: ReadonlyArray<unknown> = []) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setOverflows(elementScrollsY(el));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => measure());
    let contentEl: Element | null = null;

    const syncContentObserver = () => {
      const next = el.firstElementChild;
      if (next === contentEl) {
        measure();
        return;
      }
      if (contentEl) ro.unobserve(contentEl);
      contentEl = next;
      if (contentEl) ro.observe(contentEl);
      measure();
    };

    ro.observe(el);
    syncContentObserver();

    const mo = new MutationObserver(syncContentObserver);
    mo.observe(el, { childList: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remeasure when content/layout drivers change
  }, [measure, ...deps]);

  return { ref, overflows };
}
