import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'docXform',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f8fafc',
    theme_color: '#f8fafc',
    icons: [
      {
        src: '/brand/docxform-logo-icon-64.webp',
      sizes: '64x64',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/brand/docxform-logo-icon-64.webp',
      sizes: '64x64',
        type: 'image/webp',
        purpose: 'maskable',
      },
    ],
  };
}
