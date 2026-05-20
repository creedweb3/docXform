/** File-type brand colors (see {@link FORMAT_TONE} in lib/format-tone.ts). */
export type FormatTone = 'rose' | 'blue' | 'purple' | 'orange';

/** All pastel palette keys (format tones + legacy studio hues). */
export type ToneKey =
  | FormatTone
  | 'emerald'
  | 'amber'
  | 'teal'
  | 'cyan'
  | 'indigo'
  | 'slate'
  | 'sky'
  | 'violet'
  | 'lime'
  | 'fuchsia';

export type ToneStyle = {
  /** Drop zone / main workspace card (`converter-main-card-*`). */
  mainCard: string;
  drag: string;
  /** Softer CTA gradient (`from-*-500 to-*-400`). */
  primaryButton: string;
  progress: string;
  /** Home hero card wash where applicable (`converter-card-*`). */
  indexCard: string;
  /** Home hero CTA pill (`converter-cta-*`). */
  converterCta: string;
  /** Selected card tint for PageGrid (border + background). */
  pageGridSelected: string;
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
  /** Info / hint pills in the studio (selection, drag affordance, tips). */
  studioInfoPill: string;
  /** Small “i” mark inside {@link StudioInfoBanner}. */
  studioInfoBannerMark: string;
  /** Scrollbar thumb color (matches the tone's card wash, rgba). */
  scrollbarThumb: string;
  /** Scrollbar thumb hover color (slightly more saturated, rgba). */
  scrollbarThumbHover: string;
};

export const TONE_STYLES: Record<ToneKey, ToneStyle> = {
  blue: {
    mainCard: 'converter-main-card-blue',
    drag: 'ring-2 ring-blue-300/50 bg-blue-50/60 scale-[1.01]',
    primaryButton: 'from-blue-500 to-blue-400',
    progress: 'from-blue-400 to-cyan-400',
    indexCard: 'converter-card-blue',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-blue-300/80 bg-blue-50/75 text-blue-900',
    gradientText: 'from-blue-500 to-sky-400',
    pillIcon: 'text-blue-500',
    iconBox: 'icon-box-blue',
    iconText: 'text-blue-500',
    iconTextSubtle: 'text-blue-400',
    linkText: 'text-blue-600 hover:text-blue-700',
    chip: 'border-blue-200/70 bg-white/65',
    studioInfoPill:
      'border-blue-300/70 bg-blue-50/95 text-blue-950 shadow-sm ring-1 ring-blue-500/10',
    studioInfoBannerMark: 'bg-blue-200/70 text-blue-900',
    scrollbarThumb: 'rgba(147, 197, 253, 0.78)',
    scrollbarThumbHover: 'rgba(125, 211, 252, 0.88)',
  },
  emerald: {
    mainCard: 'converter-main-card-emerald',
    drag: 'ring-2 ring-emerald-300/50 bg-emerald-50/60 scale-[1.01]',
    primaryButton: 'from-emerald-500 to-emerald-400',
    progress: 'from-emerald-400 to-teal-400',
    indexCard: 'converter-main-card-emerald',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-emerald-300/80 bg-emerald-50/75 text-emerald-900',
    gradientText: 'from-emerald-500 to-teal-400',
    pillIcon: 'text-emerald-500',
    iconBox: 'icon-box-emerald',
    iconText: 'text-emerald-500',
    iconTextSubtle: 'text-emerald-400',
    linkText: 'text-emerald-600 hover:text-emerald-700',
    chip: 'border-emerald-200/70 bg-white/65',
    studioInfoPill:
      'border-emerald-300/70 bg-emerald-50/95 text-emerald-950 shadow-sm ring-1 ring-emerald-500/10 dark:border-emerald-400/35 dark:bg-emerald-950/50 dark:text-emerald-50 dark:ring-emerald-400/10',
    studioInfoBannerMark:
      'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-800/80 dark:text-emerald-100',
    scrollbarThumb: 'rgba(110, 231, 183, 0.78)',
    scrollbarThumbHover: 'rgba(52, 211, 153, 0.88)',
  },
  amber: {
    mainCard: 'converter-main-card-amber',
    drag: 'ring-2 ring-amber-300/50 bg-amber-50/60 scale-[1.01]',
    primaryButton: 'from-amber-500 to-amber-400',
    progress: 'from-amber-400 to-yellow-400',
    indexCard: 'converter-main-card-amber',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-amber-300/80 bg-amber-50/75 text-amber-900',
    gradientText: 'from-amber-500 to-yellow-400',
    pillIcon: 'text-amber-500',
    iconBox: 'icon-box-amber',
    iconText: 'text-amber-500',
    iconTextSubtle: 'text-amber-400',
    linkText: 'text-amber-600 hover:text-amber-700',
    chip: 'border-amber-200/70 bg-white/65',
    studioInfoPill:
      'border-amber-300/70 bg-amber-50/95 text-amber-950 shadow-sm ring-1 ring-amber-500/10 dark:border-amber-400/35 dark:bg-amber-950/50 dark:text-amber-50 dark:ring-amber-400/10',
    studioInfoBannerMark:
      'bg-amber-200/70 text-amber-900 dark:bg-amber-800/80 dark:text-amber-100',
    scrollbarThumb: 'rgba(252, 211, 77, 0.78)',
    scrollbarThumbHover: 'rgba(245, 158, 11, 0.88)',
  },
  teal: {
    mainCard: 'converter-main-card-teal',
    drag: 'ring-2 ring-teal-300/50 bg-teal-50/60 scale-[1.01]',
    primaryButton: 'from-teal-500 to-teal-400',
    progress: 'from-teal-400 to-cyan-400',
    indexCard: 'converter-main-card-teal',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-teal-300/80 bg-teal-50/75 text-teal-900',
    gradientText: 'from-teal-500 to-cyan-400',
    pillIcon: 'text-teal-500',
    iconBox: 'icon-box-teal',
    iconText: 'text-teal-500',
    iconTextSubtle: 'text-teal-400',
    linkText: 'text-teal-600 hover:text-teal-700',
    chip: 'border-teal-200/70 bg-white/65',
    studioInfoPill:
      'border-teal-300/70 bg-teal-50/95 text-teal-950 shadow-sm ring-1 ring-teal-500/10 dark:border-teal-400/35 dark:bg-teal-950/50 dark:text-teal-50 dark:ring-teal-400/10',
    studioInfoBannerMark:
      'bg-teal-200/70 text-teal-900 dark:bg-teal-800/80 dark:text-teal-100',
    scrollbarThumb: 'rgba(94, 234, 212, 0.78)',
    scrollbarThumbHover: 'rgba(45, 212, 191, 0.88)',
  },
  purple: {
    mainCard: 'converter-main-card-purple',
    drag: 'ring-2 ring-purple-300/50 bg-purple-50/60 scale-[1.01]',
    primaryButton: 'from-purple-500 to-purple-400',
    progress: 'from-purple-400 to-violet-400',
    indexCard: 'converter-main-card-purple',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-purple-300/80 bg-purple-50/75 text-purple-900',
    gradientText: 'from-purple-500 to-violet-400',
    pillIcon: 'text-purple-500',
    iconBox: 'icon-box-purple',
    iconText: 'text-purple-500',
    iconTextSubtle: 'text-purple-400',
    linkText: 'text-purple-600 hover:text-purple-700',
    chip: 'border-purple-200/70 bg-white/65',
    studioInfoPill:
      'border-purple-300/70 bg-purple-50/95 text-purple-950 shadow-sm ring-1 ring-purple-500/10 dark:border-purple-400/35 dark:bg-purple-950/50 dark:text-purple-50 dark:ring-purple-400/10',
    studioInfoBannerMark:
      'bg-purple-200/70 text-purple-900 dark:bg-purple-800/80 dark:text-purple-100',
    scrollbarThumb: 'rgba(216, 180, 254, 0.78)',
    scrollbarThumbHover: 'rgba(192, 132, 252, 0.88)',
  },
  cyan: {
    mainCard: 'converter-main-card-cyan',
    drag: 'ring-2 ring-cyan-300/50 bg-cyan-50/60 scale-[1.01]',
    primaryButton: 'from-cyan-500 to-cyan-400',
    progress: 'from-cyan-400 to-sky-400',
    indexCard: 'converter-main-card-cyan',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-cyan-300/80 bg-cyan-50/75 text-cyan-900',
    gradientText: 'from-cyan-500 to-sky-400',
    pillIcon: 'text-cyan-500',
    iconBox: 'icon-box-cyan',
    iconText: 'text-cyan-500',
    iconTextSubtle: 'text-cyan-400',
    linkText: 'text-cyan-600 hover:text-cyan-700',
    chip: 'border-cyan-200/70 bg-white/65',
    studioInfoPill:
      'border-cyan-300/70 bg-cyan-50/95 text-cyan-950 shadow-sm ring-1 ring-cyan-500/10 dark:border-cyan-400/35 dark:bg-cyan-950/50 dark:text-cyan-50 dark:ring-cyan-400/10',
    studioInfoBannerMark:
      'bg-cyan-200/70 text-cyan-900 dark:bg-cyan-800/80 dark:text-cyan-100',
    scrollbarThumb: 'rgba(103, 232, 249, 0.78)',
    scrollbarThumbHover: 'rgba(34, 211, 238, 0.88)',
  },
  orange: {
    mainCard: 'converter-main-card-orange',
    drag: 'ring-2 ring-orange-300/50 bg-orange-50/60 scale-[1.01]',
    primaryButton: 'from-orange-500 to-orange-400',
    progress: 'from-orange-400 to-amber-400',
    indexCard: 'converter-main-card-orange',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-orange-300/80 bg-orange-50/75 text-orange-900',
    gradientText: 'from-orange-500 to-amber-400',
    pillIcon: 'text-orange-500',
    iconBox: 'icon-box-orange',
    iconText: 'text-orange-500',
    iconTextSubtle: 'text-orange-400',
    linkText: 'text-orange-600 hover:text-orange-700',
    chip: 'border-orange-200/70 bg-white/65',
    studioInfoPill:
      'border-orange-300/70 bg-orange-50/95 text-orange-950 shadow-sm ring-1 ring-orange-500/10 dark:border-orange-400/35 dark:bg-orange-950/50 dark:text-orange-50 dark:ring-orange-400/10',
    studioInfoBannerMark:
      'bg-orange-200/70 text-orange-900 dark:bg-orange-800/80 dark:text-orange-100',
    scrollbarThumb: 'rgba(253, 186, 116, 0.78)',
    scrollbarThumbHover: 'rgba(251, 146, 60, 0.88)',
  },
  indigo: {
    mainCard: 'converter-main-card-indigo',
    drag: 'ring-2 ring-indigo-300/50 bg-indigo-50/60 scale-[1.01]',
    primaryButton: 'from-indigo-500 to-indigo-400',
    progress: 'from-indigo-400 to-blue-400',
    indexCard: 'converter-main-card-indigo',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-indigo-300/80 bg-indigo-50/75 text-indigo-900',
    gradientText: 'from-indigo-500 to-blue-400',
    pillIcon: 'text-indigo-500',
    iconBox: 'icon-box-indigo',
    iconText: 'text-indigo-500',
    iconTextSubtle: 'text-indigo-400',
    linkText: 'text-indigo-600 hover:text-indigo-700',
    chip: 'border-indigo-200/70 bg-white/65',
    studioInfoPill:
      'border-indigo-300/70 bg-indigo-50/95 text-indigo-950 shadow-sm ring-1 ring-indigo-500/10 dark:border-indigo-400/35 dark:bg-indigo-950/50 dark:text-indigo-50 dark:ring-indigo-400/10',
    studioInfoBannerMark:
      'bg-indigo-200/70 text-indigo-900 dark:bg-indigo-800/80 dark:text-indigo-100',
    scrollbarThumb: 'rgba(165, 180, 252, 0.78)',
    scrollbarThumbHover: 'rgba(129, 140, 248, 0.88)',
  },
  slate: {
    mainCard: 'converter-main-card-slate',
    drag: 'ring-2 ring-slate-300/50 bg-slate-50/60 scale-[1.01]',
    primaryButton: 'from-slate-600 to-slate-500',
    progress: 'from-slate-400 to-gray-400',
    indexCard: 'converter-main-card-slate',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-slate-300/80 bg-slate-50/75 text-slate-900',
    gradientText: 'from-slate-600 to-gray-400',
    pillIcon: 'text-slate-500',
    iconBox: 'icon-box-slate',
    iconText: 'text-slate-600',
    iconTextSubtle: 'text-slate-400',
    linkText: 'text-slate-700 hover:text-slate-900',
    chip: 'border-slate-200/70 bg-white/65',
    studioInfoPill:
      'border-slate-300/70 bg-slate-50/95 text-slate-950 shadow-sm ring-1 ring-slate-500/10 dark:border-slate-500/35 dark:bg-slate-900/55 dark:text-slate-50 dark:ring-slate-400/10',
    studioInfoBannerMark:
      'bg-slate-300/70 text-slate-950 dark:bg-slate-700/80 dark:text-slate-100',
    scrollbarThumb: 'rgba(203, 213, 225, 0.78)',
    scrollbarThumbHover: 'rgba(148, 163, 184, 0.88)',
  },
  rose: {
    mainCard: 'converter-main-card-rose',
    drag: 'ring-2 ring-rose-300/50 bg-rose-50/60 scale-[1.01]',
    primaryButton: 'from-rose-500 to-rose-400',
    progress: 'from-rose-400 to-pink-400',
    indexCard: 'converter-card-rose',
    converterCta: 'converter-cta-rose',
    pageGridSelected: 'border-rose-300/80 bg-rose-50/75 text-rose-900',
    gradientText: 'from-rose-400 to-pink-400',
    pillIcon: 'text-rose-500',
    iconBox: 'icon-box-rose',
    iconText: 'text-rose-400',
    iconTextSubtle: 'text-rose-400',
    linkText: 'text-rose-600 hover:text-rose-700',
    chip: 'border-rose-200/70 bg-white/65',
    studioInfoPill:
      'border-rose-300/70 bg-rose-50/95 text-rose-950 shadow-sm ring-1 ring-rose-500/10 dark:border-rose-400/35 dark:bg-rose-950/50 dark:text-rose-50 dark:ring-rose-400/10',
    studioInfoBannerMark:
      'bg-rose-200/70 text-rose-900 dark:bg-rose-800/80 dark:text-rose-100',
    scrollbarThumb: 'rgba(251, 182, 206, 0.78)',
    scrollbarThumbHover: 'rgba(253, 164, 175, 0.88)',
  },
  sky: {
    mainCard: 'converter-main-card-sky',
    drag: 'ring-2 ring-sky-300/50 bg-sky-50/60 scale-[1.01]',
    primaryButton: 'from-sky-500 to-sky-400',
    progress: 'from-sky-400 to-cyan-400',
    indexCard: 'converter-main-card-sky',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-sky-300/80 bg-sky-50/75 text-sky-900',
    gradientText: 'from-sky-500 to-cyan-400',
    pillIcon: 'text-sky-500',
    iconBox: 'icon-box-sky',
    iconText: 'text-sky-500',
    iconTextSubtle: 'text-sky-400',
    linkText: 'text-sky-600 hover:text-sky-700',
    chip: 'border-sky-200/70 bg-white/65',
    studioInfoPill:
      'border-sky-300/70 bg-sky-50/95 text-sky-950 shadow-sm ring-1 ring-sky-500/10 dark:border-sky-400/35 dark:bg-sky-950/50 dark:text-sky-50 dark:ring-sky-400/10',
    studioInfoBannerMark:
      'bg-sky-200/70 text-sky-900 dark:bg-sky-800/80 dark:text-sky-100',
    scrollbarThumb: 'rgba(125, 211, 252, 0.78)',
    scrollbarThumbHover: 'rgba(56, 189, 248, 0.88)',
  },
  violet: {
    mainCard: 'converter-main-card-violet',
    drag: 'ring-2 ring-violet-300/50 bg-violet-50/60 scale-[1.01]',
    primaryButton: 'from-violet-500 to-violet-400',
    progress: 'from-violet-400 to-purple-400',
    indexCard: 'converter-main-card-violet',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-violet-300/80 bg-violet-50/75 text-violet-900',
    gradientText: 'from-violet-500 to-purple-400',
    pillIcon: 'text-violet-500',
    iconBox: 'icon-box-violet',
    iconText: 'text-violet-500',
    iconTextSubtle: 'text-violet-400',
    linkText: 'text-violet-600 hover:text-violet-700',
    chip: 'border-violet-200/70 bg-white/65',
    studioInfoPill:
      'border-violet-300/70 bg-violet-50/95 text-violet-950 shadow-sm ring-1 ring-violet-500/10 dark:border-violet-400/35 dark:bg-violet-950/50 dark:text-violet-50 dark:ring-violet-400/10',
    studioInfoBannerMark:
      'bg-violet-200/70 text-violet-900 dark:bg-violet-800/80 dark:text-violet-100',
    scrollbarThumb: 'rgba(196, 181, 253, 0.78)',
    scrollbarThumbHover: 'rgba(167, 139, 250, 0.88)',
  },
  lime: {
    mainCard: 'converter-main-card-lime',
    drag: 'ring-2 ring-lime-300/50 bg-lime-50/60 scale-[1.01]',
    primaryButton: 'from-lime-500 to-lime-400',
    progress: 'from-lime-400 to-green-400',
    indexCard: 'converter-main-card-lime',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-lime-300/80 bg-lime-50/75 text-lime-900',
    gradientText: 'from-lime-500 to-green-400',
    pillIcon: 'text-lime-500',
    iconBox: 'icon-box-lime',
    iconText: 'text-lime-600',
    iconTextSubtle: 'text-lime-500',
    linkText: 'text-lime-600 hover:text-lime-700',
    chip: 'border-lime-200/70 bg-white/65',
    studioInfoPill:
      'border-lime-300/70 bg-lime-50/95 text-lime-950 shadow-sm ring-1 ring-lime-500/10 dark:border-lime-400/35 dark:bg-lime-950/50 dark:text-lime-50 dark:ring-lime-400/10',
    studioInfoBannerMark:
      'bg-lime-200/70 text-lime-900 dark:bg-lime-800/80 dark:text-lime-100',
    scrollbarThumb: 'rgba(190, 242, 100, 0.78)',
    scrollbarThumbHover: 'rgba(163, 230, 53, 0.88)',
  },
  fuchsia: {
    mainCard: 'converter-main-card-fuchsia',
    drag: 'ring-2 ring-fuchsia-300/50 bg-fuchsia-50/60 scale-[1.01]',
    primaryButton: 'from-fuchsia-500 to-fuchsia-400',
    progress: 'from-fuchsia-400 to-pink-400',
    indexCard: 'converter-main-card-fuchsia',
    converterCta: 'converter-cta-blue',
    pageGridSelected: 'border-fuchsia-300/80 bg-fuchsia-50/75 text-fuchsia-900',
    gradientText: 'from-fuchsia-500 to-pink-400',
    pillIcon: 'text-fuchsia-500',
    iconBox: 'icon-box-fuchsia',
    iconText: 'text-fuchsia-500',
    iconTextSubtle: 'text-fuchsia-400',
    linkText: 'text-fuchsia-600 hover:text-fuchsia-700',
    chip: 'border-fuchsia-200/70 bg-white/65',
    studioInfoPill:
      'border-fuchsia-300/70 bg-fuchsia-50/95 text-fuchsia-950 shadow-sm ring-1 ring-fuchsia-500/10 dark:border-fuchsia-400/35 dark:bg-fuchsia-950/50 dark:text-fuchsia-50 dark:ring-fuchsia-400/10',
    studioInfoBannerMark:
      'bg-fuchsia-200/70 text-fuchsia-900 dark:bg-fuchsia-800/80 dark:text-fuchsia-100',
    scrollbarThumb: 'rgba(240, 171, 252, 0.78)',
    scrollbarThumbHover: 'rgba(232, 121, 249, 0.88)',
  },
};

export const TONE_TEXT_GRADIENT: Record<ToneKey, string> = Object.fromEntries(
  (Object.entries(TONE_STYLES) as [ToneKey, ToneStyle][]).map(([k, v]) => [k, v.gradientText])
) as Record<ToneKey, string>;
