export type ArticleTag = 'Security' | 'Guide' | 'Technical' | 'Performance';

/** Order for filter chips on /articles */
export const ARTICLE_TAG_ORDER: ArticleTag[] = ['Security', 'Guide', 'Technical', 'Performance'];

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
  {
    slug: 'word-to-pdf-without-upload',
    title: 'Convert Word to PDF Without Uploading',
    metaTitle: 'Word to PDF Without Uploading Files | docXform',
    description:
      'What "local" Word-to-PDF means on docXform, how that differs from sites that upload your file, and what internet traffic you should still expect (engine download, normal page assets).',
    tag: 'Guide',
    readTime: '11 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-word-to-pdf-without-upload.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Convert Word to PDF locally',
  },
  {
    slug: 'pdf-to-word-scanned-ocr',
    title: 'PDF to Word for Scanned Documents and OCR',
    metaTitle: 'PDF to Word for Scans: OCR Expectations and Cleanup | docXform',
    description:
      'How scanned (image-only) PDFs differ from text PDFs, what that means for editable Word output, and how to clean up results - whatever converter you use.',
    tag: 'Guide',
    readTime: '12 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-pdf-to-word-ocr.png',
    relatedHref: '/pdf-to-word',
    relatedLabel: 'Convert PDF to Word',
  },
  {
    slug: 'batch-word-to-pdf',
    title: 'Batch Word to PDF Without Exposing Files',
    metaTitle: 'Batch Word to PDF, Private and Local | docXform',
    description:
      'Ways to process multiple DOCX files to PDF in the browser, plus when to zip downloads and watch size limits.',
    tag: 'Performance',
    readTime: '10 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-batch-word-to-pdf.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Batch Word to PDF',
  },
  {
    slug: 'font-embedding-pdf',
    title: 'Font Embedding and Fidelity in DOCX to PDF',
    metaTitle: 'DOCX to PDF: Fonts, Embedding, and Fidelity | docXform',
    description:
      'How fonts, embedding, and fallbacks affect PDF output and what to do before converting DOCX to PDF.',
    tag: 'Technical',
    readTime: '11 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-font-embedding.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Convert DOCX to PDF',
  },
  {
    slug: 'table-heavy-pdf-to-word',
    title: 'Converting Table-Heavy PDFs to Word',
    metaTitle: 'PDF to Word with Complex Tables | docXform',
    description:
      'Tips for preserving tables, grids, and tabular data when turning PDF files into editable DOCX documents.',
    tag: 'Guide',
    readTime: '12 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-table-heavy-pdf.png',
    relatedHref: '/pdf-to-word',
    relatedLabel: 'PDF to Word tables',
  },
  {
    slug: 'docx-to-pdf-legal-briefs',
    title: 'DOCX to PDF for Legal Briefs and Filings',
    metaTitle: 'DOCX to PDF for Legal Briefs: a Practical Checklist | docXform',
    description:
      'Technical checklist for margins, fonts, exhibits, metadata, and bookmarks when exporting legal-style briefs from DOCX to PDF - verify against your court rules.',
    tag: 'Technical',
    readTime: '12 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-legal-briefs.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Court-ready PDFs',
  },
  {
    slug: 'pdf-to-word-privacy-compliance',
    title: 'PDF to Word with Privacy and Compliance in Mind',
    metaTitle: 'Privacy-First PDF to Word Conversion | docXform',
    description:
      'Plain-language notes for teams: what changes when conversion stays in the browser, what it does not fix by itself, and how to double-check behavior against your own rules.',
    tag: 'Security',
    readTime: '11 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-pdf-privacy.png',
    relatedHref: '/pdf-to-word',
    relatedLabel: 'Private PDF to Word',
  },
  {
    slug: 'wasm-converter-troubleshooting',
    title: 'Troubleshooting Browser-Based Converters',
    metaTitle: 'Fix Browser WASM Converter Issues | docXform',
    description:
      'Common failures and fixes for local WASM document converters: cache resets, offline mode, and storage limits.',
    tag: 'Performance',
    readTime: '11 min read',
    datePublished: '2026-05-08T09:00:00+00:00',
    dateModified: '2026-05-08T18:00:00+00:00',
    author: 'docXform',
    image: '/og/article-wasm-troubleshooting.png',
    relatedHref: '/pdf-to-word',
    relatedLabel: 'Try PDF to Word',
  },
  {
    slug: 'first-load-wasm-slow-devices',
    title: 'Why the First Open Can Feel Slow',
    metaTitle: 'Slow First Load: Wi-Fi, Old Devices, and WASM Tips | docXform',
    description:
      'What happens on the first visit, why slow internet or an older laptop can make it feel long, and simple steps that usually help - written in plain language.',
    tag: 'Performance',
    readTime: '8 min read',
    datePublished: '2026-05-08T12:00:00+00:00',
    dateModified: '2026-05-08T12:00:00+00:00',
    author: 'docXform',
    image: '/og/article-wasm-troubleshooting.png',
    relatedHref: '/word-to-pdf',
    relatedLabel: 'Open Word to PDF',
  },
  {
    slug: 'browser-conversion-future',
    title: 'Why In-Browser Conversion Fits the Next Few Years',
    metaTitle: 'The Future of Browser File Conversion | docXform',
    description:
      'Devices and home internet keep getting faster. Here is why that matters for tools that run in the browser instead of sending your files to someone else\'s server.',
    tag: 'Guide',
    readTime: '7 min read',
    datePublished: '2026-05-08T12:00:00+00:00',
    dateModified: '2026-05-08T12:00:00+00:00',
    author: 'docXform',
    image: '/og/article-formatting-guide.png',
    relatedHref: '/pdf-to-word',
    relatedLabel: 'Try PDF to Word',
  },
];

export function getArticleBySlug(slug: string) {
  const article = SITE_ARTICLES.find((item) => item.slug === slug);

  if (!article) {
    throw new Error(`Unknown article slug: ${slug}`);
  }

  return article;
}
