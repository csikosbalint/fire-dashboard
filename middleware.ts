import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const previewPassword = process.env.PREVIEW_PASSWORD;

  // If no password is set, allow all requests
  if (!previewPassword) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('preview-auth')?.value;

  // Check for Authorization header (for API routes and direct access)
  const authHeader = request.headers.get('Authorization');
  const tokenFromHeader =
    authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Allow if valid auth provided via cookie or header
  if (authCookie === previewPassword || tokenFromHeader === previewPassword) {
    return NextResponse.next();
  }

  // If accessing root or app routes, show auth page
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/api/')) {
    // For API routes, return 401
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Preview password required' },
        { status: 401 }
      );
    }

    // For page routes, redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
