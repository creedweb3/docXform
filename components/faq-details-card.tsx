'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

type FaqDetailsCardProps = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  variant?: 'glass' | 'terminal';
  showExpander?: boolean;
};

function formatQuestion(question: string) {
  const trimmed = question.trim();
  return trimmed.endsWith('?') ? trimmed : `${trimmed}?`;
}

export function FaqDetailsCard({
  question,
  answer,
  defaultOpen = false,
  variant,
  showExpander = true,
}: FaqDetailsCardProps) {
  const isTerminal = variant === 'terminal';
  const [open, setOpen] = useState(defaultOpen);
  const displayQuestion = formatQuestion(question);

  return (
    <details
      className={cn(
        'faq-details group overflow-hidden transition-[background-color,border-color,box-shadow] duration-200',
        isTerminal
          ? 'faq-details-terminal rounded-sm border border-[hsl(var(--brand-copper)/0.14)] bg-[#080808] hover:border-[hsl(var(--brand-copper)/0.28)]'
          : 'rounded-sm border border-border/70 bg-card/40 hover:border-[hsl(var(--brand-copper)/0.22)] hover:bg-card/52',
        open &&
          (isTerminal
            ? 'border-[hsl(var(--brand-copper)/0.38)] shadow-[inset_0_0_24px_hsl(var(--brand-copper)/0.04)]'
            : 'border-foreground/12 bg-card/55')
      )}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      onClick={(e) => {
        const el = e.currentTarget;
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (t.closest('a, button')) return;
        const summary = el.querySelector('summary');
        if (summary?.contains(t)) return;
        setOpen((o) => !o);
      }}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-4 transition-colors duration-200',
          'hover:bg-[hsl(var(--brand-copper)/0.06)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          '[&::-webkit-details-marker]:hidden',
          isTerminal ? 'px-5 py-5 sm:px-6 sm:py-6' : 'px-5 py-4 sm:px-6 sm:py-5'
        )}
      >
        <span
          className={cn(
            'min-w-0 flex-1 text-left leading-snug',
            isTerminal
              ? 'font-mono text-[11px] text-foreground/90'
              : 'text-sm sm:text-[15px] font-medium text-foreground'
          )}
        >
          {displayQuestion}
        </span>
        {showExpander ? (
          <span
            className={cn(
              'faq-expander flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border text-muted-foreground transition-colors duration-200',
              'group-hover:border-[hsl(var(--brand-copper)/0.35)] group-hover:text-foreground/90',
              isTerminal
                ? 'border-[hsl(var(--brand-copper)/0.2)] bg-[#070707] font-mono text-[10px]'
                : 'border-border/70 bg-card/50',
              open && (isTerminal ? 'text-[hsl(var(--brand-copper))]' : 'border-foreground/15 text-foreground')
            )}
            aria-hidden
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} className={cn(open && 'rotate-180')} />
          </span>
        ) : null}
      </summary>
      <div
        className={cn(
          'border-t',
          isTerminal
            ? 'border-[hsl(var(--brand-copper)/0.12)] px-5 py-5 sm:px-6 sm:py-6'
            : 'border-border/60 px-5 pb-5 pt-0 sm:px-6 sm:pb-6'
        )}
      >
        <p
          className={cn(
            'leading-relaxed',
            isTerminal
              ? 'font-mono text-[11px] text-muted-foreground'
              : 'pt-4 text-sm text-muted-foreground'
          )}
        >
          {answer}
        </p>
      </div>
    </details>
  );
}
