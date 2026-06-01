import type { ToolDefinition, ToolIntent } from '@/lib/tools';
import type { ToolFormat } from '@/lib/format-tone';
import { getFormatTone } from '@/lib/format-tone';
import type { WorkspaceConfig } from '@/components/tools/tool-workspace';
import { TONE_STYLES, type ToneKey } from '@/components/tools/tone-styles';
import { cn } from '@/lib/utils';
import {
  FILTER_PILL_ACTIVE as FILTER_PILL_ACTIVE_CLASS,
  FILTER_PILL_IDLE,
} from '@/lib/site-design';

export { FORMAT_TONE, formatCatalogTokens, getFormatTone } from '@/lib/format-tone';
export type { FormatTone } from '@/components/tools/tone-styles';

/** Format chip on tools index — neutral on dark surfaces. */
export const FORMAT_ACCENT: Record<ToolFormat, string> = {
  pdf: 'border-border/70 bg-card/40 text-muted-foreground',
  docx: 'border-border/70 bg-card/40 text-muted-foreground',
  image: 'border-border/70 bg-card/40 text-muted-foreground',
  pptx: 'border-border/70 bg-card/40 text-muted-foreground',
};

export const INTENT_ACCENT: Record<ToolIntent, string> = {
  edit: 'border-border/70 bg-card/40 text-muted-foreground',
  convert: 'border-border/70 bg-card/40 text-muted-foreground',
  optimize: 'border-border/70 bg-card/40 text-muted-foreground',
  extract: 'border-border/70 bg-card/40 text-muted-foreground',
  privacy: 'border-border/70 bg-card/40 text-muted-foreground',
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

/** Dark utility cards on `/tools`. */
export const TOOLS_INDEX_UTILITY_CARD =
  'group flex flex-col gap-4 rounded-xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-foreground/12 hover:bg-card/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10';

export function toolsIndexCoreCardClass(_tone: ToneKey): string {
  return TOOLS_INDEX_UTILITY_CARD;
}

export function toolsIndexLinkClass(): string {
  return 'inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-all group-hover:text-foreground group-hover:gap-2';
}

export const FILTER_PILL_ACTIVE = FILTER_PILL_ACTIVE_CLASS;

export { FILTER_PILL_IDLE };

export const FILTER_MODE_THUMB_ACTIVE =
  'absolute inset-0 rounded-md border border-border bg-card/80';

type BuildWorkspaceConfigInput = Omit<
  WorkspaceConfig,
  keyof WorkspaceThemeFields
> &
  Partial<WorkspaceThemeFields>;

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
