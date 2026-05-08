import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticleBySlug, SITE_ARTICLES } from '@/lib/site-articles';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';
import { IconArrowLeft02, IconArrowRight02 } from '@/components/icons';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SITE_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  const path = `/articles/${article.slug}`;

  return createPageMetadata({
    title: article.metaTitle,
    description: article.description,
    path,
    image: article.image,
    openGraphType: 'article',
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  const path = `/articles/${article.slug}`;

  return (
    <>
      <JsonLd
        id="article-schema"
        data={schemaGraph([
          webPageJsonLd({
            type: 'Article',
            name: article.title,
            description: article.description,
            path,
          }),
          articleJsonLd(article),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles' },
            { name: article.title, path },
          ]),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <article className="px-6 py-14 sm:py-16">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <IconArrowLeft02 size={14} strokeWidth={2} /> Articles
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{article.title}</h1>
              <p className="text-xs text-muted-foreground mb-10">
                <time dateTime={article.dateModified}>Updated {new Date(article.dateModified).toLocaleDateString()}</time>{' '}
                &middot; {article.readTime} by {article.author}
              </p>
              <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                <p>{article.description}</p>
                <p>
                  This guide is part of our browser-based conversion series. It focuses on privacy-first workflows for{' '}
                  {article.title.toLowerCase()} and links directly to the converter so you can act on the guidance without
                  leaving the page.
                </p>
                <h2 className="text-lg font-semibold text-foreground pt-2">Why it matters</h2>
                <p>
                  docXform processes files locally in your browser with WebAssembly. For sensitive documents, avoiding uploads
                  reduces exposure and keeps data on your device. Use the checklist below to apply the recommendations quickly.
                </p>
                <ul>
                  <li>Follow the prep tips in this article, then open the converter.</li>
                  <li>Stay within file size limits for the fastest results.</li>
                  <li>Review output for fonts, tables, and layout on important documents.</li>
                </ul>
              </div>
              <div className="mt-10 rounded-2xl bg-white/60 border border-border/50 p-6">
                <h2 className="text-base font-semibold text-foreground mb-2">Try it now</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Jump straight into the tool with your document. Conversion runs locally—no uploads required.
                </p>
                <Link
                  href={article.relatedHref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {article.relatedLabel} <IconArrowRight02 size={14} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
