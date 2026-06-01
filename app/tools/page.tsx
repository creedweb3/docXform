import type { Metadata } from 'next';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  schemaGraph,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { SiteShell } from '@/components/site/site-shell';
import { HackerPage } from '@/components/site/console/console-ui';
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
      <SiteShell>
        <HackerPage
          path="/tools"
          title="All tools"
          description={`${toolDefinitions.length} browser-based utilities for PDF and Office files. Filter by file type or job, then open a tool.`}
        >
          <ToolsIndexClient />
        </HackerPage>
      </SiteShell>
    </>
  );
}
