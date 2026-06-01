import { ContentRule } from '@/components/site/ui/content-rule';
import { CONTENT_MAX } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

type ZoneSeparatorProps = {
  className?: string;
};

/**
 * Full-width rule between regions. Vertical space is symmetric via
 * `.marketing-zone-separator` in globals.css (half gap above + half below the line).
 */
export function ZoneSeparator({ className }: ZoneSeparatorProps) {
  return (
    <div
      className={cn('marketing-zone-separator w-full', className)}
      data-marketing-separator
      aria-hidden
    >
      <div className={cn('mx-auto w-full px-4 sm:px-6', CONTENT_MAX)}>
        <ContentRule />
      </div>
    </div>
  );
}
