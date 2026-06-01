import { Eyebrow } from '@/components/site/ui/eyebrow';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Container } from '@/components/site/ui/container';
import { cn } from '@/lib/utils';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: PageHeroProps) {
  const centered = align === 'center';

  return (
    <section className={cn('pt-10 pb-10 sm:pt-12 sm:pb-12 border-b border-border', className)}>
      <Container size="lg" className={cn(centered && 'text-center')}>
        <BrandRule className={cn('mb-5', centered && 'mx-auto')} />
        {eyebrow ? (
          <Eyebrow className={cn('mb-3', centered && 'mx-auto w-fit')}>{eyebrow}</Eyebrow>
        ) : null}
        <h1
          className={cn(
            'font-display text-[1.85rem] sm:text-[2.35rem] font-semibold tracking-[-0.02em] text-foreground text-balance leading-[1.1]',
            centered && 'mx-auto max-w-3xl'
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              'mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-2xl',
              centered && 'mx-auto'
            )}
          >
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
