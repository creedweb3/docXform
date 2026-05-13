import { DocxToPdfTool } from '@/components/tools/docx-to-pdf-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createPageMetadata } from '@/lib/seo';

const slug = 'docx-to-pdf';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function DocxToPdfPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<DocxToPdfTool />} />;
}
