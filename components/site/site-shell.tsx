import { SiteFooter } from '@/components/site/site-footer';
import { ZoneSeparator } from '@/components/site/ui/zone-separator';
import CreativeEngine, { type CreativeBootMode } from '@/components/creative/CreativeEngine';
import { CreativeNav } from '@/components/creative/CreativeNav';
import { MarketingBackdrop } from '@/components/site/marketing-backdrop';
import { MARKETING_MAIN, MARKETING_PAGE } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

type SiteShellProps = {
  children: React.ReactNode;
  className?: string;
  plain?: boolean;
  boot?: CreativeBootMode;
};

export function SiteShell({ children, className, plain, boot }: SiteShellProps) {
  const bootMode: CreativeBootMode = boot ?? (plain ? 'off' : 'once');

  return (
    <CreativeEngine bootMode={bootMode} bootWord="DOCXFORM" layoutMode="flow">
      <div className={cn('marketing-shell relative min-h-screen bg-background text-foreground', className)}>
        {!plain ? <MarketingBackdrop /> : null}
        <CreativeNav floating />
        <div className="relative z-[2] mx-auto w-full max-w-[72rem] px-0">
          <main className={cn(MARKETING_MAIN, plain && 'marketing-main')}>
            <div className={MARKETING_PAGE}>
              {children}
              <ZoneSeparator />
              <SiteFooter />
            </div>
          </main>
        </div>
      </div>
    </CreativeEngine>
  );
}
