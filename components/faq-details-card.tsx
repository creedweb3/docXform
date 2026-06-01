'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

type FaqDetailsCardProps = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  variant?: 'glass';
  showExpander?: boolean;
};

export function FaqDetailsCard({
  question,
  answer,
  defaultOpen = false,
  showExpander = true,
}: FaqDetailsCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className={cn(
        'group rounded-xl border border-border/70 bg-card/40 overflow-hidden transition-colors',
        open && 'border-foreground/12 bg-card/55'
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
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/15 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 text-left text-sm sm:text-[15px] font-medium text-foreground leading-snug">
          {question}
        </span>
        {showExpander ? (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card/50 text-muted-foreground transition-colors',
              open && 'border-foreground/15 text-foreground'
            )}
            aria-hidden
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} className={cn(open && 'rotate-180')} />
          </span>
        ) : null}
      </summary>
      <div className="border-t border-border/60 px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}
