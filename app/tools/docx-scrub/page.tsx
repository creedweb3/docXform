import { DocxScrubTool } from '@/components/tools/docx-scrub-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createPageMetadata } from '@/lib/seo';

const slug = 'docx-scrub';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function DocxScrubPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<DocxScrubTool />} />;
}
