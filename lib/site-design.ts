/** Workspace + catalog fragments (aligned with Imprint brand). */

import { BTN_PRIMARY, BTN_SECONDARY, SHEET, SHEET_HOVER } from '@/lib/brand';

export {
  SECTION_PY,
  SECTION_BODY_GAP,
  SECTION_TITLE_GAP,
  SECTION_STACK,
  BLOCK_STACK,
  BODY_BLOCK_STACK,
  TERM_MODULE_GRID,
  TERM_LIST_STACK,
  MARKETING_MAIN,
  MARKETING_PAGE,
  ZONE_BODY,
  ZONE_FOOTER_INNER,
  ZONE_GAP_AFTER,
  ZONE_GAP_BEFORE,
  ZONE_NAV_TOP,
  ZONE_TOP,
  CATALOG_GROUP_GAP,
} from '@/lib/marketing-layout';

export const WORKSPACE_PRIMARY_CTA = BTN_PRIMARY;

/** Same copper-outline secondary as marketing {@link Button} `outline` / `secondary`. */
export const WORKSPACE_SECONDARY_SURFACE = BTN_SECONDARY;

const WORKSPACE_CTA_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Full-width or flex CTAs in converter / tool studio (convert, download). */
export const WORKSPACE_CTA_BASE = [
  'interactive-trigger inline-flex min-h-12 min-w-0 select-none items-center justify-center gap-2 rounded-sm box-border px-4 py-3',
  'font-mono text-xs font-medium uppercase tracking-[0.08em] leading-snug transition-colors',
  WORKSPACE_CTA_FOCUS,
  'disabled:cursor-not-allowed disabled:opacity-45',
].join(' ');

export const WORKSPACE_CTA_PRIMARY = `${WORKSPACE_CTA_BASE} ${BTN_PRIMARY}`;

export const WORKSPACE_CTA_SECONDARY = `${WORKSPACE_CTA_BASE} ${BTN_SECONDARY}`;

export const WORKSPACE_CTA_IDLE = [
  WORKSPACE_CTA_BASE,
  'border border-dashed border-border/80 bg-card/30 text-muted-foreground disabled:opacity-100',
].join(' ');

const WORKSPACE_TOOLBAR_BTN_BASE = [
  'interactive-trigger inline-flex h-9 items-center justify-center gap-1.5 rounded-sm px-3',
  'font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors',
  WORKSPACE_CTA_FOCUS,
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

/** Compact queue actions (add files, clear all, skip). */
export const WORKSPACE_TOOLBAR_BTN = `${WORKSPACE_TOOLBAR_BTN_BASE} ${BTN_SECONDARY}`;

/** Compact primary action paired with {@link WORKSPACE_TOOLBAR_BTN} (e.g. add again). */
export const WORKSPACE_TOOLBAR_BTN_PRIMARY = `${WORKSPACE_TOOLBAR_BTN_BASE} ${BTN_PRIMARY}`;

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

/** Sticky filter bar below catalog header — spacing from {@link BODY_BLOCK_STACK} above. */
export const STICKY_BAR =
  'sticky z-20 top-[calc(3.5rem+0.5rem)] bg-background/90 py-0 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80';
