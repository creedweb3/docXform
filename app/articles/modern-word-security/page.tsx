import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import { IconArrowLeft02, IconShield01 } from '@/components/icons';
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

const article = getArticleBySlug('modern-word-security');
const path = `/articles/${article.slug}`;

export const metadata: Metadata = createPageMetadata({
  title: article.metaTitle,
  description: article.description,
  path,
  image: article.image,
  openGraphType: 'article',
});

export default function ModernWordSecurity() {
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
                  <div className="w-14 h-14 rounded-2xl icon-box-blue flex items-center justify-center mb-6">
                    <IconShield01 size={24} strokeWidth={1.5} className="text-blue-500" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    Modern Word Security: How WASM Protects Your Documents
                  </h1>
                  <p className="text-xs text-muted-foreground mb-10">
                    <time dateTime={article.dateModified}>Updated May 3, 2026</time> &middot; {article.readTime} by {article.author}
                  </p>
                  <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                    <p>Most online conversion tools require uploading your files to a remote server. This creates avoidable risk: your data passes through networks and sits on infrastructure you do not control. Even with HTTPS, your documents exist on someone else&apos;s servers while they are processed.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">The Cloud Conversion Problem</h2>
                    <p>When you upload a DOCX file to a traditional converter, it is transmitted over the internet, stored temporarily on a server, processed by software you cannot inspect, and sent back. Server logs, backups, and caching layers can retain copies longer than users expect.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">WebAssembly Changes the Workflow</h2>
                    <p>WebAssembly (WASM) enables high-performance applications to run directly in your browser at near-native speeds. With a WASM-powered tool like docXform, your file is read by the browser, processed by a WASM module in the browser sandbox, and the result is generated in memory on your device.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">The Browser Sandbox</h2>
                    <p>WASM runs inside the browser&apos;s security sandbox, which enforces the same-origin policy and restricts file system access. The converter can process the file you selected, but it does not get broad access to your device.</p>
                    <h2 className="text-lg font-semibold text-foreground pt-2">Verifiable Privacy</h2>
                    <p>With client-side processing, you can inspect network traffic using browser dev tools and confirm the conversion file itself is not transmitted to docXform servers. For teams handling sensitive documents, this reduces the exposure created by upload-based conversion workflows.</p>
                  </div>
                  <div className="mt-10 rounded-2xl bg-white/60 border border-border/50 p-6">
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      Convert PDFs without uploading the file
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Use docXform&apos;s browser-based PDF to Word converter when you need editable DOCX output and want conversion to stay on your device.
                    </p>
                    <Link href={article.relatedHref} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
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
