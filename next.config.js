/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/wasm/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // `credentialless` still enables cross-origin isolation (SharedArrayBuffer / WASM) with
          // COOP same-origin, but avoids the strictest `require-corp` embedding rules. Some
          // Chromium builds fail to composite `backdrop-filter` on the main document with
          // If WASM or workers misbehave with third-party scripts, try `require-corp` again.
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
