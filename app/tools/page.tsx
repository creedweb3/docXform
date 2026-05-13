import type { Metadata } from 'next';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  schemaGraph,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ToolsIndexClient } from '@/components/tools/tools-index-client';
import { toolDefinitions } from '@/lib/tools';

const title = 'All tools – browser-based PDF & Office utilities | docXform';
const description =
  'Merge, split, compress, convert, and sanitize PDFs and Office files in your browser. All docXform tools run locally with no uploads.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
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
  return (
    <>
      <JsonLd
        id="tools-index-schema"
        data={schemaGraph([
          webPageJsonLd({ name: title, description, path: '/tools' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
          ]),
          ...toolDefinitions.map((tool) =>
            softwareApplicationJsonLd({
              name: tool.name,
              description: tool.metaDescription,
              path: `/tools/${tool.slug}`,
              featureList: tool.features,
            })
          ),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center px-6 pt-[8.5rem] sm:pt-[9rem] pb-12">
          <ToolsIndexClient />
        </main>
        <Footer />
      </div>
    </>
  );
}
