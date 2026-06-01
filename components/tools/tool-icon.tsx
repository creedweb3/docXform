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

const toneIconBox: Record<ToneKey, string> = {
  blue: 'icon-box-blue',
  emerald: 'icon-box-emerald',
  amber: 'icon-box-amber',
  teal: 'icon-box-teal',
  purple: 'icon-box-purple',
  cyan: 'icon-box-cyan',
  orange: 'icon-box-orange',
  indigo: 'icon-box-indigo',
  slate: 'icon-box-slate',
  rose: 'icon-box-rose',
  sky: 'icon-box-sky',
  violet: 'icon-box-violet',
  lime: 'icon-box-lime',
  fuchsia: 'icon-box-fuchsia',
};

export function ToolIcon({ pair, tone, variant = 'tile', className, label }: ToolIconProps) {
  const iconBox = toneIconBox[tone];
  const isInline = variant === 'inline';

  const content = (
    <>
      <HugeiconsIcon
        icon={pair.back}
        size={isInline ? 17 : 30}
        strokeWidth={1.8}
        className={clsx(
          'text-muted-foreground',
          isInline ? 'translate-x-[-2px] translate-y-[-1px]' : '-translate-x-1 -translate-y-1'
        )}
      />
      <motion.span
        className={clsx(
          'absolute flex items-center justify-center rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm',
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
    'relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-2xl border',
    iconBox,
    isInline ? 'h-8 w-8 rounded-xl' : 'h-14 w-14',
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
      whileHover={{ y: -1, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {content}
    </motion.span>
  );
}
