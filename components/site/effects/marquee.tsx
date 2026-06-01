import { cn } from '@/lib/utils';

type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: 'slow' | 'normal';
};

export function Marquee({ items, className, speed = 'normal' }: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        'marquee-mask relative overflow-hidden border-y border-border/40 bg-card/20 py-3',
        className
      )}
    >
      <div
        className={cn(
          'flex w-max gap-10 marquee-track',
          speed === 'slow' ? 'marquee-track-slow' : 'marquee-track-normal'
        )}
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground/80 whitespace-nowrap"
          >
            {item}
            <span className="h-1 w-1 rounded-full bg-violet-500/60" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
