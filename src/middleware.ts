import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is accessing an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Look for the admin session cookie
    const adminSession = request.cookies.get('admin_session');

    // If no session exists, redirect to the login page
    if (!adminSession) {
      const loginUrl = new URL('/login', request.url);
      // Optional: specific redirect back logic could go here
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};