import { SiteShell } from '@/components/site/site-shell';
import { HackerPage, HackerPageBody } from '@/components/site/console/console-ui';
import { Button } from '@/components/site/ui/button';
import { FAQSchema } from '@/components/faq-schema';
import { AdSlot } from '@/components/ad-slot';
import { FaqDetailsCard } from '@/components/faq-details-card';
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
import { CONTENT_SIDE_GRID, SECTION_BODY_GAP } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

const title = 'FAQ - Private Word and PDF Conversion Questions | docXform';
const description =
  'Answers about docXform browser-based Word to PDF and PDF to Word conversion, privacy, supported files, limits, and output quality.';

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
          webPageJsonLd({ type: 'WebPage', name: title, description, path: '/faq' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ])}
      />
      <SiteShell>
        <HackerPage
          path="/faq"
          title="Frequently asked questions"
          description="Privacy, supported formats, file limits, output quality, and what to expect from in-browser conversion."
        >
          <div className="space-y-2">
            {SITE_FAQS.map((faq, index) => (
              <FaqDetailsCard
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </HackerPage>

        <HackerPageBody className="!pt-10">
          <div className={cn(CONTENT_SIDE_GRID, SECTION_BODY_GAP)}>
            <aside className="hidden xl:block xl:col-start-1 xl:row-start-1 xl:sticky xl:top-24 self-start">
              <AdSlot variant="content" />
            </aside>
            <div className="min-w-0 xl:col-start-2">
              <div className="w-full rounded-sm border border-border/70 bg-card/40 px-5 py-6 text-center sm:px-6">
                <p className="text-sm text-muted-foreground">
                  Business, partnership, or press inquiry?
                </p>
                <Button href="/contact" variant="primary" className="mt-4">
                  Contact docXform
                </Button>
              </div>
            </div>
            <aside className="hidden xl:block xl:col-start-3 xl:row-start-1 xl:sticky xl:top-24 self-start">
              <AdSlot variant="content" />
            </aside>
          </div>
          <div className="mt-8 flex justify-center xl:hidden">
            <AdSlot variant="content" />
          </div>
        </HackerPageBody>
      </SiteShell>
    </>
  );
}
