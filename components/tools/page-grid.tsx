'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle01Icon,
  RefreshIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import clsx from 'clsx';
import { WORKSPACE_SECONDARY_SURFACE } from '@/lib/site-design';

export type PageThumb = {
  id: string;
  pageNumber: number;
  thumbUrl?: string;
  status: 'loading' | 'ready' | 'error';
  error?: string;
};

export type PageGridProps = {
  toneClass: string;
  pages: PageThumb[];
  selected: Set<number>;
  onToggle(page: number): void;
  onSelectAll?(): void;
  onSelectNone?(): void;
  /** Optional reorder hook; when set, drag handles reorder items in the `pages` array. */
  reorderable?: boolean;
  /** Indices into the `pages` array (not PDF page numbers). */
  onReorder?(fromIndex: number, toIndex: number): void;
  compact?: boolean;
  onClose?: () => void;
};

const spring = { type: 'spring' as const, stiffness: 380, damping: 38, mass: 0.9 };

export function PageGrid({
  toneClass,
  pages,
  selected,
  onToggle,
  onSelectAll,
  onSelectNone,
  reorderable = false,
  onReorder,
  compact = false,
  onClose,
}: PageGridProps) {
  const [dense, setDense] = useState(compact);
  const [draggingFrom, setDraggingFrom] = useState<number | null>(null);
  const allSelected = useMemo(() => selected.size === pages.length, [selected.size, pages.length]);

  const handleDragStart = useCallback((index: number, event: React.DragEvent) => {
    setDraggingFrom(index);
    try {
      event.dataTransfer.setData('text/plain', String(index));
      event.dataTransfer.effectAllowed = 'move';
    } catch {
      /* ignore */
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingFrom(null);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (!reorderable) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, [reorderable]);

  const handleDropOn = useCallback(
    (toIndex: number) => (event: React.DragEvent) => {
      if (!reorderable) return;
      event.preventDefault();
      const raw = event.dataTransfer.getData('text/plain');
      const from = Number(raw);
      setDraggingFrom(null);
      if (!Number.isInteger(from) || from < 0 || from === toIndex) return;
      onReorder?.(from, toIndex);
    },
    [onReorder, reorderable]
  );

  const handleLabelDragStart = useCallback(
    (index: number, event: React.DragEvent) => {
      if (!reorderable) return;
      if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
        event.preventDefault();
        return;
      }
      handleDragStart(index, event);
    },
    [reorderable, handleDragStart]
  );

  const handleLabelDragEnd = useCallback(
    (event: React.DragEvent) => {
      if ((event.target as HTMLElement).closest('input[type="checkbox"]')) return;
      handleDragEnd();
    },
    [handleDragEnd]
  );

  useEffect(() => {
    // Keep grid density in sync when parent passes a new `compact` default.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- controlled default prop
    if (compact !== dense) setDense(compact);
  }, [compact, dense]);

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-card/40 p-3 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Pages</span>
          <span className="text-[11px] text-muted-foreground">{pages.length} page(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={clsx(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
              dense ? `${toneClass}` : `border-border/70 bg-card/30 text-muted-foreground hover:bg-card/55`
            )}
            onClick={() => setDense((v) => !v)}
          >
            {dense ? 'Grid' : 'Compact'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors ${WORKSPACE_SECONDARY_SURFACE}`}
              aria-label="Close page grid"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
        {onSelectAll && (
          <button
            type="button"
            onClick={onSelectAll}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${WORKSPACE_SECONDARY_SURFACE}`}
          >
            Select all
          </button>
        )}
        {onSelectNone && (
          <button
            type="button"
            onClick={onSelectNone}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${WORKSPACE_SECONDARY_SURFACE}`}
          >
            Clear
          </button>
        )}
        <span className="text-muted-foreground">
          {selected.size}/{pages.length} selected
        </span>
      </div>

      <div
        className={clsx(
          'grid gap-3',
          dense ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
        )}
      >
        <AnimatePresence>
          {pages.map((page, index) => {
            const isSelected = selected.has(page.pageNumber);
            return (
              <label
                key={page.id}
                draggable={reorderable}
                onDragStart={(e) => reorderable && handleLabelDragStart(index, e)}
                onDragEnd={(e) => handleLabelDragEnd(e)}
                onDragOver={handleDragOver}
                onDrop={reorderable ? handleDropOn(index) : undefined}
                className={clsx(
                  'group relative flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-2 transition-colors hover:border-foreground/12 hover:bg-card/55',
                  isSelected ? `${toneClass} border-opacity-80` : 'border-border/60',
                  reorderable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                  reorderable && draggingFrom === index && 'ring-2 ring-ring/50'
                )}
                title={reorderable ? 'Drag to reorder, or use the checkbox to include the page' : undefined}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(page.pageNumber)}
                  className="absolute left-2 top-2 h-4 w-4 accent-current"
                  aria-label={`Select page ${page.pageNumber}`}
                />
                <div
                  className={clsx(
                    'flex items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-card/50',
                    dense ? 'h-32' : 'h-40'
                  )}
                >
                  {page.status === 'ready' && page.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={page.thumbUrl} alt={`Page ${page.pageNumber}`} className="h-full w-full object-contain" />
                  ) : page.status === 'loading' ? (
                    <div className="h-full w-full animate-pulse rounded-lg bg-muted/50" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-rose-600">
                      {page.error || 'Preview failed'}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Page {page.pageNumber}</span>
                  {reorderable ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Drag card</span>
                  ) : null}
                </div>
                {isSelected && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={spring}
                    className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/90 px-2 py-1 text-[10px] font-semibold text-emerald-500"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} strokeWidth={2} />
                    Selected
                  </motion.span>
                )}
                {page.status === 'loading' && (
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/90 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    <HugeiconsIcon icon={RefreshIcon} size={12} strokeWidth={2} className="animate-spin" />
                    Loading
                  </span>
                )}
              </label>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
