import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_INTERNAL_PREFIX,
  getAdminEntrySlug,
} from '@/lib/admin-config';

function notFoundResponse() {
  return new NextResponse('Not Found', { status: 404 });
}

function withIsolationHeaders(response: NextResponse) {
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return response;
}

/**
 * WASM binaries are fetched/embedded under COEP `require-corp`. Without
 * `Cross-Origin-Resource-Policy: cross-origin`, some browsers block the proxied
 * R2 body even when the URL is same-origin (edge rewrite). Worker JS already
 * gets CORP via static config; match that for .wasm / .data rewrites.
 *
 * Cache-Control is set here hoping the edge forwards it, but Next.js rewrite
 * responses often keep the **origin** Cache-Control (R2) and do not let
 * middleware replace it (see vercel/next.js#70515). You should still set a
 * long TTL on `wasm.docxform.com` (Transform Rule or R2 HTTP headers) so
 * browsers actually cache `soffice.{wasm,data}`.
 */
const CACHE_VERSIONED_WASM = 'public, max-age=31536000, immutable';
/** Align with next.config `/wasm/:path*` for non-revision URLs. */
const CACHE_LEGACY_WASM =
  'public, max-age=600, stale-while-revalidate=86400';

function withWasmBinaryIsolation(response: NextResponse) {
  withIsolationHeaders(response);
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  return response;
}

function wasmBinaryRewrite(rewriteTarget: string, cacheControl: string): NextResponse {
  const res = NextResponse.rewrite(rewriteTarget);
  withWasmBinaryIsolation(res);
  res.headers.set('Cache-Control', cacheControl);
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep converter runtime URLs same-origin while offloading heavy binaries to R2.
  // Versioned paths (`/wasm/bin/<rev>/…`) enable long-lived immutable browser cache per deploy.
  const versionedWasm = /^\/wasm\/bin\/[^/]+\/soffice\.wasm$/;
  const versionedData = /^\/wasm\/bin\/[^/]+\/soffice\.data$/;
  if (versionedWasm.test(pathname)) {
    return wasmBinaryRewrite(
      'https://wasm.docxform.com/wasm/soffice.wasm',
      CACHE_VERSIONED_WASM
    );
  }
  if (versionedData.test(pathname)) {
    return wasmBinaryRewrite(
      'https://wasm.docxform.com/wasm/soffice.data',
      CACHE_VERSIONED_WASM
    );
  }

  if (pathname === '/wasm/soffice.wasm') {
    return wasmBinaryRewrite(
      'https://wasm.docxform.com/wasm/soffice.wasm',
      CACHE_LEGACY_WASM
    );
  }

  if (pathname === '/wasm/soffice.data') {
    return wasmBinaryRewrite(
      'https://wasm.docxform.com/wasm/soffice.data',
      CACHE_LEGACY_WASM
    );
  }

  if (pathname.startsWith(ADMIN_INTERNAL_PREFIX)) {
    return withIsolationHeaders(notFoundResponse());
  }

  const slug = getAdminEntrySlug();
  if (!slug) {
    return withIsolationHeaders(NextResponse.next());
  }

  const publicLoginPath = `/${slug}/login`;
  const publicInboxPath = `/${slug}/inbox`;
  const publicConverterMetricsPath = `/${slug}/converter-metrics`;

  if (pathname === publicLoginPath) {
    return withIsolationHeaders(
      NextResponse.rewrite(new URL(`${ADMIN_INTERNAL_PREFIX}/login`, request.url))
    );
  }

  if (pathname === publicInboxPath) {
    return withIsolationHeaders(
      NextResponse.rewrite(new URL(`${ADMIN_INTERNAL_PREFIX}/inbox`, request.url))
    );
  }

  if (pathname === publicConverterMetricsPath) {
    return withIsolationHeaders(
      NextResponse.rewrite(new URL(`${ADMIN_INTERNAL_PREFIX}/converter-metrics`, request.url))
    );
  }

  if (pathname.startsWith(`/${slug}/`)) {
    return withIsolationHeaders(notFoundResponse());
  }

  return withIsolationHeaders(NextResponse.next());
}

export const config = {
  // Exclude pdf.js worker: applying COEP `require-corp` to the worker script response
  // breaks same-origin module workers and leaves PDF preview stuck on "Loading…".
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|ads\\.txt|wasm-cache-sw.js|pdf\\.worker\\.min\\.mjs).*)',
  ],
};
