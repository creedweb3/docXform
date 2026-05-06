export type ArticleTag = 'Security' | 'Guide' | 'Technical' | 'Performance';

export interface SiteArticle {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  tag: ArticleTag;
  readTime: string;
  datePublished: string;
  dateModified: string;
  author: string;
  image: string;
  relatedHref: string;
  relatedLabel: string;
}

/** Shared article metadata for SEO-rich listings (home and /articles). */
export const SITE_ARTICLES: SiteArticle[] = [
  {
    slug: 'modern-word-security',
    title: 'Modern Word Security with WASM',
    metaTitle: 'Modern Word Security: How WASM Protects Documents | docXform',
    description:
      'How WebAssembly enables truly private PDF to DOCX and Word conversion without uploading documents to the cloud.',
    tag: 'Security',
    readTime: '5 min read',
    datePublished: '2026-05-01T09:00:00+00:00',
    dateModified: '2026-05-03T09:00:00+00:00',
    author: 'docXform',
    image: '/og/article-modern-word-security.png',
    relatedHref: '/pdf-to-word',
    relatedLabel: 'Try private PDF to Word',
  },
  {
    slug: 'formatting-guide',
    title: 'The Complete DOCX Formatting Guide',
    metaTitle: 'Complete DOCX Formatting Guide for Clean PDF Conversion | docXform',
    description:
      'Prepare fonts, styles, images, and layout for cleaner conversion between Word documents and PDFs.',
    tag: 'Guide',
    readTime: '7 min read',
    datePublished: '2026-05-01T09:00:00+00:00',
    dateModified: '2026-05-03T09:00:00+00:00',
    author: 'docXform',
    image: '/og/article-formatting-guide.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Convert Word to PDF',
  },
  {
    slug: 'docx-standards',
    title: 'Understanding DOCX Standards',
    metaTitle: 'Understanding DOCX Standards and Office Open XML | docXform',
    description:
      'Office Open XML explained: structure, compatibility, and why it matters for reliable Word and PDF workflows.',
    tag: 'Technical',
    readTime: '6 min read',
    datePublished: '2026-05-01T09:00:00+00:00',
    dateModified: '2026-05-03T09:00:00+00:00',
    author: 'docXform',
    image: '/og/article-docx-standards.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Convert DOCX to PDF',
  },
  {
    slug: 'pdf-optimization',
    title: 'PDF Optimization Techniques',
    metaTitle: 'PDF Optimization: Smaller Files, Better Performance | docXform',
    description:
      'Reduce PDF file size, speed up rendering, and keep visual quality for email, web, and archive-friendly documents.',
    tag: 'Performance',
    readTime: '5 min read',
    datePublished: '2026-05-01T09:00:00+00:00',
    dateModified: '2026-05-03T09:00:00+00:00',
    author: 'docXform',
    image: '/og/article-pdf-optimization.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Create a browser PDF',
  },
];

export function getArticleBySlug(slug: string) {
  const article = SITE_ARTICLES.find((item) => item.slug === slug);

  if (!article) {
    throw new Error(`Unknown article slug: ${slug}`);
  }

  return article;
}
