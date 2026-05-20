'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ToolDefinition } from '@/lib/tools';
import type { ToneKey } from '@/components/tools/tone-styles';

type ToolIconProps = {
  pair: ToolDefinition['iconPair'];
  tone: ToneKey;
  variant?: 'tile' | 'inline';
  className?: string;
  label?: string;
};

/** Pastel tile + softer accent badge (500-weight, not 600). */
const toneClasses: Record<ToneKey, { base: string; front: string; glow: string; text: string }> = {
  blue: {
    base: 'from-blue-50 to-sky-50 border-blue-100/50',
    front: 'bg-blue-500 text-white border-blue-300',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-600',
  },
  emerald: {
    base: 'from-emerald-50 to-green-50 border-emerald-100',
    front: 'bg-emerald-500 text-white border-emerald-300',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-600',
  },
  amber: {
    base: 'from-amber-50 to-yellow-50 border-amber-100',
    front: 'bg-amber-500 text-white border-amber-300',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-600',
  },
  teal: {
    base: 'from-teal-50 to-cyan-50 border-teal-100',
    front: 'bg-teal-500 text-white border-teal-300',
    glow: 'shadow-teal-500/20',
    text: 'text-teal-600',
  },
  purple: {
    base: 'from-purple-50 to-violet-50 border-purple-100',
    front: 'bg-purple-500 text-white border-purple-300',
    glow: 'shadow-purple-500/20',
    text: 'text-purple-600',
  },
  cyan: {
    base: 'from-cyan-50 to-sky-50 border-cyan-100',
    front: 'bg-cyan-500 text-white border-cyan-300',
    glow: 'shadow-cyan-500/20',
    text: 'text-cyan-600',
  },
  orange: {
    base: 'from-orange-50 to-amber-50 border-orange-100',
    front: 'bg-orange-500 text-white border-orange-300',
    glow: 'shadow-orange-500/20',
    text: 'text-orange-600',
  },
  indigo: {
    base: 'from-indigo-50 to-blue-50 border-indigo-100',
    front: 'bg-indigo-500 text-white border-indigo-300',
    glow: 'shadow-indigo-500/20',
    text: 'text-indigo-600',
  },
  slate: {
    base: 'from-slate-50 to-gray-50 border-slate-200/60',
    front: 'bg-slate-600 text-white border-slate-400',
    glow: 'shadow-slate-500/20',
    text: 'text-slate-600',
  },
  rose: {
    base: 'from-rose-50 to-pink-50 border-rose-100',
    front: 'bg-rose-500 text-white border-rose-300',
    glow: 'shadow-rose-500/20',
    text: 'text-rose-600',
  },
  sky: {
    base: 'from-sky-50 to-blue-50 border-sky-100',
    front: 'bg-sky-500 text-white border-sky-300',
    glow: 'shadow-sky-500/20',
    text: 'text-sky-600',
  },
  violet: {
    base: 'from-violet-50 to-purple-50 border-violet-100',
    front: 'bg-violet-500 text-white border-violet-300',
    glow: 'shadow-violet-500/20',
    text: 'text-violet-600',
  },
  lime: {
    base: 'from-lime-50 to-green-50 border-lime-100',
    front: 'bg-lime-500 text-white border-lime-300',
    glow: 'shadow-lime-500/20',
    text: 'text-lime-600',
  },
  fuchsia: {
    base: 'from-fuchsia-50 to-pink-50 border-fuchsia-100',
    front: 'bg-fuchsia-500 text-white border-fuchsia-300',
    glow: 'shadow-fuchsia-500/20',
    text: 'text-fuchsia-600',
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
