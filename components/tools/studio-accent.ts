import type { ToneKey } from '@/components/tools/tone-styles';

/** Pastel studio controls (segments, range badges, page selection outline). */
export type StudioAccent = {
  segmentActive: string;
  segmentFocus: string;
  rangeIndexBadge: string;
  addRangeButton: string;
  tabBadge: string;
  pageSelectOutline: string;
};

const rose: StudioAccent = {
  segmentActive: 'bg-rose-100/90 text-rose-950 dark:bg-rose-900/45 dark:text-rose-50',
  segmentFocus: 'focus-visible:ring-rose-400/35',
  rangeIndexBadge:
    'flex h-7 w-7 shrink-0 flex-none items-center justify-center rounded-lg max-md:rounded-full bg-rose-100/90 text-[11px] font-bold tabular-nums leading-none text-rose-950 dark:bg-rose-900/50 dark:text-rose-50',
  addRangeButton:
    'w-full shrink-0 rounded-lg max-md:rounded-2xl bg-rose-500/14 py-2 max-md:py-2.5 text-[11px] font-semibold text-rose-950 ring-1 ring-inset ring-rose-600/20 transition hover:bg-rose-500/22 dark:bg-rose-500/12 dark:text-rose-50 dark:ring-rose-400/25',
  tabBadge: 'text-rose-700 dark:text-rose-300',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-rose-500',
};

const blue: StudioAccent = {
  segmentActive: 'bg-blue-100/90 text-blue-950 dark:bg-blue-900/45 dark:text-blue-50',
  segmentFocus: 'focus-visible:ring-blue-400/35',
  rangeIndexBadge:
    'flex h-7 w-7 shrink-0 flex-none items-center justify-center rounded-lg max-md:rounded-full bg-blue-100/90 text-[11px] font-bold tabular-nums leading-none text-blue-950 dark:bg-blue-900/50 dark:text-blue-50',
  addRangeButton:
    'w-full shrink-0 rounded-lg max-md:rounded-2xl bg-blue-500/14 py-2 max-md:py-2.5 text-[11px] font-semibold text-blue-950 ring-1 ring-inset ring-blue-600/20 transition hover:bg-blue-500/22 dark:bg-blue-500/12 dark:text-blue-50 dark:ring-blue-400/25',
  tabBadge: 'text-blue-700 dark:text-blue-300',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-blue-500',
};

const purple: StudioAccent = {
  segmentActive: 'bg-purple-100/90 text-purple-950 dark:bg-purple-900/45 dark:text-purple-50',
  segmentFocus: 'focus-visible:ring-purple-400/35',
  rangeIndexBadge:
    'flex h-7 w-7 shrink-0 flex-none items-center justify-center rounded-lg max-md:rounded-full bg-purple-100/90 text-[11px] font-bold tabular-nums leading-none text-purple-950 dark:bg-purple-900/50 dark:text-purple-50',
  addRangeButton:
    'w-full shrink-0 rounded-lg max-md:rounded-2xl bg-purple-500/14 py-2 max-md:py-2.5 text-[11px] font-semibold text-purple-950 ring-1 ring-inset ring-purple-600/20 transition hover:bg-purple-500/22 dark:bg-purple-500/12 dark:text-purple-50 dark:ring-purple-400/25',
  tabBadge: 'text-purple-700 dark:text-purple-300',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-purple-500',
};

const orange: StudioAccent = {
  segmentActive: 'bg-orange-100/90 text-orange-950 dark:bg-orange-900/45 dark:text-orange-50',
  segmentFocus: 'focus-visible:ring-orange-400/35',
  rangeIndexBadge:
    'flex h-7 w-7 shrink-0 flex-none items-center justify-center rounded-lg max-md:rounded-full bg-orange-100/90 text-[11px] font-bold tabular-nums leading-none text-orange-950 dark:bg-orange-900/50 dark:text-orange-50',
  addRangeButton:
    'w-full shrink-0 rounded-lg max-md:rounded-2xl bg-orange-500/14 py-2 max-md:py-2.5 text-[11px] font-semibold text-orange-950 ring-1 ring-inset ring-orange-600/20 transition hover:bg-orange-500/22 dark:bg-orange-500/12 dark:text-orange-50 dark:ring-orange-400/25',
  tabBadge: 'text-orange-700 dark:text-orange-300',
  pageSelectOutline: 'outline outline-2 outline-offset-2 outline-orange-500',
};

const BY_TONE: Partial<Record<ToneKey, StudioAccent>> = {
  rose,
  blue,
  purple,
  orange,
};

export function getStudioAccent(tone: ToneKey | undefined): StudioAccent {
  return (tone && BY_TONE[tone]) ?? rose;
}
