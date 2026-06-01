import { cn } from '@/lib/utils';

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 h-px bg-border/80', className)} aria-hidden />;
}
