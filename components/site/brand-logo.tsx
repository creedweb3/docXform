import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  /** text-sm | text-lg etc. */
  size?: 'sm' | 'md' | 'lg';
};

const sizeClass = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl sm:text-2xl',
};

export function BrandLogo({ className, size = 'md' }: BrandLogoProps) {
  return (
    <span className={cn('font-display font-semibold tracking-tight text-foreground', sizeClass[size], className)}>
      doc<span className="brand-x">X</span>form
    </span>
  );
}
