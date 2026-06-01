import { cn } from '@/lib/utils';
import { surfaceClass } from '@/components/site/ui/surface';

type GradientBorderProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  variant?: 'default' | 'violet' | 'rose' | 'cyan';
};

/** Muted framed surface — name kept for API compat; no loud gradient ring. */
export function GradientBorder({
  children,
  className,
  innerClassName,
}: GradientBorderProps) {
  return (
    <div className={cn(surfaceClass(), className)}>
      <div className={cn('h-full', innerClassName)}>{children}</div>
    </div>
  );
}
