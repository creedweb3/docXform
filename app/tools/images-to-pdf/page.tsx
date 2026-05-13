import { ImagesToPdfTool } from '@/components/tools/images-to-pdf-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createPageMetadata } from '@/lib/seo';

const slug = 'images-to-pdf';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function ImagesToPdfPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<ImagesToPdfTool />} />;
}
