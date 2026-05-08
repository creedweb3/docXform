import type { Metadata } from 'next';
import type { SiteArticle } from '@/lib/site-articles';
import type { SiteFaq } from '@/lib/site-faqs';

export const SITE_NAME = 'docXform';
export const SITE_URL = 'https://www.docxform.com';
export const SITE_DESCRIPTION =
  'Convert Word to PDF and PDF to Word in your browser. docXform keeps document processing on your device with no file uploads.';

export const OG_IMAGES = {
  default: '/og/docxform-default.png',
  wordToPdf: '/og/word-to-pdf.png',
  pdfToWord: '/og/pdf-to-word.png',
  articles: '/og/articles.png',
  faq: '/og/faq.png',
  about: '/og/about.png',
  contact: '/og/contact.png',
  legal: '/og/legal.png',
} as const;

const SAME_AS_LINKS =
  typeof process.env.NEXT_PUBLIC_SITE_SAMEAS === 'string'
    ? process.env.NEXT_PUBLIC_SITE_SAMEAS.split(',').map((link) => link.trim()).filter(Boolean)
    : [];

export const PUBLIC_ROUTES = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/word-to-pdf', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/pdf-to-word', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/articles', priority: 0.75, changeFrequency: 'weekly' },
  { path: '/articles/modern-word-security', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/articles/formatting-guide', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/articles/docx-standards', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/articles/pdf-optimization', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/articles/word-to-pdf-without-upload', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/pdf-to-word-scanned-ocr', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/batch-word-to-pdf', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/font-embedding-pdf', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/table-heavy-pdf-to-word', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/docx-to-pdf-legal-briefs', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/pdf-to-word-privacy-compliance', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/articles/wasm-converter-troubleshooting', priority: 0.68, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.55, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.45, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.25, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
] as const;

type OpenGraphType = 'website' | 'article';

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  openGraphType?: OpenGraphType;
  robots?: Metadata['robots'];
}

interface ToolSchemaOptions {
  name: string;
  description: string;
  path: string;
  featureList: string[];
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface WebPageSchemaOptions {
  name: string;
  description: string;
  path: string;
  type?: string;
}

export function absoluteUrl(path = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === '/' ? SITE_URL : `${SITE_URL}${normalizedPath}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image = OG_IMAGES.default,
  imageAlt,
  keywords,
  openGraphType = 'website',
  robots,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const resolvedImageAlt = imageAlt ?? `${SITE_NAME} - ${title.replace(/\s+\|\s+docXform$/i, '')}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: openGraphType,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: resolvedImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: resolvedImageAlt,
        },
      ],
    },
    robots,
  };
}

export function schemaGraph(items: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': items,
  };
}

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/brand/docxform-logo-icon.png'),
    description: SITE_DESCRIPTION,
    ...(SAME_AS_LINKS.length ? { sameAs: SAME_AS_LINKS } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
    inLanguage: 'en',
  };
}

export function webApplicationJsonLd() {
  return {
    '@type': 'WebApplication',
    '@id': `${SITE_URL}#webapp`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any modern browser',
    browserRequirements: 'Requires a modern browser with WebAssembly support.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Word to PDF conversion',
      'PDF to Word conversion',
      'Browser-based document processing',
      'No file upload required for conversion',
    ],
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
  };
}

export function softwareApplicationJsonLd({
  name,
  description,
  path,
  featureList,
}: ToolSchemaOptions) {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${absoluteUrl(path)}#software`,
    name,
    url: absoluteUrl(path),
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any modern browser',
    browserRequirements: 'Requires a modern browser with WebAssembly support.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList,
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
  type = 'WebPage',
}: WebPageSchemaOptions) {
  return {
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    name,
    url: absoluteUrl(path),
    description,
    isPartOf: {
      '@id': `${SITE_URL}#website`,
    },
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
    inLanguage: 'en',
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(items[items.length - 1]?.path ?? '/')}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(faqs: SiteFaq[], path = '/faq') {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleJsonLd(article: SiteArticle) {
  const path = `/articles/${article.slug}`;

  return {
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(path)}#article`,
    mainEntityOfPage: absoluteUrl(path),
    headline: article.title,
    description: article.description,
    image: absoluteUrl(article.image),
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: absoluteUrl('/about'),
    },
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
    inLanguage: 'en',
  };
}

export function articlesCollectionJsonLd(articles: SiteArticle[]) {
  return {
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl('/articles')}#collection`,
    name: 'docXform Articles and Guides',
    url: absoluteUrl('/articles'),
    description:
      'Guides about private document conversion, PDF to Word workflows, Word to PDF workflows, DOCX standards, and browser security.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: absoluteUrl(`/articles/${article.slug}`),
      })),
    },
    isPartOf: {
      '@id': `${SITE_URL}#website`,
    },
  };
}
