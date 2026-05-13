import type { ToolDefinition } from '@/lib/tools';

export type ToneKey = ToolDefinition['tone'];

export type ToneStyle = {
  /** Tailwind class fragment for `bg-gradient-to-br` (from/to). */
  gradientText: string;
  /** Tinted icon color matching the tone (medium weight). */
  pillIcon: string;
  /** Existing `icon-box-*` utility for square icon tiles. */
  iconBox: string;
  /** Tone text color for icons inside boxes / heading accents. */
  iconText: string;
  /** Lighter tone for small feature-card icons. */
  iconTextSubtle: string;
  /** Tone link color + hover variant for inline links. */
  linkText: string;
  /** Per-tone status pill (border + glass surface). */
  chip: string;
  /** Scrollbar thumb color (matches the tone's card wash, rgba). */
  scrollbarThumb: string;
  /** Scrollbar thumb hover color (slightly more saturated, rgba). */
  scrollbarThumbHover: string;
};

export const TONE_STYLES: Record<ToneKey, ToneStyle> = {
  emerald: {
    gradientText: 'from-emerald-500 to-teal-400',
    pillIcon: 'text-emerald-500',
    iconBox: 'icon-box-emerald',
    iconText: 'text-emerald-500',
    iconTextSubtle: 'text-emerald-400',
    linkText: 'text-emerald-600 hover:text-emerald-700',
    chip: 'border-emerald-200/70 bg-white/65',
    scrollbarThumb: 'rgba(110, 231, 183, 0.78)',
    scrollbarThumbHover: 'rgba(52, 211, 153, 0.88)',
  },
  amber: {
    gradientText: 'from-amber-500 to-yellow-400',
    pillIcon: 'text-amber-500',
    iconBox: 'icon-box-amber',
    iconText: 'text-amber-500',
    iconTextSubtle: 'text-amber-400',
    linkText: 'text-amber-600 hover:text-amber-700',
    chip: 'border-amber-200/70 bg-white/65',
    scrollbarThumb: 'rgba(252, 211, 77, 0.78)',
    scrollbarThumbHover: 'rgba(245, 158, 11, 0.88)',
  },
  teal: {
    gradientText: 'from-teal-500 to-cyan-400',
    pillIcon: 'text-teal-500',
    iconBox: 'icon-box-teal',
    iconText: 'text-teal-500',
    iconTextSubtle: 'text-teal-400',
    linkText: 'text-teal-600 hover:text-teal-700',
    chip: 'border-teal-200/70 bg-white/65',
    scrollbarThumb: 'rgba(94, 234, 212, 0.78)',
    scrollbarThumbHover: 'rgba(45, 212, 191, 0.88)',
  },
  purple: {
    gradientText: 'from-purple-500 to-violet-400',
    pillIcon: 'text-purple-500',
    iconBox: 'icon-box-purple',
    iconText: 'text-purple-500',
    iconTextSubtle: 'text-purple-400',
    linkText: 'text-purple-600 hover:text-purple-700',
    chip: 'border-purple-200/70 bg-white/65',
    scrollbarThumb: 'rgba(216, 180, 254, 0.78)',
    scrollbarThumbHover: 'rgba(192, 132, 252, 0.88)',
  },
  cyan: {
    gradientText: 'from-cyan-500 to-sky-400',
    pillIcon: 'text-cyan-500',
    iconBox: 'icon-box-cyan',
    iconText: 'text-cyan-500',
    iconTextSubtle: 'text-cyan-400',
    linkText: 'text-cyan-600 hover:text-cyan-700',
    chip: 'border-cyan-200/70 bg-white/65',
    scrollbarThumb: 'rgba(103, 232, 249, 0.78)',
    scrollbarThumbHover: 'rgba(34, 211, 238, 0.88)',
  },
  orange: {
    gradientText: 'from-orange-500 to-amber-400',
    pillIcon: 'text-orange-500',
    iconBox: 'icon-box-orange',
    iconText: 'text-orange-500',
    iconTextSubtle: 'text-orange-400',
    linkText: 'text-orange-600 hover:text-orange-700',
    chip: 'border-orange-200/70 bg-white/65',
    scrollbarThumb: 'rgba(253, 186, 116, 0.78)',
    scrollbarThumbHover: 'rgba(251, 146, 60, 0.88)',
  },
  indigo: {
    gradientText: 'from-indigo-500 to-blue-400',
    pillIcon: 'text-indigo-500',
    iconBox: 'icon-box-indigo',
    iconText: 'text-indigo-500',
    iconTextSubtle: 'text-indigo-400',
    linkText: 'text-indigo-600 hover:text-indigo-700',
    chip: 'border-indigo-200/70 bg-white/65',
    scrollbarThumb: 'rgba(165, 180, 252, 0.78)',
    scrollbarThumbHover: 'rgba(129, 140, 248, 0.88)',
  },
  slate: {
    gradientText: 'from-slate-600 to-gray-400',
    pillIcon: 'text-slate-500',
    iconBox: 'icon-box-slate',
    iconText: 'text-slate-600',
    iconTextSubtle: 'text-slate-400',
    linkText: 'text-slate-700 hover:text-slate-900',
    chip: 'border-slate-200/70 bg-white/65',
    scrollbarThumb: 'rgba(203, 213, 225, 0.78)',
    scrollbarThumbHover: 'rgba(148, 163, 184, 0.88)',
  },
  rose: {
    gradientText: 'from-rose-400 to-pink-400',
    pillIcon: 'text-rose-500',
    iconBox: 'icon-box-rose',
    iconText: 'text-rose-500',
    iconTextSubtle: 'text-rose-400',
    linkText: 'text-rose-600 hover:text-rose-700',
    chip: 'border-rose-200/70 bg-white/65',
    scrollbarThumb: 'rgba(251, 182, 206, 0.78)',
    scrollbarThumbHover: 'rgba(253, 164, 175, 0.88)',
  },
  sky: {
    gradientText: 'from-sky-500 to-cyan-400',
    pillIcon: 'text-sky-500',
    iconBox: 'icon-box-sky',
    iconText: 'text-sky-500',
    iconTextSubtle: 'text-sky-400',
    linkText: 'text-sky-600 hover:text-sky-700',
    chip: 'border-sky-200/70 bg-white/65',
    scrollbarThumb: 'rgba(125, 211, 252, 0.78)',
    scrollbarThumbHover: 'rgba(56, 189, 248, 0.88)',
  },
  violet: {
    gradientText: 'from-violet-500 to-purple-400',
    pillIcon: 'text-violet-500',
    iconBox: 'icon-box-violet',
    iconText: 'text-violet-500',
    iconTextSubtle: 'text-violet-400',
    linkText: 'text-violet-600 hover:text-violet-700',
    chip: 'border-violet-200/70 bg-white/65',
    scrollbarThumb: 'rgba(196, 181, 253, 0.78)',
    scrollbarThumbHover: 'rgba(167, 139, 250, 0.88)',
  },
  lime: {
    gradientText: 'from-lime-500 to-green-400',
    pillIcon: 'text-lime-500',
    iconBox: 'icon-box-lime',
    iconText: 'text-lime-600',
    iconTextSubtle: 'text-lime-500',
    linkText: 'text-lime-600 hover:text-lime-700',
    chip: 'border-lime-200/70 bg-white/65',
    scrollbarThumb: 'rgba(190, 242, 100, 0.78)',
    scrollbarThumbHover: 'rgba(163, 230, 53, 0.88)',
  },
  fuchsia: {
    gradientText: 'from-fuchsia-500 to-pink-400',
    pillIcon: 'text-fuchsia-500',
    iconBox: 'icon-box-fuchsia',
    iconText: 'text-fuchsia-500',
    iconTextSubtle: 'text-fuchsia-400',
    linkText: 'text-fuchsia-600 hover:text-fuchsia-700',
    chip: 'border-fuchsia-200/70 bg-white/65',
    scrollbarThumb: 'rgba(240, 171, 252, 0.78)',
    scrollbarThumbHover: 'rgba(232, 121, 249, 0.88)',
  },
};

export const TONE_TEXT_GRADIENT: Record<ToneKey, string> = Object.fromEntries(
  (Object.entries(TONE_STYLES) as [ToneKey, ToneStyle][]).map(([k, v]) => [k, v.gradientText])
) as Record<ToneKey, string>;

export const TONE_CHIP_CLASS: Record<ToneKey, string> = Object.fromEntries(
  (Object.entries(TONE_STYLES) as [ToneKey, ToneStyle][]).map(([k, v]) => [k, v.chip])
) as Record<ToneKey, string>;
