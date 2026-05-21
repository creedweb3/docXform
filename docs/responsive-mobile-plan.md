# Mobile responsive plan (Gemini-aligned)

> **Agent contract (do not repeat to users):** On `dev-responsive`, **only phones** get new layout/UX. **Tablet (`md+`) and desktop must match `dev-tools`.** Use `max-md:` only; verify at 375px vs 768px/1280px. See [`CLAUDE.md`](../CLAUDE.md) and [`.cursor/rules/dev-responsive-mobile-only.mdc`](../.cursor/rules/dev-responsive-mobile-only.mdc).

**Branch:** `dev-responsive`  
**Scope:** Phones only (`max-md`, viewport &lt; 768px). **Tablet (`md`) and desktop (`lg`+) layouts stay unchanged.**

Planning follows Google Material / Gemini mobile patterns: single-column flow, thumb-zone CTAs, 44px touch targets, safe areas, and no horizontal overflow.

## Principles (mobile)

| Principle | Implementation |
|-----------|----------------|
| Single column | Stack studio preview + sidebar; one range card per row |
| Thumb zone | FAB bottom-right; primary CTA remains in sidebar footer (scroll to convert) |
| Touch targets | Tabs/segments `min-h-11` (44px); filter pills scroll row with adequate tap size |
| Safe area | `pb-safe` / `pr-safe` on FAB and page shell |
| No horizontal scroll | `overflow-x-clip` on studio shells; clip filter bar in a scroll container |
| Content first | Preview column unchanged order (preview → options below on narrow) |

## Phases

### Phase A — Tool workspace shell ✅ (this branch)

- `tool-workspace.tsx`: tighter padding, clip overflow, preview area bottom padding for FAB, shorter queue scroll on small viewports
- `studio-ui.tsx`: FAB moves to bottom on mobile with safe-area inset
- `tool-page.tsx`: `px-4`, reduced top padding on mobile

### Phase B — PDF split studio ✅ (this branch)

- `pdf-tool-studio-surfaces.tsx`: range grid `grid-cols-1` on mobile (full-width cards); page thumb grid `grid-cols-2`
- `pdf-split-tool.tsx`: From/To inputs stack vertically on mobile

### Phase C — Marketing / hub ✅ (partial)

- `app/page.tsx`: hero type scale and horizontal padding on mobile
- `tools-index-client.tsx`: horizontally scrollable filter pills (no wrap squeeze)
- `globals.css`: `pb-safe`, `pr-safe`, mobile `scrollbar-gutter` override

### Mobile screen map (PDF split, phone)

```
┌─────────────────────────────┐
│ Nav                         │
├─────────────────────────────┤
│ Title + 1-line subtitle     │  ← compact hero
├─────────────────────────────┤
│ Chips: files · size         │  ← hide duplicate privacy chip
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ SPLIT PREVIEW (scroll)  │ │  ← min ~50vh; range cards stacked
│ │ [Range 1]               │ │
│ │ [Range 2]               │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ▶ How Range & Pages work    │  ← collapsed <details>
├─────────────────────────────┤
│ Tabs: Range | Pages | Size  │
│ Controls + Split CTA        │
└─────────────────────────────┘
```

Tablet/desktop: unchanged two-column studio + sidebar.

### Phase F — M3 / Gemini mobile polish ✅

- **`docs/mobile-ui-gemini-spec.md`**: mobile design contract + optional `scripts/gemini-mobile-ui-brief.mjs` (Gemini 2.0 Flash)
- **`app/globals.css`**: phone-only utilities (`mobile-preview-shell`, `mobile-range-card`, `mobile-sheet-scrim`, `mobile-rail-*`)
- **`MobileStudioRail`**: tone FAB with “Settings” label, frosted scrim, tonal header, scroll lock, elevated CTA bar
- **`studio-ui`**: 44px tabs/segments on phone
- **PDF split preview**: softer range cards, taller summary tap target, preview shell padding for FAB

### Phase E — RTL settings rail + 2-column preview ✅

- **`MobileStudioRail`**: compact **gear / close icon** on the right edge; panel **slides in from the right** (not a full-width bottom bar).
- **2-column range grid** on phone (`computeRangeCardColSpansMobile`): multi alone → full row (2); single+single → half each (1+1); lone single → full row (2).
- **Removed** floating bottom dock and pinned CTAs.
- Single-file PDF split: queue file row hidden on phone (preview is enough).

### Phase D — Follow-up (not in this commit)

- Sticky bottom primary CTA on tool pages (optional `position: sticky` + safe area)
- Playwright: 375×812 viewport, assert `document.documentElement.scrollWidth <= clientWidth`
- Converter landing pages (`pdf-to-word`, `word-to-pdf`) shared layout token if duplicated `main` classes persist

## Breakpoint contract

```
< 768px   max-md   phone — NEW rules only
≥ 768px   md+      tablet — unchanged
≥ 1024px  lg+      desktop studio split — unchanged
```

## Root cause (PDF split “thin line” studio)

Desktop studio height comes from a **flex chain** (`flex-1` + `basis-0` + `min-h-0`) inside a **two-column grid with implicit height**. On mobile the grid **stacks** and the parent has **no fixed height**, so the preview column **collapses to ~0px** — only borders/padding remain visible; the sidebar (hint + queue) looks like the whole tool.

**Fix:** On `max-md`, drop `flex-1 basis-0` on the studio slot and set explicit `min-h-[min(50vh,…)]` on the preview panel and scroll region. Collapse the long `studioHint` into `<details>` so the preview gets above-the-fold space.

## Verification checklist

- [ ] `/tools/pdf-split` at **768px and 1280px**: layout matches **`dev-tools`** (sidebar, 6-col range grid, thumb sizes)
- [ ] `/tools/pdf-split` at 375px: no horizontal scroll; range cards full width
- [ ] FAB does not cover range thumbs or last row
- [ ] Sidebar From/To usable one-handed
- [ ] `/tools` filter row scrolls smoothly
- [ ] iPhone safe area: home indicator clear of FAB
