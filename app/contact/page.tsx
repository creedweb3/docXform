import { SiteShell } from '@/components/site/site-shell';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/site/ui/container';
import { Card } from '@/components/site/ui/card';
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
        <PageHero
          eyebrow="Contact"
          title="Get in touch"
          description="Business inquiries only. Document conversion happens in your browser — this form only sends the message you write."
        />
        <section className="pb-20">
          <Container size="md">
            <Card padding="lg">
              <ContactForm />
            </Card>
          </Container>
        </section>
      </SiteShell>
    </>
  );
}
