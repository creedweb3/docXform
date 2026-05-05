import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_INTERNAL_PREFIX,
  getAdminEntrySlug,
} from '@/lib/admin-config';

function notFoundResponse() {
  return new NextResponse('Not Found', { status: 404 });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
