import Link from 'next/link';
import { cn } from '@/lib/utils';

export function TermCmd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-[12px] leading-relaxed', className)}>
      <span className="text-[hsl(var(--brand-sage))]">root@docxform</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-[hsl(var(--brand-copper))]">~</span>
      <span className="text-muted-foreground">$ </span>
      <span className="text-foreground">{children}</span>
      <span className="term-blink text-[hsl(var(--brand-copper))]">_</span>
    </p>
  );
}

export function TermComment({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-mono text-[11px] leading-relaxed text-muted-foreground/90',
        className
      )}
    >
      # {children}
    </p>
  );
}

export function TermOut({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'copper' | 'sage' | 'warn' | 'dim';
  className?: string;
}) {
  const toneClass = {
    default: 'text-foreground/90',
    copper: 'text-[hsl(var(--brand-copper))]',
    sage: 'text-[hsl(var(--brand-sage))]',
    warn: 'text-amber-400/95',
    dim: 'text-muted-foreground',
  }[tone];

  return (
    <p className={cn('font-mono text-[12px] leading-relaxed pl-2', toneClass, className)}>
      {children}
    </p>
  );
}

export function TermBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'ok' | 'warn' | 'block';
}) {
  const styles = {
    neutral: 'border-border/80 text-muted-foreground',
    ok: 'border-[hsl(var(--brand-sage)/0.45)] text-[hsl(var(--brand-sage))] bg-[hsl(var(--brand-sage)/0.08)]',
    warn: 'border-amber-500/40 text-amber-400/90 bg-amber-500/5',
    block: 'border-red-500/35 text-red-400/90 bg-red-500/5',
  }[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em]',
        styles
      )}
    >
      {children}
    </span>
  );
}

export function TermLink({
  href,
  children,
  label = 'RUN',
}: {
  href: string;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="interactive-trigger group inline-flex items-center gap-2 font-mono text-[12px] text-[hsl(var(--brand-copper))] hover:text-foreground"
      data-interactive-mode="explore"
      data-cursor-label={label}
    >
      <span className="text-muted-foreground group-hover:text-[hsl(var(--brand-copper))]">{`{`}</span>
      {children}
      <span className="text-muted-foreground group-hover:text-[hsl(var(--brand-copper))]">{`}`}</span>
    </Link>
  );
}

export function TermKeyRow({
  keyName,
  value,
  status,
}: {
  keyName: string;
  value: string;
  status?: 'ok' | 'warn' | 'block';
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr_auto] items-baseline gap-3 border-b border-[hsl(var(--brand-copper)/0.08)] py-3 font-mono text-[11px] last:border-0">
      <span className="text-[hsl(var(--brand-copper))]">{keyName}</span>
      <span className="text-foreground/85">{value}</span>
      {status ? <TermBadge tone={status}>{status === 'ok' ? 'OK' : status === 'block' ? 'DENY' : 'WARN'}</TermBadge> : null}
    </div>
  );
}

/** Grouped key rows — single bordered panel with consistent internal padding. */
export function TermKeyGroup({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-sm border border-[hsl(var(--brand-copper)/0.15)] bg-black/25 px-4 py-1 sm:px-5',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function TermModule({
  id,
  title,
  detail,
}: {
  id: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-sm border border-[hsl(var(--brand-copper)/0.2)] bg-black/40 p-4 font-mono text-[11px] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[hsl(var(--brand-copper))]">[{id}]</span>
        <TermBadge tone="ok">loaded</TermBadge>
      </div>
      <p className="mt-3 text-sm leading-snug text-foreground/90">{title}</p>
      <p className="mt-2 leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

/** Wrap multiple {@link TermSection} blocks — spacing via `.term-section-stack` in globals.css. */
export function TermSectionStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('term-section-stack', className)}>{children}</div>;
}

/** Labeled block inside a terminal — path + optional `#` hint (comment style). */
export function TermSection({
  path,
  hint,
  children,
  className,
}: {
  path: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col', className)}>
      <header className="mb-5 sm:mb-6">
        <p className="font-mono text-[10px] uppercase leading-normal tracking-[0.16em] text-[hsl(var(--brand-copper))]">
          ./{path}
        </p>
        {hint ? (
          <p className="mt-3 max-w-2xl font-mono text-[11px] leading-relaxed text-muted-foreground">
            <span className="text-muted-foreground/55" aria-hidden>
              #{' '}
            </span>
            {hint}
          </p>
        ) : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** Shell-style log line (`> key: value`). */
export function TermLog({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'copper' | 'sage' | 'dim';
  className?: string;
}) {
  const toneClass = {
    default: 'text-foreground/88',
    copper: 'text-[hsl(var(--brand-copper))]',
    sage: 'text-[hsl(var(--brand-sage))]',
    dim: 'text-muted-foreground',
  }[tone];

  return (
    <p className={cn('font-mono text-[12px] leading-relaxed', className)}>
      <span className="text-muted-foreground/80">{'> '}</span>
      <span className={toneClass}>{children}</span>
    </p>
  );
}

export function TermFrame({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'studio-shell-panel rounded-sm border border-[hsl(var(--brand-copper)/0.18)] p-4 sm:p-5',
        className
      )}
    >
      {label ? (
        <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(var(--brand-copper))]">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** Readable page body inside the terminal shell (not faux log lines). */
export function TermProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'space-y-4 text-[15px] leading-relaxed',
        '[&_h2]:font-display [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:pt-1',
        '[&_h3]:font-display [&_h3]:text-lg [&_h3]:text-foreground [&_h3]:pt-1',
        '[&_p]:text-muted-foreground',
        '[&_a]:text-[hsl(var(--brand-copper))] [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_ul]:space-y-2.5 [&_ul]:pl-5 [&_li]:list-disc [&_li]:text-muted-foreground',
        '[&_strong]:font-medium [&_strong]:text-foreground/90',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TermAsciiDivider({ label }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-3 py-2 font-mono text-[10px] text-muted-foreground/70"
      role="separator"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--brand-copper)/0.35)] to-transparent" />
      {label ? <span className="shrink-0 uppercase tracking-[0.2em]">{label}</span> : null}
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[hsl(var(--brand-copper)/0.35)] to-transparent" />
    </div>
  );
}
