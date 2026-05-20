import type { ToolDefinition, ToolIntent } from '@/lib/tools';
import type { ToolFormat } from '@/lib/format-tone';
import { getFormatTone } from '@/lib/format-tone';
import type { WorkspaceConfig } from '@/components/tools/tool-workspace';
import { TONE_STYLES, type ToneKey } from '@/components/tools/tone-styles';

export { FORMAT_TONE, formatCatalogTokens, getFormatTone } from '@/lib/format-tone';
export type { FormatTone } from '@/components/tools/tone-styles';

/** Format chip on tools index (utilities use white cards; color lives in icon/title/badge). */
export const FORMAT_ACCENT: Record<ToolFormat, string> = {
  pdf: 'border-rose-200/80 bg-rose-50/90 text-rose-800',
  docx: 'border-blue-200/80 bg-blue-50/90 text-blue-800',
  image: 'border-purple-200/80 bg-purple-50/90 text-purple-800',
  pptx: 'border-orange-200/80 bg-orange-50/90 text-orange-800',
};

/** Secondary accent for job/intent badges (neutral chips on the index). */
export const INTENT_ACCENT: Record<ToolIntent, string> = {
  edit: 'border-slate-200/80 bg-white/90 text-slate-700',
  convert: 'border-slate-200/80 bg-white/90 text-slate-700',
  optimize: 'border-slate-200/80 bg-white/90 text-slate-700',
  extract: 'border-slate-200/80 bg-white/90 text-slate-700',
  privacy: 'border-slate-200/80 bg-white/90 text-slate-700',
};

export type WorkspaceThemeFields = Pick<
  WorkspaceConfig,
  | 'cardClass'
  | 'iconBoxClass'
  | 'iconClass'
  | 'dragClass'
  | 'primaryButtonClass'
  | 'progressClass'
  | 'tone'
>;

export function workspaceThemeFromTone(tone: ToneKey): WorkspaceThemeFields {
  const s = TONE_STYLES[tone];
  return {
    cardClass: s.mainCard,
    iconBoxClass: s.iconBox,
    iconClass: s.iconText,
    dragClass: s.drag,
    primaryButtonClass: s.primaryButton,
    progressClass: s.progress,
    tone,
  };
}

export function workspaceThemeFromTool(tool: ToolDefinition): WorkspaceThemeFields {
  return workspaceThemeFromTone(getFormatTone(tool.format));
}

/** White utility cards on `/tools` (no format wash on the card surface). */
export const TOOLS_INDEX_UTILITY_CARD =
  'group flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/80 glass-subtle p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Pastel card for legacy/core converters only. */
export function toolsIndexCoreCardClass(tone: ToneKey): string {
  return `group flex flex-col gap-4 rounded-2xl border p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${TONE_STYLES[tone].mainCard}`;
}

export function toolsIndexLinkClass(tone: ToneKey): string {
  return `inline-flex items-center gap-1.5 text-xs font-semibold ${TONE_STYLES[tone].linkText} group-hover:gap-2 transition-all`;
}

/** Active filter pill — pastel wash, not solid 600 gradient. */
export const FILTER_PILL_ACTIVE =
  'border border-blue-200/90 bg-blue-50/90 font-semibold text-blue-800 shadow-sm focus-visible:ring-blue-500/35';

export const FILTER_MODE_THUMB_ACTIVE =
  'absolute inset-0 rounded-full border border-blue-200/90 bg-blue-50/95 shadow-sm';

type BuildWorkspaceConfigInput = Omit<
  WorkspaceConfig,
  keyof WorkspaceThemeFields
> &
  Partial<WorkspaceThemeFields>;

/**
 * Merge per-tool copy with the file-type pastel theme (`FORMAT_TONE`).
 */
export function buildWorkspaceConfig(
  tool: ToolDefinition,
  partial: BuildWorkspaceConfigInput
): WorkspaceConfig {
  return {
    ...workspaceThemeFromTool(tool),
    iconPair: tool.iconPair,
    storageKey: tool.slug,
    ...partial,
  };
}

export type FlagshipConverterMode = 'word-to-pdf' | 'pdf-to-word';

export function flagshipConverterTheme(mode: FlagshipConverterMode) {
  const tone: ToneKey = mode === 'word-to-pdf' ? 'blue' : 'rose';
  const s = TONE_STYLES[tone];
  return {
    cardClass: s.mainCard,
    iconBoxClass: s.iconBox,
    iconClass: s.iconText,
    dragClass: s.drag,
    primaryButtonClass: s.primaryButton,
    progressClass: s.progress,
    linkClass: s.linkText,
    chipClass: s.chip,
    queueScrollbarThumb: s.scrollbarThumb,
    queueScrollbarThumbHover: s.scrollbarThumbHover,
  };
}
