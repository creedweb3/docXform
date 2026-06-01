import { Container } from '@/components/site/ui/container';
import { SECTION_OVERLAP, SECTION_PY } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

type PageSectionProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  narrow?: boolean;
  /** Top border for closing bands (CTA, footer-adjacent). */
  separated?: boolean;
};

/** Marketing section with shared vertical rhythm and content width. */
export function PageSection({
  children,
  className,
  containerClassName,
  narrow = false,
  separated = false,
}: PageSectionProps) {
  return (
    <section
      className={cn(SECTION_PY, SECTION_OVERLAP, separated && 'border-t border-border', className)}
    >
      <Container size={narrow ? 'md' : 'lg'} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
