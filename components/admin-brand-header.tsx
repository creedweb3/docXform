'use client';

import Link from 'next/link';
import { BrandLogoMark } from '@/components/brand-logo-mark';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminBrandHeaderProps {
  inboxPath: string;
  identityLabel: string;
  inboxActive?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}

export function AdminBrandHeader({
  inboxPath,
  identityLabel,
  inboxActive = false,
  showLogout = false,
  onLogout,
}: AdminBrandHeaderProps) {
  return (
    <div className="converter-main-card-blue rounded-2xl px-4 sm:px-5 py-3">
      <div className="flex flex-col gap-y-2 md:relative md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
          <div className="flex h-10 items-center gap-2.5 md:shrink-0">
            <div className="w-10 h-10 flex items-center justify-center" aria-hidden>
              <BrandLogoMark />
            </div>
            <div className="flex h-10 flex-col items-center justify-center gap-[5px] leading-none text-center -translate-y-px">
              <span className="block text-[20px] font-extrabold leading-[0.85] tracking-[-0.025em]" aria-label="docXform">
                <span className="text-slate-800">doc</span>
                <span className="text-[#2563eb] font-extrabold">X</span>
                <span className="text-slate-800">form</span>
              </span>
              <span className="block pl-[0.24em] text-center text-xs font-bold uppercase leading-[0.8] tracking-[0.24em] text-slate-500">
                Admin
              </span>
            </div>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open admin menu"
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/50 transition-colors"
                >
                  <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-52 glass-subtle border border-white/60 p-1"
              >
                <DropdownMenuItem asChild className="cursor-pointer p-0">
                  <Link
                    href={inboxPath}
                    className={`w-full rounded-md px-3 py-2 text-sm font-medium ${
                      inboxActive
                        ? 'bg-foreground/90 text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Inbox
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer p-0">
                  <Link
                    href="/"
                    className="w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Open Site
                  </Link>
                </DropdownMenuItem>
                {showLogout ? (
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      onLogout?.();
                    }}
                    className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={2} />
                    Logout
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p
          className="mx-auto w-full px-2 truncate text-sm sm:text-[15px] font-medium text-muted-foreground text-center md:absolute md:left-1/2 md:top-1/2 md:w-auto md:max-w-[38%] md:-translate-x-1/2 md:-translate-y-1/2"
          title={identityLabel}
        >
          {identityLabel}
        </p>

        <div className="hidden md:flex items-center justify-end gap-1.5 md:shrink-0">
          <Link
            href={inboxPath}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              inboxActive
                ? 'bg-foreground/90 text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/55'
            }`}
          >
            Inbox
          </Link>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/55 transition-colors whitespace-nowrap"
          >
            Open Site
          </Link>

          {showLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/55 transition-colors whitespace-nowrap"
            >
              <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={2} />
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
