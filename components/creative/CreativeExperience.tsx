'use client';

import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useMemo, useRef, type ReactNode } from 'react';
import { LocalConversionPipeline } from '@/components/creative/LocalConversionPipeline';
import { CreativeNav } from '@/components/creative/CreativeNav';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import { cn } from '@/lib/utils';

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const MAGNETIC_SPRING = { stiffness: 280, damping: 22, mass: 0.35 };

function KineticCharacters({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reducedMotion = useReducedMotion();
  const chars = useMemo(() => text.split(''), [text]);

  if (reducedMotion) {
    return <span className={cn('creative-type-hero', className)}>{text}</span>;
  }

  return (
    <span className={cn('creative-type-hero', className)} aria-label={text}>
      {chars.map((char, index) => (
        <span key={`${char}-${index}`} className="text-reveal-parent inline-block">
          <motion.span
            className="text-reveal-child"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.85,
              delay: delay + index * 0.024,
              ease: REVEAL_EASE,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function ProductPlacard() {
  return (
    <aside className="absolute right-6 top-6 z-20 max-w-[16rem] text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-exhibit-mute sm:right-10 sm:top-10">
      <p className="text-exhibit-paper/80">ENGINE // LibreOffice WASM</p>
      <p className="mt-1">UPLOADS // 0</p>
      <p className="mt-1">ACCOUNT // none</p>
      <p className="mt-2 text-[hsl(var(--brand-copper))]">LIMIT // {MAX_CONVERSION_FILE_SIZE_LABEL}</p>
    </aside>
  );
}

function SectionHero() {
  return (
    <div className="relative flex h-full w-full flex-col justify-end bg-exhibit-void p-6 pb-12 sm:p-10 sm:pb-16">
      <ProductPlacard />
      <div className="relative z-10 max-w-[96vw]">
        <p className="label-mono mb-4 text-exhibit-mute">Private browser conversion</p>
        <KineticCharacters text="YOUR FILE NEVER LEAVES." delay={0.2} />
        <p className="type-lead mt-6 max-w-xl text-exhibit-mute">
          Word to PDF and PDF to Word run inside your tab. No upload queue. No account.
        </p>
      </div>
    </div>
  );
}

function SectionPipeline() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-8 bg-exhibit-ink px-6 py-16 sm:px-10">
      <div className="max-w-xl">
        <p className="label-mono text-[hsl(var(--brand-copper))]">How it works</p>
        <h2 className="kinetic-headline mt-3 text-exhibit-paper">Watch the local pipeline.</h2>
        <p className="type-body mt-4 text-exhibit-mute">
          This is what docXform does: your document stays on your machine while LibreOffice WASM converts
          it in the browser. The network panel stays quiet.
        </p>
      </div>
      <LocalConversionPipeline />
    </div>
  );
}

function MagneticCta() {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, MAGNETIC_SPRING);
  const springY = useSpring(offsetY, MAGNETIC_SPRING);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-10 bg-exhibit-void px-6 py-16">
      <p className="label-mono text-center text-exhibit-mute">Ready when you are</p>
      <motion.div style={{ x: springX, y: springY }} className="flex flex-col items-center gap-6 sm:flex-row">
        <Link
          ref={ref}
          href="/word-to-pdf"
          data-interactive-mode="magnetic"
          data-cursor-label="CONVERT"
          onMouseMove={(event) => {
            if (reducedMotion || !ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            offsetX.set((event.clientX - (rect.left + rect.width / 2)) * 0.18);
            offsetY.set((event.clientY - (rect.top + rect.height / 2)) * 0.18);
          }}
          onMouseLeave={() => {
            offsetX.set(0);
            offsetY.set(0);
          }}
          className="interactive-trigger font-display text-[clamp(1.75rem,6vw,4rem)] font-semibold uppercase tracking-ultra-tight text-exhibit-paper hover:text-[hsl(var(--brand-copper))]"
        >
          Word to PDF
        </Link>
        <Link
          href="/pdf-to-word"
          data-interactive-mode="explore"
          data-cursor-label="OPEN"
          className="interactive-trigger font-display text-[clamp(1.75rem,6vw,4rem)] font-semibold uppercase tracking-ultra-tight text-exhibit-mute hover:text-exhibit-paper"
        >
          PDF to Word
        </Link>
      </motion.div>
      <Link
        href="/tools"
        data-interactive-mode="explore"
        data-cursor-label="TOOLS"
        className="interactive-trigger font-mono text-[10px] uppercase tracking-[0.2em] text-exhibit-mute hover:text-[hsl(var(--brand-copper))]"
      >
        Browse all 15 tools
      </Link>
    </div>
  );
}

function DeckSection({
  children,
  index,
  scrollYProgress,
}: {
  children: ReactNode;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / 3;
  const mid = (index + 0.5) / 3;
  const end = (index + 1) / 3;

  const scale = useTransform(
    scrollYProgress,
    [start, mid, end],
    index === 2 ? [0.96, 1, 1] : [1, 1, 0.92]
  );
  const opacity = useTransform(
    scrollYProgress,
    [start, mid, end],
    index === 2 ? [0.88, 1, 1] : [1, 1, 0.42]
  );
  const y = useTransform(scrollYProgress, [start, start + 0.08], [index === 0 ? 0 : 80, 0]);
  const brightness = useTransform(scrollYProgress, [start, end], [1, 0.7]);
  const filter = useTransform(brightness, (value) => `brightness(${value})`);

  return (
    <div
      className="creative-snap-panel sticky top-0 h-[100dvh] w-full"
      style={{ zIndex: 20 + index }}
    >
      <motion.div
        className="gpu-transform h-full w-full origin-top"
        style={{ scale, opacity, y, filter }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function CreativeExperience() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div className="relative h-full w-full">
      <CreativeNav floating />

      <div ref={scrollRef} className="creative-scroll h-[100dvh] w-full">
        <div className="relative w-full" style={{ height: reducedMotion ? 'auto' : '300dvh' }}>
          {reducedMotion ? (
            <>
              <section className="creative-snap-panel min-h-[100dvh] pt-16">
                <SectionHero />
              </section>
              <section className="creative-snap-panel min-h-[100dvh]">
                <SectionPipeline />
              </section>
              <section className="creative-snap-panel min-h-[100dvh]">
                <MagneticCta />
              </section>
            </>
          ) : (
            <>
              <DeckSection index={0} scrollYProgress={scrollYProgress}>
                <div className="pt-16">
                  <SectionHero />
                </div>
              </DeckSection>
              <DeckSection index={1} scrollYProgress={scrollYProgress}>
                <SectionPipeline />
              </DeckSection>
              <DeckSection index={2} scrollYProgress={scrollYProgress}>
                <MagneticCta />
              </DeckSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
