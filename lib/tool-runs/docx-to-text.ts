import JSZip from 'jszip';

export type DocxTextMode = 'txt' | 'markdown';

export type DocxTextResult = {
  name: string;
  blob: Blob;
  combined: string;
};

const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function getParagraphText(paragraph: Element): string {
  const runs = Array.from(paragraph.getElementsByTagNameNS(NS_W, 't'));
  const text = runs.map((node) => node.textContent ?? '').join('');
  return text.replace(/\u00a0/g, ' ');
}

function getHeadingLevel(paragraph: Element): number | null {
  const styleNode = paragraph.getElementsByTagNameNS(NS_W, 'pStyle')[0];
  if (!styleNode) return null;
  const val = styleNode.getAttribute(`w:val`) || styleNode.getAttributeNS(NS_W, 'val');
  if (!val) return null;
  const match = /Heading(\d+)/i.exec(val);
  if (!match) return null;
  const level = Number(match[1]);
  if (!Number.isFinite(level)) return null;
  return Math.max(1, Math.min(level, 6));
}

function isListParagraph(paragraph: Element): boolean {
  const numNode = paragraph.getElementsByTagNameNS(NS_W, 'numPr')[0];
  return Boolean(numNode);
}

export async function docxToText(
  file: File,
  mode: DocxTextMode,
  onProgress?: (percent: number) => void
): Promise<DocxTextResult> {
  if (typeof window === 'undefined') {
    throw new Error('DOCX text extraction runs only in the browser.');
  }

  onProgress?.(10);
  const zip = await JSZip.loadAsync(await file.arrayBuffer(), { checkCRC32: false });
  const documentEntry = zip.file('word/document.xml');
  if (!documentEntry) {
    throw new Error('Invalid DOCX: missing word/document.xml');
  }

  const xml = await documentEntry.async('text');
  onProgress?.(50);

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const paragraphs = Array.from(doc.getElementsByTagNameNS(NS_W, 'p'));

  const lines: string[] = [];
  paragraphs.forEach((paragraph) => {
    const rawText = getParagraphText(paragraph).trim();
    if (!rawText) {
      lines.push('');
      return;
    }
    if (mode === 'markdown') {
      const heading = getHeadingLevel(paragraph);
      if (heading) {
        lines.push(`${'#'.repeat(heading)} ${rawText}`);
      } else if (isListParagraph(paragraph)) {
        lines.push(`- ${rawText}`);
      } else {
        lines.push(rawText);
      }
    } else {
      lines.push(rawText);
    }
  });

  const combined = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  onProgress?.(95);

  const baseName = file.name.replace(/\.docx$/i, '');
  const outName = mode === 'markdown' ? `${baseName}.md` : `${baseName}.txt`;
  const mime = mode === 'markdown' ? 'text/markdown' : 'text/plain';

  onProgress?.(100);
  return {
    name: outName,
    blob: new Blob([combined], { type: mime }),
    combined,
  };
}
