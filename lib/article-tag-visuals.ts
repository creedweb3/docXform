import {
  BookOpen01Icon,
  CpuIcon,
  File01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import type { ArticleTag } from '@/lib/site-articles';

/** Hero icon, frame, and CTA link colors - one set per article tag (matches flagship article pages). */
export const ARTICLE_TAG_VISUALS: Record<
  ArticleTag,
  {
    Icon: typeof Shield01Icon;
    iconBoxClass: string;
    iconClass: string;
    ctaLinkClass: string;
  }
> = {
  Security: {
    Icon: Shield01Icon,
    iconBoxClass: 'icon-box-blue',
    iconClass: 'text-blue-500',
    ctaLinkClass: 'text-blue-600 hover:text-blue-700',
  },
  Guide: {
    Icon: File01Icon,
    iconBoxClass: 'icon-box-rose',
    iconClass: 'text-rose-400',
    ctaLinkClass: 'text-rose-600 hover:text-rose-700',
  },
  Technical: {
    Icon: BookOpen01Icon,
    iconBoxClass: 'icon-box-amber',
    iconClass: 'text-amber-500',
    ctaLinkClass: 'text-amber-600 hover:text-amber-700',
  },
  Performance: {
    Icon: CpuIcon,
    iconBoxClass: 'icon-box-mint',
    iconClass: 'text-emerald-500',
    ctaLinkClass: 'text-emerald-600 hover:text-emerald-700',
  },
};

export function getArticleTagVisuals(tag: ArticleTag) {
  return ARTICLE_TAG_VISUALS[tag];
}
