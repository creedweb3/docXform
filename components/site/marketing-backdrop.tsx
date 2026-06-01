'use client';

import { ParticleField } from '@/components/site/effects/particle-field';

export function MarketingBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      data-marketing-backdrop
      aria-hidden
    >
      <ParticleField density="ambient" className="absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_18%_-5%,hsl(26_55%_42%/0.14),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/70 to-background" />
    </div>
  );
}
