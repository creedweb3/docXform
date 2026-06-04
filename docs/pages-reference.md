# Pages reference

**Upload:** browser-only (no server upload)  
**Limits:** 100 MB per file · up to 10 files when batch is on

Every product page uses **pick → studio → output** (`ConversionProductShell`). What differs is **how much the user configures in studio** before Run.

---

## Three product tiers

Use these slots when planning UX, docs, or sign-off. **Tier** is about **mode selection & editing depth**, not file format.

### Tier 1 — Direct convert

**Drop → queue (optional batch) → Convert.** No presets, no modes, no tabs.

| Route | In → Out | Notes |
|-------|----------|-------|
| `/word-to-pdf` | DOC/DOCX → PDF | Flagship · LibreOffice WASM · batch ZIP |
| `/pdf-to-word` | PDF → DOCX | Flagship · batch ZIP |
| `/tools/pptx-to-pdf` | PPTX → PDF | Engine defaults only |
| `/tools/docx-to-pptx` | DOCX → PPTX | Engine defaults only |
| `/tools/pdf-unlock` | PDF → PDF | Strips owner lock · info text only, no controls |

**Mode selection:** none — primary action is enough.  
**Studio:** default file list (queue / batch preview). No sidebar choices.  
**UI:** `DocumentConverter` (flagship) or `ToolWorkspace` without option `footer`.

**Redirects:** `/docx-to-pdf`, `/doc-to-pdf`, `/tools/docx-to-pdf` → `/word-to-pdf` · `/pdf-to-docx` → `/pdf-to-word`

---

### Tier 2 — Options only (pick one, convert)

**Drop → choose from a small fixed set (2–4 radios/toggles) → Convert.** No tabs, no page grid, no studio editing modes.

| Route | Choices before Run | Preview |
|-------|-------------------|---------|
| `/tools/pdf-compress` | Quality: light · balanced · max | list |
| `/tools/image-compress` | Preset: web · balanced · archive | none |
| `/tools/image-convert` | Output format (JPEG/PNG/WebP) + quality | none |
| `/tools/pdf-to-text` | Output: one combined file · per-page files | list |
| `/tools/docx-to-text` | Output: plain text · Markdown | none |
| `/tools/docx-scrub` | Toggles: comments · properties · custom XML | none |
| `/tools/images-to-pdf` | Layout: fit to page · native size (+ reorder files on stage) | list |

**Mode selection:** **options** — single panel of mutually exclusive or few checkboxes; no “Range vs Pages” style **modes**.  
**Studio pane:** **default** (file strip + options in right rail).  
**Not tier 2:** anything with **tabs**, **page grid editing**, or **multi-step range builders** → tier 3.

---

### Tier 3 — Studio modes & edits

**Drop → work in a proper studio** — tabs, modes, page grid, reorder, ranges, live preview of edits.

| Route | Modes / studio work | Preview |
|-------|---------------------|---------|
| `/tools/pdf-split` | **Tabs:** Range · Pages · **Range modes:** custom ranges, every N, merge outputs · **Extract:** pick/merge pages | grid |
| `/tools/pdf-merge` | Reorder files · per-file **page pick** on grid | grid |
| `/tools/pdf-rotate` | Angle + scope + optional ranges · **page grid** for fine selection | grid |
| `/tools/pdf-organize` | **Page order** (grid + text reorder) | grid |
| `/tools/pdf-watermark` | Text, position, tile, opacity, size, color, page ranges · stage preview | grid |
| `/tools/pdf-to-images` | Format, scale, JPEG quality · **page pick** on grid | grid |

**Mode selection:** **modes** — named workflows (tabs/segments), page-level selection, or structural edits before Run.  
**Studio pane:** **custom** (`studioSurface` + often `pageGrid`).  
**Live today:** PDF Split only (`lib/tool-availability.ts`).

---

### Tier vs table columns

| Concept | Tier 1 | Tier 2 | Tier 3 |
|---------|--------|--------|--------|
| **User question** | “Convert this.” | “Which preset?” | “How should pages/files be edited?” |
| **Sidebar** | Empty (or info only) | 2–4 options | Modes + tools + grid |
| **Preview** (see glossary) | list or none | list or none | usually **grid** |
| **Studio pane** (see glossary) | default | default | **custom** |

---

## Flow (all tiers)

| Stage | What the user sees |
|-------|-------------------|
| **pick** | Drop zone + trust row. Marketing below on desktop. |
| **studio** | Tier 1–3 content above (left preview · right queue + options + Run). |
| **output** | `download.queue` + artifacts. |

Shell: `#080808` terminal · brand copper on **`/tools/*`** + flagship routes · per-format hues on **`/tools`** index only.

---

## Column glossary (detail tables)

### Live

Route published? **`yes`** = full UI · **`no`** = Coming soon (`lib/tool-availability.ts`). Index always lists all tools.

### Batch

**yes** = up to 10 input files · **no** = one primary input (e.g. Split).

### Preview

| Value | Meaning |
|-------|---------|
| **grid** | Every PDF **page** as thumbnail; select/reorder pages (`pageGrid`). |
| **list** | One row/card per **file**; optional single thumb; no page grid. |
| **none** | Filenames/icons only. |

### Studio pane

| Value | Meaning |
|-------|---------|
| **custom** | Tool-specific left pane (`studioSurface`). Tier 3. |
| **default** | Generic file strip (`DefaultBatchStudioSurface`). Tier 1–2. |

### ZIP

**yes** = multi-file ZIP download · **no** = single artifact (e.g. Images to PDF → one PDF).

---

## All tools — by tier

**Live** column = route gate only.

### Tier 1 — Direct convert

```
Route                 Live   Batch   Preview   ZIP
──────────────────────────────────────────────────
/word-to-pdf          yes    yes     list      yes
/pdf-to-word          yes    yes     list      yes
/tools/pptx-to-pdf    yes    yes     none      yes
/tools/docx-to-pptx   yes    yes     none      yes
/tools/pdf-unlock     yes    yes     list      yes
```

### Tier 2 — Options only

```
Route                 Live   Batch   Preview   ZIP   Options summary
─────────────────────────────────────────────────────────────────────
/tools/pdf-compress   no     yes     list      yes   3 quality presets
/tools/image-compress no     yes     none      yes   3 presets
/tools/image-convert  no     yes     none      yes   format + quality
/tools/pdf-to-text    no     yes     list      yes   combined vs per-page
/tools/docx-to-text   no     yes     none      yes   text vs Markdown
/tools/docx-scrub     no     yes     none      yes   3 scrub toggles
/tools/images-to-pdf  no     yes     list      no*   fit + file order
```

\* One PDF output, not a ZIP.

### Tier 3 — Studio modes & edits

```
Route                 Live   Batch   Preview   Studio pane   ZIP
───────────────────────────────────────────────────────────────
/tools/pdf-split      yes    no      grid      custom        yes
/tools/pdf-merge      no     yes     grid      custom        yes
/tools/pdf-rotate     no     yes     grid      custom        yes
/tools/pdf-organize   no     no      grid      custom        yes
/tools/pdf-watermark  no     yes     grid      custom        yes
/tools/pdf-to-images  no     yes     grid      custom        yes
```

---

## Tier 3 — option reference

### PDF Split — `/tools/pdf-split`

- **Range tab:** custom ranges · every N pages · merge range outputs  
- **Pages tab:** all · pick on grid · merge picked into one PDF  

### PDF Merge — `/tools/pdf-merge`

- Reorder files · per-file page pick on grid  

### PDF Rotate — `/tools/pdf-rotate`

- Angle 90° / 180° / 270° · scope all/odd/even · optional range string · page grid  

### PDF Organize — `/tools/pdf-organize`

- Page order via grid + text  

### PDF Watermark — `/tools/pdf-watermark`

- Text, position, tile, opacity, font size, color, page ranges  

### PDF to Images — `/tools/pdf-to-images`

- PNG/JPEG · scale · JPEG quality · page pick on grid  

---

## Tier 2 — option reference

| Tool | Options |
|------|---------|
| PDF Compress | light · balanced · max |
| Image Compress | web · balanced · archive |
| Image Convert | JPEG · PNG · WebP + quality |
| PDF to Text | combined · per-page |
| DOCX to Text | plain text · Markdown |
| DOCX Scrub | comments · properties · custom XML |
| Images to PDF | fit to page · native size (+ reorder files) |

---

## Code map

| Concern | Location |
|---------|----------|
| Tool catalog | `lib/tools.ts` |
| Live gate | `lib/tool-availability.ts` |
| Tier 1 workspace | `document-converter.tsx`, minimal `*-tool.tsx` |
| Tier 2 options | `footer` on `ToolWorkspace` (RadioGroup, toggles) |
| Tier 3 studio | `studioSurface` + `pageGrid` in `*-tool.tsx`, `pdf-tool-studio-surfaces.tsx` |
| Flow shell | `conversion-product-shell.tsx` |
| Output | `studio-flow-artifacts-pane.tsx` |

See **`docs/tool-status.md`** for launch checklist by tier.
