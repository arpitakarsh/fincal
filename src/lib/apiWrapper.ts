import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { RateLimiter } from '@/lib/rateLimit';

export type ApiHandler<T = any> = (
  req: NextRequest,
  ctx: { params: Promise<any>; session: any }
) => Promise<NextResponse<T>>;

/**
 * Wraps a handler with:
 * 1. Better Auth session validation → 401 if missing
 * 2. Zod validation error catching → 400 with field details
 * 3. General error catching → 500
 * 4. Consistent { success, data, error } response format
 */
export function withApiAuthAndError(handler: ApiHandler) {
  return async (req: NextRequest, { params }: { params?: Promise<any> } = {}) => {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // General API Rate Limit: 200 req / 15 mins (900s)
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const identifier = session.user.id || ip;
      const rateLimit = await RateLimiter.check(`api:${identifier}`, 200, 900);
      
      if (!rateLimit.success) {
        return NextResponse.json(
          { success: false, error: 'Too Many Requests', resetTime: rateLimit.resetTime },
          { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000).toString() } }
        );
      }

      return await handler(req, { params: params || Promise.resolve({}), session });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
            details: error.issues,
          },
          { status: 400 }
        );
      }

      logger.error('API Error', {
        url: req.url,
        message: error.message,
        stack: error.stack
      });

      return NextResponse.json(
        { success: false, error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wraps a handler with error handling only (no auth check).
 * Use for public endpoints like /api/auth/*.
 */
export function withApiError(handler: (req: NextRequest, ctx: { params: Promise<any> }) => Promise<NextResponse>) {
  return async (req: NextRequest, { params }: { params?: Promise<any> } = {}) => {
    try {
      // Auth / Public Route Rate Limit: 10 req / 15 mins (900s) per IP
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const rateLimit = await RateLimiter.check(`public:${ip}`, 10, 900);
      
      if (!rateLimit.success) {
        return NextResponse.json(
          { success: false, error: 'Too Many Requests', resetTime: rateLimit.resetTime },
          { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000).toString() } }
        );
      }

      return await handler(req, { params: params || Promise.resolve({}) });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
            details: error.issues,
          },
          { status: 400 }
        );
      }

      logger.error('API Error', {
        url: req.url,
        message: error.message,
        stack: error.stack
      });

      return NextResponse.json(
        { success: false, error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
