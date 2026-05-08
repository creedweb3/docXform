import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { IconCpu, IconEye, IconLockKey, IconShield01 } from '@/components/icons';
import type { Metadata } from 'next';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  OG_IMAGES,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';

const title = 'About docXform - Browser-Based Document Conversion';
const description =
  'Learn how docXform converts Word and PDF documents in your browser with WebAssembly, no account requirement, and no file upload for conversion.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/about',
  image: OG_IMAGES.about,
});

const features = [
  {
    Icon: IconShield01,
    label: 'No Server-Side File Conversion',
    desc: 'The selected document is processed by the browser-based converter instead of being uploaded to docXform for conversion.',
    boxClass: 'icon-box-blue',
    iconClass: 'text-blue-500',
  },
  {
    Icon: IconCpu,
    label: 'WebAssembly Engine',
    desc: 'WebAssembly lets the conversion engine run inside a modern browser with practical desktop-like performance.',
    boxClass: 'icon-box-rose',
    iconClass: 'text-rose-400',
  },
  {
    Icon: IconEye,
    label: 'Verifiable Workflow',
    desc: 'You can inspect network activity in browser developer tools to verify that conversion files are not uploaded.',
    boxClass: 'icon-box-amber',
    iconClass: 'text-amber-500',
  },
  {
    Icon: IconLockKey,
    label: 'No Account Required',
    desc: 'Convert documents without creating an account or giving docXform access to your document storage.',
    boxClass: 'icon-box-mint',
    iconClass: 'text-emerald-500',
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        id="about-schema"
        data={schemaGraph([
          webPageJsonLd({
            type: 'AboutPage',
            name: title,
            description,
            path: '/about',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-dot-grid-subtle">
        <Navbar />
        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <section className="px-6 pt-4 sm:pt-6 pb-14 sm:pb-16">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-[2.75rem] font-bold tracking-tight text-foreground mb-3 text-center">
                About docXform
              </h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-14 text-center">
                <p>
                  docXform exists to make everyday document conversion more private.
                  Traditional online converters usually require uploading files to
                  remote servers. docXform takes a different approach: conversion
                  runs directly in your browser.
                </p>
                <p>
                  Using WebAssembly (WASM), docXform runs a document conversion
                  engine on your device. Your selected files are processed locally,
                  and the converted output is generated for download in the browser.
                </p>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
                Built for Private Browser Workflows
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.label} className="glass rounded-2xl p-5">
                    <div
                      className={`w-10 h-10 rounded-xl ${feature.boxClass} flex items-center justify-center mb-4`}
                    >
                      <feature.Icon size={20} strokeWidth={1.5} className={feature.iconClass} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {feature.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-16 bg-gradient-to-b from-transparent to-white/5">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                The docXform Approach
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your documents are your property. docXform is designed so conversion
                files stay on your device during Word to PDF and PDF to Word workflows.
                The site may still use standard web services such as advertising or
                the contact form, but the documents you convert are not sent to
                docXform for processing.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
