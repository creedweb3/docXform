import Link from 'next/link';
import { BrandLogo } from '@/components/site/brand-logo';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { ZONE_FOOTER_INNER, ZONE_GAP_BEFORE } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/word-to-pdf', label: 'Word to PDF' },
      { href: '/pdf-to-word', label: 'PDF to Word' },
      { href: '/tools', label: 'All tools' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/articles', label: 'Articles' },
      { href: '/faq', label: 'FAQ' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/cookies', label: 'Cookies' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={cn('relative', ZONE_GAP_BEFORE)} data-marketing-zone="footer">
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8 lg:px-10">
        <div className={ZONE_FOOTER_INNER}>
          <BrandRule className="mb-8" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <BrandLogo size="lg" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Browser-native document conversion. Imprint keeps processing on your device.
              </p>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <p className="label-mono">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-12 pt-2 font-mono text-[10px] text-muted-foreground">
            © {year} docXform · imprint system
          </p>
        </div>
      </div>
    </footer>
  );
}
