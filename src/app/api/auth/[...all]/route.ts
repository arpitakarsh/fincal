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

/**
 * OPTIONS /api/auth/*
 *
 * Respond to CORS preflight requests. Browsers send OPTIONS before any
 * cross-origin POST/PUT — without a 200/204 response the actual request
 * is blocked before it even reaches the auth handler.
 */
export async function OPTIONS(_req: NextRequest) {
  const appUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': appUrl,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // cache preflight for 24 hours
    },
  });
}

