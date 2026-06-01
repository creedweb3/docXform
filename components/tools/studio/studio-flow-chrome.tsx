'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { TermFrame } from '@/components/site/console/console-ui';
import { STUDIO_LABEL } from '@/components/tools/studio/studio-theme';
import { WORKSPACE_TOOLBAR_BTN, WORKSPACE_TOOLBAR_BTN_PRIMARY } from '@/lib/site-design';

/** Right-rail queue row — terminal panel, not legacy list dividers. */
export const STUDIO_FLOW_QUEUE_ROW =
  'studio-flow-queue-row studio-shell-panel box-border w-full min-w-0 rounded-sm border px-2.5 py-2.5 transition-colors';

export const STUDIO_FLOW_QUEUE_ROW_SELECTED =
  'border-[hsl(var(--brand-copper)/0.45)] bg-[hsl(var(--brand-copper)/0.06)] ring-1 ring-[hsl(var(--brand-copper)/0.22)]';

/** Info strip under preview title — optional Add/Clear toolbar on the right (flow studio). */
export function StudioFlowPreviewInfoRow({
  children,
  toolbar,
  className,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}) {
  if (!toolbar) {
    return <div className={clsx('mb-1.5 w-full min-w-0 shrink-0 sm:mb-1', className)}>{children}</div>;
  }
  return (
    <div className={clsx('mb-1.5 w-full min-w-0 shrink-0 sm:mb-1', className)}>
      <div className="flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:items-stretch lg:justify-between lg:gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        <div className="w-full shrink-0 lg:w-[min(100%,17.5rem)]">{toolbar}</div>
      </div>
    </div>
  );
}

export function StudioFlowPreviewHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[hsl(var(--brand-copper)/0.12)] pb-3">
      <div className="min-w-0">
        <p className={STUDIO_LABEL}>{title}</p>
        {meta ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{meta}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StudioFlowRailHeader({
  meta,
  actions,
}: {
  meta: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2.5 border-b border-[hsl(var(--brand-copper)/0.12)] pb-3">
      <div className="min-w-0 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{meta}</div>
      {actions ? <div className="w-full min-w-0">{actions}</div> : null}
    </div>
  );
}

/** Equal-width Add / Clear (or similar) in the flow-studio rail. */
export function StudioFlowRailToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-2 [&_button]:w-full [&_button]:justify-center">
      {children}
    </div>
  );
}

/** Full-width CTAs in a vertical flow-studio rail (PDF split, etc.). */
export const STUDIO_FLOW_CTA_STRETCH_COL = 'min-h-11 w-full min-w-0';

/** Equal-width CTAs in a horizontal pair (wide rail / flagship converter). */
export const STUDIO_FLOW_CTA_STRETCH_ROW = 'min-h-11 min-w-0 flex-1 basis-0 self-stretch';

/** @deprecated Use {@link STUDIO_FLOW_CTA_STRETCH_COL} or {@link STUDIO_FLOW_CTA_STRETCH_ROW}. */
export const STUDIO_FLOW_CTA_STRETCH = STUDIO_FLOW_CTA_STRETCH_COL;

export function StudioFlowCtaRow({
  children,
  className,
  layout = 'column',
}: {
  children: ReactNode;
  className?: string;
  /** Narrow rails use column; batch converter aside can use row. */
  layout?: 'column' | 'row';
}) {
  return (
    <div
      className={clsx(
        'flex w-full min-w-0 gap-2',
        layout === 'row' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Standard flow-studio right column: header, scrollable body, pinned CTAs. */
export function StudioFlowAsideLayout({
  header,
  children,
  footer,
}: {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {header}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">{children}</div>
      <div className="studio-shell-divider shrink-0 border-t pt-3">{footer}</div>
    </div>
  );
}

/** Duplicate-file banner — matches flow output {@link TermFrame} styling. */
export function StudioFlowDuplicatePrompt({
  message,
  onSkip,
  onAddAgain,
  className,
}: {
  message: string;
  onSkip: () => void;
  onAddAgain: () => void;
  className?: string;
}) {
  return (
    <TermFrame label="duplicate.detected" className={clsx('w-full shrink-0', className)}>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
        <p className="min-w-0 flex-1 font-mono text-[11px] normal-case leading-snug text-muted-foreground">
          {message}
        </p>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button type="button" onClick={onSkip} className={clsx(WORKSPACE_TOOLBAR_BTN, 'flex-1 sm:flex-none')}>
            Skip
          </button>
          <button
            type="button"
            onClick={onAddAgain}
            className={clsx(WORKSPACE_TOOLBAR_BTN_PRIMARY, 'flex-1 sm:flex-none')}
          >
            Add again
          </button>
        </div>
      </div>
    </TermFrame>
  );
}
