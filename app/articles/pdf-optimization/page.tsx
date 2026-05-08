import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import { IconArrowLeft02, IconCpu } from '@/components/icons';
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

const article = getArticleBySlug('pdf-optimization');
const path = `/articles/${article.slug}`;

export const metadata: Metadata = createPageMetadata({
  title: article.metaTitle,
  description: article.description,
  path,
  image: article.image,
  openGraphType: 'article',
});

export default function PdfOptimization() {
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
                    <IconArrowLeft02 size={14} strokeWidth={2} /> Articles
                  </Link>
                  <div className="w-14 h-14 rounded-2xl icon-box-mint flex items-center justify-center mb-6">
                    <IconCpu size={24} strokeWidth={1.5} className="text-emerald-500" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    PDF Optimization Techniques
                  </h1>
                  <p className="text-xs text-muted-foreground mb-10">
                    <time dateTime={article.dateModified}>Updated May 3, 2026</time> &middot; {article.readTime} by {article.author}
                  </p>
                  <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                    <p>PDF files can become large because of embedded images, fonts, and metadata. Optimization reduces file size, improves loading times, and makes sharing easier while preserving the visual quality users need.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Understanding PDF Bloat</h2>
                    <p>High-resolution images are a common source of oversized PDFs. Embedded fonts, especially full font families, can also add weight. The right optimization method depends on whether the document is image-heavy, text-heavy, or designed for print.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Image Compression</h2>
                    <p>Use JPEG for photographs and PNG for sharp graphics. Downsampling images to match their display resolution can reduce file size significantly without a visible difference for screen reading.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Font Subsetting</h2>
                    <p>Font subsetting includes only the characters used in the document rather than the entire font. This can reduce font data while keeping the intended appearance for the text that is present.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Object Optimization</h2>
                    <p>Edited and re-saved PDFs can accumulate unused objects. Removing them reduces file size. Linearization can also reorganize the PDF so the first page displays before the entire file downloads.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Before You Convert</h2>
                    <p>When creating a PDF from Word, start with optimized images and consistent styles in the source document. Cleaner source files usually produce smaller, more reliable PDFs.</p>
                  </div>
                  <div className="mt-10 rounded-2xl bg-white/60 border border-border/50 p-6">
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      Create a PDF from Word
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Convert a prepared DOC or DOCX file to PDF in your browser, then review the final file size and layout before sharing.
                    </p>
                    <Link href={article.relatedHref} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
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
