import Link from 'next/link';
import { TermBadge, TermComment, TermKeyRow } from '@/components/site/terminal/hacker-primitives';
import { BTN_PRIMARY } from '@/lib/brand';
import { cn } from '@/lib/utils';

type TermInquiryCtaProps = {
  path?: string;
  hint?: string;
  href?: string;
  ctaLabel?: string;
  className?: string;
};

/** Terminal-style business / press inquiry panel (Imprint). */
export function TermInquiryCta({
  path = 'inquiry',
  hint = 'Business, partnership, or press inquiry?',
  href = '/contact',
  ctaLabel = 'Contact docXform',
  className,
}: TermInquiryCtaProps) {
  return (
    <aside
      className={cn(
        'term-inquiry-cta overflow-hidden rounded-sm border border-[hsl(var(--brand-copper)/0.2)] bg-black/40',
        'transition-[border-color,background-color,box-shadow] duration-200',
        'hover:border-[hsl(var(--brand-copper)/0.32)] hover:bg-black/48 hover:shadow-[inset_0_0_32px_hsl(var(--brand-copper)/0.04)]',
        className
      )}
      aria-label="Contact for business inquiries"
    >
      <div className="border-b border-[hsl(var(--brand-copper)/0.12)] bg-[#0a0a0a] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="text-[hsl(var(--brand-copper))]">docxform</span>
        <span className="opacity-40"> / </span>
        <span>{path}</span>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--brand-copper))]">
            ./{path}
          </p>
          <TermComment>{hint}</TermComment>
        </div>

        <div className="overflow-hidden rounded-sm border border-[hsl(var(--brand-copper)/0.12)] bg-black/25 px-3 py-1">
          <TermKeyRow keyName="route" value="/contact" status="ok" />
          <TermKeyRow keyName="handles" value="business · press · partners" status="ok" />
        </div>

        <div className="flex flex-col gap-4 border-t border-[hsl(var(--brand-copper)/0.1)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={href}
            className={cn(
              BTN_PRIMARY,
              'interactive-trigger inline-flex h-10 items-center justify-center rounded-sm px-5',
              'font-mono text-[11px] font-medium uppercase tracking-[0.1em]'
            )}
            data-interactive-mode="explore"
            data-cursor-label="RUN"
          >
            {ctaLabel}
          </Link>
          <TermBadge tone="neutral">not for file conversion</TermBadge>
        </div>
      </div>
    </aside>
  );
}
