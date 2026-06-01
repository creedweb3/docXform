/** Workspace + catalog fragments (aligned with Imprint brand). */

import { BTN_PRIMARY, SHEET, SHEET_HOVER } from '@/lib/brand';

export { SECTION_PY, SECTION_BODY_GAP, SECTION_STACK, CATALOG_GROUP_GAP } from '@/lib/marketing-layout';

export const WORKSPACE_PRIMARY_CTA = BTN_PRIMARY;

export const WORKSPACE_SECONDARY_SURFACE =
  'border border-border/80 bg-card/60 text-foreground hover:border-[hsl(var(--brand-copper)/0.3)] hover:bg-card/80';

export const FILTER_PILL_BASE =
  'inline-flex shrink-0 h-8 items-center gap-1.5 rounded-sm px-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const FILTER_PILL_IDLE =
  `${FILTER_PILL_BASE} border border-border/80 bg-background/60 text-muted-foreground hover:text-foreground`;

export const FILTER_PILL_ACTIVE =
  `${FILTER_PILL_BASE} border-[hsl(var(--brand-copper)/0.45)] bg-[hsl(var(--brand-copper)/0.1)] text-foreground`;

export const SURFACE = SHEET;

export const SURFACE_HOVER = SHEET_HOVER;

export const CATALOG_ROW =
  'group relative flex min-h-[3.25rem] items-center gap-3 sm:gap-4 px-5 py-4 sm:px-6 sm:min-h-[3.5rem] transition-[background-color,box-shadow,color] duration-200 hover:bg-[hsl(var(--brand-copper)/0.08)] hover:shadow-[inset_3px_0_0_0_hsl(var(--brand-copper))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.25)]';

export const STICKY_BAR =
  'sticky z-20 top-[calc(3.5rem+0.5rem)] -mx-4 border-b border-border/80 bg-background/90 px-4 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8';
