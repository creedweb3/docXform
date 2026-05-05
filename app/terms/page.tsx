import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  OG_IMAGES,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';

const title = 'Terms of Service | DocXform';
const description =
  'Terms for using DocXform browser-based Word to PDF and PDF to Word conversion tools.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/terms',
  image: OG_IMAGES.legal,
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        id="terms-schema"
        data={schemaGraph([
          webPageJsonLd({
            name: title,
            description,
            path: '/terms',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Terms', path: '/terms' },
          ]),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
        <article className="px-6 pt-4 sm:pt-6 pb-14 sm:pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-[2.75rem] font-bold tracking-tight text-foreground mb-3">Terms of Service</h1>
              <p className="text-xs text-muted-foreground">Last updated: May 1, 2026</p>
            </div>
            <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
              <h2 className="text-lg font-semibold text-foreground pt-2">Acceptance</h2>
              <p>By using DocXform, you agree to these terms. If you disagree, do not use the service.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Service Description</h2>
              <p>DocXform provides free, browser-based document conversion. All processing occurs locally in your browser. The service is provided &quot;as is&quot; without warranties.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Use Restrictions</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Do not use the service for illegal purposes</li>
                <li>Do not attempt to disrupt the service or its infrastructure</li>
                <li>Do not use automated bots that exceed reasonable usage</li>
              </ul>
              <h2 className="text-lg font-semibold text-foreground pt-2">Intellectual Property</h2>
              <p>The service is owned by DocXform and protected by applicable laws. Your documents remain your property at all times.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">No Liability for Output</h2>
              <p>We strive for high-quality conversions but do not guarantee identical output in all cases. You are responsible for reviewing converted documents.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Limitation of Liability</h2>
              <p>DocXform shall not be liable for any indirect, incidental, or consequential damages. Since all processing occurs in your browser and we never access your documents, we cannot be held responsible for data loss.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Contact</h2>
              <p>Questions? <Link href="/contact" className="text-foreground underline">Contact us</Link>.</p>
            </div>
          </div>
        </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
