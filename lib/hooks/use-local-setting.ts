'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Persist tool-scoped UI settings (preset/format/etc.) to localStorage so
 * power users do not re-pick the same options every time they open a tool.
 * Never stores file contents, only UI choices.
 */
export function useLocalSetting<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return;
      const parsed = JSON.parse(stored) as T;
      queueMicrotask(() => {
        if (!cancelled) setValue(parsed);
      });
    } catch {
      // Ignore malformed storage; we fall back to the default.
    }
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(next));
        }
      } catch {
        // Ignore quota/permission issues; the in-memory state still updates.
      }
    },
    [key]
  );

  return [value, update] as const;
}
