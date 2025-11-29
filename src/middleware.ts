import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');
  const path = request.nextUrl.pathname;

  // 1. Admin Route Protection
  // If accessing /admin and NO session, redirect to login
  if (path.startsWith('/admin')) {
    if (!adminSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Login Page Redirect
  // If accessing /login and session EXISTS, redirect immediately to admin dashboard
  if (path === '/login') {
    if (adminSession) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};