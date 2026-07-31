import { NextResponse } from 'next/server';
import { prisma } from '@/backend/infrastructure/database/client';
import { withApiAuthAndError } from '@/lib/apiWrapper';
import { z } from 'zod';

const profileSchema = z.object({
  age: z.number().int().min(18, 'Age must be at least 18').max(120).optional(),
  currentCapital: z.number().min(0, 'Current capital cannot be negative').optional(),
  monthlyInvestmentCap: z.number().min(0).optional(),
  annualIncome: z.number().min(0, 'Income cannot be negative').optional(),
  riskAppetite: z.enum(['Low', 'Moderate', 'High', 'Very High']).optional(),
});

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  currency: z.enum(['INR', 'USD']).optional(),
  emailAlerts: z.boolean().optional(),
});

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

/**
 * GET /api/profile
 * Returns full user settings including investor profile and preferences.
 */
export const GET = withApiAuthAndError(async (req, { session }) => {
  const [profile, preferences, user] = await Promise.all([
    prisma.investorProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.userPreferences.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true }
    })
  ]);

  return NextResponse.json({
    success: true,
    data: {
      user,
      profile,
      preferences: preferences || { theme: 'system', currency: 'INR', emailAlerts: true }
    }
  });
});

/**
 * PUT /api/profile
 * Updates user settings by type: 'profile' | 'preferences' | 'user'
 */
export const PUT = withApiAuthAndError(async (req, { session }) => {
  const body = await req.json();
  const { type, data } = body;

  if (!type || !data) {
    return NextResponse.json(
      { success: false, error: 'Request must include { type, data }' },
      { status: 400 }
    );
  }

  if (type === 'profile') {
    const validated = profileSchema.parse(data);

    // upsert: update if exists, create with defaults if not
    const profile = await prisma.investorProfile.upsert({
      where: { userId: session.user.id },
      update: validated as any,
      create: {
        userId: session.user.id,
        age: validated.age ?? 30,
        currentCapital: validated.currentCapital ?? 0,
        monthlyInvestmentCap: validated.monthlyInvestmentCap ?? 0,
        existingSip: 0,
        existingLumpsum: 0,
        emergencyFund: 0,
        annualIncome: validated.annualIncome ?? 0,
        goalType: 'Wealth Creation',
        targetYear: 10,
        riskAppetite: validated.riskAppetite ?? 'Moderate',
        investmentKnowledge: 'BEGINNER',
        liquidityPreference: 'MEDIUM',
        investmentStyle: 'PASSIVE',
      },
    });
    return NextResponse.json({ success: true, data: profile });
  }

  if (type === 'preferences') {
    const validated = preferencesSchema.parse(data);
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: validated as any,
      create: { userId: session.user.id, ...(validated as any) },
    });
    return NextResponse.json({ success: true, data: preferences });
  }

  if (type === 'user') {
    const validated = userSchema.parse(data);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: validated as any,
      select: { id: true, name: true, email: true, image: true }
    });
    return NextResponse.json({ success: true, data: user });
  }

  return NextResponse.json(
    { success: false, error: `Unknown type "${type}". Must be 'profile', 'preferences', or 'user'.` },
    { status: 400 }
  );
});

/**
 * DELETE /api/profile
 * Deletes the user account and all associated data.
 */
export const DELETE = withApiAuthAndError(async (req, { session }) => {
  // Prisma cascading deletes should handle related records if configured,
  // otherwise we should manually delete them. For safety, we delete the user.
  await prisma.user.delete({
    where: { id: session.user.id }
  });
  
  return NextResponse.json({ success: true, message: 'Account deleted successfully' });
});
