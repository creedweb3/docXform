'use client';

import { useDeferredValue, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Doc01Icon,
  Pdf01Icon,
  Search01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import {
  toolDefinitions,
  toolHasIntent,
  type ToolDefinition,
  type ToolFormat,
  type ToolIntent,
} from '@/lib/tools';
import { isToolPageAvailable } from '@/lib/tool-availability';
import { ToolIcon } from '@/components/tools/tool-icon';
import {
  FILTER_PILL_ACTIVE,
  FILTER_PILL_IDLE,
  getFormatTone,
  toolsIndexCoreCardClass,
  toolsIndexLinkClass,
} from '@/components/tools/tool-theme';
import { SegmentedControl } from '@/components/site/ui/segmented-control';
import { CATALOG_ROW, STICKY_BAR, SURFACE, SURFACE_HOVER } from '@/lib/site-design';
import { cn } from '@/lib/utils';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';

type FormatFilter = 'all' | ToolFormat;
type IntentFilter = 'all' | ToolIntent;

const FORMAT_LABEL: Record<FormatFilter, string> = {
  all: 'All tools',
  pdf: 'PDF',
  docx: 'DOCX',
  pptx: 'PPTX',
  image: 'Image',
};

const FORMAT_ORDER: FormatFilter[] = ['all', 'pdf', 'docx', 'pptx', 'image'];

/** Stable file-type blocks when "All tools" is selected (rose → blue → orange → purple). */
const FORMAT_DISPLAY_ORDER: ToolFormat[] = ['pdf', 'docx', 'pptx', 'image'];

const INTENT_DISPLAY_ORDER: ToolIntent[] = ['edit', 'convert', 'optimize', 'extract', 'privacy'];

const INTENT_LABEL: Record<IntentFilter, string> = {
  all: 'All jobs',
  edit: 'Edit',
  convert: 'Convert',
  optimize: 'Compress',
  extract: 'Extract',
  privacy: 'Privacy',
};

const INTENT_ORDER: IntentFilter[] = ['all', 'edit', 'convert', 'optimize', 'extract', 'privacy'];

type FilterMode = 'format' | 'intent';

const FILTER_MODE_OPTIONS: { mode: FilterMode; label: string }[] = [
  { mode: 'format', label: 'File type' },
  { mode: 'intent', label: 'Job' },
];

const CORE_CONVERTERS = [
  {
    href: '/word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert DOC, DOCX, and Word files to PDF in your browser.',
    iconPair: { back: Doc01Icon, front: Pdf01Icon },
    tone: 'blue' as const,
  },
  {
    href: '/pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to editable DOCX documents locally.',
    iconPair: { back: Pdf01Icon, front: Doc01Icon },
    tone: 'rose' as const,
  },
] as const;

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

function filterPillClass(active: boolean) {
  return active ? FILTER_PILL_ACTIVE : FILTER_PILL_IDLE;
}

function countBadgeClass(active: boolean) {
  if (!active) {
    return 'rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground tabular-nums';
  }
  return 'rounded-full bg-foreground/[0.1] px-1.5 py-0.5 text-[10px] leading-none tabular-nums text-foreground';
}

function capabilityChips(tool: ToolDefinition) {
  const caps = tool.capabilities || {};
  const chips: string[] = [];
  if (caps.preview) chips.push('Preview');
  if (caps.batch) chips.push('Batch');
  if (caps.pageRange) chips.push('Page range');
  if (caps.zipOutput) chips.push('ZIP output');
  if (caps.qualityControls) chips.push('Quality');
  return chips;
}

function compareToolsByName(a: ToolDefinition, b: ToolDefinition) {
  return a.name.localeCompare(b.name);
}

function groupToolsByFormat(tools: ToolDefinition[]) {
  return FORMAT_DISPLAY_ORDER.map((format) => ({
    format,
    tools: tools.filter((t) => t.format === format).sort(compareToolsByName),
  })).filter((g) => g.tools.length > 0);
}

function groupToolsByIntent(tools: ToolDefinition[]) {
  return INTENT_DISPLAY_ORDER.map((intent) => ({
    intent,
    tools: tools
      .filter((t) => toolHasIntent(t, intent))
      .sort((a, b) => {
        const formatDelta =
          FORMAT_DISPLAY_ORDER.indexOf(a.format) - FORMAT_DISPLAY_ORDER.indexOf(b.format);
        if (formatDelta !== 0) return formatDelta;
        return compareToolsByName(a, b);
      }),
  })).filter((g) => g.tools.length > 0);
}

const CHIP =
  'inline-flex items-center rounded-md border border-border/70 bg-card/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground';

function ToolListRow({
  tool,
  showFormatChip,
  showIntentChip,
}: {
  tool: ToolDefinition;
  showFormatChip?: boolean;
  showIntentChip?: boolean;
}) {
  const available = isToolPageAvailable(tool.slug);
  const formatTone = getFormatTone(tool.format);
  const primaryIntent = tool.intents[0];
  const caps = capabilityChips(tool);
  const rowClass = cn(
    CATALOG_ROW,
    available && SURFACE_HOVER,
    !available && 'opacity-80 cursor-default'
  );

  const inner = (
    <>
      <ToolIcon pair={tool.iconPair} tone={formatTone} label={`${tool.name} icon`} className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">{tool.name}</h3>
          {showFormatChip ? <span className={CHIP}>{FORMAT_LABEL[tool.format]}</span> : null}
          {showIntentChip ? <span className={CHIP}>{INTENT_LABEL[primaryIntent]}</span> : null}
          {!available ? (
            <span className="inline-flex items-center rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200/90">
              Coming soon
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{tool.description}</p>
      </div>
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {caps.slice(0, 2).map((cap) => (
          <span key={cap} className={cn(CHIP, 'normal-case tracking-normal text-[11px]')}>
            {cap}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <HugeiconsIcon icon={Shield01Icon} size={11} strokeWidth={2} className="text-emerald-500/80" />
          Local
        </span>
        {available ? (
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={16}
            strokeWidth={2}
            className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        ) : null}
      </div>
    </>
  );

  if (!available) {
    return (
      <div className={rowClass} aria-label={`${tool.name} - coming soon`}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/tools/${tool.slug}`} className={cn(rowClass, 'group')} aria-label={`${tool.name} - ${tool.description}`}>
      {inner}
    </Link>
  );
}

function ToolCatalogList({ tools, showFormatChip, showIntentChip }: { tools: ToolDefinition[]; showFormatChip?: boolean; showIntentChip?: boolean }) {
  return (
    <div className={cn(SURFACE, 'overflow-hidden divide-y divide-border/50')}>
      {tools.map((tool) => (
        <ToolListRow key={tool.slug} tool={tool} showFormatChip={showFormatChip} showIntentChip={showIntentChip} />
      ))}
    </div>
  );
}

export function ToolsIndexClient() {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('format');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  const switchFilterMode = (next: FilterMode) => {
    if (next === filterMode) return;
    setFilterMode(next);
    if (next === 'format') setIntentFilter('all');
    else setFormatFilter('all');
  };

  const formatCounts = useMemo(() => {
    const initial: Record<FormatFilter, number> = {
      all: toolDefinitions.length,
      pdf: 0,
      docx: 0,
      pptx: 0,
      image: 0,
    };
    for (const tool of toolDefinitions) {
      initial[tool.format] += 1;
    }
    return initial;
  }, []);

  const intentCounts = useMemo(() => {
    const initial: Record<IntentFilter, number> = {
      all: toolDefinitions.length,
      edit: 0,
      convert: 0,
      optimize: 0,
      extract: 0,
      privacy: 0,
    };
    for (const tool of toolDefinitions) {
      for (const intent of tool.intents) {
        initial[intent] += 1;
      }
    }
    return initial;
  }, []);

  const filtered = useMemo(() => {
    return toolDefinitions.filter((tool) => {
      if (filterMode === 'format') {
        if (formatFilter !== 'all' && tool.format !== formatFilter) return false;
      } else if (intentFilter !== 'all' && !toolHasIntent(tool, intentFilter)) {
        return false;
      }
      return matchesQuery(tool, deferredQuery);
    });
  }, [filterMode, formatFilter, intentFilter, deferredQuery]);

  const groupByFormat = filterMode === 'format' && formatFilter === 'all';
  const groupByIntent = filterMode === 'intent' && intentFilter === 'all';

  const formatGroups = useMemo(
    () => (groupByFormat ? groupToolsByFormat(filtered) : []),
    [filtered, groupByFormat]
  );

  const intentGroups = useMemo(
    () => (groupByIntent ? groupToolsByIntent(filtered) : []),
    [filtered, groupByIntent]
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <section className="mb-10" aria-labelledby="core-converters-heading">
        <h2 id="core-converters-heading" className="sr-only">
          Core converters
        </h2>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Start here
        </p>
        <div className={cn(SURFACE, 'p-3 sm:p-4')}>
        <div className="grid gap-3 sm:grid-cols-2">
          {CORE_CONVERTERS.map((converter) => (
              <Link
                key={converter.href}
                href={converter.href}
                className={toolsIndexCoreCardClass(converter.tone)}
                aria-label={`${converter.name} - ${converter.description}`}
              >
                <div className="flex items-start gap-3">
                  <ToolIcon pair={converter.iconPair} tone={converter.tone} label={`${converter.name} icon`} />
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">{converter.name}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-border/70 bg-card/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Converter
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                  {converter.description}
                </p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <HugeiconsIcon icon={Shield01Icon} size={11} strokeWidth={2} className="text-emerald-500/80" />
                    Local-only
                  </span>
                  <span className={toolsIndexLinkClass()}>
                    Open converter <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
        </div>
        </div>
      </section>

      <nav className={cn(STICKY_BAR, 'mb-8')} aria-label="Filter tools">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SegmentedControl
              aria-label="Choose filter category"
              options={FILTER_MODE_OPTIONS.map((o) => ({ value: o.mode, label: o.label }))}
              value={filterMode}
              onChange={switchFilterMode}
            />
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                strokeWidth={2}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools…"
                aria-label="Search tools"
                className="h-9 w-full rounded-lg border border-border/70 bg-card/30 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                </button>
              ) : null}
            </div>
          </div>
          <div
            role="tablist"
            aria-label={filterMode === 'format' ? 'Filter by file type' : 'Filter by job'}
            className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filterMode === 'format'
              ? FORMAT_ORDER.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={formatFilter === key}
                    onClick={() => setFormatFilter(key)}
                    className={filterPillClass(formatFilter === key)}
                  >
                    {FORMAT_LABEL[key]}
                    <span className={countBadgeClass(formatFilter === key)}>{formatCounts[key]}</span>
                  </button>
                ))
              : INTENT_ORDER.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={intentFilter === key}
                    onClick={() => setIntentFilter(key)}
                    className={filterPillClass(intentFilter === key)}
                  >
                    {INTENT_LABEL[key]}
                    <span className={countBadgeClass(intentFilter === key)}>{intentCounts[key]}</span>
                  </button>
                ))}
          </div>
          <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}
          </p>
        </div>
      </nav>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/70 bg-card/40 p-10 text-center">
          <p className="text-sm font-medium text-foreground">No tools match that filter</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different keyword or switch the file type / job filter above.
          </p>
        </div>
      ) : groupByFormat ? (
        <div className="space-y-10">
          {formatGroups.map(({ format, tools }) => (
            <section key={format} aria-labelledby={`tools-group-${format}`}>
              <h3
                id={`tools-group-${format}`}
                className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
              >
                {FORMAT_LABEL[format]} tools
                <span className="ml-1.5 tabular-nums opacity-80">{tools.length}</span>
              </h3>
              <ToolCatalogList tools={tools} showFormatChip={false} showIntentChip />
            </section>
          ))}
        </div>
      ) : groupByIntent ? (
        <div className="space-y-10">
          {intentGroups.map(({ intent, tools }) => (
            <section key={intent} aria-labelledby={`tools-job-group-${intent}`}>
              <h3
                id={`tools-job-group-${intent}`}
                className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
              >
                {INTENT_LABEL[intent]}
                <span className="ml-1.5 tabular-nums opacity-80">{tools.length}</span>
              </h3>
              <ToolCatalogList tools={tools} showFormatChip showIntentChip={false} />
            </section>
          ))}
        </div>
      ) : (
        <ToolCatalogList
          tools={filtered.slice().sort((a, b) => {
            const formatDelta =
              FORMAT_DISPLAY_ORDER.indexOf(a.format) - FORMAT_DISPLAY_ORDER.indexOf(b.format);
            if (formatDelta !== 0) return formatDelta;
            return compareToolsByName(a, b);
          })}
          showFormatChip
          showIntentChip
        />
      )}
    </div>
  );
}
