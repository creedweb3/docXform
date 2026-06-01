'use client';

import { cn } from '@/lib/utils';
import { surfaceClass } from '@/components/site/ui/surface';

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  tint?: 'violet' | 'rose' | 'cyan';
};

/** Flat interactive surface — spotlight removed for calmer UI. */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  return <div className={cn(surfaceClass(true), className)}>{children}</div>;
}
