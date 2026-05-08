import type { SiteArticle } from '@/lib/site-articles';

/** Bottom CTA card copy - mirrors flagship static article pages; keyed by slug for tone and tool match. */
const CTA_BY_SLUG: Record<string, { title: string; body: string }> = {
  'modern-word-security': {
    title: 'Convert PDFs without uploading the file',
    body: "Use docXform's browser-based PDF to Word converter when you need editable DOCX output and want conversion to stay on your device.",
  },
  'formatting-guide': {
    title: 'Convert a prepared Word file to PDF',
    body: 'Once your DOC or DOCX file is ready, use docXform to create a browser-generated PDF without uploading the document.',
  },
  'docx-standards': {
    title: 'Convert DOCX files in the browser',
    body: 'Use docXform when you need to turn a DOC or DOCX document into a PDF without sending the file to a server-side converter.',
  },
  'pdf-optimization': {
    title: 'Create a PDF from Word',
    body: 'Convert a prepared DOC or DOCX file to PDF in your browser, then review the final file size and layout before sharing.',
  },
  'word-to-pdf-without-upload': {
    title: 'Convert Word to PDF without uploading your document',
    body: "Use docXform's browser-based Word to PDF converter when you want the DOCX processed locally and the PDF generated in your browser.",
  },
  'pdf-to-word-scanned-ocr': {
    title: 'Turn PDF pages into editable Word output',
    body: "Use docXform's PDF to Word converter in the browser when you need DOCX from normal PDFs; for scanned pages, treat the result as a draft and proofread carefully.",
  },
  'batch-word-to-pdf': {
    title: 'Process multiple Word files in one session',
    body: "Use docXform's Word to PDF tool in the browser and download each PDF as it completes, or zip outputs for easier sharing - stay within practical RAM limits per tab.",
  },
  'font-embedding-pdf': {
    title: 'Export DOCX to PDF with layout in mind',
    body: 'After tightening fonts and styles in Word, use docXform to generate a PDF without uploading the file so you can review fidelity before distribution.',
  },
  'table-heavy-pdf-to-word': {
    title: 'Convert table-heavy PDFs to Word in the browser',
    body: 'Use docXform when you need editable DOCX from PDFs with complex layouts, then adjust merged cells and wrap settings in Word as needed.',
  },
  'docx-to-pdf-legal-briefs': {
    title: 'Generate a PDF brief from your finalized DOCX',
    body: "Use docXform's local Word to PDF conversion, then verify bookmarks, metadata, and pagination against your court or filing rules before submission.",
  },
  'pdf-to-word-privacy-compliance': {
    title: 'Keep PDF-to-Word conversion on your device',
    body: 'Use docXform when you need editable DOCX output without routing the document through a remote conversion API - a simpler posture for sensitive workflows.',
  },
  'wasm-converter-troubleshooting': {
    title: 'Retry conversion after fixing environment issues',
    body: 'When caches or storage are the problem, reset the browser tab, confirm the WASM assets load, then run PDF to Word again with a smaller test file.',
  },
  'first-load-wasm-slow-devices': {
    title: 'Open the converter when you have a calm moment',
    body: 'Pick Word to PDF or PDF to Word, let the first load finish on a steady connection, then try a small file before you convert something important.',
  },
  'browser-conversion-future': {
    title: 'Try conversion without uploading the file',
    body: "Use docXform's PDF to Word or Word to PDF tools in the browser when you want processing to stay on your device as networks and hardware keep improving.",
  },
};

function fallbackCta(article: SiteArticle): { title: string; body: string } {
  if (article.relatedHref === '/word-to-pdf') {
    return {
      title: 'Convert Word to PDF in your browser',
      body: 'Use docXform to turn a DOC or DOCX file into a PDF without uploading the document to a conversion server.',
    };
  }
  return {
    title: 'Convert PDF to Word in your browser',
    body: "Use docXform's PDF to Word converter when you need editable DOCX output and want processing to stay on your device.",
  };
}

export function getArticleDetailCta(article: SiteArticle): { title: string; body: string } {
  return CTA_BY_SLUG[article.slug] ?? fallbackCta(article);
}
