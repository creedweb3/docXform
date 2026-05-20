import { PdfSplitTool } from '@/components/tools/pdf-split-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-split';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfSplitPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfSplitTool />} />;
}
