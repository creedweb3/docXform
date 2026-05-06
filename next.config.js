/** @type {import('next').NextConfig} */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://*.doubleclick.net https://static.cloudflareinsights.com https://cloudflareinsights.com https://wasm.docxform.com",
  "frame-src https://*.doubleclick.net https://googleads.g.doubleclick.net https://td.doubleclick.net https://fundingchoicesmessages.google.com",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig = {
  devIndicators: false,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@hugeicons/react'],
    /** Inlines global CSS to cut render-blocking `<link rel="stylesheet">` (App Router). */
    inlineCss: true,
  },
  async rewrites() {
    return [
      {
        source: '/wasm/soffice.js',
        destination: 'https://wasm.docxform.com/wasm/soffice.js',
      },
      {
        source: '/wasm/browser.worker.global.js',
        destination: 'https://wasm.docxform.com/wasm/browser.worker.global.js',
      },
      {
        source: '/wasm/soffice.wasm',
        destination: 'https://wasm.docxform.com/wasm/soffice.wasm',
      },
      {
        source: '/wasm/soffice.data',
        destination: 'https://wasm.docxform.com/wasm/soffice.data',
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    return [
      {
        source: '/wasm/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Avoid sticky browser-cached 404s during deploy/routing changes.
            value: 'public, max-age=600, stale-while-revalidate=86400',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/og/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
