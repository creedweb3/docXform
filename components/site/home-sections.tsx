import Link from 'next/link';
import { PageSection } from '@/components/site/page-section';
import { CreativeReveal } from '@/components/creative/CreativeReveal';
import { SectionHeader } from '@/components/site/ui/section-header';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Sheet } from '@/components/site/ui/sheet';
import { Button } from '@/components/site/ui/button';
import { CATALOG_ROW } from '@/lib/site-design';
import { SECTION_BODY_GAP } from '@/lib/marketing-layout';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import { cn } from '@/lib/utils';

const PILLARS = [
  {
    index: '01',
    title: 'Engine ships to the tab',
    text: 'LibreOffice as WASM. First load downloads the binary; this profile caches it afterward.',
  },
  {
    index: '02',
    title: 'Conversion stays local',
    text: 'Your file is not uploaded for processing. Site assets and ads still load over HTTPS.',
  },
  {
    index: '03',
    title: 'Toolkit, same rule',
    text: 'Split, merge, compress, and scrub tools follow the same model when they run in the browser.',
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

const WORKFLOW_STEPS = [
  'Open a converter route.',
  `Attach a file ≤ ${MAX_CONVERSION_FILE_SIZE_LABEL}.`,
  'Wait for WASM on first visit in this profile.',
  'Save output from the tab. No server-side conversion log.',
];

export function HomeToolsTeaser() {
  return (
    <PageSection className="z-20">
      <CreativeReveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Catalog"
            title="More than two formats"
            description="Fifteen utilities for everyday document work."
            className="mb-0 max-w-xl"
          />
          <Link
            href="/tools"
            className="interactive-trigger shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:pb-1"
          >
            View all tools
          </Link>
        </div>
      </CreativeReveal>
      <CreativeReveal delay={0.08}>
        <Sheet padding="none" className={cn('overflow-hidden shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]', SECTION_BODY_GAP)}>
          <ul className="divide-y divide-border">
            {FEATURED_TOOLS.map((tool, i) => (
              <li key={tool.href}>
                <Link href={tool.href} className={cn(CATALOG_ROW, 'interactive-trigger')} data-cursor-label="OPEN">
                  <span className="w-8 font-mono text-[11px] tabular-nums text-muted-foreground transition-colors group-hover:text-[hsl(var(--brand-copper))]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-[hsl(var(--brand-copper))]">
                    {tool.name}
                  </span>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-foreground/80">
                    local
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
      </CreativeReveal>
    </PageSection>
  );
}

export function HomeFeatures() {
  return (
    <PageSection className="z-30">
      <CreativeReveal>
        <SectionHeader
          eyebrow="Position"
          title="Built as an instrument, not a funnel"
          description="Most converters rent you convenience and take custody of the file. docXform keeps the step on your machine."
          className="max-w-2xl"
        />
      </CreativeReveal>
      <CreativeReveal delay={0.1}>
        <div className={cn('grid gap-px border border-border bg-border lg:grid-cols-3', SECTION_BODY_GAP)}>
          {PILLARS.map((item) => (
            <article
              key={item.index}
              className="interactive-trigger flex flex-col bg-background/95 p-6 backdrop-blur-sm sm:p-8"
            >
              <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-[hsl(var(--brand-copper))]">
                {item.index}
              </p>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-foreground">
                {item.title}
              </h3>
              <p className="type-body mt-3 flex-1">{item.text}</p>
            </article>
          ))}
        </div>
      </CreativeReveal>
    </PageSection>
  );
}

export function HomeWorkflow() {
  return (
    <PageSection className="z-40">
      <CreativeReveal>
        <SectionHeader
          eyebrow="Procedure"
          title="A normal session"
          description="Four steps, no account, no upload queue."
          className="max-w-xl"
        />
      </CreativeReveal>
      <CreativeReveal delay={0.08}>
        <Sheet
          padding="lg"
          className={cn(SECTION_BODY_GAP, 'shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]')}
        >
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {WORKFLOW_STEPS.map((step, i) => (
              <li key={step} className="flex flex-col gap-2">
                <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-[hsl(var(--brand-copper))]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
              </li>
            ))}
          </ol>
        </Sheet>
      </CreativeReveal>
    </PageSection>
  );
}

export function HomeCta() {
  return (
    <PageSection separated className="z-50 !pb-20 lg:!pb-24">
      <CreativeReveal>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <BrandRule className="mb-5" />
            <h2 className="kinetic-headline">One file is enough to test the claim</h2>
            <p className="type-body mt-4">
              Open DevTools before you convert. Compare with any upload-based tool.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Button href="/word-to-pdf" variant="primary" size="lg">
              Word to PDF
            </Button>
            <Button href="/pdf-to-word" variant="secondary" size="lg">
              PDF to Word
            </Button>
          </div>
        </div>
      </CreativeReveal>
    </PageSection>
  );
}
