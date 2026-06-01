'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { ParticleField } from '@/components/site/effects/particle-field';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Button } from '@/components/site/ui/button';
import { Container } from '@/components/site/ui/container';
import { Sheet } from '@/components/site/ui/sheet';
import { HomeWasmProof } from '@/components/site/home-wasm-proof';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import { cn } from '@/lib/utils';

export function HomeHero() {
  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden">
      <div className="relative min-h-[min(86vh,50rem)]">
        <ParticleField density="hero" className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

        <Container size="full" className="relative z-[1] flex min-h-[min(86vh,50rem)] flex-col justify-center py-14 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_19rem] lg:items-end lg:gap-10">
            <div className="max-w-xl">
              <BrandRule className="mb-6" />
              <p className="label-mono">Imprint · local conversion</p>

              <h1 className="display-hero mt-4 text-[2.4rem] leading-[1.04] sm:text-[2.9rem] lg:text-[3.2rem]">
                Convert documents where they already live — your browser
              </h1>

              <p className="mt-6 text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
                LibreOffice ships as WebAssembly. Pick a file, run the engine in-tab, download the
                result. The conversion payload does not go to our servers — your security team can
                confirm in the Network panel.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/word-to-pdf" variant="primary" size="lg">
                  Word to PDF
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={2.5} />
                </Button>
                <Button href="/pdf-to-word" variant="secondary" size="lg">
                  PDF to Word
                </Button>
              </div>

              <p className="mt-8 font-mono text-[11px] leading-relaxed text-muted-foreground/90">
                <span className="text-foreground">limit</span> {MAX_CONVERSION_FILE_SIZE_LABEL}
                <span className="text-muted-foreground/50"> · </span>
                <span className="text-foreground">uploads</span> 0
                <span className="text-muted-foreground/50"> · </span>
                <span className="text-foreground">account</span> none
              </p>
            </div>

            <Sheet padding="md" className="lg:mb-2">
              <p className="label-mono">Converters</p>
              <ul className="mt-4 divide-y divide-border">
                <ConverterLink href="/word-to-pdf" title="Word to PDF" code="docx→pdf" />
                <ConverterLink href="/pdf-to-word" title="PDF to Word" code="pdf→docx" />
              </ul>
              <div className="mt-5 border-t border-border pt-4">
                <HomeWasmProof />
              </div>
              <Link
                href="/tools"
                className="mt-4 block font-mono text-[11px] text-[hsl(var(--brand-copper))] hover:text-foreground transition-colors"
              >
                + 15 more tools →
              </Link>
            </Sheet>
          </div>

          <p className="mt-14 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60 sm:block">
            docXform — browser-native document tools
          </p>
        </Container>
      </div>
    </section>
  );
}

function ConverterLink({ href, title, code }: { href: string; title: string; code: string }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-baseline justify-between gap-4 py-3.5',
          'transition-colors hover:bg-[hsl(var(--brand-copper)/0.05)] -mx-2 px-2 rounded-sm'
        )}
      >
        <span className="font-medium text-foreground">{title}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{code}</span>
      </Link>
    </li>
  );
}
