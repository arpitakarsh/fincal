import { auth, checkAuthRateLimit } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Auth endpoints that should be rate-limited (sign-in, sign-up)
const RATE_LIMITED_PATHS = ['/api/auth/sign-in', '/api/auth/sign-up'];

async function rateLimitedHandler(req: NextRequest) {
  const pathname = new URL(req.url).pathname;
  const isRateLimited = RATE_LIMITED_PATHS.some(p => pathname.startsWith(p));

  if (isRateLimited && req.method === 'POST') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const allowed = await checkAuthRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too Many Requests',
          message: 'Too many authentication attempts. Please wait 15 minutes and try again.'
        },
        {
          status: 429,
          headers: { 'Retry-After': '900' }
        }
      );
    }
  }

  return handler.POST(req);
}

export async function POST(req: NextRequest) {
  return rateLimitedHandler(req);
}

export async function GET(req: NextRequest) {
  return handler.GET(req);
}
