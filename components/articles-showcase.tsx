'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { getArticleTagVisuals } from '@/lib/article-tag-visuals';
import { ARTICLE_TAG_ORDER, SITE_ARTICLES, type ArticleTag } from '@/lib/site-articles';

const tagStyles: Record<ArticleTag, string> = {
  Security: 'text-blue-600 bg-blue-50/90 border-blue-100/80',
  Guide: 'text-rose-600 bg-rose-50/90 border-rose-100/80',
  Technical: 'text-amber-700 bg-amber-50/90 border-amber-100/80',
  Performance: 'text-emerald-700 bg-emerald-50/90 border-emerald-100/80',
};

interface ArticlesShowcaseProps {
  /** Larger typography on marketing home */
  variant?: 'home' | 'page';
}

export function ArticlesShowcase({ variant = 'page' }: ArticlesShowcaseProps) {
  const isHome = variant === 'home';
  const HeadingTag = isHome ? 'h2' : 'h1';
  const showTypeFilter = variant === 'page';
  const [activeTag, setActiveTag] = useState<ArticleTag | 'all'>('all');

  const filteredArticles = useMemo(() => {
    if (activeTag === 'all') return SITE_ARTICLES;
    return SITE_ARTICLES.filter((a) => a.tag === activeTag);
  }, [activeTag]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10 sm:mb-12">
        <HeadingTag
          className={`font-bold tracking-tight text-foreground mb-3 ${
            isHome ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-[2.75rem]'
          }`}
        >
          Articles &amp; guides
        </HeadingTag>
        <p
          className={`text-muted-foreground max-w-xl mx-auto leading-relaxed ${
            isHome ? 'text-sm sm:text-base' : 'text-sm'
          }`}
        >
          Learn more about PDF to Word conversion, DOCX to PDF workflows, browser privacy, and performance best practices - free
          guides for teams and individuals.
        </p>
      </div>

      {showTypeFilter ? (
        <div
          className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10"
          role="tablist"
          aria-label="Filter articles by type"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTag === 'all'}
            onClick={() => setActiveTag('all')}
            className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTag === 'all'
                ? 'border-foreground/25 bg-foreground/[0.06] text-foreground'
                : 'border-border/70 bg-white/50 text-muted-foreground hover:text-foreground hover:border-foreground/20'
            }`}
          >
            All
          </button>
          {ARTICLE_TAG_ORDER.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTag === tag
                  ? `${tagStyles[tag]} shadow-sm`
                  : 'border-border/70 bg-white/50 text-muted-foreground hover:text-foreground hover:border-foreground/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {filteredArticles.map((a) => {
          const { Icon, iconBoxClass, iconClass } = getArticleTagVisuals(a.tag);
          return (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="glass rounded-3xl p-6 sm:p-7 flex flex-col gap-4 text-left group hover:shadow-[0_12px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300 border border-white/70"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${iconBoxClass}`}
                >
                  <HugeiconsIcon icon={Icon} size={22} strokeWidth={1.5} className={iconClass} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span
                    className={`inline-flex text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${tagStyles[a.tag]}`}
                  >
                    {a.tag}
                  </span>
                  <h3 className="mt-3 text-base sm:text-lg font-semibold text-foreground leading-snug group-hover:underline underline-offset-2">
                    {a.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-xs text-muted-foreground">{a.readTime}</span>
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={18}
                  strokeWidth={2}
                  className="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          );
        })}
      </div>

      {isHome ? (
        <div className="text-center mt-10">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all articles
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={2.5} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
