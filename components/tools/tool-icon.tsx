'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ToolDefinition } from '@/lib/tools';

type ToolIconProps = {
  pair: ToolDefinition['iconPair'];
  tone: ToolDefinition['tone'];
  variant?: 'tile' | 'inline';
  className?: string;
  label?: string;
};

const toneClasses: Record<ToolDefinition['tone'], { base: string; front: string; glow: string; text: string }> = {
  emerald: {
    base: 'from-emerald-50 to-green-50 border-emerald-100',
    front: 'bg-emerald-600 text-white border-emerald-400',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-700',
  },
  amber: {
    base: 'from-amber-50 to-yellow-50 border-amber-100',
    front: 'bg-amber-500 text-white border-amber-300',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-700',
  },
  teal: {
    base: 'from-teal-50 to-cyan-50 border-teal-100',
    front: 'bg-teal-600 text-white border-teal-400',
    glow: 'shadow-teal-500/20',
    text: 'text-teal-700',
  },
  purple: {
    base: 'from-purple-50 to-violet-50 border-purple-100',
    front: 'bg-purple-600 text-white border-purple-400',
    glow: 'shadow-purple-500/20',
    text: 'text-purple-700',
  },
  cyan: {
    base: 'from-cyan-50 to-sky-50 border-cyan-100',
    front: 'bg-cyan-600 text-white border-cyan-400',
    glow: 'shadow-cyan-500/20',
    text: 'text-cyan-700',
  },
  orange: {
    base: 'from-orange-50 to-amber-50 border-orange-100',
    front: 'bg-orange-600 text-white border-orange-400',
    glow: 'shadow-orange-500/20',
    text: 'text-orange-700',
  },
  indigo: {
    base: 'from-indigo-50 to-blue-50 border-indigo-100',
    front: 'bg-indigo-600 text-white border-indigo-400',
    glow: 'shadow-indigo-500/20',
    text: 'text-indigo-700',
  },
  slate: {
    base: 'from-slate-50 to-gray-50 border-slate-200',
    front: 'bg-slate-700 text-white border-slate-500',
    glow: 'shadow-slate-500/20',
    text: 'text-slate-700',
  },
  rose: {
    base: 'from-rose-50 to-pink-50 border-rose-100',
    front: 'bg-rose-600 text-white border-rose-400',
    glow: 'shadow-rose-500/20',
    text: 'text-rose-700',
  },
  sky: {
    base: 'from-sky-50 to-blue-50 border-sky-100',
    front: 'bg-sky-600 text-white border-sky-400',
    glow: 'shadow-sky-500/20',
    text: 'text-sky-700',
  },
  violet: {
    base: 'from-violet-50 to-purple-50 border-violet-100',
    front: 'bg-violet-600 text-white border-violet-400',
    glow: 'shadow-violet-500/20',
    text: 'text-violet-700',
  },
  lime: {
    base: 'from-lime-50 to-green-50 border-lime-100',
    front: 'bg-lime-600 text-white border-lime-400',
    glow: 'shadow-lime-500/20',
    text: 'text-lime-700',
  },
  fuchsia: {
    base: 'from-fuchsia-50 to-pink-50 border-fuchsia-100',
    front: 'bg-fuchsia-600 text-white border-fuchsia-400',
    glow: 'shadow-fuchsia-500/20',
    text: 'text-fuchsia-700',
  },
};

export function ToolIcon({ pair, tone, variant = 'tile', className, label }: ToolIconProps) {
  const styles = toneClasses[tone];
  const isInline = variant === 'inline';

  const content = (
    <>
      <HugeiconsIcon
        icon={pair.back}
        size={isInline ? 17 : 30}
        strokeWidth={1.8}
        className={clsx(styles.text, isInline ? 'translate-x-[-2px] translate-y-[-1px]' : '-translate-x-1 -translate-y-1')}
      />
      <motion.span
        className={clsx(
          'absolute flex items-center justify-center rounded-xl border shadow-lg',
          styles.front,
          styles.glow,
          isInline ? '-bottom-1 -right-1 h-5 w-5 rounded-lg' : '-bottom-2 -right-2 h-8 w-8'
        )}
        whileHover={isInline ? undefined : { x: 2, y: -2 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      >
        <HugeiconsIcon icon={pair.front} size={isInline ? 12 : 18} strokeWidth={2} />
      </motion.span>
    </>
  );

  const shellClassName = clsx(
    'relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-2xl border bg-gradient-to-br',
    styles.base,
    isInline ? 'h-8 w-8 rounded-xl' : 'h-14 w-14 shadow-sm',
    className
  );

  if (isInline) {
    return (
      <span aria-label={label} className={shellClassName}>
        {content}
      </span>
    );
  }

  return (
    <motion.span
      aria-label={label}
      className={shellClassName}
      whileHover={{ y: -1, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {content}
    </motion.span>
  );
}
