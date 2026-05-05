import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_ROUTES } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date('2026-05-03T09:00:00+00:00'),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
