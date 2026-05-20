import { PptxToPdfTool } from '@/components/tools/pptx-to-pdf-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pptx-to-pdf';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PptxToPdfPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PptxToPdfTool />} />;
}
