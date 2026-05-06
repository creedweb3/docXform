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

const title = 'Privacy Policy | docXform';
const description =
  'docXform privacy policy for browser-based Word to PDF and PDF to Word conversion, contact submissions, advertising, and analytics.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/privacy',
  image: OG_IMAGES.legal,
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        id="privacy-schema"
        data={schemaGraph([
          webPageJsonLd({
            name: title,
            description,
            path: '/privacy',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Privacy', path: '/privacy' },
          ]),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <article className="px-6 pt-4 sm:pt-6 pb-14 sm:pb-16">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-[2.75rem] font-bold tracking-tight text-foreground mb-3">Privacy Policy</h1>
                <p className="text-xs text-muted-foreground">Last updated: May 1, 2026</p>
              </div>
              <div className="prose prose-neutral max-w-none space-y-5 text-sm text-muted-foreground leading-relaxed">
                <h2 className="text-lg font-semibold text-foreground pt-2">Core Principle</h2>
                <p>Document conversion is performed in your browser using WebAssembly. Files selected for conversion are not uploaded to, stored on, or transmitted through a docXform conversion server.</p>
                <h2 className="text-lg font-semibold text-foreground pt-2">What We Do Not Collect From Conversions</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>Document content from converted files</li>
                  <li>Conversion history tied to individual users</li>
                  <li>Converted document downloads</li>
                </ul>
                <h2 className="text-lg font-semibold text-foreground pt-2">What We May Collect</h2>
                <p>Standard web analytics for site operation may include aggregate page views, browser type, device type, and referral source. Contact form submissions send the name, email, message, and source page you provide.</p>
                <h2 className="text-lg font-semibold text-foreground pt-2">Advertising</h2>
                <p>docXform uses Google AdSense, which may use cookies for personalized ads. Opt out at <a href="https://www.google.com/settings/ads" className="text-foreground underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>. See our <Link href="/cookies" className="text-foreground underline">Cookie Policy</Link> for details.</p>
                <h2 className="text-lg font-semibold text-foreground pt-2">Data Security</h2>
                <p>Document security also depends on your device and browser. Keep your browser updated, use HTTPS, and review converted files before sharing them.</p>
                <h2 className="text-lg font-semibold text-foreground pt-2">Contact</h2>
                <p>Questions about this policy? <Link href="/contact" className="text-foreground underline">Contact us</Link>.</p>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
