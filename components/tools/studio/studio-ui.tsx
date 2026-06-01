'use client';

import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { useVerticalScrollOverflow } from '@/components/tools/studio/use-vertical-scroll-overflow';
import { getStudioAccent } from '@/components/tools/studio-accent';
import { TONE_STYLES, type ToneKey } from '@/components/tools/tone-styles';
import {
  STUDIO_INFO_BANNER,
  STUDIO_NUM_STEPPER,
  STUDIO_NUM_STEPPER_BTN,
  STUDIO_NUM_STEPPER_BTNS,
  STUDIO_NUM_STEPPER_INPUT,
  STUDIO_TAB_ACTIVE,
  STUDIO_TAB_IDLE,
  STUDIO_TAB_TRACK,
} from '@/components/tools/studio/studio-theme';

export function StudioScrollArea({
  className,
  style,
  children,
  measureKey,
  'aria-label': ariaLabel,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Remeasure when scrollable content changes (e.g. range count). */
  measureKey?: string | number;
  'aria-label'?: string;
}) {
  const { ref, overflows } = useVerticalScrollOverflow([measureKey]);
  return (
    <div
      ref={ref}
      className={clsx(
        'queue-list-scrollbar min-h-0 min-w-0 overflow-x-clip overflow-y-auto overscroll-y-contain',
        overflows && 'pe-2',
        className
      )}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export function StudioNumStepper({
  value,
  min = 1,
  max,
  disabled,
  onChange,
  ariaLabel,
  className,
  fullWidth,
}: {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
  /** Full rail width with h-9 — matches {@link STUDIO_FULL_INPUT} weight in aside panels. */
  fullWidth?: boolean;
}) {
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  const clamp = (raw: number) => {
    let next = Math.max(min, Math.floor(raw) || min);
    if (max != null) next = Math.min(max, next);
    return next;
  };

  const bump = (delta: number) => onChange(clamp(value + delta));

  return (
    <div
      className={clsx(
        STUDIO_NUM_STEPPER,
        fullWidth && '!w-full h-9 focus-within:ring-2 focus-within:ring-[hsl(var(--brand-copper)/0.35)]',
        className
      )}
    >
      <input
        type="number"
        min={min}
        max={max}
        disabled={disabled}
        aria-label={ariaLabel}
        className={clsx(STUDIO_NUM_STEPPER_INPUT, fullWidth && 'text-sm')}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <div className={clsx(STUDIO_NUM_STEPPER_BTNS, fullWidth && 'w-6')} aria-hidden={disabled}>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || atMax}
          aria-label={`Increase ${ariaLabel}`}
          className={STUDIO_NUM_STEPPER_BTN}
          onClick={() => bump(1)}
        >
          ▴
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || atMin}
          aria-label={`Decrease ${ariaLabel}`}
          className={STUDIO_NUM_STEPPER_BTN}
          onClick={() => bump(-1)}
        >
          ▾
        </button>
      </div>
    </div>
  );
}

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
            'relative flex h-12 w-12 items-center justify-center rounded-sm shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40',
            primaryButtonClass
          )}
        >
          <HugeiconsIcon icon={Add01Icon} size={24} strokeWidth={2} />
        </button>
        <span className="studio-shell-badge absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-sm border px-1.5 font-mono text-[10px] font-bold">
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
          className="studio-shell-input pointer-events-auto flex h-10 w-10 items-center justify-center rounded-sm border font-mono text-[10px] font-bold text-foreground shadow-md transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="leading-none tracking-tight" aria-hidden>
            A<span className="text-muted-foreground">↓</span>Z
          </span>
        </button>
      ) : null}
    </div>
  );
}

export function StudioInfoBanner({ children }: { tone?: ToneKey; children: React.ReactNode }) {
  return (
    <div className={STUDIO_INFO_BANNER}>
      <span className="studio-shell-badge mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px] font-bold">
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
  tone,
}: {
  tabs: { id: T; label: string; disabled?: boolean; badge?: string }[];
  value: T;
  onChange: (id: T) => void;
  tone: ToneKey;
}) {
  const accent = getStudioAccent(tone);
  return (
    <div className={STUDIO_TAB_TRACK}>
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => !t.disabled && onChange(t.id)}
            className={clsx(
              `relative flex min-h-10 min-w-0 flex-1 flex-col items-center justify-center rounded-sm px-1 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide outline-none transition focus-visible:ring-2 ${accent.segmentFocus} focus-visible:ring-offset-1 sm:px-1.5 sm:py-1.5`,
              active ? STUDIO_TAB_ACTIVE : STUDIO_TAB_IDLE,
              t.disabled && 'cursor-not-allowed opacity-45'
            )}
          >
            <span className="min-w-0 text-center leading-tight">{t.label}</span>
            {t.badge ? (
              <span className={clsx('mt-0.5 max-w-full truncate text-center text-[8px] font-semibold', accent.tabBadge)}>
                {t.badge}
              </span>
            ) : null}
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
  tone,
  activeClassName,
}: {
  options: { id: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (id: T) => void;
  tone: ToneKey;
  activeClassName?: string;
}) {
  const accent = getStudioAccent(tone);
  return (
    <div className={STUDIO_TAB_TRACK}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.id)}
            className={clsx(
              `min-w-0 flex-1 rounded-sm px-1.5 py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wide outline-none transition focus-visible:ring-2 ${accent.segmentFocus} focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45 sm:px-2 sm:text-[11px]`,
              active ? (activeClassName ?? accent.segmentActive) : STUDIO_TAB_IDLE
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
