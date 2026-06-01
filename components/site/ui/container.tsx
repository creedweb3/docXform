import { cn } from '@/lib/utils';
import { CONTENT_MAX } from '@/lib/marketing-layout';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: 'md' | 'lg' | 'xl' | 'full';
};

const sizeMap = {
  md: 'max-w-3xl',
  lg: CONTENT_MAX,
  xl: 'max-w-6xl',
  full: CONTENT_MAX,
};

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 sm:px-8 lg:px-10',
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  );
}
