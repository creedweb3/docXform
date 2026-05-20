import { PdfWatermarkTool } from '@/components/tools/pdf-watermark-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-watermark';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfWatermarkPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfWatermarkTool />} />;
}
