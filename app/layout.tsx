import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_SRC } from '@/lib/adsense';
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

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#100e0c',
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
    'google-adsense-account': ADSENSE_CLIENT_ID,
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
    <html lang="en" className="dark">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} ${sans.className} font-sans antialiased`}
      >
        <JsonLd
          id="site-schema"
          data={schemaGraph([organizationJsonLd(), websiteJsonLd()])}
        />
        <Script
          id="google-adsense"
          async
          src={ADSENSE_SCRIPT_SRC}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <WasmCdnResourceHints />
        <WasmCacheServiceWorker />
        <PostLcpWasmPrime />
        <ConverterQueueProvider>{children}</ConverterQueueProvider>
      </body>
    </html>
  );
}
