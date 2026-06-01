/**
 * Marketing layout rhythm — single source for section spacing, type scale, and content width.
 */

/** Max content width inside `.marketing-frame` (72rem / 1152px). */
export const CONTENT_MAX = 'max-w-[72rem]';

/** Three-column grid: side gutters + 72rem center (matches Container lg). */
export const CONTENT_SIDE_GRID =
  'grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,72rem)_minmax(0,1fr)] xl:gap-x-8';

/** Vertical padding per section (pair with `.premium-section` overlap). */
export const SECTION_PY = 'py-14 sm:py-16 lg:py-[4.5rem]';

/** Pull following sections under the previous band. */
export const SECTION_OVERLAP = 'premium-section';

/** Space between section title block and body. */
export const SECTION_BODY_GAP = 'mt-8 lg:mt-10';

/** Space between stacked blocks inside a section (e.g. catalog groups). */
export const SECTION_STACK = 'space-y-12 lg:space-y-14';

export const CATALOG_GROUP_GAP = 'space-y-5';

/** Standard catalog / list row height. */
export const ROW_PY = 'py-4 sm:py-[1.125rem]';
