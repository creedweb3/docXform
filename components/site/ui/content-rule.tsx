import { CONTENT_RULE } from '@/lib/brand';

import { cn } from '@/lib/utils';



type ContentRuleProps = {

  className?: string;

};



/** Full-column hairline — use via {@link ZoneSeparator} between zones, or in-section when `separated`. */

export function ContentRule({ className }: ContentRuleProps) {

  return <hr className={cn(CONTENT_RULE, className)} aria-hidden />;

}

