import { AuthService } from '../services/AuthService';
import { NextRequest } from 'next/server';
import { middleware } from '../../../../src/middleware';

describe('Authentication System', () => {
  it('AuthService login should return success on valid stub', async () => {
    const result = await AuthService.login('test@test.com', 'password');
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('test@test.com');
  });

  it('Middleware should redirect protected routes', async () => {
    const req = {
      nextUrl: {
        pathname: '/dashboard',
        clone: () => ({ pathname: '' })
      }
    } as any;

    const res = await middleware(req);
    // NextResponse.redirect returns a redirect response
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login');
  });
});
