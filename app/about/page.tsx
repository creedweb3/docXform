import { SiteShell } from '@/components/site/site-shell';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/site/ui/container';
import { SectionHeader } from '@/components/site/ui/section-header';
import { Card } from '@/components/site/ui/card';
import { JsonLd } from '@/components/json-ld';
import { HugeiconsIcon } from '@hugeicons/react';
import { CpuIcon, EyeIcon, LockKeyIcon, Shield01Icon } from '@hugeicons/core-free-icons';
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

const featureSurface = 'text-muted-foreground border border-border/70 bg-card/40';

const features = [
  {
    icon: Shield01Icon,
    label: 'No server-side conversion',
    desc: 'Your file is processed in-browser — not uploaded for conversion.',
  },
  {
    icon: CpuIcon,
    label: 'WebAssembly engine',
    desc: 'A compiled conversion stack with practical desktop-like speed.',
  },
  {
    icon: EyeIcon,
    label: 'Verifiable workflow',
    desc: 'Open DevTools and confirm conversion traffic stays local.',
  },
  {
    icon: LockKeyIcon,
    label: 'No account required',
    desc: 'Convert without sign-up or linking cloud storage.',
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        id="about-schema"
        data={schemaGraph([
          webPageJsonLd({ type: 'AboutPage', name: title, description, path: '/about' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ])}
      />
      <SiteShell>
        <PageHero
          eyebrow="About"
          title="Documents stay on your device"
          description="docXform exists to make everyday Word and PDF conversion private by default — with the engine running in your browser, not on remote servers."
        />
        <section className="pb-20">
          <Container size="lg">
            <div className="prose-width mx-auto max-w-2xl space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                Traditional online converters usually require uploading files to remote
                infrastructure. docXform takes a different approach: conversion runs
                directly where you work — in the browser tab.
              </p>
              <p>
                Using WebAssembly, docXform ships a document engine to your device. You
                select a file, convert locally, and download the output without sending
                the document to docXform for processing.
              </p>
            </div>

            <div className="mt-16">
              <SectionHeader
                eyebrow="Principles"
                title="Built for private browser workflows"
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {features.map((f) => (
                  <Card key={f.label} hover>
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${featureSurface}`}
                    >
                      <HugeiconsIcon icon={f.icon} size={22} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-foreground">{f.label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </SiteShell>
    </>
  );
}
