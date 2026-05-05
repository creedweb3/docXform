import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { JsonLd } from '@/components/json-ld';
import { WasmEnvBridge } from '@/components/wasm-env-bridge';
import {
  createPageMetadata,
  organizationJsonLd,
  schemaGraph,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  websiteJsonLd,
} from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

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
    icon: '/brand/docxform-logo-icon.png',
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
        <WasmEnvBridge />
        <JsonLd
          id="site-schema"
          data={schemaGraph([organizationJsonLd(), websiteJsonLd()])}
        />
        <Script
          id="adsense-loader"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7154775313079570"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
