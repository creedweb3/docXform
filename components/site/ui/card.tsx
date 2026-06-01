import { Sheet } from '@/components/site/ui/sheet';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

/** Maps to Imprint {@link Sheet} — kept for existing imports. */
export function Card({ children, className, hover, elevated, padding = 'md' }: CardProps) {
  return (
    <Sheet hover={hover || elevated} className={className} padding={padding}>
      {children}
    </Sheet>
  );
}
