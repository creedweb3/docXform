import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { MarketingBackdrop } from '@/components/site/marketing-backdrop';
import { cn } from '@/lib/utils';

type SiteShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Converter/tool pages — flat background, no particles. */
  plain?: boolean;
};

export function SiteShell({ children, className, plain }: SiteShellProps) {
  return (
    <div className={cn('marketing-shell', className)}>
      {!plain ? <MarketingBackdrop /> : null}
      <div className="marketing-frame">
        <SiteHeader />
        <main className="marketing-main">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
