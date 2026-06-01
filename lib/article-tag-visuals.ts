import {
  BookOpen01Icon,
  CpuIcon,
  File01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import type { ArticleTag } from '@/lib/site-articles';

const LINK =
  'text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground';

/** Hero icon and frame — muted for dark marketing shell. */
const ARTICLE_TAG_VISUALS: Record<
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
    iconClass: 'text-muted-foreground',
    ctaLinkClass: LINK,
  },
  Guide: {
    Icon: File01Icon,
    iconBoxClass: 'icon-box-rose',
    iconClass: 'text-muted-foreground',
    ctaLinkClass: LINK,
  },
  Technical: {
    Icon: BookOpen01Icon,
    iconBoxClass: 'icon-box-amber',
    iconClass: 'text-muted-foreground',
    ctaLinkClass: LINK,
  },
  Performance: {
    Icon: CpuIcon,
    iconBoxClass: 'icon-box-mint',
    iconClass: 'text-muted-foreground',
    ctaLinkClass: LINK,
  },
};

export function getArticleTagVisuals(tag: ArticleTag) {
  return ARTICLE_TAG_VISUALS[tag];
}
