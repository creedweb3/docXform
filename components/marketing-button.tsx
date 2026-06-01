import Link from 'next/link';
import { cn } from '@/lib/utils';

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-outline',
  ghost: 'text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors',
} as const;

type MarketingButtonVariant = keyof typeof variantClasses;

type MarketingButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: MarketingButtonVariant;
  className?: string;
  scroll?: boolean;
};

export function MarketingButton({
  href,
  children,
  variant = 'primary',
  className,
  scroll = false,
}: MarketingButtonProps) {
  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(
        variantClasses[variant],
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
    >
      {children}
    </Link>
  );
}
