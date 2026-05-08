import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  IconArchive01,
  IconArrowRight02,
  IconBookOpen01,
  IconCpu,
  IconFile01,
  IconScanDoc,
  IconShield01,
  IconSparkles,
  IconTable,
  type SiteIconProps,
} from '@/components/icons';
import { SITE_ARTICLES, type ArticleTag } from '@/lib/site-articles';

const icons: Partial<Record<string, ComponentType<SiteIconProps>>> = {
  'modern-word-security': IconShield01,
  'formatting-guide': IconFile01,
  'docx-standards': IconBookOpen01,
  'pdf-optimization': IconCpu,
  'word-to-pdf-without-upload': IconShield01,
  'pdf-to-word-scanned-ocr': IconScanDoc,
  'batch-word-to-pdf': IconArchive01,
  'font-embedding-pdf': IconSparkles,
  'table-heavy-pdf-to-word': IconTable,
  'docx-to-pdf-legal-briefs': IconFile01,
  'pdf-to-word-privacy-compliance': IconShield01,
  'wasm-converter-troubleshooting': IconCpu,
};

const iconWrap: Record<string, string> = {
  'modern-word-security': 'icon-box-blue',
  'formatting-guide': 'icon-box-rose',
  'docx-standards': 'icon-box-amber',
  'pdf-optimization': 'icon-box-mint',
  'word-to-pdf-without-upload': 'icon-box-blue',
  'pdf-to-word-scanned-ocr': 'icon-box-rose',
  'batch-word-to-pdf': 'icon-box-mint',
  'font-embedding-pdf': 'icon-box-amber',
  'table-heavy-pdf-to-word': 'icon-box-blue',
  'docx-to-pdf-legal-briefs': 'icon-box-amber',
  'pdf-to-word-privacy-compliance': 'icon-box-blue',
  'wasm-converter-troubleshooting': 'icon-box-mint',
};

const iconColor: Record<string, string> = {
  'modern-word-security': 'text-blue-500',
  'formatting-guide': 'text-rose-400',
  'docx-standards': 'text-amber-500',
  'pdf-optimization': 'text-emerald-500',
  'word-to-pdf-without-upload': 'text-blue-500',
  'pdf-to-word-scanned-ocr': 'text-rose-400',
  'batch-word-to-pdf': 'text-emerald-500',
  'font-embedding-pdf': 'text-amber-500',
  'table-heavy-pdf-to-word': 'text-blue-500',
  'docx-to-pdf-legal-briefs': 'text-amber-500',
  'pdf-to-word-privacy-compliance': 'text-blue-500',
  'wasm-converter-troubleshooting': 'text-emerald-500',
};

const tagStyles: Record<ArticleTag, string> = {
  Security: 'text-blue-600 bg-blue-50/90 border-blue-100/80',
  Guide: 'text-rose-600 bg-rose-50/90 border-rose-100/80',
  Technical: 'text-sky-700 bg-sky-50/90 border-sky-100/80',
  Performance: 'text-pink-600 bg-pink-50/90 border-pink-100/80',
};

interface ArticlesShowcaseProps {
  /** Larger typography on marketing home */
  variant?: 'home' | 'page';
}

export function ArticlesShowcase({ variant = 'page' }: ArticlesShowcaseProps) {
  const isHome = variant === 'home';
  const HeadingTag = isHome ? 'h2' : 'h1';

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

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {SITE_ARTICLES.map((a) => {
          const Icon = icons[a.slug];
          return (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="glass rounded-3xl p-6 sm:p-7 flex flex-col gap-4 text-left group hover:shadow-[0_12px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300 border border-white/70"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${iconWrap[a.slug] ?? 'icon-box-blue'}`}
                >
                  {Icon ? (
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className={iconColor[a.slug] ?? 'text-blue-500'}
                    />
                  ) : null}
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
                <IconArrowRight02
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
            <IconArrowRight02 size={16} strokeWidth={2.5} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
