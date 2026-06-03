'use client';

import { useEffect } from 'react';
import { CreativeReveal } from '@/components/creative/CreativeReveal';
import { ConversionFlowStageRail } from '@/components/site/conversion-flow-chrome';
import { HackerTerminal } from '@/components/site/terminal/hacker-terminal';
import {
  ConversionFlowProvider,
  useConversionFlow,
} from '@/components/tools/conversion-flow-provider';
import { ConversionFlowOutputView } from '@/components/tools/conversion-flow-output';
import {
  CONVERSION_FLOW_STUDIO_CANVAS,
  CONVERSION_FLOW_VP,
  CONVERSION_FLOW_VP_INSET,
  CONVERSION_FLOW_WORKSPACE,
} from '@/lib/conversion-flow-layout';
import { ZONE_GAP_AFTER } from '@/lib/marketing-layout';
import { cn } from '@/lib/utils';

type ConversionProductShellProps = {
  productTitle: string;
  productPath: string;
  pageTitle: string;
  pageDescription: string;
  hackerPageClassName?: string;
  trustSignals?: React.ReactNode;
  marketing?: React.ReactNode;
  workspace: React.ReactNode;
};

function formatOutputReadyLine(outputLabel?: string): string {
  const label = outputLabel?.trim();
  if (!label || label.toLowerCase() === 'files') return 'Your files are ready to download';
  const lower = label.toLowerCase();
  const singularTypes = new Set(['pdf', 'docx', 'pptx', 'txt', 'md']);
  if (singularTypes.has(lower) || !label.endsWith('s')) {
    return `Your ${label} is ready to download`;
  }
  return `Your ${label} are ready to download`;
}

/** Drop pick-stage meta (limits/free) — trust row covers uploads/runtime. */
function pickHeaderDescription(pageDescription: string): string {
  let text = pageDescription.trim();
  text = text.replace(/\s*·\s*up to .+? · free\.?\s*$/i, '').trim();
  const freeLead = text.match(/^(.+? · free\.)\s*(.+)$/s);
  if (freeLead?.[2]) return freeLead[2].trim();
  return text || pageDescription;
}

function PickOutputTerminalHeader({
  stage,
  pageTitle,
  pageDescription,
  outputLabel,
}: {
  stage: 'pick' | 'output';
  pageTitle: string;
  pageDescription: string;
  outputLabel?: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <h1 className="font-mono text-xl font-medium leading-tight tracking-[-0.02em] text-foreground text-balance sm:text-2xl">
        {pageTitle}
      </h1>
      {stage === 'pick' ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[hsl(var(--brand-copper))]/90 sm:text-[15px]">
          {pickHeaderDescription(pageDescription)}
        </p>
      ) : (
        <p className="max-w-2xl text-sm leading-relaxed text-[hsl(var(--brand-sage))]/90 sm:text-[15px]">
          {formatOutputReadyLine(outputLabel)}
        </p>
      )}
    </div>
  );
}

function ConversionProductShellInner({
  pageTitle,
  pageDescription,
  hackerPageClassName,
  trustSignals,
  marketing,
  workspace,
}: Omit<ConversionProductShellProps, 'productTitle' | 'productPath'>) {
  const flow = useConversionFlow();
  const stage = flow?.stage ?? 'pick';
  const registration = flow?.registration;
  const isPick = stage === 'pick';
  const isStudio = stage === 'studio';
  const isOutput = stage === 'output';
  const inFlowVp = isPick || isStudio || isOutput;
  const pathSlug = (flow?.productPath ?? '').replace(/^\//, '');

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.conversionStage = stage;
    return () => {
      delete root.dataset.conversionStage;
    };
  }, [stage]);

  useEffect(() => {
    if (!isStudio) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isStudio]);

  const stageRail = <ConversionFlowStageRail stage={stage} variant="bar" />;

  /** Stable wrapper so workspace state survives pick → studio → output. */
  const workspaceFrame = (
    <div
      className={cn(
        CONVERSION_FLOW_WORKSPACE,
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
        isPick && 'conversion-flow-pick-mount conversion-flow-pick-frame',
        isStudio && CONVERSION_FLOW_STUDIO_CANVAS,
        (isStudio || isOutput) && 'h-full min-h-0',
        isOutput && 'sr-only'
      )}
      aria-hidden={isOutput}
    >
      {workspace}
    </div>
  );

  const terminal = (
    <HackerTerminal
      fillHeight={inFlowVp}
      mode="product"
      path={pathSlug}
      topAccessory={stageRail}
      showProductFooter={inFlowVp}
      className="h-full min-h-0"
      header={
        isStudio ? undefined : (
          <PickOutputTerminalHeader
            stage={isOutput ? 'output' : 'pick'}
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            outputLabel={registration?.outputLabel}
          />
        )
      }
      bodyClassName={cn(
        isStudio && 'min-h-0 flex-1 gap-0 overflow-hidden !p-0',
        isPick && 'flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 sm:p-5',
        isOutput && 'flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5'
      )}
    >
      {workspaceFrame}
      {isOutput && registration ? (
        <ConversionFlowOutputView registration={registration} />
      ) : isPick && trustSignals ? (
        <div className="term-trust-signals shrink-0 border-t border-[hsl(var(--brand-copper)/0.1)] pt-3">
          {trustSignals}
        </div>
      ) : null}
    </HackerTerminal>
  );

  return (
    <>
      <section
        className={cn(
          CONVERSION_FLOW_VP,
          CONVERSION_FLOW_VP_INSET,
          isPick && ZONE_GAP_AFTER,
          hackerPageClassName
        )}
        data-marketing-zone="hero"
      >
        <CreativeReveal className="flex h-full min-h-0 flex-1 flex-col">
          {terminal}
        </CreativeReveal>
      </section>
      {isPick ? marketing : null}
    </>
  );
}

/** pick → studio → output */
export function ConversionProductShell(props: ConversionProductShellProps) {
  const { productTitle, productPath, ...inner } = props;
  return (
    <ConversionFlowProvider productTitle={productTitle} productPath={productPath}>
      <ConversionProductShellInner {...inner} />
    </ConversionFlowProvider>
  );
}
