/**
 * Perspective grid fading into the hero — static, zero JS cost.
 */
export function GridBeams({ className }: { className?: string }) {
  return (
    <div
      className={`grid-beams pointer-events-none absolute inset-0 ${className ?? ''}`}
      aria-hidden
    />
  );
}
