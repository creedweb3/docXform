/** Viewport shell for pick → studio → output (below floating nav). */
export const CONVERSION_FLOW_VP =
  'conversion-flow-vp flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] min-h-0 w-full flex-col overflow-hidden';

/** Inset terminal inside the viewport (console containment, not edge-to-edge). */
export const CONVERSION_FLOW_VP_INSET =
  'conversion-flow-vp--inset box-border bg-background px-[5px] pb-[5px] pt-4 sm:pb-5 sm:pt-5';

/** @deprecated Use {@link CONVERSION_FLOW_VP_INSET} */
export const CONVERSION_FLOW_VP_BLEED = CONVERSION_FLOW_VP_INSET;

/** @deprecated Use {@link CONVERSION_FLOW_VP_INSET} */
export const CONVERSION_FLOW_VP_STUDIO = CONVERSION_FLOW_VP_INSET;

export const CONVERSION_FLOW_WORKSPACE =
  'conversion-flow-workspace flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden';

/** Studio workspace fills terminal body with no inner frame padding. */
export const CONVERSION_FLOW_STUDIO_CANVAS =
  'conversion-flow-studio-canvas flex h-full min-h-0 w-full flex-col overflow-hidden';
