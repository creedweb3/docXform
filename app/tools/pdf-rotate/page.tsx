import { PdfRotateTool } from '@/components/tools/pdf-rotate-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createPageMetadata } from '@/lib/seo';

const slug = 'pdf-rotate';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function PdfRotatePage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfRotateTool />} />;
}
