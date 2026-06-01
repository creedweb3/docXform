import { cn } from '@/lib/utils';

/** @deprecated Prefer `.sheet` / Sheet component — Imprint brand surface */
export function surfaceClass(hover?: boolean, elevated?: boolean) {
  return cn(
    'rounded-sm border border-border bg-card',
    elevated && 'bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background)/0.5)_100%)]',
    hover && 'sheet-hover'
  );
}
