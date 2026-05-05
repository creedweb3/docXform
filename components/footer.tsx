import Link from 'next/link';

const footerLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/articles', label: 'Articles' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white/40 backdrop-blur-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-max flex items-center justify-between gap-6 text-xs sm:text-sm">
            <nav className="flex items-center gap-x-4 sm:gap-x-5 text-muted-foreground whitespace-nowrap">
              {footerLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:text-foreground transition-colors shrink-0"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <p className="text-muted-foreground/75 whitespace-nowrap">
              &copy; {new Date().getFullYear()} docXform &middot; All processing in your browser
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
