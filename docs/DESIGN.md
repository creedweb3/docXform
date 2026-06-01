# docXform — Design system (Imprint)

## Identity

**Imprint** — a document instrument, not a SaaS landing page. Warm ink on press-black, copper accents (print / seal), mono for machine-readable metadata.

## Scene

Someone converting a sensitive file before a deadline. The UI should feel like a precise tool with a publisher’s typographic spine — not a startup template.

## Color

| Token | Role |
|-------|------|
| background `32 14% 5%` | Warm black |
| foreground `42 26% 92%` | Warm paper white |
| brand-copper `26 72% 48%` | Primary accent, links, rules, CTAs |
| brand-sage `148 38% 42%` | Success / WASM ready only |

No blue/purple primaries. No glassmorphism cards.

## Typography

| Role | Family |
|------|--------|
| Display | Fraunces 500–700 |
| UI / body | IBM Plex Sans 400–600 |
| Mono / labels | IBM Plex Mono 400–500 |

**Signatures:** italic copper **X** in wordmark (`.brand-x`), `.label-mono` for metadata, `.brand-rule` copper hairline before sections.

## Surfaces

Use **Sheet** (`components/site/ui/sheet.tsx`) — flat paper, `rounded-sm`, subtle top inset highlight, copper border on hover. Not frosted glass, not `rounded-2xl` cards.

## Layout

- Max width ~76rem
- List/catalog patterns over icon grids
- Index markers (A/B/C) or mono step numbers — not 4-column feature tiles

## Bans

- Inter, Geist, Plus Jakarta, default blue SaaS palette
- `panel-frost`, heavy shadows, gradient CTAs
- Identical 3–4 col icon card grids
- Pill nav bars in bordered capsules

## Motion

Particles: warm copper network, optional. Respect `prefers-reduced-motion`.
