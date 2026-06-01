import { SiteShell } from '@/components/site/site-shell';
import { HackerPage, HackerPageBody } from '@/components/site/console/console-ui';

type ContentPageProps = {
  title: string;
  description?: string;
  path?: string;
  children: React.ReactNode;
};

export function ContentPage({ title, description, path = '/legal', children }: ContentPageProps) {
  return (
    <SiteShell>
      <HackerPage path={path} title={title} description={description} separatorAfter />
      <HackerPageBody>
        <div className="prose prose-invert prose-sm max-w-none text-foreground/90 [&_a]:text-[hsl(var(--brand-copper))] [&_h2]:font-display [&_h2]:text-foreground">
          {children}
        </div>
      </HackerPageBody>
    </SiteShell>
  );
}
