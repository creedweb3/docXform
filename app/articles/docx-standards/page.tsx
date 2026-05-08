import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import { IconArrowLeft02, IconBookOpen01 } from '@/components/icons';
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

const article = getArticleBySlug('docx-standards');
const path = `/articles/${article.slug}`;

export const metadata: Metadata = createPageMetadata({
  title: article.metaTitle,
  description: article.description,
  path,
  image: article.image,
  openGraphType: 'article',
});

export default function DocxStandards() {
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
                  <div className="w-14 h-14 rounded-2xl icon-box-amber flex items-center justify-center mb-6">
                    <IconBookOpen01 size={24} strokeWidth={1.5} className="text-amber-500" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    Understanding DOCX Standards
                  </h1>
                  <p className="text-xs text-muted-foreground mb-10">
                    <time dateTime={article.dateModified}>Updated May 3, 2026</time> &middot; {article.readTime} by {article.author}
                  </p>
                  <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                    <p>The DOCX format is one of the world&apos;s most widely used document formats. Behind the familiar extension is a standards-based architecture that helps documents move between editors, converters, and publishing workflows.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">What is Office Open XML?</h2>
                    <p>Office Open XML (OOXML) is an open standard for representing word processing documents, spreadsheets, and presentations. Standardized as ISO/IEC 29500, DOCX is the word processing implementation. Unlike the older binary DOC format, OOXML is based on XML with documented schemas.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Inside a DOCX File</h2>
                    <p>A DOCX file is a ZIP archive containing XML files and folders. Key files include document.xml for content and structure, styles.xml for formatting, and relationship files describing how parts connect. This modular structure makes DOCX flexible and easier for conversion engines to inspect.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Compatibility</h2>
                    <p>DOCX is supported by Microsoft Word, Google Docs, LibreOffice, Apple Pages, and many other applications. Not every editor implements the standard in the same way, which can cause formatting differences. This is one reason PDF is preferred for sharing final documents.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Why Standards Matter for Conversion</h2>
                    <p>Because the format is documented and structured, conversion engines can parse DOCX systematically and produce PDF output from its text, styles, images, and layout information. WebAssembly allows a converter to run that workflow inside the browser.</p>
                  </div>
                  <div className="mt-10 rounded-2xl bg-white/60 border border-border/50 p-6">
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      Convert DOCX files in the browser
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Use docXform when you need to turn a DOC or DOCX document into a PDF without sending the file to a server-side converter.
                    </p>
                    <Link href={article.relatedHref} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
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
