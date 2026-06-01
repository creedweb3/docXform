'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { BrandLogo } from '@/components/site/brand-logo';
import { Button } from '@/components/site/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '/tools', label: 'Tools' },
  { href: '/faq', label: 'FAQ' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About' },
];

const FLAGSHIP = ['/word-to-pdf', '/pdf-to-word'] as const;

function isActive(pathname: string, href: string) {
  if (href === '/tools') {
    return (
      pathname === '/tools' ||
      pathname.startsWith('/tools/') ||
      FLAGSHIP.some((p) => pathname === p)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200',
          scrolled ? 'border-border bg-background/85 backdrop-blur-sm' : 'border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-14 max-w-[72rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <Image
              src="/brand/docxform-logo-icon-64.webp"
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px]"
              priority
            />
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label="Main">
            <NavLink href="/" active={pathname === '/'}>
              Home
            </NavLink>
            {links.map((link) => (
              <NavLink key={link.href} href={link.href} active={isActive(pathname, link.href)}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <Button href="/pdf-to-word" variant="ghost" size="sm" className="hidden lg:inline-flex font-mono text-[11px]">
              PDF to Word
            </Button>
            <Button href="/word-to-pdf" variant="primary" size="sm">
              Word to PDF
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} size={18} strokeWidth={2} />
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-x-0 top-14 z-50 border-b border-border bg-background md:hidden">
          <div className="mx-auto max-w-[72rem] px-5 py-4 sm:px-8 lg:px-10">
            <nav className="sheet-inset divide-y divide-border overflow-hidden">
              <MobileLink href="/">Home</MobileLink>
              {links.map((link) => (
                <MobileLink key={link.href} href={link.href}>
                  {link.label}
                </MobileLink>
              ))}
            </nav>
            <div className="mt-4 flex gap-2">
              <Button href="/pdf-to-word" variant="outline" size="sm" className="flex-1 justify-center">
                PDF to Word
              </Button>
              <Button href="/word-to-pdf" variant="primary" size="sm" className="flex-1 justify-center">
                Word to PDF
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'interactive-trigger text-[13px] font-medium tracking-[-0.01em] transition-colors',
        active
          ? 'text-foreground underline decoration-[hsl(var(--brand-copper))] decoration-2 underline-offset-[6px]'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="interactive-trigger block px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-[hsl(var(--brand-copper)/0.05)] hover:text-foreground"
    >
      {children}
    </Link>
  );
}
