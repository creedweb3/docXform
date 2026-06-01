import { SiteShell } from '@/components/site/site-shell';
import { ArticlesShowcase } from '@/components/articles-showcase';
import { HackerPage, HackerPageBody } from '@/components/site/console/console-ui';
import { JsonLd } from '@/components/json-ld';
import {
  articlesCollectionJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  OG_IMAGES,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';
import { SITE_ARTICLES } from '@/lib/site-articles';
import type { Metadata } from 'next';

const title = 'Articles and Guides - PDF, DOCX and Browser Privacy | docXform';
const description =
  'Guides on private PDF to Word conversion, DOCX formatting, Office Open XML standards, PDF optimization, and browser-based document security.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/articles',
  image: OG_IMAGES.articles,
});

export default function ArticlesPage() {
  return (
    <>
      <JsonLd
        id="articles-schema"
        data={schemaGraph([
          webPageJsonLd({
            type: 'CollectionPage',
            name: title,
            description,
            path: '/articles',
          }),
          articlesCollectionJsonLd(SITE_ARTICLES),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles' },
          ]),
        ])}
      />
      <SiteShell>
        <HackerPage
          path="/articles"
          title="Articles and guides"
          description="Longer reads on DOCX structure, PDF workflows, privacy, and getting reliable results from browser-based tools."
        />
        <HackerPageBody className="!pt-10">
          <ArticlesShowcase variant="page" />
        </HackerPageBody>
      </SiteShell>
    </>
  );
}
