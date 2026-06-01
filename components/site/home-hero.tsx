'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ParticleField } from '@/components/site/effects/particle-field';
import { BrandRule } from '@/components/site/ui/brand-rule';
import { Button } from '@/components/site/ui/button';
import { Container } from '@/components/site/ui/container';
import { Sheet } from '@/components/site/ui/sheet';
import { HomeWasmProof } from '@/components/site/home-wasm-proof';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import { cn } from '@/lib/utils';

const REVEAL = [0.22, 1, 0.36, 1] as const;

export function HomeHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
      <div className="relative min-h-[min(76vh,46rem)] lg:min-h-[min(82vh,48rem)]">
        <ParticleField density="hero" className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

        <Container
          size="lg"
          className="relative z-[1] flex min-h-[min(76vh,46rem)] flex-col justify-center py-16 sm:py-20 lg:min-h-[min(82vh,48rem)]"
        >
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="max-w-[36rem]">
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: REVEAL }}
              >
                <BrandRule className="mb-5" />
                <p className="label-mono">Imprint · local conversion</p>
              </motion.div>

              <motion.h1
                className="kinetic-display mt-6"
                initial={reducedMotion ? false : { opacity: 0, y: 36, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.95, delay: 0.12, ease: REVEAL }}
              >
                Convert documents where they already live: your browser
              </motion.h1>

              <motion.p
                className="type-lead mt-6 max-w-[32rem]"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.22, ease: REVEAL }}
              >
                LibreOffice ships as WebAssembly. Pick a file, run the engine in-tab, download the
                result. The conversion payload does not go to our servers.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap items-center gap-3"
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.34, ease: REVEAL }}
              >
                <Button href="/word-to-pdf" variant="primary" size="lg">
                  Word to PDF
                </Button>
                <Button href="/pdf-to-word" variant="secondary" size="lg">
                  PDF to Word
                </Button>
              </motion.div>

              <motion.dl
                className="mt-10 grid grid-cols-3 gap-4 border-t border-border/80 pt-6 sm:max-w-md"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.45, ease: REVEAL }}
              >
                <div>
                  <dt className="label-mono">Limit</dt>
                  <dd className="type-caption mt-1.5 text-foreground">{MAX_CONVERSION_FILE_SIZE_LABEL}</dd>
                </div>
                <div>
                  <dt className="label-mono">Uploads</dt>
                  <dd className="type-caption mt-1.5 text-foreground">0</dd>
                </div>
                <div>
                  <dt className="label-mono">Account</dt>
                  <dd className="type-caption mt-1.5 text-foreground">None</dd>
                </div>
              </motion.dl>
            </div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 48, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.28, ease: REVEAL }}
            >
              <Sheet
                padding="md"
                className="lg:sticky lg:top-[calc(3.5rem+1.25rem)] shadow-[0_32px_100px_-48px_rgba(0,0,0,0.9)]"
              >
                <p className="label-mono">Converters</p>
                <ul className="mt-4 divide-y divide-border">
                  <ConverterLink href="/word-to-pdf" title="Word to PDF" code="docx / pdf" />
                  <ConverterLink href="/pdf-to-word" title="PDF to Word" code="pdf / docx" />
                </ul>
                <div className="mt-6 border-t border-border/80 pt-6">
                  <HomeWasmProof />
                </div>
                <Link
                  href="/tools"
                  className="interactive-trigger mt-5 inline-block text-sm font-medium text-[hsl(var(--brand-copper))] transition-colors hover:text-foreground"
                >
                  Browse all 15 tools
                </Link>
              </Sheet>
            </motion.div>
          </div>
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
          'interactive-trigger flex items-center justify-between gap-4 py-3.5',
          'transition-colors hover:bg-[hsl(var(--brand-copper)/0.05)] -mx-1.5 rounded-sm px-1.5'
        )}
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="font-mono text-[10px] tracking-wide text-muted-foreground">{code}</span>
      </Link>
    </li>
  );
}
