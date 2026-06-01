import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/lib/brand';

const variants = {
  primary: BTN_PRIMARY,
  accent: 'bg-[hsl(var(--brand-copper)/0.12)] text-foreground border border-[hsl(var(--brand-copper)/0.3)] hover:bg-[hsl(var(--brand-copper)/0.18)]',
  secondary: BTN_SECONDARY,
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]',
  outline: 'border border-border text-foreground hover:border-[hsl(var(--brand-copper)/0.35)] hover:bg-[hsl(var(--brand-copper)/0.06)]',
  gradient: BTN_PRIMARY,
} as const;

const sizes = {
  sm: 'h-9 px-4 text-xs rounded-sm',
  md: 'h-10 px-5 text-sm rounded-sm',
  lg: 'h-11 px-6 text-sm rounded-sm',
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  scroll?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  scroll = false,
  type = 'button',
  onClick,
}: ButtonProps) {
  const resolved = variant === 'gradient' ? 'primary' : variant;
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    variants[resolved],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} scroll={scroll} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
