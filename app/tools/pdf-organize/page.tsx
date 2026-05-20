import { PdfOrganizeTool } from '@/components/tools/pdf-organize-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-organize';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfOrganizePage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfOrganizeTool />} />;
}
