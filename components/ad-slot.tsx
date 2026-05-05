'use client';

interface AdSlotProps {
  variant?: 'tool' | 'content';
  visibleClassName?: string;
}

export function AdSlot(_props: AdSlotProps) {
  // Manual ad units need real AdSense slot IDs. Auto ads are handled by the
  // global AdSense script until those IDs exist.
  return null;
}
