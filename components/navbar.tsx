'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/word-to-pdf', label: 'Word to PDF' },
  { href: '/pdf-to-word', label: 'PDF to Word' },
  { href: '/faq', label: 'FAQ' },
  { href: '/articles', label: 'Articles' },
];

function linkIsActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Current page: same charcoal as home hero (doc/form) — not full black. */
const navLinkActiveClass = 'font-semibold text-white bg-[#333333]';

export function Navbar() {
  const pathname = usePathname() || '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 overflow-visible pointer-events-none">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-5 pb-2 pointer-events-auto">
        <nav className="glass-navbar rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-4 gap-y-2 sm:gap-y-0">
          <Link href="/" className="flex min-h-12 items-center gap-2.5 shrink-0 py-1" aria-label="docXform home">
            <div className="w-10 h-10 flex shrink-0 items-center justify-center">
              <Image
                src="/brand/docxform-logo-icon-64.webp"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="flex h-10 flex-col items-center justify-center gap-[5px] leading-none text-center -translate-y-px">
              <span className="block text-[20px] font-extrabold leading-[0.85] tracking-[-0.025em]" aria-label="docXform">
                <span className="text-slate-800">doc</span>
                <span className="text-[#2563eb] font-extrabold">X</span>
                <span className="text-slate-800">form</span>
              </span>
              <span className="block pl-[0.24em] text-center text-xs font-bold uppercase leading-[0.8] tracking-[0.24em] text-slate-500">
                Converter
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex flex-nowrap items-center justify-end gap-x-1">
            {navLinks.map((link) => {
              const active = linkIsActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  scroll={false}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-12 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 whitespace-nowrap inline-flex items-center justify-center ${
                    active
                      ? navLinkActiveClass
                      : 'font-medium text-muted-foreground hover:text-foreground hover:bg-white/45'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="sm:hidden">
            <details className="relative">
              <summary className="inline-flex min-h-12 min-w-12 cursor-pointer list-none items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors">
                <span aria-hidden className="text-xl leading-none">☰</span>
                <span className="sr-only">Open navigation menu</span>
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-xl glass-subtle border border-white/60 p-1 shadow-lg">
                {navLinks.map((link) => {
                  const active = linkIsActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      scroll={false}
                      aria-current={active ? 'page' : undefined}
                      className={`block w-full rounded-md px-3 py-2 text-sm ${
                        active
                          ? navLinkActiveClass
                          : 'font-medium text-muted-foreground hover:text-foreground hover:bg-white/60'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          </div>
        </nav>
      </div>
    </header>
  );
}
