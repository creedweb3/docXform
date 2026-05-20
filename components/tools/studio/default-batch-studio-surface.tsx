'use client';

import clsx from 'clsx';
import type { WorkspaceSurfaceApi } from '@/components/tools/tool-workspace';

/**
 * Fallback “stage” when a tool does not pass a custom `studioSurface`.
 * Matches merge-board card sizing so batch tools feel visually consistent.
 */
export function DefaultBatchStudioSurface({ api }: { api: WorkspaceSurfaceApi }) {
  const { files, busy, draggedFileId, setDraggedFileId, reorderFilesInQueue, config } = api;
  const isReorderable = config.allowMultiple && files.length > 1 && !busy;
  const title = config.studioStageTitle ?? 'Your files';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      </div>
      <div className="flex min-h-[200px] flex-1 flex-wrap content-start items-stretch justify-center gap-3 sm:justify-start">
        {files.map((item, index) => (
          <div
            key={item.id}
            draggable={isReorderable}
            onDragStart={() => isReorderable && setDraggedFileId(item.id)}
            onDragOver={(e) => isReorderable && e.preventDefault()}
            onDrop={() => isReorderable && reorderFilesInQueue(item.id)}
            onDragEnd={() => setDraggedFileId(null)}
            className={clsx(
              'flex w-[min(100%,11rem)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-white/70 shadow-sm transition',
              draggedFileId === item.id && 'opacity-50',
              isReorderable && 'cursor-grab active:cursor-grabbing hover:border-border'
            )}
          >
            <div className="relative aspect-[3/4] w-full bg-muted/30">
              {item.preview?.status === 'ready' && item.preview.thumbUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.preview.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                  {item.preview?.status === 'loading' ? 'Preview…' : 'Preview'}
                </div>
              )}
              {config.allowMultiple && files.length > 1 ? (
                <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-xs font-bold text-white shadow">
                  {index + 1}
                </span>
              ) : null}
            </div>
            <div className="border-t border-border/40 px-2 py-2">
              <p className="truncate text-center text-[11px] font-medium text-foreground" title={item.file.name}>
                {item.file.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
