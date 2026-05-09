import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_ROUTES } from '@/lib/seo';
import { SITE_ARTICLES } from '@/lib/site-articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const buildTimestamp = new Date();

  return PUBLIC_ROUTES.map((route) => {
    const article =
      route.path.startsWith('/articles/')
        ? SITE_ARTICLES.find((item) => `/articles/${item.slug}` === route.path)
        : undefined;
    const maybeLastModified = (route as { lastModified?: string | Date }).lastModified;
    const lastModified =
      maybeLastModified instanceof Date
        ? maybeLastModified
        : typeof maybeLastModified === 'string'
        ? new Date(maybeLastModified)
        : article
        ? new Date(article.dateModified)
        : buildTimestamp;

    return {
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    };
  });
}
