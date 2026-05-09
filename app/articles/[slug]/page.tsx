import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticleBySlug, SITE_ARTICLES } from '@/lib/site-articles';
import { getArticleDetailCta } from '@/lib/article-detail-cta';
import { getArticleTagVisuals } from '@/lib/article-tag-visuals';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { ArticleRichBody, hasArticleRichBody } from '@/components/article-rich-bodies';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatArticleDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
  const visuals = getArticleTagVisuals(article.tag);
  const cta = getArticleDetailCta(article);

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
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)_180px] gap-8">
                <aside className="hidden xl:block xl:sticky xl:top-32 self-start">
                  <AdSlot variant="content" />
                </aside>
                <div className="max-w-2xl mx-auto w-full">
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
                  >
                    <HugeiconsIcon icon={ArrowLeft02Icon} size={14} strokeWidth={2} /> Articles
                  </Link>
                  <div
                    className={`w-14 h-14 rounded-2xl ${visuals.iconBoxClass} flex items-center justify-center mb-6`}
                  >
                    <HugeiconsIcon
                      icon={visuals.Icon}
                      size={24}
                      strokeWidth={1.5}
                      className={visuals.iconClass}
                    />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{article.title}</h1>
                  <p className="text-xs text-muted-foreground mb-10">
                    <time dateTime={article.dateModified}>Updated {formatArticleDate(article.dateModified)}</time>{' '}
                    &middot; {article.readTime} by {article.author}
                  </p>
                  <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                    <p>{article.description}</p>
                    {hasArticleRichBody(slug) ? (
                      <ArticleRichBody slug={slug} />
                    ) : (
                      <>
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
                        <ul className="list-disc pl-5 space-y-1.5">
                          <li>Follow the prep tips in this article, then open the converter.</li>
                          <li>Stay within file size limits for the fastest results.</li>
                          <li>Review output for fonts, tables, and layout on important documents.</li>
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="mt-10 rounded-2xl bg-white/60 border border-border/50 p-6">
                    <h2 className="text-base font-semibold text-foreground mb-2">{cta.title}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{cta.body}</p>
                    <Link href={article.relatedHref} className={`text-xs font-semibold ${visuals.ctaLinkClass}`}>
                      {article.relatedLabel}
                    </Link>
                  </div>
                  <div className="mt-10 xl:hidden">
                    <AdSlot variant="content" />
                  </div>
                </div>
                <aside className="hidden xl:block xl:sticky xl:top-32 self-start">
                  <AdSlot variant="content" />
                </aside>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
