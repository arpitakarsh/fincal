import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Aggregates metrics across all active goals for the hero Portfolio component.
   */
  static async getPortfolioSummary(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'ACTIVE' }
    });

    const totalInvested = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalMonthlySip = goals.reduce((sum, g) => sum + g.monthlySip, 0);

    // Upsert the Portfolio cache table
    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      update: { totalInvested, totalMonthlySip },
      create: { userId, totalInvested, totalMonthlySip }
    });

    return portfolio;
  }
}
