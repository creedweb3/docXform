import { SiteShell } from '@/components/site/site-shell';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/site/ui/container';

type ContentPageProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function ContentPage({ title, description, eyebrow, children }: ContentPageProps) {
  return (
    <SiteShell>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="pb-20">
        <Container size="md">
          <div className="prose-site text-sm sm:text-base text-muted-foreground leading-relaxed space-y-4">
            {children}
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
