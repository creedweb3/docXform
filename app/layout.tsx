import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AdsenseLoader } from '@/components/adsense-loader';
import { ConverterQueueProvider } from '@/components/converter-queue-provider';
import { PostLcpWasmPrime } from '@/components/post-lcp-wasm-prime';
import { WasmCacheServiceWorker } from '@/components/wasm-cache-service-worker';
import { JsonLd } from '@/components/json-ld';
import {
  createPageMetadata,
  organizationJsonLd,
  schemaGraph,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  websiteJsonLd,
} from '@/lib/seo';
import { WasmCdnResourceHints } from '@/components/wasm-cdn-resource-hints';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8fafc',
};

export const metadata: Metadata = {
  ...createPageMetadata({
    title: `${SITE_NAME} | Private Word to PDF and PDF to Word Converter`,
    description: SITE_DESCRIPTION,
    path: '/',
    keywords: [
      'PDF to Word converter',
      'Word to PDF converter',
      'convert PDF to Word',
      'convert Word to PDF',
      'Word to PDF without upload',
      'PDF to Word without upload',
      'private document converter',
      'client-side PDF converter',
      'browser-based document converter',
      'WebAssembly document converter',
    ],
  }),
  alternates: undefined,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: [{ url: '/brand/docxform-logo-icon-64.webp', sizes: '64x64', type: 'image/webp' }],
    apple: [{ url: '/brand/docxform-logo-icon-64.webp', sizes: '64x64', type: 'image/webp' }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
  },
  other: {
    'google-adsense-account': 'ca-pub-7154775313079570',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JsonLd
          id="site-schema"
          data={schemaGraph([organizationJsonLd(), websiteJsonLd()])}
        />
        <AdsenseLoader />
        <WasmCdnResourceHints />
        <WasmCacheServiceWorker />
        <PostLcpWasmPrime />
        <ConverterQueueProvider>{children}</ConverterQueueProvider>
      </body>
    </html>
  );
}
