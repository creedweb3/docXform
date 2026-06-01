'use client';

import { motion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const SIZE_SPRING = { stiffness: 380, damping: 32, mass: 0.25 };

type PrecisionCursorProps = {
  enabled: boolean;
  cursorRef: React.RefObject<HTMLDivElement | null>;
  dotInnerRef: React.RefObject<HTMLDivElement | null>;
  hovering: boolean;
  label: string;
};

export function PrecisionCursor({
  enabled,
  cursorRef,
  dotInnerRef,
  hovering,
  label,
}: PrecisionCursorProps) {
  const ringSize = useSpring(hovering ? 52 : 22, SIZE_SPRING);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[20001]"
      style={{ transform: 'translate3d(-100px,-100px,0)' }}
    >
      <motion.div
        className={cn(
          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-transparent transition-[border-color] duration-150',
          hovering
            ? 'border-[hsl(var(--brand-copper)/0.85)]'
            : 'border-[hsl(var(--brand-copper)/0.55)]'
        )}
        style={{
          width: ringSize,
          height: ringSize,
        }}
      />
      <div
        ref={dotInnerRef}
        className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-[hsl(var(--brand-copper))] will-change-transform"
        style={{
          transform: 'translate(-50%, -50%) translate3d(0px, 0px, 0)',
          opacity: hovering ? 0 : 1,
          transition: 'opacity 0.12s ease',
        }}
      />
      {hovering && label ? (
        <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--brand-copper))]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
