import { cn } from '@/lib/utils';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Eyebrow } from '@/components/site/ui/eyebrow';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div className={cn(centered && 'text-center', className)}>
      <BrandRule className={cn('mb-5', centered && 'mx-auto')} />
      {eyebrow ? (
        <Eyebrow className={cn('mb-3', centered && 'mx-auto w-fit')}>{eyebrow}</Eyebrow>
      ) : null}
      <h2
        className={cn(
          'font-display text-[1.65rem] sm:text-[2rem] font-semibold tracking-[-0.02em] text-foreground text-balance max-w-3xl leading-[1.12]',
          centered && 'mx-auto'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-[15px] text-muted-foreground leading-[1.65] max-w-2xl',
            centered && 'mx-auto',
            !centered && 'max-w-xl'
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
