import { PdfWatermarkTool } from '@/components/tools/pdf-watermark-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createPageMetadata } from '@/lib/seo';

const slug = 'pdf-watermark';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function PdfWatermarkPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfWatermarkTool />} />;
}
