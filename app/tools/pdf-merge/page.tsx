import { PdfMergeTool } from '@/components/tools/pdf-merge-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-merge';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfMergePage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfMergeTool />} />;
}
