import JSZip from 'jszip';

export type ScrubOptions = {
  removeComments: boolean;
  removeProperties: boolean;
  removeCustomXml: boolean;
};

export type ScrubResult = {
  name: string;
  blob: Blob;
  summary: {
    removedComments: number;
    removedProps: boolean;
    removedCustomXml: boolean;
  };
};

const COMMENT_PATHS = ['word/comments.xml', 'word/commentsExtended.xml', 'word/commentsIds.xml', 'word/people.xml'];
const PROP_PATHS = ['docProps/core.xml', 'docProps/app.xml', 'docProps/custom.xml'];

function removeNodes(xmlString: string, selectors: string[]): { xml: string; removed: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  let removed = 0;
  selectors.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((node) => {
      node.parentNode?.removeChild(node);
      removed += 1;
    });
  });
  const serializer = new XMLSerializer();
  return { xml: serializer.serializeToString(doc), removed };
}

export async function scrubDocx(file: File, options: ScrubOptions): Promise<ScrubResult> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer(), { checkCRC32: false });

  let removedComments = 0;
  if (options.removeComments) {
    COMMENT_PATHS.forEach((path) => {
      if (zip.file(path)) {
        zip.remove(path);
        removedComments += 1;
      }
    });
  }

  let removedProps = false;
  if (options.removeProperties) {
    PROP_PATHS.forEach((path) => {
      if (zip.file(path)) {
        zip.remove(path);
        removedProps = true;
      }
    });
  }

  let removedCustomXml = false;
  if (options.removeCustomXml) {
    const customFolder = zip.folder('customXml');
    if (customFolder) {
      removedCustomXml = true;
      Object.keys(customFolder.files).forEach((key) => {
        zip.remove(key);
      });
    }
  }

  // Light sanitization: strip revision tracking flags if present
  const settingsPath = 'word/settings.xml';
  if (options.removeComments && zip.file(settingsPath)) {
    const xml = await zip.file(settingsPath)!.async('text');
    const { xml: sanitized } = removeNodes(xml, ['trackRevisions', 'w\\:trackRevisions']);
    zip.file(settingsPath, sanitized);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  return {
    name: file.name.replace(/\.docx$/i, '') + '-scrubbed.docx',
    blob,
    summary: {
      removedComments,
      removedProps,
      removedCustomXml,
    },
  };
}
