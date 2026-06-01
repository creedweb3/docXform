import { cn } from '@/lib/utils';

export function BrandRule({ className }: { className?: string }) {
  return <div className={cn('brand-rule', className)} aria-hidden />;
}
