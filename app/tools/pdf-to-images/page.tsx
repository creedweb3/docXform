import { PdfToImagesTool } from '@/components/tools/pdf-to-images-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-to-images';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfToImagesPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfToImagesTool />} />;
}
