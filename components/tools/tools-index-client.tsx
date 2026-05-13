'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import { toolDefinitions } from '@/lib/tools';
import { ToolIcon } from '@/components/tools/tool-icon';

export function ToolsIndexClient() {
  return (
    <main className="min-h-screen flex flex-col bg-dot-grid-subtle">
      <div className="pt-[7.5rem] pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 border border-white/5">
            <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} className="text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Browser-based tools · No uploads · Privacy-first
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            All docXform tools, in your browser
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Merge, split, compress, convert, and sanitize PDFs and Office files without sending them to a server.
            WebAssembly keeps your work local, fast, and private.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-10 grid gap-4 sm:gap-6 md:grid-cols-2">
          {toolDefinitions.map((tool) => {
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group block rounded-2xl border border-white/50 glass-subtle p-5 sm:p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                aria-label={`${tool.name} - ${tool.description}`}
              >
                <div className="flex items-start gap-4">
                  <ToolIcon pair={tool.iconPair} tone={tool.tone} label={`${tool.name} icon`} />
                  <div className="min-w-0">
                    <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border ${tool.accentClass}`}>
                      <ToolIcon pair={tool.iconPair} tone={tool.tone} variant="inline" />
                      <span>{tool.name}</span>
                    </div>
                    <p className="mt-3 text-sm sm:text-base text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card/60 text-muted-foreground border border-border/40"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                  Open tool
                  <span aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
