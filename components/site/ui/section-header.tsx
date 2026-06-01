import { cn } from '@/lib/utils';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Eyebrow } from '@/components/site/ui/eyebrow';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  /** Copper hairline above the eyebrow (hero / page title only). */
  showRule?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  showRule = false,
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <header className={cn(centered && 'text-center', className)}>
      {showRule ? <BrandRule className={cn('mb-5', centered && 'mx-auto')} /> : null}
      {eyebrow ? (
        <Eyebrow className={cn(showRule ? 'mb-3' : 'mb-2.5', centered && 'mx-auto w-fit')}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2 className={cn('type-section-title max-w-2xl', centered && 'mx-auto')}>{title}</h2>
      {description ? (
        <p className={cn('type-lead mt-4 max-w-xl', centered && 'mx-auto')}>{description}</p>
      ) : null}
    </header>
  );
}
