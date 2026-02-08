import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import cookie from 'cookie';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/onboarding', '/dashboard'];
  
  // Allow dashboard routes without auth check for now (testing)
  if (publicRoutes.includes(pathname) || pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
