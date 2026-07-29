import { NextRequest, NextResponse } from 'next/server';

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // const token = req.headers.get('Authorization');
    // if (!token) return new NextResponse('Unauthorized', { status: 401 });
    // const user = verifyToken(token);
    // (req as any).user = user;
    return handler(req);
  };
}
