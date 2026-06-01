import { cn } from '@/lib/utils';

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export function Eyebrow({ children, className }: EyebrowProps) {
  return <p className={cn('label-mono', className)}>{children}</p>;
}
