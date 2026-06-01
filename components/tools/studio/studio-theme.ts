/**
 * Studio surfaces — Imprint terminal shell (neutral + copper).
 * File-type hue is accent-only via `.studio-range-outline` + {@link getStudioAccent}.
 */

export const STUDIO_LABEL =
  'font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground';

/** lg+ studio shell: preview/stage 70%, sidebar (modes, queue, settings) 30%. */
export const STUDIO_DESKTOP_GRID = 'lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]';

/** Full-width flow studio: two columns, no gutter — preview | settings rail. */
export const STUDIO_FLOW_GRID =
  'grid h-full min-h-0 w-full grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-0';

export const STUDIO_CARD =
  'studio-shell-panel flex flex-col overflow-hidden rounded-sm border border-dashed shadow-none transition';

export const STUDIO_CARD_DRAG = 'cursor-grab active:cursor-grabbing hover:border-[hsl(var(--brand-copper)/0.28)]';

export const STUDIO_CARD_INNER = 'studio-shell-divider border-t';

export const STUDIO_THUMB_AREA = 'studio-shell-thumb relative aspect-[3/4] w-full';

export const STUDIO_PAGE_THUMB_SHELL =
  'studio-page-thumb inline-block max-w-full overflow-hidden rounded-lg';

export const STUDIO_PAGE_THUMB_IMG = 'block h-auto w-auto rounded-lg';

/** @deprecated Use {@link STUDIO_PAGE_THUMB_SHELL} + {@link STUDIO_PAGE_THUMB_IMG}. */
export const STUDIO_PAGE_THUMB = STUDIO_PAGE_THUMB_SHELL;
export const STUDIO_THUMB_FRAME = STUDIO_PAGE_THUMB_SHELL;

/** Dashed outline per split range — subtle file-type tint (globals.css). */
export const STUDIO_RANGE_OUTLINE = 'studio-range-outline';

export const STUDIO_RANGE_CARD =
  'studio-range-outline flex w-full min-w-0 flex-col gap-1.5 rounded-xl px-2 py-1.5';

export const STUDIO_RANGE_CARD_GRID =
  'studio-range-outline col-span-6 grid w-full min-w-0 grid-rows-[auto_auto] gap-y-1.5 rounded-xl px-0 py-1.5';

export const STUDIO_RANGE_CARD_GRID_PAIR =
  'studio-range-outline col-span-4 grid w-full min-w-0 grid-rows-[auto_auto] gap-y-1.5 rounded-xl px-0 py-1.5';

export const STUDIO_TAB_TRACK =
  'studio-shell-track flex w-full min-w-0 gap-0.5 rounded-sm border p-0.5';

export const STUDIO_TAB_ACTIVE = 'studio-shell-tab-active border shadow-none';

export const STUDIO_TAB_IDLE =
  'text-muted-foreground hover:bg-black/25 hover:text-foreground';

export const STUDIO_INFO_BANNER =
  'studio-shell-panel flex min-w-0 gap-3 rounded-sm border p-4 font-mono text-[11px] leading-relaxed text-muted-foreground';

export const STUDIO_INDEX_BADGE =
  'studio-shell-badge absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-sm border font-mono text-xs font-bold';

export const STUDIO_EMPTY_STATE =
  'studio-shell-panel rounded-sm border border-dashed px-3 py-10 text-center text-sm text-muted-foreground';

export const STUDIO_INPUT =
  'studio-shell-input rounded-sm border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.35)]';

export const STUDIO_FIELD_ROW =
  'studio-shell-panel flex shrink-0 min-h-[1.75rem] min-w-0 flex-nowrap items-center gap-2 rounded-sm border px-2 py-2';

export const STUDIO_NUM_INPUT =
  'studio-shell-input studio-num-input box-border h-7 w-11 shrink-0 rounded-sm border px-1 text-center font-mono text-xs font-medium tabular-nums leading-none text-foreground disabled:cursor-default disabled:opacity-60';

/** Page/range number field with terminal up/down steppers. */
export const STUDIO_NUM_STEPPER =
  'studio-num-stepper studio-shell-input box-border flex h-7 w-[3.35rem] shrink-0 overflow-hidden rounded-sm border';

export const STUDIO_NUM_STEPPER_INPUT =
  'studio-num-input min-h-0 min-w-0 flex-1 border-0 bg-transparent px-0.5 text-center font-mono text-xs font-medium tabular-nums leading-none text-foreground shadow-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-60';

export const STUDIO_NUM_STEPPER_BTNS = 'studio-num-stepper-btns flex w-4 shrink-0 flex-col self-stretch';

export const STUDIO_NUM_STEPPER_BTN =
  'studio-num-stepper-btn flex min-h-0 flex-1 items-center justify-center font-mono text-[10px] leading-none text-muted-foreground transition disabled:cursor-not-allowed disabled:opacity-40';

export const STUDIO_FULL_INPUT =
  'studio-shell-input w-full rounded-sm border px-3 py-3 text-sm text-foreground disabled:cursor-default disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-copper)/0.35)]';

export const STUDIO_CHECK_ROW =
  'studio-shell-panel flex shrink-0 cursor-pointer select-none items-center gap-2.5 rounded-sm border px-3 py-3';

/** Terminal-styled checkbox — pair with {@link STUDIO_CHECK_ROW}. */
export const STUDIO_CHECKBOX = 'studio-shell-checkbox shrink-0';

export const STUDIO_HINT =
  'studio-shell-panel shrink-0 rounded-sm border px-3 py-3 font-mono text-[11px] text-muted-foreground';

export const STUDIO_SECONDARY_BTN =
  'studio-shell-input w-full shrink-0 rounded-sm border px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wide text-foreground transition hover:bg-black/30';

export const STUDIO_INFO_STRIP = 'studio-shell-pill rounded-sm border px-3 py-2 text-center';

/** Neutral hint chip — no pastel file-type wash. */
export const STUDIO_SHELL_PILL = 'studio-shell-pill';

/** @deprecated Use {@link STUDIO_SHELL_PILL}. */
export const STUDIO_TONE_PILL = STUDIO_SHELL_PILL;
