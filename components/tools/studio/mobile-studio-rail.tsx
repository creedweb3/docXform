'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { TONE_STYLES, type ToneKey } from '@/components/tools/tone-styles';

type MobileStudioRailProps = {
  title?: string;
  children: ReactNode;
  sheetFooter?: ReactNode;
  /** Split / download CTAs pinned to the bottom of the slide-in panel. */
  actions?: ReactNode;
  /** Tool tone for FAB + header accent (phones only). */
  tone?: ToneKey;
};

/**
 * Phone: settings slide in from the right; tone FAB when closed, close in panel header when open.
 * Tablet/desktop: sidebar in ToolWorkspace (this component renders nothing visible).
 */
export function MobileStudioRail({
  title = 'Settings',
  children,
  sheetFooter,
  actions,
  tone = 'rose',
}: MobileStudioRailProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const toneStyle = TONE_STYLES[tone];

  useEffect(() => {
    if (open) {
      document.documentElement.dataset.mobileRailOpen = 'true';
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
        delete document.documentElement.dataset.mobileRailOpen;
      };
    }
    delete document.documentElement.dataset.mobileRailOpen;
  }, [open]);

  return (
    <div className="md:hidden">
      {open ? (
        <button
          type="button"
          aria-label="Close settings"
          className="mobile-sheet-scrim fixed inset-0 z-40"
          onClick={close}
        />
      ) : null}

      {!open ? (
        <button
          type="button"
          aria-label={`Open ${title}`}
          aria-expanded={false}
          onClick={() => setOpen(true)}
          className={clsx(
            'fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full',
            'shadow-md transition active:scale-[0.97]',
            toneStyle.primaryButton
          )}
        >
          <HugeiconsIcon icon={Settings02Icon} size={22} strokeWidth={2} aria-hidden />
        </button>
      ) : null}

      {open ? (
      <aside
        className={clsx(
          'mobile-rail-panel studio-shell-panel fixed z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-sm border shadow-[-8px_0_32px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out',
          'right-3 top-[max(0.75rem,env(safe-area-inset-top,0px))] bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
          'translate-x-0'
        )}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        <div className="studio-shell-panel flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <p className="min-w-0 flex-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            {title}
          </p>
          <button
            type="button"
            aria-label="Close settings"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="studio-shell-panel flex min-h-0 flex-1 flex-col">
          <div className="mobile-rail-panel__body min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 [scrollbar-gutter:auto]">
            {children}
            {sheetFooter ? <div className="mt-4 shrink-0">{sheetFooter}</div> : null}
          </div>
          {actions ? (
            <div className="studio-shell-panel shrink-0 border-t px-4 py-3 pb-safe">
              {actions}
            </div>
          ) : null}
        </div>
      </aside>
      ) : null}
    </div>
  );
}
