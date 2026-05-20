import { ImageCompressTool } from '@/components/tools/image-compress-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'image-compress';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function ImageCompressPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<ImageCompressTool />} />;
}
