import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FAQSchema } from '@/components/faq-schema';
import { AdSlot } from '@/components/ad-slot';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_FAQS } from '@/lib/site-faqs';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  OG_IMAGES,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

const title = 'FAQ - Private Word and PDF Conversion Questions | DocXform';
const description =
  'Answers about DocXform browser-based Word to PDF and PDF to Word conversion, privacy, supported files, limits, and output quality.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/faq',
  image: OG_IMAGES.faq,
});

export default function FaqPage() {
  return (
    <>
      <FAQSchema />
      <JsonLd
        id="faq-page-schema"
        data={schemaGraph([
          webPageJsonLd({
            type: 'WebPage',
            name: title,
            description,
            path: '/faq',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-dot-grid-subtle">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <section className="px-6 pt-4 sm:pt-6 pb-14 sm:pb-16">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)_180px] gap-8">
                <aside className="hidden xl:block xl:sticky xl:top-32 self-start">
                  <AdSlot variant="content" />
                </aside>
                <div className="max-w-2xl mx-auto w-full">
                  <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-[2.75rem] font-bold tracking-tight text-foreground mb-3">
                      Frequently Asked Questions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Everything you need to know about DocXform&apos;s
                      browser-based Word to PDF and PDF to Word tools.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {SITE_FAQS.map((faq, index) => (
                      <details
                        key={faq.question}
                        className="glass rounded-2xl p-5 group cursor-pointer"
                        open={index === 0}
                      >
                        <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                          {faq.question}
                          <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">
                            +
                          </span>
                        </summary>
                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                  <div className="mt-12 text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      Need business help with DocXform?
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-xl px-5 py-2.5 font-medium text-xs hover:opacity-90 transition-opacity"
                    >
                      Contact DocXform
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
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
