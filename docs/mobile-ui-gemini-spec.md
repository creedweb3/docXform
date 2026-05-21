# Mobile UI spec (Material 3 / Gemini-aligned)

**Branch:** `dev-responsive` · **Scope:** phones only (`max-md`, &lt;768px). Tablet/desktop unchanged (`dev-tools`).

This spec applies [Google Material 3](https://m3.material.io/) mobile patterns used in Gemini-style apps: tonal surfaces, 48dp touch targets, content-first hierarchy, and thumb-zone actions.

## Design goals

| Goal | Mobile treatment |
|------|------------------|
| Preview first | ~58vh min-height preview shell; settings in slide-in rail |
| Scannable outputs | 2-column range grid; portrait page thumbs (`aspect-[85/110]`) |
| Clear affordances | Tone-tinted settings FAB; segmented tabs ≥44px tall |
| Calm chrome | Softer cards (solid border + light shadow vs heavy dashed-only) |
| Safe areas | `pb-safe` on shell, rail CTAs, and page footer |

## Surfaces

- **Preview panel:** `bg-[#f4f5f7]` shell, white inner cards, `rounded-2xl`, light ring
- **Range card:** dashed border retained but lighter; `rounded-2xl`, white fill, subtle shadow
- **Settings rail:** frosted scrim, `rounded-l-3xl` sheet, tone accent on header + FAB
- **CTA footer (rail):** elevated bar, full-width primary button, safe-area padding

## Components

| Component | File |
|-----------|------|
| Mobile tokens (CSS) | `app/globals.css` (`@media max-width: 767px`) |
| Settings rail | `components/tools/studio/mobile-studio-rail.tsx` |
| Tabs / segments | `components/tools/studio/studio-ui.tsx` (`max-md:`) |
| Split preview | `components/tools/studio/pdf-tool-studio-surfaces.tsx` |
| Tool shell | `components/tools/tool-workspace.tsx` |

## Optional: Gemini Flash review

If `GEMINI_API_KEY` is set, run:

```bash
node scripts/gemini-mobile-ui-brief.mjs
```

That calls **Gemini 2.0 Flash** with current component summaries and writes suggestions to `docs/mobile-ui-gemini-flash-output.md` (gitignored). Implementation in this repo follows the spec above; use the script for iterative copy/layout ideas.
