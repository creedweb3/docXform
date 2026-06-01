import { ContentPage } from '@/components/site/content-page';
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

const title = 'Terms of Service | docXform';
const description =
  'Terms for using docXform browser-based Word to PDF and PDF to Word conversion tools.';

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
      <ContentPage title="Terms of Service" eyebrow="Legal" description="Last updated: May 1, 2026">
              <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground pt-2">Acceptance</h2>
              <p>By using docXform, you agree to these terms. If you disagree, do not use the service.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Service Description</h2>
              <p>docXform provides free, browser-based document conversion. All processing occurs locally in your browser. The service is provided &quot;as is&quot; without warranties.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Use Restrictions</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Do not use the service for illegal purposes</li>
                <li>Do not attempt to disrupt the service or its infrastructure</li>
                <li>Do not use automated bots that exceed reasonable usage</li>
              </ul>
              <h2 className="text-lg font-semibold text-foreground pt-2">Intellectual Property</h2>
              <p>The service is owned by docXform and protected by applicable laws. Your documents remain your property at all times.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">No Liability for Output</h2>
              <p>We strive for high-quality conversions but do not guarantee identical output in all cases. You are responsible for reviewing converted documents.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Limitation of Liability</h2>
              <p>docXform shall not be liable for any indirect, incidental, or consequential damages. Since all processing occurs in your browser and we never access your documents, we cannot be held responsible for data loss.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Contact</h2>
              <p>Questions? <Link href="/contact" className="text-foreground underline">Contact us</Link>.</p>
              </div>
      </ContentPage>
    </>
  );
}
