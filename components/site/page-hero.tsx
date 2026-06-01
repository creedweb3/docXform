import { Eyebrow } from '@/components/site/ui/eyebrow';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Container } from '@/components/site/ui/container';
import { CreativeReveal } from '@/components/creative/CreativeReveal';
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
    <section className={cn('border-b border-border/80 pt-16 pb-12 sm:pt-20 sm:pb-14', className)}>
      <Container size="lg" className={cn(centered && 'text-center')}>
        <CreativeReveal>
          <BrandRule className={cn('mb-5', centered && 'mx-auto')} />
          {eyebrow ? (
            <Eyebrow className={cn('mb-3', centered && 'mx-auto w-fit')}>{eyebrow}</Eyebrow>
          ) : null}
          <h1 className={cn('kinetic-headline', centered && 'mx-auto max-w-3xl')}>{title}</h1>
          {description ? (
            <p className={cn('type-lead mt-5 max-w-2xl', centered && 'mx-auto')}>{description}</p>
          ) : null}
        </CreativeReveal>
      </Container>
    </section>
  );
}
