import { ImageConvertTool } from '@/components/tools/image-convert-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'image-convert';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function ImageConvertPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<ImageConvertTool />} />;
}
