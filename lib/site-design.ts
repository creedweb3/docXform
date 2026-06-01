/** Workspace + catalog fragments (aligned with Imprint brand). */

import { BTN_PRIMARY, SHEET, SHEET_HOVER } from '@/lib/brand';

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
  'group flex items-center gap-3 sm:gap-4 px-4 py-3.5 sm:px-5 sm:py-4 transition-colors hover:bg-[hsl(var(--brand-copper)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.25)]';

export const STICKY_BAR =
  'sticky z-20 top-[calc(3.5rem+0.5rem)] rounded-sm border border-border bg-card/90 p-3 sm:p-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/85';
