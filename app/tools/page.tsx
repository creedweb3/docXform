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
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/site/ui/container';
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
      <SiteShell plain>
        <PageHero
          eyebrow="Toolkit"
          title="Every tool runs in your browser"
          description="Search, filter, and open PDF & Office utilities — same local-only architecture as our flagship converters."
        />
        <section className="pb-20">
          <Container size="full">
            <ToolsIndexClient />
          </Container>
        </section>
      </SiteShell>
    </>
  );
}
