/**

 * Marketing layout — width, type scale, and spacing rhythm.

 *

 * ZONE SPACING (split halves)

 * ---------------------------

 * Total space between regions = `--marketing-zone-gap` (see globals.css).

 * • Upper region: `ZONE_GAP_AFTER` → padding-bottom = half

 * • Lower region: `ZONE_GAP_BEFORE` → padding-top = half

 * • Between them: `ZoneSeparator` (full-width `ContentRule`)

 *

 * Example (gap = 3rem): hero pb 1.5rem + rule + body pt 1.5rem = 3rem total.

 * Nav clearance (`ZONE_NAV_TOP`) is separate and only on the first hero band.

 */



/** Max content width (72rem). */

export const CONTENT_MAX = 'max-w-[72rem]';



export const CONTENT_SIDE_GRID =

  'grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,72rem)_minmax(0,1fr)] xl:gap-x-8';



/** Fixed nav clearance — first hero / page band only. */

export const ZONE_NAV_TOP = 'pt-16 sm:pt-20';



/** @deprecated Use {@link ZONE_NAV_TOP} */

export const ZONE_TOP = ZONE_NAV_TOP;



/** Half of zone gap below a region (cleared when followed by {@link ZoneSeparator}). */

export const ZONE_GAP_AFTER = 'zone-gap-after';



/** Half of zone gap above a region (cleared when preceded by {@link ZoneSeparator}). */

export const ZONE_GAP_BEFORE = 'zone-gap-before';



/** Body band — split gap above and below. */

export const ZONE_BODY = 'zone-gap-before zone-gap-after';



/** Footer inner content — page bottom only (not part of zone gap). */

export const ZONE_FOOTER_INNER = 'pb-14 sm:pb-16 lg:pb-20';



/** Page stack wrapper — no flex gap; spacing is on zones + separators. */

export const MARKETING_PAGE = 'marketing-page';



/** Below fixed nav on `<main>`. */

export const MARKETING_MAIN = 'pt-14';



/** Space from section heading to content (same zone). */

export const SECTION_TITLE_GAP = 'mt-8 lg:mt-10';



/** @deprecated Alias for SECTION_TITLE_GAP */

export const SECTION_BODY_GAP = SECTION_TITLE_GAP;



/** Home / marketing bands — same split gap as hero/body. */

export const SECTION_PY = 'zone-gap-before zone-gap-after';



export const SECTION_OVERLAP = 'premium-section';

export const SECTION_STACK = 'space-y-12 lg:space-y-14';



/** Blocks inside a zone (tools catalog, FAQ extras). */

export const BODY_BLOCK_STACK = 'flex flex-col gap-10 sm:gap-12';



export const BLOCK_STACK = 'term-section-stack';

export const TERM_MODULE_GRID = 'term-module-grid';

export const TERM_LIST_STACK = 'term-list-stack';

export const CATALOG_GROUP_GAP = 'space-y-5';

export const ROW_PY = 'py-4 sm:py-[1.125rem]';


