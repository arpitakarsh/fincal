import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { InvestorProfileRepository } from '@/backend/repositories/InvestorProfileRepository';
import { GoalRepository } from '@/backend/repositories/GoalRepository';

const profileRepo = new InvestorProfileRepository();
const goalRepo = new GoalRepository();

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      age,
      currentCapital,
      monthlyInvestmentCap,
      existingSip,
      existingLumpsum,
      emergencyFund,
      annualIncome,
      goalType,
      targetAmount,
      targetYear,
      riskAppetite,
      investmentKnowledge,
      liquidityPreference,
      investmentStyle,
      goalName
    } = body;

    // Save profile
    await profileRepo.upsertProfile(userId, {
      age: Number(age),
      currentCapital: Number(currentCapital || 0),
      monthlyInvestmentCap: Number(monthlyInvestmentCap || 0),
      existingSip: Number(existingSip || 0),
      existingLumpsum: Number(existingLumpsum || 0),
      emergencyFund: Number(emergencyFund || 0),
      annualIncome: Number(annualIncome || 0),
      goalType: goalType || 'Wealth Creation',
      targetAmount: Number(targetAmount || 0),
      targetYear: Number(targetYear || 10),
      riskAppetite: riskAppetite || 'MODERATE',
      investmentKnowledge: investmentKnowledge || 'BEGINNER',
      liquidityPreference: liquidityPreference || 'MEDIUM',
      investmentStyle: investmentStyle || 'PASSIVE'
    });

    // Create a Goal if needed
    if (goalName || goalType) {
      await goalRepo.createGoal({
        user: { connect: { id: userId } },
        name: goalName || `${goalType} Goal`,
        investmentType: 'sip',
        timeHorizonYears: Number(targetYear || 10),
        targetAmount: Number(targetAmount || 0),
        goalType: 'wealth_generation',
        riskAppetite: riskAppetite || 'moderate',
        age: Number(age || 30),
        sipAmount: Number(monthlyInvestmentCap || 0)
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
