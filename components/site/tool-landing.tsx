import { Eyebrow } from '@/components/site/ui/eyebrow';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Container } from '@/components/site/ui/container';
import { Sheet } from '@/components/site/ui/sheet';

type ToolLandingHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  accent?: 'blue' | 'rose';
};

export function ToolLandingHero({ eyebrow, title, description }: ToolLandingHeroProps) {
  return (
    <section className="border-b border-border pt-8 pb-8 sm:pt-10 sm:pb-10">
      <Container size="lg" className="text-center">
        <BrandRule className="mx-auto mb-5" />
        <Eyebrow className="mx-auto mb-3 w-fit">{eyebrow}</Eyebrow>
        <h1 className="font-display text-[1.75rem] sm:text-[2.15rem] font-semibold tracking-[-0.02em] text-foreground leading-[1.12] text-balance">
          {title}
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      </Container>
    </section>
  );
}

export function ToolLandingStatGrid({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>;
}

export function ToolLandingStat({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Sheet padding="md" className="text-center">
      <div className="mx-auto mb-2.5 flex justify-center text-muted-foreground">{icon}</div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{subtitle}</p>
    </Sheet>
  );
}

export function ToolLandingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="label-mono mb-6 text-center">{title}</h2>
      {children}
    </section>
  );
}
