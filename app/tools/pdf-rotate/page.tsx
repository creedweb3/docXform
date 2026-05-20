import { PdfRotateTool } from '@/components/tools/pdf-rotate-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-rotate';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfRotatePage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfRotateTool />} />;
}
