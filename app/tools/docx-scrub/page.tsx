import { DocxScrubTool } from '@/components/tools/docx-scrub-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'docx-scrub';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function DocxScrubPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<DocxScrubTool />} />;
}
