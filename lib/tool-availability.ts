/**
 * Which `/tools/{slug}` pages are live. Index at `/tools` is always available.
 * Flip a slug to `true` when UX sign-off is done (see docs/tool-status.md).
 */
export const TOOL_PAGE_AVAILABLE: Record<string, boolean> = {
  'pdf-split': true,
  'pdf-merge': false,
  'pdf-compress': false,
  'pdf-to-images': false,
  'pdf-rotate': false,
  'pdf-organize': false,
  'pdf-watermark': false,
  'pdf-unlock': true,
  'pdf-to-text': false,
  'images-to-pdf': false,
  'image-convert': false,
  'image-compress': false,
  'pptx-to-pdf': true,
  'docx-to-pptx': true,
  'docx-scrub': false,
  'docx-to-text': false,
};

export function isToolPageAvailable(slug: string): boolean {
  return TOOL_PAGE_AVAILABLE[slug] === true;
}

export const AVAILABLE_TOOL_SLUGS = Object.entries(TOOL_PAGE_AVAILABLE)
  .filter(([, open]) => open)
  .map(([slug]) => slug);
