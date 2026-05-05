'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/word-to-pdf', label: 'Word to PDF' },
  { href: '/pdf-to-word', label: 'PDF to Word' },
  { href: '/faq', label: 'FAQ' },
  { href: '/articles', label: 'Articles' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 overflow-visible pointer-events-none">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-5 pb-2 pointer-events-auto">
        <nav className="glass-navbar rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-4 gap-y-2 sm:gap-y-0">
          <Link href="/" className="flex h-10 items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/brand/docxform-logo-icon.png"
                alt="docXform logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
              />
            </div>
            <div className="flex h-10 flex-col items-center justify-center gap-[5px] leading-none text-center -translate-y-px">
              <span className="block text-[20px] font-extrabold leading-[0.85] tracking-[-0.025em]" aria-label="docXform">
                <span className="text-slate-800">doc</span>
                <span className="text-[#2563eb] font-extrabold">X</span>
                <span className="text-slate-800">form</span>
              </span>
              <span className="block pl-[0.24em] text-center text-[10.5px] font-bold uppercase leading-[0.8] tracking-[0.24em] text-slate-500">
                Converter
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex flex-nowrap items-center justify-end gap-x-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-foreground/90 text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/45'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
                >
                  <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 glass-subtle border border-white/60 p-1"
              >
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <DropdownMenuItem key={link.href} asChild className="cursor-pointer p-0">
                      <Link
                        href={link.href}
                        className={`w-full rounded-md px-3 py-2 text-sm font-medium ${
                          isActive
                            ? 'bg-foreground/90 text-background'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
}
