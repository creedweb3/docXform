import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, File01Icon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticleBySlug } from '@/lib/site-articles';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';

const article = getArticleBySlug('formatting-guide');
const path = `/articles/${article.slug}`;

export const metadata: Metadata = createPageMetadata({
  title: article.metaTitle,
  description: article.description,
  path,
  image: article.image,
  openGraphType: 'article',
});

export default function FormattingGuide() {
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
                  <Link href="/articles" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
                    <HugeiconsIcon icon={ArrowLeft02Icon} size={14} strokeWidth={2} /> Articles
                  </Link>
                  <div className="w-14 h-14 rounded-2xl icon-box-rose flex items-center justify-center mb-6">
                    <HugeiconsIcon icon={File01Icon} size={24} strokeWidth={1.5} className="text-rose-400" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    The Complete DOCX Formatting Guide
                  </h1>
                  <p className="text-xs text-muted-foreground mb-10">
                    <time dateTime={article.dateModified}>Updated May 3, 2026</time> &middot; {article.readTime} by {article.author}
                  </p>
                  <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                    <p>Well-formatted DOCX documents convert more cleanly to PDF. This guide covers document preparation techniques that help keep output consistent across common Word to PDF workflows.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Styles Over Manual Formatting</h2>
                    <p>Define styles for headings, body text, and captions rather than manually applying bold, sizes, and colors. Styles ensure uniformity and make global changes easier. Templates take this further by providing predefined sets of styles and layouts.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Page Layout</h2>
                    <p>Standard business documents often use 1-inch margins. When using columns, tables, or text boxes, keep layouts simple and avoid deeply nested structures. Use section breaks to isolate complex regions.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Font Selection</h2>
                    <p>Use commonly available fonts such as Arial, Times New Roman, or Calibri to reduce substitution risk. If you need custom fonts, embed them in the DOCX file where licensing allows it. Embedded fonts can help PDF output stay closer to the original design.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Image Handling</h2>
                    <p>Use appropriately sized images rather than inserting large files and scaling down. PNG works well for screenshots and sharp graphics, while JPEG works well for photographs. Inline placement is often more reliable than floating images during conversion.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Pre-Conversion Checklist</h2>
                    <p>Verify that styles are consistent, images are properly sized, fonts are embedded or common, and page breaks use section breaks. These checks improve the chance of clean, professional PDF output.</p>
                  </div>
                  <div className="mt-10 rounded-2xl bg-white/60 border border-border/50 p-6">
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      Convert a prepared Word file to PDF
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Once your DOC or DOCX file is ready, use DocXform to create a browser-generated PDF without uploading the document.
                    </p>
                    <Link href={article.relatedHref} className="text-xs font-semibold text-rose-600 hover:text-rose-700">
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
