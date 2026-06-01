'use client';

import clsx from 'clsx';
import { formatBytes } from '@/lib/client-file-validation';
import type { WorkspaceSurfaceApi } from '@/components/tools/tool-workspace';
import { FlowBatchPreview } from '@/components/tools/studio/flow-batch-preview';
import {
  STUDIO_CARD,
  STUDIO_CARD_DRAG,
  STUDIO_CARD_INNER,
  STUDIO_INDEX_BADGE,
  STUDIO_LABEL,
  STUDIO_THUMB_AREA,
} from '@/components/tools/studio/studio-theme';

/**
 * Fallback “stage” when a tool does not pass a custom `studioSurface`.
 */
export function DefaultBatchStudioSurface({ api }: { api: WorkspaceSurfaceApi }) {
  const {
    files,
    busy,
    draggedFileId,
    setDraggedFileId,
    reorderFilesInQueue,
    config,
    focusedFileId,
    setFocusedFileId,
    inFlowStudio,
    flowDuplicateBanner,
  } = api;
  const isReorderable = config.allowMultiple && files.length > 1 && !busy;
  const title = config.studioStageTitle ?? 'Your files';

  if (inFlowStudio) {
    return (
      <FlowBatchPreview
        title={title}
        topBanner={flowDuplicateBanner}
        items={files.map((item, index) => ({
          id: item.id,
          name: item.file.name,
          index,
          thumbUrl: item.preview?.status === 'ready' ? item.preview.thumbUrl : null,
          thumbLoading: item.preview?.status === 'loading',
          meta: formatBytes(item.file.size),
        }))}
        iconBoxClass={config.iconBoxClass}
        iconClass={config.iconClass}
        showIndex={config.allowMultiple && files.length > 1}
        selectedId={focusedFileId}
        onSelect={setFocusedFileId}
        draggable={isReorderable}
        draggingId={draggedFileId}
        onReorderDrop={isReorderable ? reorderFilesInQueue : undefined}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className={STUDIO_LABEL}>{title}</p>
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
              STUDIO_CARD,
              'w-[min(100%,11rem)] shrink-0',
              draggedFileId === item.id && 'opacity-50',
              isReorderable && STUDIO_CARD_DRAG
            )}
          >
            <div className={STUDIO_THUMB_AREA}>
              {item.preview?.status === 'ready' && item.preview.thumbUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.preview.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center font-mono text-[10px] text-muted-foreground">
                  {item.preview?.status === 'loading' ? 'Preview…' : 'Preview'}
                </div>
              )}
              {config.allowMultiple && files.length > 1 ? (
                <span className={STUDIO_INDEX_BADGE}>{index + 1}</span>
              ) : null}
            </div>
            <div className={clsx(STUDIO_CARD_INNER, 'px-2 py-2')}>
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
