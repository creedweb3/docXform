'use client';

import { CreativeReveal } from '@/components/creative/CreativeReveal';
import { LocalConversionPipeline } from '@/components/creative/LocalConversionPipeline';
import {
  HomeCta,
  HomeFeatures,
  HomeToolsTeaser,
  HomeWorkflow,
} from '@/components/site/home-sections';
import { HomeHero } from '@/components/site/home-hero';
import { Container } from '@/components/site/ui/container';
import { SectionHeader } from '@/components/site/ui/section-header';
import { ZoneSeparator } from '@/components/site/ui/zone-separator';

export function CreativeHome() {
  return (
    <>
      <HomeHero />

      <section className="border-t border-border/80 py-16 sm:py-20">
        <Container size="lg">
          <CreativeReveal>
            <SectionHeader
              eyebrow="System view"
              title="See the local pipeline run"
              description="A live readout of what docXform does in your browser — file in, WASM engine, PDF out. Upload routes stay blocked."
              className="mb-8 max-w-2xl"
            />
            <LocalConversionPipeline />
          </CreativeReveal>
        </Container>
      </section>

      <HomeToolsTeaser />
      <HomeFeatures />
      <HomeWorkflow />
      <ZoneSeparator />
      <HomeCta />
    </>
  );
}
