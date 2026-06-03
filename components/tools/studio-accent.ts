import type { ToneKey } from '@/components/tools/tone-styles';

/** Studio controls tinted by site brand copper (terminal / Imprint). */
export type StudioAccent = {
  segmentActive: string;
  segmentFocus: string;
  rangeIndexBadge: string;
  addRangeButton: string;
  tabBadge: string;
  pageSelectOutline: string;
};

const copperFocus = 'focus-visible:ring-[hsl(var(--brand-copper)/0.4)]';

const brand: StudioAccent = {
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

/** All tool workspaces use site brand copper — not per-format hues. */
export function getStudioAccent(_tone: ToneKey | undefined): StudioAccent {
  return brand;
}
