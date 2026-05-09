'use client';

import { useState } from 'react';

type FaqDetailsCardProps = {
  question: string;
  answer: string;
  /** Initial open state. */
  defaultOpen?: boolean;
  variant?: 'glass' | 'glass-subtle';
  /** Show the rotating + control on the right. */
  showExpander?: boolean;
};

/**
 * FAQ accordion: the full card toggles when open (click anywhere on the answer
 * area, not just the title row). Summary still uses native open/close; links in
 * answers do not toggle.
 */
export function FaqDetailsCard({
  question,
  answer,
  defaultOpen = false,
  variant = 'glass',
  showExpander = true,
}: FaqDetailsCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const skin = variant === 'glass-subtle' ? 'glass-subtle' : 'glass';

  return (
    <details
      className={`${skin} rounded-2xl overflow-hidden group cursor-pointer`}
      open={open}
      onToggle={(e) => {
        setOpen(e.currentTarget.open);
      }}
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
      <summary className="list-none flex w-full select-none items-center justify-between gap-3 px-5 pt-5 pb-3 font-medium text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 text-left">{question}</span>
        {showExpander ? (
          <span
            className="shrink-0 text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none"
            aria-hidden
          >
            +
          </span>
        ) : null}
      </summary>
      <div className="px-5 pb-5 pt-0">
        <p className="text-xs text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}
