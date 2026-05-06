import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArticlesShowcase } from '@/components/articles-showcase';
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
      <div className="min-h-screen flex flex-col bg-dot-grid-subtle">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <section className="px-6 pt-4 sm:pt-6 pb-14 sm:pb-16">
            <ArticlesShowcase variant="page" />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
