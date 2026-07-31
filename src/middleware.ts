import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/dashboard',
  '/api/portfolio',
  '/api/goals',
  '/api/recommendations',
  '/api/profile',
  '/api/onboarding',
  '/api/ai',
];

const PROTECTED_PAGE_ROUTES = [
  '/dashboard',
  '/portfolio',
  '/goals',
  '/funds',
  '/assistant',
  '/settings',
  '/calculator',
];

// Routes that should redirect logged-in users away (login, register)
const AUTH_PAGE_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth sets this cookie — check for it
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  const isApiRoute = pathname.startsWith('/api/');
  const isAuthApiRoute = pathname.startsWith('/api/auth/');

  // Never block Better Auth's own endpoints
  if (isAuthApiRoute) {
    return NextResponse.next();
  }

  // Protected API routes — return 401 JSON if no session cookie
  if (isApiRoute) {
    const isProtectedApi = PROTECTED_API_ROUTES.some(route =>
      pathname.startsWith(route)
    );
    if (isProtectedApi && !sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Page routes: redirect unauthenticated users to /login
  const isProtectedPage = PROTECTED_PAGE_ROUTES.some(route =>
    pathname.startsWith(route)
  );
  if (isProtectedPage && !sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from /login and /register
  const isAuthPage = AUTH_PAGE_ROUTES.some(route => pathname === route);
  if (isAuthPage && sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
