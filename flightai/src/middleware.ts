import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user has a session cookie
  const sessionToken = request.cookies.get('_session');

  // Protect /settings routes
  if (request.nextUrl.pathname.startsWith('/settings')) {
    if (!sessionToken) {
      // Redirect to login if unauthenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Note: /dashboard is intentionally left public to allow guest users 
  // to view live flights (freemium model). Only the AI chat features 
  // inside the dashboard require authentication (handled via backend API protection).

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/settings/:path*',
  ],
};
