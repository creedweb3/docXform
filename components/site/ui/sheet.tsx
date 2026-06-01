import { cn } from '@/lib/utils';

type SheetProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  inset?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/** Imprint brand card — flat paper sheet, copper hover edge. */
export function Sheet({ children, className, hover, inset, padding = 'md' }: SheetProps) {
  return (
    <div
      className={cn(
        inset ? 'sheet-inset' : hover ? 'sheet-hover' : 'sheet',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
