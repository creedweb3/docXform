'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { STUDIO_LABEL } from '@/components/tools/studio/studio-theme';
import type { DuplicateIntakeContent } from '@/lib/queue-duplicate-keys';
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
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[hsl(var(--brand-copper)/0.12)] pb-2">
      <div className="min-w-0 py-0.5">
        <p className={STUDIO_LABEL}>{title}</p>
        {meta ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{meta}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
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

/** Duplicate-file banner — studio panel (matches flow output). */
export function StudioFlowDuplicatePrompt({
  content,
  onSkip,
  onAddAgain,
  className,
}: {
  content: DuplicateIntakeContent;
  onSkip: () => void;
  onAddAgain: () => void;
  className?: string;
}) {
  const hasNames = Boolean(content.names?.length);

  return (
    <section
      className={clsx(
        'studio-shell-panel w-full shrink-0 rounded-sm border px-3 sm:px-3.5',
        hasNames ? 'py-2.5 sm:py-3' : 'py-2',
        className
      )}
    >
      <div
        className={clsx(
          'flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-3',
          'sm:items-center'
        )}
      >
        <div className={clsx('min-w-0 flex-1', hasNames && 'space-y-1')}>
          <p className={clsx(STUDIO_LABEL, 'mb-1 text-[hsl(var(--brand-copper))]')}>duplicate.detected</p>
          <p className="font-mono text-[11px] leading-snug text-white/90">{content.headline}</p>
          {content.names?.map((name, index) => (
            <p
              key={`${name}-${index}`}
              className="truncate font-mono text-[11px] leading-snug text-foreground/85"
              title={name}
            >
              {name}
            </p>
          ))}
        </div>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto sm:self-center">
          <button
            type="button"
            onClick={onSkip}
            className={clsx(WORKSPACE_TOOLBAR_BTN, 'flex-1 sm:flex-none !h-8 !min-h-8')}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onAddAgain}
            className={clsx(WORKSPACE_TOOLBAR_BTN_PRIMARY, 'flex-1 sm:flex-none !h-8 !min-h-8')}
          >
            Add again
          </button>
        </div>
      </div>
    </section>
  );
}

/** Confirm removing queued duplicate copies — blocking modal (header or Dupe badge). */
export function StudioFlowDupeRemoveConfirm({
  open,
  count,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dupe-remove-modal"
          className="fixed inset-0 z-[150]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-hidden={false}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 top-14 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="dupe-remove-title"
              aria-describedby="dupe-remove-desc"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={clsx(
                'relative z-[1] w-full max-w-lg rounded-sm border border-amber-500/35',
                'bg-[#080808] px-6 py-7 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.95)] sm:px-8 sm:py-8'
              )}
            >
            <p
              id="dupe-remove-title"
              className={clsx(STUDIO_LABEL, 'mb-3 text-[11px] tracking-[0.18em] text-amber-200/95')}
            >
              duplicate.copies
            </p>
            <p
              id="dupe-remove-desc"
              className="mb-6 max-w-[28rem] font-mono text-sm normal-case leading-relaxed text-foreground/90 sm:text-[15px]"
            >
              Would you like to remove all {count} duplicate {count === 1 ? 'copy' : 'copies'}?
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={onCancel}
                autoFocus
                className={clsx(WORKSPACE_TOOLBAR_BTN, 'h-10 flex-1 text-[10px] sm:h-11')}
              >
                Keep
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={clsx(
                  WORKSPACE_TOOLBAR_BTN,
                  'h-10 flex-1 text-[10px] sm:h-11',
                  'border-amber-500/40 text-amber-100 hover:border-amber-500/55 hover:bg-amber-500/15 hover:text-amber-50'
                )}
              >
                Remove dupes
              </button>
            </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
