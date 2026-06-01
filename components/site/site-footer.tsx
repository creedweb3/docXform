import Link from 'next/link';
import { BrandLogo } from '@/components/site/brand-logo';
import { BrandRule } from '@/components/site/ui/brand-rule';

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
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-[76rem] px-4 py-14 sm:px-6 lg:px-8">
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

        <p className="mt-12 border-t border-border pt-6 font-mono text-[10px] text-muted-foreground">
          © {year} docXform · imprint system
        </p>
      </div>
    </footer>
  );
}
