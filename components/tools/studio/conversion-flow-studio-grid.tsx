'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { STUDIO_FLOW_GRID } from '@/components/tools/studio/studio-theme';

/**
 * Shared 70/30 flow-studio shell: preview (left) + queue/settings rail (right).
 * Used by {@link ToolWorkspace} and flagship {@link DocumentConverter}.
 */
export function ConversionFlowStudioGrid({
  preview,
  aside,
  className,
}: {
  preview: ReactNode;
  aside: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'tool-workspace tool-workspace--studio tool-workspace--flow-studio relative z-0 flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent p-0',
        className
      )}
    >
      <div className={clsx(STUDIO_FLOW_GRID, 'min-h-0 flex-1')}>
        <div className="mobile-preview-shell relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-[hsl(var(--brand-copper)/0.12)] bg-[#080808] p-4 sm:p-5">
          {preview}
        </div>
        <aside className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#080808] px-4 py-4 sm:px-5 sm:py-5">
          {aside}
        </aside>
      </div>
    </div>
  );
}
