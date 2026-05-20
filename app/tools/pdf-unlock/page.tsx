import { PdfUnlockTool } from '@/components/tools/pdf-unlock-tool';
import { ToolPage } from '@/components/tools/tool-page';
import { getToolBySlug } from '@/lib/tools';
import { createToolPageMetadata } from '@/lib/seo';

const slug = 'pdf-unlock';
const tool = getToolBySlug(slug);

export const metadata = tool && createToolPageMetadata(tool, slug);

export default function PdfUnlockPage() {
  if (!tool) return null;
  return <ToolPage tool={tool} workspace={<PdfUnlockTool />} />;
}
