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

const title = 'Cookie Policy | docXform';
const description =
  'How docXform uses essential, advertising, and analytics cookies on its browser-based document conversion site.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/cookies',
  image: OG_IMAGES.legal,
});

export default function CookiesPage() {
  return (
    <>
      <JsonLd
        id="cookies-schema"
        data={schemaGraph([
          webPageJsonLd({
            name: title,
            description,
            path: '/cookies',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Cookies', path: '/cookies' },
          ]),
        ])}
      />
      <ContentPage
        path="/cookies"
        title="Cookie Policy"
        description="Last updated May 1, 2026. How we use essential, advertising, and analytics cookies."
      >
              <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground pt-2">What Are Cookies</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They can be persistent (until expiry or deletion) or session-based (deleted when you close your browser).</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Cookies We Use</h2>
              <p><strong className="text-foreground">Essential:</strong> Required for the website to function properly.</p>
              <p><strong className="text-foreground">Advertising:</strong> Google AdSense may set cookies for ad targeting (__gads, __gpi, __gac, IDE). These enable relevant ads and campaign measurement.</p>
              <p><strong className="text-foreground">Analytics:</strong> We may use analytics cookies for aggregate, anonymized data about site usage patterns.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Managing Cookies</h2>
              <p>Control cookies through your browser settings. Blocking all cookies may affect functionality. To opt out of personalized Google ads, visit <a href="https://www.google.com/settings/ads" className="text-foreground underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</p>
              <h2 className="text-lg font-semibold text-foreground pt-2">Contact</h2>
              <p>Questions? <Link href="/contact" className="text-foreground underline">Contact us</Link>.</p>
              </div>
      </ContentPage>
    </>
  );
}
