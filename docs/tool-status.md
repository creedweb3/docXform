# Completion status

UX / polish sign-off (not “does the engine run”). Tools are grouped by **product tier** — see **`docs/pages-reference.md`** for what each tier means.

---

## Tier 1 — Direct convert

Drop → Convert. **No mode or preset UI.**

| Route | Status |
|-------|--------|
| `/word-to-pdf` | Done · live |
| `/pdf-to-word` | Done · live |
| `/tools/pptx-to-pdf` | Done · live |
| `/tools/docx-to-pptx` | Done · live |
| `/tools/pdf-unlock` | Done · live |

---

## Tier 2 — Options only

Pick from 2–4 radios/toggles → Convert. **No tabs or page grid.**

| Route | Status |
|-------|--------|
| `/tools/pdf-compress` | WIP |
| `/tools/image-compress` | WIP |
| `/tools/image-convert` | WIP |
| `/tools/pdf-to-text` | WIP |
| `/tools/docx-to-text` | WIP |
| `/tools/docx-scrub` | WIP |
| `/tools/images-to-pdf` | WIP |

---

## Tier 3 — Studio modes & edits

Tabs, modes, page grid, structural edits.

| Route | Status |
|-------|--------|
| `/tools/pdf-split` | **Done** (only live utility tool) |
| `/tools/pdf-merge` | WIP |
| `/tools/pdf-rotate` | WIP |
| `/tools/pdf-organize` | WIP |
| `/tools/pdf-watermark` | WIP |
| `/tools/pdf-to-images` | WIP |

---

## Index & shared

| Route | Status |
|-------|--------|
| `/tools` | Done |

---

## Launch a tool

Set `TOOL_PAGE_AVAILABLE['your-slug'] = true` in `lib/tool-availability.ts`.

## Counts

**Live tier 1:** 5 (Word to PDF, PDF to Word, PPTX to PDF, DOCX to PPTX, PDF Unlock)  
**Live tier 3:** 1 (PDF Split)  
**Coming soon on index:** 12 utility tools  
