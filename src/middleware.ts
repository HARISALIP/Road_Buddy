import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('rb_auth_token')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  
  // Public routes that don't need auth
  if (
    isLoginPage || 
    request.nextUrl.pathname.startsWith('/api/auth') || 
    request.nextUrl.pathname.startsWith('/api/seed')
  ) {
    if (isLoginPage && token) {
      // If logged in and trying to access login page, redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    // If not logged in and trying to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
