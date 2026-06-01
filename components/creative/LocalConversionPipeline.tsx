'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'pick' | 'load' | 'convert' | 'save';

const PHASES: Phase[] = ['idle', 'pick', 'load', 'convert', 'save'];
const DURATION: Record<Phase, number> = {
  idle: 700,
  pick: 1200,
  load: 1800,
  convert: 2400,
  save: 1400,
};

const LOG_LINES = [
  { at: 'pick' as Phase, text: '[client] file selected · resume.docx · 248 KB' },
  { at: 'load' as Phase, text: '[wasm] fetching LibreOffice core → CacheStorage' },
  { at: 'convert' as Phase, text: '[worker] soffice --convert-to pdf · in-tab' },
  { at: 'save' as Phase, text: '[client] download ready · resume.pdf' },
];

export function LocalConversionPipeline({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const phaseIndex = PHASES.indexOf(phase);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('save');
      setProgress(100);
      setLogIndex(LOG_LINES.length);
      return;
    }

    let i = 0;
    let timeout = 0;

    const run = () => {
      const current = PHASES[i] ?? 'idle';
      setPhase(current);
      setProgress(Math.round((i / (PHASES.length - 1)) * 100));
      const logs = LOG_LINES.filter((line) => PHASES.indexOf(line.at) <= i);
      setLogIndex(logs.length);

      timeout = window.setTimeout(() => {
        i = (i + 1) % PHASES.length;
        run();
      }, DURATION[current]);
    };

    run();
    return () => window.clearTimeout(timeout);
  }, [reducedMotion]);

  const visibleLogs = useMemo(() => LOG_LINES.slice(0, logIndex), [logIndex]);

  return (
    <div
      className={cn(
        'sheet overflow-hidden border-border/90',
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7',
        className
      )}
      aria-label="Local conversion demonstration"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <p className="label-mono text-[hsl(var(--brand-copper))]">Live system preview</p>
          <p className="mt-1 text-sm text-muted-foreground">
            What happens when you convert on docXform — no upload path.
          </p>
        </div>
        <div className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">
          <span className="text-foreground">{progress}%</span>
          <span className="mx-1 opacity-40">·</span>
          local-only
        </div>
      </div>

      <div className={cn('mt-5 grid gap-5', compact ? '' : 'lg:grid-cols-[1.15fr_1fr]')}>
        <div className="relative overflow-hidden rounded-sm border border-border/80 bg-background/60 p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2">
            <span className="h-2 w-2 rounded-full bg-red-500/70" />
            <span className="h-2 w-2 rounded-full bg-amber-500/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">docXform · this tab</span>
          </div>

          <div className="min-h-[220px]">
            <div className="grid grid-cols-3 gap-3">
              <StageCard
                title="Your file"
                subtitle="DOCX on disk"
                active={phaseIndex >= 1}
                highlight={phase === 'pick'}
                icon="DOC"
              />
              <StageCard
                title="WASM engine"
                subtitle="LibreOffice"
                active={phaseIndex >= 2}
                highlight={phase === 'load' || phase === 'convert'}
                icon="CPU"
                pulse={phase === 'convert'}
              />
              <StageCard
                title="Output"
                subtitle="PDF download"
                active={phaseIndex >= 4}
                highlight={phase === 'save'}
                icon="PDF"
              />
            </div>

            <div className="relative mx-[8%] mt-4 h-10" aria-hidden>
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/80" />
              <motion.div
                className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-[hsl(var(--brand-copper))]"
                animate={{
                  scaleX:
                    phaseIndex >= 4 ? 1 : phaseIndex >= 2 ? 0.55 : phaseIndex >= 1 ? 0.18 : 0,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--brand-copper))] shadow-[0_0_16px_hsl(26_72%_48%/0.75)]"
                animate={{
                  left:
                    phase === 'pick'
                      ? '0%'
                      : phase === 'load' || phase === 'convert'
                        ? '50%'
                        : phase === 'save'
                          ? '100%'
                          : '0%',
                  opacity: phaseIndex >= 1 ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 140, damping: 20 }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="label-mono">Network monitor</p>
          <ul className="min-h-[140px] flex-1 space-y-2 rounded-sm border border-border/80 bg-background/50 p-3 font-mono text-[10px] leading-relaxed">
            <li className="flex justify-between gap-2 text-amber-400/90">
              <span>upload.docxform.com</span>
              <span>BLOCKED</span>
            </li>
            <li className="flex justify-between gap-2 text-amber-400/90">
              <span>api.remote-convert</span>
              <span>BLOCKED</span>
            </li>
            <li className="flex justify-between gap-2 text-[hsl(var(--brand-sage))]">
              <span>wasm.libreoffice</span>
              <span>cache hit</span>
            </li>
            {visibleLogs.map((line) => (
              <motion.li
                key={line.text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-muted-foreground"
              >
                {line.text}
              </motion.li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Open DevTools → Network while converting. You should see the document stay local; only
            site assets and WASM cache requests appear.
          </p>
        </div>
      </div>
    </div>
  );
}

function StageCard({
  title,
  subtitle,
  icon,
  active,
  highlight,
  pulse,
}: {
  title: string;
  subtitle: string;
  icon: string;
  active: boolean;
  highlight?: boolean;
  pulse?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        'relative z-[1] flex flex-col items-center rounded-sm border px-2 py-5 text-center transition-colors',
        active
          ? 'border-[hsl(var(--brand-copper)/0.45)] bg-[hsl(var(--brand-copper)/0.08)]'
          : 'border-border/70 bg-card/30',
        highlight && 'shadow-[0_0_32px_-8px_hsl(26_72%_48%/0.55)]'
      )}
      animate={pulse ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 1.1, repeat: pulse ? Infinity : 0, ease: 'easeInOut' }}
    >
      <span className="font-mono text-[10px] font-semibold tracking-wider text-[hsl(var(--brand-copper))]">
        {icon}
      </span>
      <p className="mt-2 text-xs font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
