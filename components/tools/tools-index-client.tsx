'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Search01Icon,
  Shield01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { toolDefinitions, type ToolDefinition } from '@/lib/tools';
import { ToolIcon } from '@/components/tools/tool-icon';
import { TONE_TEXT_GRADIENT } from '@/components/tools/tone-styles';

type Category = 'all' | 'pdf' | 'docx' | 'pptx' | 'image';

const CATEGORY_LABEL: Record<Category, string> = {
  all: 'All tools',
  pdf: 'PDF',
  docx: 'DOCX',
  pptx: 'PPTX',
  image: 'Image',
};

const CATEGORY_ORDER: Category[] = ['all', 'pdf', 'docx', 'pptx', 'image'];

function getCategory(tool: ToolDefinition): Exclude<Category, 'all'> {
  if (tool.slug.startsWith('pdf-')) return 'pdf';
  if (tool.slug.startsWith('docx-')) return 'docx';
  if (tool.slug.startsWith('pptx-')) return 'pptx';
  if (tool.slug.startsWith('image-') || tool.slug.startsWith('images-')) return 'image';
  return 'pdf';
}

function matchesQuery(tool: ToolDefinition, query: string) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (tool.name.toLowerCase().includes(needle)) return true;
  if (tool.description.toLowerCase().includes(needle)) return true;
  if (tool.metaTitle.toLowerCase().includes(needle)) return true;
  if (tool.keywords.some((kw) => kw.toLowerCase().includes(needle))) return true;
  return false;
}

export function ToolsIndexClient() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const deferredQuery = useDeferredValue(query);

  const counts = useMemo(() => {
    const initial: Record<Category, number> = {
      all: toolDefinitions.length,
      pdf: 0,
      docx: 0,
      pptx: 0,
      image: 0,
    };
    for (const tool of toolDefinitions) {
      initial[getCategory(tool)] += 1;
    }
    return initial;
  }, []);

  const filtered = useMemo(() => {
    return toolDefinitions.filter((tool) => {
      if (category !== 'all' && getCategory(tool) !== category) return false;
      return matchesQuery(tool, deferredQuery);
    });
  }, [category, deferredQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto pt-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-6 border border-white/5">
          <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} className="text-blue-500" />
          <span className="text-xs font-medium text-muted-foreground">
            Browser-based tools &middot; No uploads &middot; Privacy-first
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          <span className="gradient-text-blue">All docXform tools</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Merge, split, compress, convert, and sanitize PDFs and Office files without sending them to a server.
        </p>
      </div>

      <div className="glass-subtle rounded-2xl border border-white/60 p-4 sm:p-5 mb-8 flex flex-col gap-3">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, format, or keyword…"
            aria-label="Search tools"
            className="w-full rounded-xl border border-border/50 bg-white/70 pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card/70 hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by file type">
          {CATEGORY_ORDER.map((key) => {
            const active = category === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(key)}
                className={
                  active
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/80 hover:text-foreground'
                }
              >
                {CATEGORY_LABEL[key]}
                <span
                  className={
                    active
                      ? 'rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] leading-none'
                      : 'rounded-full bg-card/70 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground'
                  }
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-subtle rounded-2xl border border-white/60 p-10 text-center">
          <p className="text-sm font-medium text-foreground">No tools match that filter</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different keyword or pick another file type above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => {
            const fileType = getCategory(tool);
            const gradient = TONE_TEXT_GRADIENT[tool.tone];
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-white/60 glass-subtle p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${tool.name} - ${tool.description}`}
              >
                <div className="flex items-start gap-3">
                  <ToolIcon pair={tool.iconPair} tone={tool.tone} label={`${tool.name} icon`} />
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-base font-bold tracking-tight">
                      <span className={`bg-gradient-to-br bg-clip-text text-transparent ${gradient}`}>
                        {tool.name}
                      </span>
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/40 bg-white/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {CATEGORY_LABEL[fileType]}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <HugeiconsIcon icon={Shield01Icon} size={11} strokeWidth={2} className="text-emerald-500" />
                    Local-only
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Open tool <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
