import { TONE_STYLES, type FormatTone } from '@/components/tools/tone-styles';

export type ToolFormat = 'pdf' | 'docx' | 'pptx' | 'image';

/** File-type palette: PDF rose, Word/DOCX blue, image purple, PPTX orange. */
export const FORMAT_TONE: Record<ToolFormat, FormatTone> = {
  pdf: 'rose',
  docx: 'blue',
  image: 'purple',
  pptx: 'orange',
};

export function getFormatTone(format: ToolFormat): FormatTone {
  return FORMAT_TONE[format];
}

const FORMAT_CATALOG_TOKENS: Record<
  FormatTone,
  { accentClass: string; badgeClass: string; buttonClass: string }
> = {
  rose: {
    accentClass: 'bg-rose-50 text-rose-700 border-rose-100',
    badgeClass: 'text-rose-700 bg-rose-100',
    buttonClass: TONE_STYLES.rose.primaryButton,
  },
  blue: {
    accentClass: 'bg-blue-50 text-blue-700 border-blue-100',
    badgeClass: 'text-blue-700 bg-blue-100',
    buttonClass: TONE_STYLES.blue.primaryButton,
  },
  purple: {
    accentClass: 'bg-purple-50 text-purple-700 border-purple-100',
    badgeClass: 'text-purple-700 bg-purple-100',
    buttonClass: TONE_STYLES.purple.primaryButton,
  },
  orange: {
    accentClass: 'bg-orange-50 text-orange-700 border-orange-100',
    badgeClass: 'text-orange-700 bg-orange-100',
    buttonClass: TONE_STYLES.orange.primaryButton,
  },
};

export function formatCatalogTokens(tone: FormatTone) {
  return FORMAT_CATALOG_TOKENS[tone];
}
