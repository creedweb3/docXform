'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Slide distance in px */
  y?: number;
};

export function ScrollReveal({ children, className, delay = 0, y = 28 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y }}
      animate={reduce || inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
