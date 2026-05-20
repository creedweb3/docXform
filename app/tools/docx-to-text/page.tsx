import { DocxToTextTool } from '@/components/tools/docx-to-text-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'docx-to-text';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function DocxToTextPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<DocxToTextTool />} />;
}
