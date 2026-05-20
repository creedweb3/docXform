import { DocxToPptxTool } from '@/components/tools/docx-to-pptx-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'docx-to-pptx';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function DocxToPptxPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<DocxToPptxTool />} />;
}
