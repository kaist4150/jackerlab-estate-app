import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'jackerlab.com',
  'vercel.app',
  'localhost',
  '127.0.0.1',
];

function isAllowedOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return ALLOWED_ORIGINS.some(
      domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return ALLOWED_ORIGINS.some(domain => value.includes(domain));
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow internal service-to-service calls
  const internalKey = request.headers.get('x-internal-key');
  if (internalKey && internalKey === process.env.INTERNAL_API_KEY) {
    return NextResponse.next();
  }

  // Check Origin or Referer for browser requests
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';

  if ((origin && isAllowedOrigin(origin)) || (referer && isAllowedOrigin(referer))) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

export const config = {
  matcher: '/api/:path*',
};
