'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type HackerTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type TerminalMode = 'content' | 'product';
export type TerminalPresentation = 'page' | 'shell';

const PRODUCT_STATUS = ['UPLOADS=0', 'WASM=ready', 'NET=filtered'] as const;

type HackerTerminalProps = {
  path: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
  tabs?: HackerTab[];
  defaultTabId?: string;
  status?: string[];
  mode?: TerminalMode;
  presentation?: TerminalPresentation;
  className?: string;
  /** Product flows: terminal + body fill the parent viewport (flex chain). */
  fillHeight?: boolean;
  bodyClassName?: string;
  /** Product mode: bottom “local session” bar (off for studio). */
  showProductFooter?: boolean;
  /** Product page mode: right side of the path row (e.g. pick → studio → output). */
  topAccessory?: React.ReactNode;
};

const MAX_TABS = 2;

export function HackerTerminal({
  path,
  header,
  children,
  tabs,
  defaultTabId,
  status,
  mode = 'content',
  presentation = 'page',
  className,
  fillHeight = false,
  bodyClassName,
  showProductFooter: showProductFooterProp,
  topAccessory,
}: HackerTerminalProps) {
  const showProductFooter = showProductFooterProp ?? mode !== 'product';
  const visibleTabs = tabs?.slice(0, MAX_TABS) ?? [];
  const hasTabs = visibleTabs.length >= 2;
  const initialTab =
    defaultTabId && visibleTabs.some((tab) => tab.id === defaultTabId)
      ? defaultTabId
      : visibleTabs[0]?.id ?? 'main';
  const [active, setActive] = useState(initialTab);

  const activeContent = hasTabs
    ? visibleTabs.find((tab) => tab.id === active)?.content
    : visibleTabs[0]?.content ?? children;

  const statusLine =
    mode === 'product'
      ? [...PRODUCT_STATUS]
      : presentation === 'shell' && status && status.length > 0
        ? status
        : [];

  return (
    <div
      className={cn(
        'term-shell relative overflow-hidden',
        fillHeight && 'flex h-full min-h-0 flex-col',
        className
      )}
    >
      <div className="term-scanlines pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative border-b border-[hsl(var(--brand-copper)/0.2)] bg-[#080808] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">
        {presentation === 'page' ? (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 normal-case tracking-normal">
              <span className="text-muted-foreground">docxform</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="truncate text-[hsl(var(--brand-copper))]">{path.replace(/^\//, '')}</span>
            </div>
            {topAccessory ? <div className="shrink-0">{topAccessory}</div> : null}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[hsl(var(--brand-copper))]">docxform@local</span>
              <span className="text-muted-foreground">path:{path}</span>
            </div>
            {statusLine.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-2 text-[9px] tracking-[0.18em] text-muted-foreground">
                {statusLine.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      {header ? (
        <div className="relative space-y-3 border-b border-[hsl(var(--brand-copper)/0.12)] bg-[#080808] px-4 py-5 sm:px-6 sm:py-6">
          {header}
        </div>
      ) : null}

      {hasTabs ? (
        <div
          className="relative flex gap-0 border-b border-[hsl(var(--brand-copper)/0.15)] bg-[#070707] px-2 pt-2"
          role="tablist"
        >
          {visibleTabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'interactive-trigger -mb-px border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                  isActive
                    ? 'border-[hsl(var(--brand-copper)/0.45)] border-b-[#080808] bg-[#080808] text-[hsl(var(--brand-copper))]'
                    : 'border-transparent bg-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeContent ? (
        <div
          className={cn(
            'relative flex flex-col bg-[#080808]',
            fillHeight ? 'min-h-0 flex-1 gap-4 overflow-hidden p-4 sm:p-5' : 'p-5 sm:p-8',
            !fillHeight && (mode === 'product' ? 'gap-6' : 'gap-5'),
            bodyClassName
          )}
        >
          {activeContent}
        </div>
      ) : null}

      {mode === 'product' && showProductFooter ? (
        <div
          className="term-product-footer relative border-t border-[hsl(var(--brand-copper)/0.15)] bg-[#080808] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground"
          data-product-footer
        >
          <span className="text-[hsl(var(--brand-sage))]">■</span> local session
          <span className="mx-2 opacity-30">│</span>
          <span>no remote conversion socket</span>
        </div>
      ) : null}
    </div>
  );
}
