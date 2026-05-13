'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, Shield01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import { type ToolDefinition } from '@/lib/tools';
import { ToolIcon } from '@/components/tools/tool-icon';

type ToolExperienceProps = {
  tool: ToolDefinition;
  workspace?: React.ReactNode;
};

export function ToolExperience({ tool, workspace }: ToolExperienceProps) {
  const keywordChips = useMemo(
    () =>
      tool.keywords.map((kw) => (
        <span
          key={kw}
          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/60 text-muted-foreground border border-white/70"
        >
          {kw}
        </span>
      )),
    [tool.keywords]
  );

  return (
    <main className="min-h-screen flex flex-col bg-dot-grid-subtle">
      <div className="pt-[7.5rem] pb-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 border border-white/5">
            <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} className="text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Browser-based · No uploads · Privacy-first
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">{tool.name}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">{tool.description}</p>
          <div className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold border ${tool.accentClass}`}>
            <ToolIcon pair={tool.iconPair} tone={tool.tone} variant="tile" label={`${tool.name} icon`} />
            <span className="text-left">{tool.metaTitle}</span>
          </div>
        </div>

        {workspace && <div className="max-w-5xl mx-auto mt-10">{workspace}</div>}

        <div className="max-w-5xl mx-auto mt-10 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 glass-subtle rounded-2xl border border-white/60 p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Upload04Icon} size={18} strokeWidth={2.4} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-foreground">Process files locally</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Add your files and run this tool fully in your browser. WebAssembly or optimized client-side code keeps
              documents on-device for privacy and speed.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {tool.features.map((f) => (
                <div key={f} className="rounded-xl border border-white/50 bg-white/40 px-3 py-2 text-sm text-foreground">
                  {f}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">{keywordChips}</div>
          </div>

          <div className="glass-subtle rounded-2xl border border-white/60 p-5 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <HugeiconsIcon icon={Shield01Icon} size={18} strokeWidth={2.2} className="text-green-600" />
              Private by design
            </div>
            <p className="text-sm text-muted-foreground">
              Nothing uploads to a server. All processing stays in your browser session.
            </p>
            <Link
              href="/faq"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-2"
            >
              Read privacy FAQ <span aria-hidden>→</span>
            </Link>
            <Link
              href="/tools"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              Browse all tools <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10 grid gap-6 md:grid-cols-2">
          <div className="glass-subtle rounded-2xl border border-white/60 p-5 sm:p-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">How to use</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {tool.howToSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="glass-subtle rounded-2xl border border-white/60 p-5 sm:p-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">FAQs</h3>
            <div className="space-y-3">
              {tool.faqs.map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-white/50 bg-white/30 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground group-open:text-blue-600">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
