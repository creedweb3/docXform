'use client';

import type { ConversionFlowStage } from '@/lib/conversion-flow';
import { TermBadge } from '@/components/site/console/console-ui';
import { cn } from '@/lib/utils';

const STAGES: { id: ConversionFlowStage; label: string }[] = [
  { id: 'pick', label: 'pick' },
  { id: 'studio', label: 'studio' },
  { id: 'output', label: 'output' },
];

export function ConversionFlowStageRail({
  stage,
  className,
  variant = 'default',
}: {
  stage: ConversionFlowStage;
  className?: string;
  /** `bar` — compact pills for the terminal path row. */
  variant?: 'default' | 'bar';
}) {
  const compact = variant === 'bar';

  return (
    <nav
      aria-label="Conversion flow"
      className={cn('flex flex-wrap items-center', compact ? 'gap-1.5' : 'gap-2', className)}
    >
      {STAGES.map((item, index) => {
        const active = item.id === stage;
        const done =
          (item.id === 'pick' && (stage === 'studio' || stage === 'output')) ||
          (item.id === 'studio' && stage === 'output');
        return (
          <span key={item.id} className={cn('inline-flex items-center', compact ? 'gap-1.5' : 'gap-2')}>
            {index > 0 ? (
              <span
                className={cn(
                  'font-mono text-muted-foreground/50',
                  compact ? 'text-[9px]' : 'text-[10px]'
                )}
                aria-hidden
              >
                →
              </span>
            ) : null}
            <span
              className={cn(
                !active && !done && 'opacity-40',
                done && !active && 'opacity-85'
              )}
            >
              <TermBadge tone={active || done ? 'ok' : 'neutral'}>{item.label}</TermBadge>
            </span>
          </span>
        );
      })}
    </nav>
  );
}
