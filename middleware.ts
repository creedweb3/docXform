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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep converter runtime URLs same-origin while offloading heavy binaries to R2.
  if (pathname === '/wasm/soffice.wasm') {
    return withIsolationHeaders(
      NextResponse.rewrite('https://wasm.docxform.com/wasm/soffice.wasm')
    );
  }

  if (pathname === '/wasm/soffice.data') {
    return withIsolationHeaders(
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
