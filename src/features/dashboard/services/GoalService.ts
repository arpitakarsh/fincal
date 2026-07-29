import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class GoalService {
  /**
   * Calculates a simple health score based on time remaining vs completion %.
   * In a real implementation, this would deeply integrate with the ProbabilityEngine.
   */
  static calculateHealthScore(currentAmount: number, targetAmount: number, targetDate: Date): string {
    const percentage = (currentAmount / targetAmount) * 100;
    const yearsRemaining = (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
    
    if (percentage >= 80) return 'EXCELLENT';
    if (percentage >= 40 && yearsRemaining > 5) return 'GOOD';
    if (percentage < 20 && yearsRemaining < 3) return 'CRITICAL';
    return 'NEEDS_ATTENTION';
  }

  static async createGoal(userId: string, data: any) {
    const health = this.calculateHealthScore(data.currentAmount || 0, data.targetAmount, new Date(data.targetDate));
    
    return await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: new Date(data.targetDate),
        priority: data.priority,
        healthScore: health,
        monthlySip: data.monthlySip || 0,
      }
    });
  }

  static async getGoalsForUser(userId: string) {
    return await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
