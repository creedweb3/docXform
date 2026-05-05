import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
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

const title = 'Contact DocXform | Business Inquiries';
const description =
  'Contact DocXform for business inquiries about private browser-based Word to PDF and PDF to Word conversion.';

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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <section className="px-6 pt-4 sm:pt-6 pb-10 sm:pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-3xl sm:text-[2.75rem] font-bold tracking-tight text-foreground mb-3">
                  Contact DocXform
                </h1>
                <p className="text-sm text-muted-foreground">
                  Business inquiries only. Document conversion happens in your browser;
                  this form only sends the message details you submit.
                </p>
              </div>

              <ContactForm />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
