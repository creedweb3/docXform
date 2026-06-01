'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InteractiveCardProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article';
};

export function InteractiveCard({ children, className, as = 'article' }: InteractiveCardProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const Component = as;

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };

  return (
    <Component
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={onMove}
      className={cn(
        'interactive-trigger sheet sheet-hover relative overflow-hidden p-6 transition-shadow',
        hover && 'shadow-[0_20px_60px_-30px_hsl(26_72%_48%/0.35)]',
        className
      )}
      data-interactive-mode="explore"
      data-cursor-label="READ"
      style={
        reducedMotion
          ? undefined
          : {
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }
      }
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-sm opacity-0 transition-opacity"
        animate={{ opacity: hover ? 1 : 0 }}
        style={{
          background:
            'radial-gradient(420px circle at 50% 0%, hsl(var(--brand-copper) / 0.12), transparent 55%)',
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </Component>
  );
}
