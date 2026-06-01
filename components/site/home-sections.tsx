import Link from 'next/link';
import { Container } from '@/components/site/ui/container';
import { SectionHeader } from '@/components/site/ui/section-header';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Sheet } from '@/components/site/ui/sheet';
import { Button } from '@/components/site/ui/button';
import { CATALOG_ROW } from '@/lib/site-design';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import { cn } from '@/lib/utils';

const PILLARS = [
  {
    index: 'A',
    title: 'Engine ships to the tab',
    text: 'LibreOffice as WASM. First load downloads the binary; this profile caches it afterward.',
  },
  {
    index: 'B',
    title: 'Conversion stays local',
    text: 'Your file is not uploaded for processing. Site assets and ads still load over HTTPS.',
  },
  {
    index: 'C',
    title: 'Toolkit, same rule',
    text: 'Split, merge, compress, scrub — in-browser tools follow the same model when implemented locally.',
  },
];

const FEATURED_TOOLS = [
  { href: '/tools/pdf-split', name: 'PDF Split' },
  { href: '/tools/pdf-merge', name: 'PDF Merge' },
  { href: '/tools/pdf-compress', name: 'PDF Compress' },
  { href: '/tools/docx-scrub', name: 'DOCX Scrub' },
  { href: '/tools/pdf-organize', name: 'PDF Organize' },
  { href: '/tools/images-to-pdf', name: 'Images to PDF' },
];

export function HomeToolsTeaser() {
  return (
    <section className="relative py-16 sm:py-20">
      <Container size="full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Catalog"
            title="More than two formats"
            description="Fifteen utilities for everyday document work."
            className="mb-0"
          />
          <Link href="/tools" className="label-mono shrink-0 hover:text-foreground transition-colors">
            View all →
          </Link>
        </div>
        <Sheet padding="none" className="mt-8 overflow-hidden">
          <ul className="divide-y divide-border">
            {FEATURED_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className={CATALOG_ROW}>
                  <span className="font-mono text-[10px] text-muted-foreground w-6">—</span>
                  <span className="text-sm font-medium text-foreground">{tool.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">local</span>
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
      </Container>
    </section>
  );
}

export function HomeFeatures() {
  return (
    <section className="relative py-16 sm:py-20 border-t border-border">
      <Container size="full">
        <SectionHeader
          eyebrow="Position"
          title="Built as an instrument, not a funnel"
          description="Most converters rent you convenience and take custody of the file. docXform keeps the step on your machine."
        />
        <div className="mt-12 space-y-0 border border-border divide-y divide-border">
          {PILLARS.map((item) => (
            <article
              key={item.index}
              className="grid gap-4 bg-card/30 p-5 sm:grid-cols-[3rem_1fr] sm:gap-8 sm:p-6"
            >
              <p className="font-mono text-lg font-medium text-[hsl(var(--brand-copper))]">{item.index}</p>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HomeWorkflow() {
  return (
    <section className="relative py-16 sm:py-20 border-t border-border">
      <Container size="lg">
        <SectionHeader eyebrow="Procedure" title="A normal session" />
        <Sheet padding="lg" className="mt-8">
          <ol className="space-y-5 font-mono text-[12px] leading-relaxed text-muted-foreground">
            <li>
              <span className="text-[hsl(var(--brand-copper))]">01</span>
              <span className="ml-4 text-foreground/90">Open a converter route.</span>
            </li>
            <li>
              <span className="text-[hsl(var(--brand-copper))]">02</span>
              <span className="ml-4 text-foreground/90">Attach a file ≤ {MAX_CONVERSION_FILE_SIZE_LABEL}.</span>
            </li>
            <li>
              <span className="text-[hsl(var(--brand-copper))]">03</span>
              <span className="ml-4 text-foreground/90">Wait for WASM on first visit in this profile.</span>
            </li>
            <li>
              <span className="text-[hsl(var(--brand-copper))]">04</span>
              <span className="ml-4 text-foreground/90">Save output from the tab. No server-side conversion log.</span>
            </li>
          </ol>
        </Sheet>
      </Container>
    </section>
  );
}

export function HomeCta() {
  return (
    <section className="relative border-t border-border pb-20 pt-12 sm:pb-24">
      <Container size="lg">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandRule className="mb-4" />
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              One file is enough to test the claim
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Open DevTools before you convert. Compare with any upload-based tool.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/word-to-pdf" variant="primary" size="lg">
              Word to PDF
            </Button>
            <Button href="/pdf-to-word" variant="secondary" size="lg">
              PDF to Word
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
