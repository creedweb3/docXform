import { SiteShell } from '@/components/site/site-shell';
import { HackerPage, HackerPageBody, TermInquiryCta } from '@/components/site/console/console-ui';
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
import { BODY_BLOCK_STACK, CONTENT_SIDE_GRID } from '@/lib/marketing-layout';
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
          separatorAfter
        >
          <div className="term-list-stack">
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

        <HackerPageBody>
          <div className={BODY_BLOCK_STACK}>
            <div className={CONTENT_SIDE_GRID}>
              <aside className="hidden xl:block xl:col-start-1 xl:row-start-1 xl:sticky xl:top-24 self-start">
                <AdSlot variant="content" />
              </aside>
              <div className="min-w-0 xl:col-start-2">
                <TermInquiryCta />
              </div>
              <aside className="hidden xl:block xl:col-start-3 xl:row-start-1 xl:sticky xl:top-24 self-start">
                <AdSlot variant="content" />
              </aside>
            </div>
            <div className="flex justify-center xl:hidden">
              <AdSlot variant="content" />
            </div>
          </div>
        </HackerPageBody>
      </SiteShell>
    </>
  );
}
