import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/features/auth/lib/auth';

const protectedRoutes = ['/dashboard', '/portfolio', '/profile'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route)) || pathname.startsWith('/api/private');

  if (isProtected) {
    // In a real implementation with Better Auth:
    // const session = await auth.api.getSession({ headers: request.headers });
    const session = null; // Simulated unauthorized

    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
