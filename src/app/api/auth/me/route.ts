import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/infrastructure/database/client';
import { withApiAuthAndError } from '@/lib/apiWrapper';

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile and investor profile.
 * Protected — requires valid Better Auth session.
 */
export const GET = withApiAuthAndError(async (req: NextRequest, { session }) => {
  const [user, investorProfile, preferences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, emailVerified: true, image: true, createdAt: true }
    }),
    prisma.investorProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.userPreferences.findUnique({ where: { userId: session.user.id } })
  ]);

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      user,
      investorProfile: investorProfile || null,
      preferences: preferences || { theme: 'system', currency: 'INR', emailAlerts: true }
    }
  });
});
