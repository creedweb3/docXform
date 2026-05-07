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
 */
function withWasmBinaryIsolation(response: NextResponse) {
  withIsolationHeaders(response);
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep converter runtime URLs same-origin while offloading heavy binaries to R2.
  // Versioned paths (`/wasm/bin/<rev>/…`) enable long-lived immutable browser cache per deploy.
  const versionedWasm = /^\/wasm\/bin\/[^/]+\/soffice\.wasm$/;
  const versionedData = /^\/wasm\/bin\/[^/]+\/soffice\.data$/;
  if (versionedWasm.test(pathname)) {
    return withWasmBinaryIsolation(
      NextResponse.rewrite('https://wasm.docxform.com/wasm/soffice.wasm')
    );
  }
  if (versionedData.test(pathname)) {
    return withWasmBinaryIsolation(
      NextResponse.rewrite('https://wasm.docxform.com/wasm/soffice.data')
    );
  }

  if (pathname === '/wasm/soffice.wasm') {
    return withWasmBinaryIsolation(
      NextResponse.rewrite('https://wasm.docxform.com/wasm/soffice.wasm')
    );
  }

  if (pathname === '/wasm/soffice.data') {
    return withWasmBinaryIsolation(
      NextResponse.rewrite('https://wasm.docxform.com/wasm/soffice.data')
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

  if (pathname.startsWith(`/${slug}/`)) {
    return withIsolationHeaders(notFoundResponse());
  }

  return withIsolationHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
