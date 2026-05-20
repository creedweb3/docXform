# Completion status

UX / polish sign-off (not “does the engine run”).

## Done

- `/word-to-pdf` — Word to PDF  
- `/pdf-to-word` — PDF to Word  
- `/tools` — tools index  
- `/tools/pdf-split` — PDF Split (only live utility tool)  

## Work in progress

**Gate:** `lib/tool-availability.ts` — index lists WIP tools; routes show coming soon UI.  

**PDF**

- `/tools/pdf-merge`  
- `/tools/pdf-compress`  
- `/tools/pdf-to-images`  
- `/tools/pdf-rotate`  
- `/tools/pdf-organize`  
- `/tools/pdf-watermark`  
- `/tools/pdf-unlock`  
- `/tools/pdf-to-text`  

**DOCX**

- `/tools/docx-to-pptx`  
- `/tools/docx-scrub`  
- `/tools/docx-to-text`  

**PPTX**

- `/tools/pptx-to-pdf`  

**Image**

- `/tools/images-to-pdf`  
- `/tools/image-convert`  
- `/tools/image-compress`  

## Launch a tool

Set `TOOL_PAGE_AVAILABLE['your-slug'] = true` in `lib/tool-availability.ts`.

## Counts

**Live tool pages:** 1 (`pdf-split`)  
**Coming soon on index:** 15  
