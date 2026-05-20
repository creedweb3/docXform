'use client';

import { useDeferredValue, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Doc01Icon,
  Pdf01Icon,
  Search01Icon,
  Shield01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import {
  toolDefinitions,
  toolHasIntent,
  type ToolDefinition,
  type ToolFormat,
  type ToolIntent,
} from '@/lib/tools';
import { ToolIcon } from '@/components/tools/tool-icon';
import { TONE_TEXT_GRADIENT } from '@/components/tools/tone-styles';

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

/** Matches filter pill height (h-8). Collapsed search is a circle: width = height. */
const FILTER_CONTROL_HEIGHT_CLASS = 'h-8';
const SEARCH_COLLAPSED_SIZE = 32;
const SEARCH_EXPANDED_WIDTH = 200;

const searchSpring = { type: 'spring', stiffness: 520, damping: 36, mass: 0.72 } as const;

const pillPanelSpring = { type: 'spring', stiffness: 480, damping: 34, mass: 0.68 } as const;

/** File type slides from the left; Job slides from the right (exit reverses). */
const pillPanelVariants = {
  format: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: pillPanelSpring },
    exit: { opacity: 0, x: -20, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } },
  },
  intent: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: pillPanelSpring },
    exit: { opacity: 0, x: 20, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } },
  },
} as const;

const CORE_CONVERTERS = [
  {
    href: '/word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert DOC, DOCX, and Word files to PDF in your browser.',
    iconPair: { back: Doc01Icon, front: Pdf01Icon },
    tone: 'indigo' as const,
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
  const base = `inline-flex shrink-0 ${FILTER_CONTROL_HEIGHT_CLASS} items-center gap-1.5 rounded-full px-3.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`;
  if (!active) {
    return `${base} border border-slate-200/90 bg-white font-medium text-muted-foreground shadow-sm transition hover:border-slate-300 hover:text-foreground focus-visible:ring-blue-500/30`;
  }
  return `${base} bg-gradient-to-br from-blue-600 to-blue-500 font-semibold text-white shadow-sm focus-visible:ring-blue-500/40`;
}

function countBadgeClass(active: boolean) {
  if (!active) {
    return 'rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground tabular-nums';
  }
  return 'rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] leading-none tabular-nums';
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

export function ToolsIndexClient() {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('format');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const deferredQuery = useDeferredValue(query);

  const searchExpanded = searchFocused || query.trim().length > 0;

  const openSearch = () => {
    setSearchFocused(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const handleSearchBlur = () => {
    if (!query.trim()) setSearchFocused(false);
  };

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

      <section className="mb-8" aria-labelledby="core-converters-heading">
        <h2 id="core-converters-heading" className="sr-only">
          Core converters
        </h2>
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Core converters
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {CORE_CONVERTERS.map((converter) => {
            const gradient = TONE_TEXT_GRADIENT[converter.tone];
            return (
              <Link
                key={converter.href}
                href={converter.href}
                className="group flex flex-col gap-4 rounded-2xl border border-white/60 glass-subtle p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${converter.name} - ${converter.description}`}
              >
                <div className="flex items-start gap-3">
                  <ToolIcon pair={converter.iconPair} tone={converter.tone} label={`${converter.name} icon`} />
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-base font-bold tracking-tight">
                      <span className={`bg-gradient-to-br bg-clip-text text-transparent ${gradient}`}>
                        {converter.name}
                      </span>
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/40 bg-white/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Converter
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                  {converter.description}
                </p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <HugeiconsIcon icon={Shield01Icon} size={11} strokeWidth={2} className="text-emerald-500" />
                    Local-only
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-br bg-clip-text text-transparent ${gradient} group-hover:gap-2 transition-all`}
                  >
                    Open converter <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="utilities-filter-heading">
        <div className="mb-4 text-center">
          <h2
            id="utilities-filter-heading"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            All utilities
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick file type or job, then filter or search
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-2 sm:px-0">
          <div
            className="inline-flex rounded-full border border-slate-200/90 bg-white/80 p-0.5 shadow-sm"
            role="tablist"
            aria-label="Choose filter category"
          >
            {FILTER_MODE_OPTIONS.map((option) => {
              const selected = filterMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => switchFilterMode(option.mode)}
                  className={`relative min-w-[5.5rem] rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 ${
                    selected ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="tools-filter-mode-thumb"
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-sm"
                      transition={reduceMotion ? { duration: 0 } : searchSpring}
                    />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div
            className="flex w-full max-w-4xl justify-center overflow-visible px-2"
            aria-live="polite"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={filterMode}
                role="tablist"
                aria-label={filterMode === 'format' ? 'Filter by file type' : 'Filter by job'}
                variants={pillPanelVariants[filterMode]}
                initial={reduceMotion ? false : 'initial'}
                animate="animate"
                exit="exit"
                className="flex flex-wrap items-center justify-center gap-2 overflow-visible"
              >
                <motion.div
                  className={`relative shrink-0 self-center overflow-hidden rounded-full border bg-white shadow-sm ${FILTER_CONTROL_HEIGHT_CLASS} ${
                    searchExpanded
                      ? 'border-blue-200/90 shadow-[0_1px_3px_rgba(37,99,235,0.12)]'
                      : 'border-slate-200/90'
                  }`}
                  initial={false}
                  animate={{
                    width: searchExpanded ? SEARCH_EXPANDED_WIDTH : SEARCH_COLLAPSED_SIZE,
                  }}
                  transition={reduceMotion ? { duration: 0 } : searchSpring}
                >
                  <div
                    className={`relative flex w-full ${FILTER_CONTROL_HEIGHT_CLASS} items-center ${
                      searchExpanded ? 'gap-0.5 px-0.5' : 'justify-center'
                    }`}
                  >
                    {searchExpanded ? (
                      <span
                        className={`flex ${FILTER_CONTROL_HEIGHT_CLASS} w-7 shrink-0 items-center justify-center text-blue-600`}
                        aria-hidden
                      >
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-50">
                          <HugeiconsIcon icon={Search01Icon} size={13} strokeWidth={2} />
                        </span>
                      </span>
                    ) : (
                      <HugeiconsIcon
                        icon={Search01Icon}
                        size={14}
                        strokeWidth={2}
                        className="pointer-events-none shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    )}

                    <input
                      ref={searchInputRef}
                      type="text"
                      role="searchbox"
                      enterKeyHint="search"
                      autoComplete="off"
                      spellCheck={false}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={handleSearchBlur}
                      placeholder="Search tools…"
                      aria-label="Search tools"
                      tabIndex={searchExpanded ? 0 : -1}
                      className={
                        searchExpanded
                          ? `min-w-0 flex-1 ${FILTER_CONTROL_HEIGHT_CLASS} border-0 bg-transparent px-0 text-sm leading-none text-foreground placeholder:text-muted-foreground/80 focus-visible:outline-none`
                          : 'sr-only'
                      }
                    />

                    {searchExpanded && query ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('');
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        className={`flex ${FILTER_CONTROL_HEIGHT_CLASS} w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100 hover:text-foreground`}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                      </button>
                    ) : null}

                    {!searchExpanded && (
                      <button
                        type="button"
                        onClick={openSearch}
                        aria-label="Open search"
                        className="absolute inset-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2"
                      />
                    )}
                  </div>
                </motion.div>

                {filterMode === 'format'
                  ? FORMAT_ORDER.map((key) => {
                      const active = formatFilter === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setFormatFilter(key)}
                          className={filterPillClass(active)}
                        >
                          {FORMAT_LABEL[key]}
                          <span className={countBadgeClass(active)}>{formatCounts[key]}</span>
                        </button>
                      );
                    })
                  : INTENT_ORDER.map((key) => {
                      const active = intentFilter === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setIntentFilter(key)}
                          className={filterPillClass(active)}
                        >
                          {INTENT_LABEL[key]}
                          <span className={countBadgeClass(active)}>{intentCounts[key]}</span>
                        </button>
                      );
                    })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="glass-subtle rounded-2xl border border-white/60 p-10 text-center">
          <p className="text-sm font-medium text-foreground">No tools match that filter</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different keyword or switch the file type / job filter above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => {
            const fileType = tool.format;
            const gradient = TONE_TEXT_GRADIENT[tool.tone];
            const caps = capabilityChips(tool);
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
                      {FORMAT_LABEL[fileType]}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">
                  {tool.description}
                </p>
                {caps.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {caps.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center rounded-full border border-border/60 bg-white/70 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
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
