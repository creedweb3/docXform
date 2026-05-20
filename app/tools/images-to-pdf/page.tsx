import { ImagesToPdfTool } from '@/components/tools/images-to-pdf-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'images-to-pdf';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function ImagesToPdfPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<ImagesToPdfTool />} />;
}
