import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the admin session cookie created during login
  const adminSession = request.cookies.get('admin_session');
  const path = request.nextUrl.pathname;

  // 1. Protected Admin Routes
  // If user tries to access /admin area without a session, send them to login
  if (path.startsWith('/admin')) {
    if (!adminSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Public Login Page (Redirect Feature)
  // If user tries to access /login but HAS a session, redirect to dashboard
  if (path === '/login') {
    if (adminSession) {
      const adminUrl = new URL('/admin', request.url);
      // Use 307 (Temporary Redirect) to preserve method, or 302.
      // Next.js often handles 307 better for internal redirects to avoid caching the redirect itself aggressively.
      // However, for a simple page redirect, standard behavior is fine.
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignores internal Next.js paths, static files, and API routes
  matcher: ['/admin/:path*', '/login'],
};