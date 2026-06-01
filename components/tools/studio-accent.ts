import type { ToneKey } from '@/components/tools/tone-styles';

/** Studio controls tinted by file-type tone (terminal / Imprint). */
export type StudioAccent = {
  segmentActive: string;
  segmentFocus: string;
  rangeIndexBadge: string;
  addRangeButton: string;
  tabBadge: string;
  pageSelectOutline: string;
};

const copperFocus = 'focus-visible:ring-[hsl(var(--brand-copper)/0.4)]';

const rose: StudioAccent = {
  segmentActive:
    'border border-rose-500/22 bg-rose-500/[0.06] text-rose-300/90',
  segmentFocus: 'focus-visible:ring-rose-400/25',
  rangeIndexBadge:
    'studio-shell-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border font-mono text-[11px] font-bold tabular-nums text-rose-300/90',
  addRangeButton:
    'studio-shell-input w-full shrink-0 rounded-sm border py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-foreground transition hover:bg-black/30',
  tabBadge: 'text-muted-foreground',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-rose-500/45',
};

const blue: StudioAccent = {
  ...rose,
  segmentActive: 'border border-blue-500/22 bg-blue-500/[0.06] text-blue-300/90',
  segmentFocus: 'focus-visible:ring-blue-400/25',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-blue-500/45',
};

const purple: StudioAccent = {
  ...rose,
  segmentActive: 'border border-purple-500/22 bg-purple-500/[0.06] text-purple-300/90',
  segmentFocus: 'focus-visible:ring-purple-400/25',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-purple-500/45',
};

const orange: StudioAccent = {
  segmentActive:
    'border border-[hsl(var(--brand-copper)/0.28)] bg-[hsl(var(--brand-copper)/0.06)] text-[hsl(var(--brand-copper))]',
  segmentFocus: copperFocus,
  rangeIndexBadge:
    'studio-shell-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border font-mono text-[11px] font-bold tabular-nums text-[hsl(var(--brand-copper))]',
  addRangeButton:
    'studio-shell-input w-full shrink-0 rounded-sm border py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-foreground transition hover:bg-black/30',
  tabBadge: 'text-muted-foreground',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-[hsl(var(--brand-copper)/0.45)]',
};

const slate: StudioAccent = {
  ...orange,
  segmentActive: 'border border-border/80 bg-[#0b0b0b] text-foreground',
  rangeIndexBadge:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border/70 bg-black/40 font-mono text-[11px] font-bold tabular-nums text-foreground',
};

const BY_TONE: Partial<Record<ToneKey, StudioAccent>> = {
  rose,
  blue,
  purple,
  orange,
  slate,
  emerald: orange,
  amber: orange,
  teal: orange,
  cyan: blue,
  indigo: purple,
  sky: blue,
  violet: purple,
  lime: orange,
  fuchsia: rose,
};

/** Studio chrome follows legacy per-tool / format tone. */
export function getStudioAccent(tone: ToneKey | undefined): StudioAccent {
  return (tone && BY_TONE[tone]) ?? orange;
}
