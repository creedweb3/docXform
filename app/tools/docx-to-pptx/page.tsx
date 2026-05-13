import { DocxToPptxTool } from '@/components/tools/docx-to-pptx-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createPageMetadata } from '@/lib/seo';

const slug = 'docx-to-pptx';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function DocxToPptxPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<DocxToPptxTool />} />;
}
