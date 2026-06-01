'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/tools', label: 'Tools' },
  { href: '/word-to-pdf', label: 'Word to PDF' },
  { href: '/pdf-to-word', label: 'PDF to Word' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export function CreativeNav({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!floating) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [floating]);

  return (
    <header
      className={cn(
        'z-[100] flex items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10',
        floating
          ? cn(
              'fixed left-0 right-0 top-0 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200',
              scrolled
                ? 'border-b border-border/70 bg-background/85 shadow-[0_10px_40px_-16px_hsl(0_0%_0%/0.65)] backdrop-blur-md supports-[backdrop-filter]:bg-background/70'
                : 'border-b border-transparent bg-transparent'
            )
          : 'relative border-b border-exhibit-paper/10'
      )}
    >
      <Link
        href="/"
        className="interactive-trigger font-mono text-[10px] uppercase tracking-museum text-exhibit-paper"
        data-interactive-mode="view"
        data-cursor-label="HOME"
      >
        docXform
      </Link>
      <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'interactive-trigger font-mono text-[10px] uppercase tracking-[0.16em] transition-colors',
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? 'text-[hsl(var(--brand-copper))]'
                : 'text-exhibit-mute hover:text-exhibit-paper'
            )}
            data-interactive-mode="explore"
            data-cursor-label="OPEN"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/word-to-pdf"
        className="interactive-trigger rounded-sm border border-[hsl(var(--brand-copper)/0.4)] bg-[hsl(var(--brand-copper)/0.12)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-exhibit-paper"
        data-interactive-mode="view"
        data-cursor-label="RUN"
      >
        Convert
      </Link>
    </header>
  );
}
