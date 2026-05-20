import { PdfCompressTool } from '@/components/tools/pdf-compress-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-compress';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfCompressPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfCompressTool />} />;
}
