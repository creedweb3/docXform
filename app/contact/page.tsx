import { SiteShell } from '@/components/site/site-shell';
import { HackerPage, HackerPageBody, TermProse } from '@/components/site/console/console-ui';
import { ContactForm } from '@/components/contact-form';
import { JsonLd } from '@/components/json-ld';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  OG_IMAGES,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';
import type { Metadata } from 'next';

const title = 'Contact docXform | Business Inquiries';
const description =
  'Contact docXform for business inquiries about private browser-based Word to PDF and PDF to Word conversion.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/contact',
  image: OG_IMAGES.contact,
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        id="contact-schema"
        data={schemaGraph([
          webPageJsonLd({
            type: 'ContactPage',
            name: title,
            description,
            path: '/contact',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ])}
      />
      <SiteShell>
        <HackerPage
          path="/contact"
          title="Contact"
          description="For business, partnership, or press inquiries. This form sends a message only — it does not convert documents."
        />
        <HackerPageBody className="!pt-10 pb-24">
          <div className="w-full max-w-xl">
            <div className="rounded-sm border border-border/70 bg-card/40 p-5 sm:p-6">
              <TermProse className="mb-5">
                <p className="!text-sm">
                  Use this form for non-technical inquiries. If you have a question about how a
                  tool works, check the FAQ first.
                </p>
              </TermProse>
              <ContactForm />
            </div>
          </div>
        </HackerPageBody>
      </SiteShell>
    </>
  );
}
