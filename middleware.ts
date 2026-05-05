import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_INTERNAL_PREFIX,
  getAdminEntrySlug,
} from '@/lib/admin-config';

function notFoundResponse() {
  return new NextResponse('Not Found', { status: 404 });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep converter runtime URLs same-origin while offloading heavy binaries to R2.
  if (pathname === '/wasm/soffice.wasm') {
    return NextResponse.rewrite(
      'https://wasm.docxform.com/wasm/soffice.wasm'
    );
  }

  if (pathname === '/wasm/soffice.data') {
    return NextResponse.rewrite(
      'https://wasm.docxform.com/wasm/soffice.data'
    );
  }

  if (pathname.startsWith(ADMIN_INTERNAL_PREFIX)) {
    return notFoundResponse();
  }

  const slug = getAdminEntrySlug();
  if (!slug) {
    return NextResponse.next();
  }

  const publicLoginPath = `/${slug}/login`;
  const publicInboxPath = `/${slug}/inbox`;

  if (pathname === publicLoginPath) {
    return NextResponse.rewrite(
      new URL(`${ADMIN_INTERNAL_PREFIX}/login`, request.url)
    );
  }

  if (pathname === publicInboxPath) {
    return NextResponse.rewrite(
      new URL(`${ADMIN_INTERNAL_PREFIX}/inbox`, request.url)
    );
  }

  if (pathname.startsWith(`/${slug}/`)) {
    return notFoundResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
