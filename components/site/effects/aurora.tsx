'use client';

/**
 * Animated aurora blobs — CSS-only, respects prefers-reduced-motion via globals.
 */
export function Aurora() {
  return (
    <div className="aurora-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="aurora-blob aurora-blob-a" />
      <div className="aurora-blob aurora-blob-b" />
      <div className="aurora-blob aurora-blob-c" />
    </div>
  );
}
