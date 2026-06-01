import { SiteFooter } from '@/components/site/site-footer';
import CreativeEngine, { type CreativeBootMode } from '@/components/creative/CreativeEngine';
import { CreativeNav } from '@/components/creative/CreativeNav';
import { MarketingBackdrop } from '@/components/site/marketing-backdrop';
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
          <main className={cn(plain ? 'marketing-main pt-14' : 'pt-14')}>{children}</main>
          <SiteFooter />
        </div>
      </div>
    </CreativeEngine>
  );
}
