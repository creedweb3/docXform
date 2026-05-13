import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';
import { ToolsIndexClient } from '@/components/tools/tools-index-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = createPageMetadata({
  title: 'All tools – browser-based PDF & Office utilities | docXform',
  description:
    'Merge, split, compress, convert, and sanitize PDFs and Office files in your browser. All docXform tools run locally with no uploads.',
  path: '/tools',
  keywords: [
    'PDF tools',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'convert PPTX to PDF',
    'images to PDF',
    'docx metadata scrub',
    'browser PDF tools',
  ],
});

export default function ToolsPage() {
  return <ToolsIndexClient />;
}
