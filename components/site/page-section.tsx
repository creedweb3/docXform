import { Container } from '@/components/site/ui/container';
import { ContentRule } from '@/components/site/ui/content-rule';
import { SECTION_OVERLAP, SECTION_PY } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

type PageSectionProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  narrow?: boolean;
  /**
   * Line before content — prefer {@link ZoneSeparator} between sections so spacing stays
   * split half/half; this only adds an in-band rule with modest gap below it.
   */
  separated?: boolean;
};

export function PageSection({
  children,
  className,
  containerClassName,
  narrow = false,
  separated = false,
}: PageSectionProps) {
  return (
    <section className={cn(SECTION_PY, SECTION_OVERLAP, className)} data-marketing-zone="section">
      <Container size={narrow ? 'md' : 'lg'} className={containerClassName}>
        {separated ? <ContentRule className="mb-6 sm:mb-8" /> : null}
        {children}
      </Container>
    </section>
  );
}
