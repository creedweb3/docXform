# Pages reference

**Upload:** browser-only (no server upload)  
**Limits:** 100 MB per file · up to 10 files when batch is on

**Words used below**

- **Preview · grid** — PDF page thumbnails + selection  
- **Preview · list** — file queue / sidebar only (no page grid)  
- **Preview · off** — drop → options → run (no preview step)  
- **Studio · full** — two-column studio + page tools  
- **Studio · basic** — wide layout + file strip (no full studio)  
- **Studio · off** — standard narrow workspace  

---

## Legacy converters

### Word to PDF — `/word-to-pdf`

- **In:** `.doc`, `.docx` → **Out:** PDF  
- **Batch:** yes  
- **Preview:** list (queue only)  
- **Studio:** off  
- **Quality:** LibreOffice WASM (fixed)  
- **Options:** none  
- **After run:** download per file or ZIP  
- **UI:** `document-converter.tsx`  

### PDF to Word — `/pdf-to-word`

- **In:** `.pdf` → **Out:** DOCX  
- **Batch:** yes  
- **Preview:** list (queue only)  
- **Studio:** off  
- **Quality:** LibreOffice WASM (fixed)  
- **Options:** none  
- **After run:** download per file or ZIP  
- **UI:** `document-converter.tsx`  

**Redirects:** `/docx-to-pdf`, `/doc-to-pdf` → word-to-pdf · `/pdf-to-docx` → pdf-to-word  

---

## Tools — quick compare

### PDF (rose)

```
Tool              Batch   Preview        Studio    ZIP
──────────────────────────────────────────────────────
PDF Merge         yes     grid           full      yes
PDF Split         no      grid           full      yes
PDF Compress      yes     list           basic     yes
PDF to Images     yes     grid           full      yes
PDF Rotate        yes     grid           full      yes
PDF Organize      no      grid           full      yes
PDF Watermark     yes     grid           full      yes
PDF Unlock        yes     list           basic     yes
PDF to Text       yes     list           basic     yes
```

### DOCX (blue)

```
Tool                 Batch   Preview   Studio   ZIP
───────────────────────────────────────────────────
DOCX → PPTX          yes     off       off      yes
DOCX Metadata Scrub  yes     off       off      yes
DOCX → TXT / MD      yes     off       off      yes
```

### PPTX (orange)

```
Tool           Batch   Preview   Studio   ZIP
─────────────────────────────────────────────
PPTX to PDF    yes     off       off      yes
```

### Image (purple)

```
Tool              Batch   Preview   Studio   ZIP
────────────────────────────────────────────────
Images to PDF     yes     list      basic    no*
Image Convert     yes     off       off      yes
Image Compress    yes     off       off      yes
```
\* Images to PDF outputs one PDF (not a ZIP of PDFs)

---

## Tools — options (only where it matters)

### PDF Split — `/tools/pdf-split`

- **Range tab:** custom page ranges · split every N pages · merge range outputs into one PDF  
- **Pages tab:** all pages · pick pages on grid · merge picked pages into one PDF  

### PDF Compress — `/tools/pdf-compress`

- **Preset:** light · balanced · max  

### PDF to Images — `/tools/pdf-to-images`

- **Format:** PNG · JPEG  
- **Scale / JPEG quality**  
- **Page pick** on grid  

### PDF Rotate — `/tools/pdf-rotate`

- **Angle:** 90° · 180° · 270°  
- **Scope:** all · odd · even · custom ranges  
- **Page pick** on grid  

### PDF Organize — `/tools/pdf-organize`

- **Page order** (text + grid reorder)  

### PDF Watermark — `/tools/pdf-watermark`

- **Text, position, tile, opacity, font size, color, page ranges**  

### PDF Unlock — `/tools/pdf-unlock`

- Strips **owner** restrictions only (not open-password PDFs)  

### PDF to Text — `/tools/pdf-to-text`

- **Output:** one combined file · per-page files  

### PDF Merge — `/tools/pdf-merge`

- **Reorder files** · **per-file page pick** on grid  

### DOCX Metadata Scrub — `/tools/docx-scrub`

- Remove **comments** · **properties** · **custom XML** (toggles)  

### DOCX → TXT / MD — `/tools/docx-to-text`

- **Output:** plain text · Markdown  

### Images to PDF — `/tools/images-to-pdf`

- **Reorder images** · **fit:** fit-to-page · keep aspect  

### Image Convert — `/tools/image-convert`

- **Target:** JPEG · PNG · WebP · **quality** slider  

### Image Compress — `/tools/image-compress`

- **Preset:** web · balanced · archive  

### DOCX → PPTX · PPTX to PDF

- No user options panel (engine defaults)  

---

**Code:** `lib/tools.ts` + each `components/tools/*-tool.tsx`
