import { cn } from '@/lib/utils';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
};

export function Badge({ children, className, dot, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-border/80 bg-card/30 px-2.5 py-1',
        'text-[11px] font-medium tracking-wide text-muted-foreground',
        className
      )}
    >
      {dot ? (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full bg-emerald-500/80',
            pulse && 'animate-pulse'
          )}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
