import { NextRequest, NextResponse } from 'next/server';

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Implement redis rate limiting here
    return handler(req);
  };
}
