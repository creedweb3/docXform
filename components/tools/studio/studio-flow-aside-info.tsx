'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

/** Settings / mode strip in the flow-studio right rail (30% column). */
export function StudioFlowAsideInfo({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        'studio-shell-panel shrink-0 space-y-2.5 rounded-sm border border-l-2 border-l-[hsl(var(--brand-copper)/0.45)] px-3 py-3 pl-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground',
        className
      )}
      aria-label={title}
    >
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-copper)/0.92)]">
        {title}
      </h3>
      <div className="min-w-0 text-[11px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
