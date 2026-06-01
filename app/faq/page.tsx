import { SiteShell } from '@/components/site/site-shell';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/site/ui/container';
import { Button } from '@/components/site/ui/button';
import { Card } from '@/components/site/ui/card';
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
        <PageHero
          eyebrow="Help"
          title="Questions & answers"
          description="Privacy, file limits, supported formats, and what to expect from browser-based conversion."
        />
        <section className="pb-24">
          <Container size="full">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,40rem)_1fr] gap-8">
              <aside className="hidden xl:block xl:sticky xl:top-24 self-start">
                <AdSlot variant="content" />
              </aside>
              <div className="space-y-2 min-w-0">
                {SITE_FAQS.map((faq, index) => (
                  <FaqDetailsCard
                    key={faq.question}
                    question={faq.question}
                    answer={faq.answer}
                    defaultOpen={index === 0}
                  />
                ))}
                <Card padding="lg" className="mt-10 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Business or partnership inquiries?
                  </p>
                  <Button href="/contact" variant="primary">
                    Contact docXform
                  </Button>
                </Card>
                <div className="mt-8 xl:hidden flex justify-center">
                  <AdSlot variant="content" />
                </div>
              </div>
              <aside className="hidden xl:block xl:sticky xl:top-24 self-start">
                <AdSlot variant="content" />
              </aside>
            </div>
          </Container>
        </section>
      </SiteShell>
    </>
  );
}
