'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { StudioFlowPreviewHeader } from '@/components/tools/studio/studio-flow-chrome';
import { StudioScrollArea } from '@/components/tools/studio/studio-ui';
import {
  STUDIO_CARD,
  STUDIO_CARD_DRAG,
  STUDIO_CARD_INNER,
  STUDIO_EMPTY_STATE,
  STUDIO_INDEX_BADGE,
} from '@/components/tools/studio/studio-theme';

/** Batch grid cards: slightly shorter than {@link STUDIO_THUMB_AREA} (~15% total vs 3/4 + 4rem footer). */
const FLOW_BATCH_THUMB_AREA = 'studio-shell-thumb relative aspect-[7/8] w-full';
const FLOW_BATCH_CARD_FOOTER_H = 'h-[4rem]';

export type FlowBatchPreviewItem = {
  id: string;
  name: string;
  thumbUrl?: string | null;
  thumbLoading?: boolean;
  index?: number;
  meta?: string;
};

export function FlowBatchPreview({
  title = 'File preview',
  items,
  iconBoxClass = 'icon-box-orange',
  iconClass = 'text-orange-500',
  showIndex = true,
  selectedId,
  onSelect,
  draggable,
  onReorderDrop,
  draggingId,
  topBanner,
}: {
  title?: string;
  /** Full-width strip below the preview header (e.g. duplicate-file prompt). */
  topBanner?: ReactNode;
  items: FlowBatchPreviewItem[];
  iconBoxClass?: string;
  iconClass?: string;
  showIndex?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  draggable?: boolean;
  onReorderDrop?: (targetId: string) => void;
  draggingId?: string | null;
}) {
  const interactive = Boolean(onSelect);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3">
      <StudioFlowPreviewHeader title={title} />
      {topBanner ? <div className="w-full min-w-0 shrink-0">{topBanner}</div> : null}
      {items.length === 0 ? (
        <p className={clsx(STUDIO_EMPTY_STATE, 'flex-1')}>Add files to see them here.</p>
      ) : (
        <StudioScrollArea measureKey={items.length} className="min-h-0 flex-1 py-0.5">
          <div
            className={clsx(
              'box-border w-full min-w-0',
              items.length === 1
                ? 'grid grid-cols-1 justify-items-start'
                : 'grid w-full auto-rows-fr grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] items-stretch gap-2'
            )}
          >
            {items.map((item, index) => {
              const selected = selectedId === item.id;
              const isDragging = draggingId === item.id;
              return (
                <div
                  key={item.id}
                  draggable={draggable}
                  onDragStart={
                    draggable
                      ? (e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }
                      : undefined
                  }
                  onDragOver={draggable ? (e) => e.preventDefault() : undefined}
                  onDrop={
                    draggable && onReorderDrop
                      ? (e) => {
                          e.preventDefault();
                          onReorderDrop(item.id);
                        }
                      : undefined
                  }
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={interactive ? () => onSelect?.(item.id) : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect?.(item.id);
                          }
                        }
                      : undefined
                  }
                  className={clsx(
                    STUDIO_CARD,
                    'flex h-full min-h-0 min-w-0 overflow-visible outline-none transition',
                    items.length === 1 ? 'w-full max-w-[12rem]' : 'w-full',
                    draggable && STUDIO_CARD_DRAG,
                    isDragging && 'opacity-50',
                    interactive && 'cursor-pointer hover:border-[hsl(var(--brand-copper)/0.28)]',
                    selected &&
                      'border-solid border-[hsl(var(--brand-copper)/0.45)] bg-[hsl(var(--brand-copper)/0.06)] shadow-[0_0_20px_-8px_hsl(var(--brand-copper)/0.35)]'
                  )}
                >
                  <div className={clsx(FLOW_BATCH_THUMB_AREA, 'shrink-0 overflow-hidden rounded-t-sm')}>
                    {item.thumbUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center">
                        {item.thumbLoading ? (
                          <span className="animate-pulse font-mono text-[10px] text-muted-foreground">Preview…</span>
                        ) : (
                          <>
                            <div
                              className={clsx(
                                'flex h-9 w-9 items-center justify-center rounded-sm border border-[hsl(var(--brand-copper)/0.2)]',
                                iconBoxClass
                              )}
                            >
                              <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.75} className={iconClass} />
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                              {item.name.split('.').pop() ?? 'file'}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {showIndex && items.length > 1 ? (
                      <span className={STUDIO_INDEX_BADGE}>{(item.index ?? index) + 1}</span>
                    ) : null}
                  </div>
                  <div
                    className={clsx(
                      STUDIO_CARD_INNER,
                      FLOW_BATCH_CARD_FOOTER_H,
                      'flex shrink-0 flex-col items-center justify-center gap-1 px-2.5 py-2 text-center'
                    )}
                  >
                    <p
                      className="line-clamp-2 max-h-[2.375rem] w-full min-w-0 break-words text-center text-[11px] font-medium leading-snug text-foreground"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <p
                      className={clsx(
                        'h-[0.75rem] w-full min-w-0 truncate text-center font-mono text-[9px] uppercase leading-none tracking-wide text-muted-foreground',
                        !item.meta && 'invisible'
                      )}
                      aria-hidden={!item.meta}
                    >
                      {item.meta ?? '\u00a0'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </StudioScrollArea>
      )}
    </div>
  );
}
