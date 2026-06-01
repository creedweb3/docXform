import { cn } from '@/lib/utils';

type BrandMarkSize = 'sm' | 'md' | 'lg' | 'hero';

const sizeClasses: Record<
  BrandMarkSize,
  { word: string; tagline: string; showTagline: boolean }
> = {
  sm: { word: 'text-lg leading-none', tagline: 'text-[9px]', showTagline: true },
  md: { word: 'text-2xl leading-none', tagline: 'text-[10px]', showTagline: true },
  lg: { word: 'text-4xl sm:text-5xl leading-[0.95]', tagline: 'text-xs', showTagline: false },
  hero: {
    word: 'text-[2.75rem] leading-[0.92] sm:text-7xl lg:text-[5.5rem] lg:leading-[0.9]',
    tagline: 'text-sm',
    showTagline: false,
  },
};

type BrandMarkProps = {
  size?: BrandMarkSize;
  className?: string;
  showTagline?: boolean;
  /** Stack doc / X / form on separate lines (editorial hero). */
  stacked?: boolean;
};

export function BrandMark({
  size = 'md',
  className,
  showTagline,
  stacked = false,
}: BrandMarkProps) {
  const config = sizeClasses[size];
  const displayTagline = showTagline ?? config.showTagline;

  const wordmark = (
    <span className={cn('font-display font-bold tracking-[-0.04em]', config.word)}>
      {stacked ? (
        <>
          <span className="block text-foreground">doc</span>
          <span className="block text-brand-blue">X</span>
          <span className="block text-foreground">form</span>
        </>
      ) : (
        <>
          <span className="text-foreground">doc</span>
          <span className="text-brand-blue">X</span>
          <span className="text-foreground">form</span>
        </>
      )}
    </span>
  );

  return (
    <span
      className={cn(
        'inline-flex flex-col leading-none',
        stacked ? 'items-center text-center' : 'items-start',
        className
      )}
      aria-label="docXform"
    >
      {wordmark}
      {displayTagline ? (
        <span
          className={cn(
            'mt-1.5 font-semibold uppercase tracking-[0.32em] text-muted-foreground',
            config.tagline
          )}
        >
          Converter
        </span>
      ) : null}
    </span>
  );
}
