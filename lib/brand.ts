/**
 * docXform brand tokens — "Imprint" (warm ink, copper accent, document instrument).
 * Use these class fragments instead of ad-hoc Tailwind for marketing UI.
 */

/** Copper hairline — signature section marker (titles, footer brand mark) */
export const BRAND_RULE = 'h-px w-10 bg-[hsl(var(--brand-copper))]';

/** Full content-column separator — major zone breaks only (hero/body, catalog/filter). */
export const CONTENT_RULE = 'content-rule block h-px w-full shrink-0 border-0';

/** Mono label (tool metadata, section index, WASM readout) */
export const LABEL_MONO =
  'font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground';

/** Primary marketing / workspace CTA — hover inverts so copper custom cursors stay visible on fill. */
export const BTN_PRIMARY =
  'border border-transparent bg-[hsl(var(--brand-copper))] text-[hsl(var(--brand-copper-foreground))] hover:border-[hsl(var(--brand-copper)/0.5)] hover:bg-background hover:text-[hsl(var(--brand-copper))]';

export const BTN_SECONDARY =
  'border border-[hsl(var(--brand-copper)/0.35)] bg-transparent text-foreground hover:bg-[hsl(var(--brand-copper)/0.08)]';

/** Flat "paper sheet" surface — no glass blur */
export const SHEET =
  'rounded-sm border border-border bg-card bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)]';

export const SHEET_HOVER =
  'transition-colors hover:border-[hsl(var(--brand-copper)/0.35)] hover:bg-[hsl(var(--card)/0.9)]';

export const SHEET_INSET = 'rounded-sm border border-border/80 bg-background/80';
