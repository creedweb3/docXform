import { TONE_STYLES, type FormatTone } from '@/components/tools/tone-styles';

export type ToolFormat = 'pdf' | 'docx' | 'pptx' | 'image';

/** Single site palette for all `/tools/*` workspaces (Imprint copper — not per file type). */
export const SITE_TOOL_TONE: FormatTone = 'orange';

/** @deprecated Per-format hues; kept for taxonomy only. Runtime styling uses {@link SITE_TOOL_TONE}. */
export const FORMAT_TONE: Record<ToolFormat, FormatTone> = {
  pdf: SITE_TOOL_TONE,
  docx: SITE_TOOL_TONE,
  image: SITE_TOOL_TONE,
  pptx: SITE_TOOL_TONE,
};

export function getFormatTone(_format: ToolFormat): FormatTone {
  return SITE_TOOL_TONE;
}

const BRAND_CATALOG_TOKENS = {
  accentClass:
    'border-[hsl(var(--brand-copper)/0.22)] bg-[hsl(var(--brand-copper)/0.06)] text-[hsl(var(--brand-copper))]',
  badgeClass: 'bg-[hsl(var(--brand-copper)/0.12)] text-[hsl(var(--brand-copper))]',
  buttonClass: TONE_STYLES.orange.primaryButton,
} as const;

export function formatCatalogTokens(_tone: FormatTone) {
  return BRAND_CATALOG_TOKENS;
}
