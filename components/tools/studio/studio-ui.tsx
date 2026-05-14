'use client';

import clsx from 'clsx';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

export function StudioFabStack({
  fileCount,
  maxFiles,
  busy,
  onAdd,
  onSort,
  showSort,
  primaryButtonClass,
}: {
  fileCount: number;
  maxFiles: number;
  busy: boolean;
  onAdd: () => void;
  onSort?: () => void;
  showSort?: boolean;
  primaryButtonClass: string;
}) {
  const atCap = fileCount >= maxFiles;
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
      <div className="pointer-events-auto relative">
        <button
          type="button"
          title="Add more files"
          aria-label="Add more files"
          disabled={busy || atCap}
          onClick={onAdd}
          className={clsx(
            'relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40',
            `bg-gradient-to-br ${primaryButtonClass}`
          )}
        >
          <HugeiconsIcon icon={Add01Icon} size={26} strokeWidth={2} />
        </button>
        <span className="absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-border/60 bg-zinc-900 px-1.5 text-[11px] font-bold text-white shadow">
          {fileCount}
        </span>
      </div>
      {showSort && onSort ? (
        <button
          type="button"
          title="Sort A–Z"
          aria-label="Sort files A to Z"
          disabled={busy || fileCount < 2}
          onClick={onSort}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-white/95 text-foreground shadow-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-[11px] font-bold leading-none tracking-tight" aria-hidden>
            A<span className="text-muted-foreground">↓</span>Z
          </span>
        </button>
      ) : null}
    </div>
  );
}

export function StudioSidebarTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-border/40 pb-3 text-center text-lg font-bold tracking-tight text-foreground sm:text-left">{children}</h2>;
}

export function StudioInfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 overflow-hidden rounded-xl bg-sky-50/90 p-3 text-[11px] leading-relaxed text-sky-950 ring-1 ring-sky-200/50 dark:bg-sky-950/25 dark:text-sky-100 dark:ring-sky-500/25">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-200/70 text-[10px] font-bold text-sky-900 dark:bg-sky-800/80 dark:text-sky-100">
        i
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function StudioTabBar<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; disabled?: boolean; badge?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex w-full gap-0.5 rounded-lg bg-muted/45 p-0.5 ring-1 ring-inset ring-black/[0.04] dark:bg-muted/25 dark:ring-white/[0.06]">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => !t.disabled && onChange(t.id)}
            className={clsx(
              'relative flex min-h-10 flex-1 flex-col items-center justify-center rounded-md px-1.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400/35 focus-visible:ring-offset-1 sm:text-[11px]',
              active
                ? 'bg-white text-foreground shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-muted-foreground hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10',
              t.disabled && 'cursor-not-allowed opacity-45'
            )}
          >
            <span className="text-center leading-tight">{t.label}</span>
            {t.badge ? <span className="mt-0.5 text-[8px] font-semibold text-amber-700">{t.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function StudioSegmentRow<T extends string>({
  options,
  value,
  onChange,
  activeClassName,
}: {
  options: { id: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (id: T) => void;
  /** Applied to the active option button (defaults to neutral ring). */
  activeClassName?: string;
}) {
  return (
    <div className="flex w-full rounded-lg bg-muted/45 p-0.5 ring-1 ring-inset ring-black/[0.04] dark:bg-muted/25 dark:ring-white/[0.06]">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.id)}
            className={clsx(
              'flex-1 rounded-md px-2 py-2 text-center text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400/35 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45',
              active
                ? activeClassName ??
                  'bg-white text-foreground shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-muted-foreground hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
