'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { getArticleTagVisuals } from '@/lib/article-tag-visuals';
import { ARTICLE_TAG_ORDER, SITE_ARTICLES, type ArticleTag } from '@/lib/site-articles';
import { SectionHeader } from '@/components/site/ui/section-header';
import { Card } from '@/components/site/ui/card';
import { Button } from '@/components/site/ui/button';
import { cn } from '@/lib/utils';

const tagStyles: Record<ArticleTag, string> = {
  Security: 'text-muted-foreground bg-card/50 border-border/70',
  Guide: 'text-muted-foreground bg-card/50 border-border/70',
  Technical: 'text-muted-foreground bg-card/50 border-border/70',
  Performance: 'text-muted-foreground bg-card/50 border-border/70',
};

interface ArticlesShowcaseProps {
  variant?: 'home' | 'page';
}

export function ArticlesShowcase({ variant = 'page' }: ArticlesShowcaseProps) {
  const isHome = variant === 'home';
  const showTypeFilter = variant === 'page';
  const [activeTag, setActiveTag] = useState<ArticleTag | 'all'>('all');

  const filteredArticles = useMemo(() => {
    if (activeTag === 'all') return SITE_ARTICLES;
    return SITE_ARTICLES.filter((a) => a.tag === activeTag);
  }, [activeTag]);

  return (
    <div>
      <SectionHeader
        eyebrow={isHome ? undefined : 'Resources'}
        title={isHome ? 'Articles & guides' : 'Articles & guides'}
        description="Guides on PDF↔Word workflows, DOCX standards, browser privacy, and performance — written for teams and individuals."
        align="center"
        className="mb-10 sm:mb-12"
      />

      {showTypeFilter ? (
        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="tablist"
          aria-label="Filter articles by type"
        >
          <FilterPill active={activeTag === 'all'} onClick={() => setActiveTag('all')}>
            All
          </FilterPill>
          {ARTICLE_TAG_ORDER.map((tag) => (
            <FilterPill
              key={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              className={activeTag === tag ? tagStyles[tag] : undefined}
            >
              {tag}
            </FilterPill>
          ))}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredArticles.map((a) => {
          const { Icon, iconBoxClass, iconClass } = getArticleTagVisuals(a.tag);
          return (
            <Link key={a.slug} href={`/articles/${a.slug}`} className="group block">
              <Card hover padding="lg" className="h-full flex flex-col">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                      iconBoxClass
                    )}
                  >
                    <HugeiconsIcon icon={Icon} size={22} strokeWidth={1.5} className={iconClass} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        tagStyles[a.tag]
                      )}
                    >
                      {a.tag}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-foreground leading-snug group-hover:text-muted-foreground transition-colors">
                      {a.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">
                  {a.description}
                </p>
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{a.readTime}</span>
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={16}
                    strokeWidth={2}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {isHome ? (
        <div className="text-center mt-10">
          <Button href="/articles" variant="outline">
            View all articles
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={2.5} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
        active
          ? className ?? 'border-foreground/25 bg-foreground/10 text-foreground'
          : 'border-border bg-card/40 text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
