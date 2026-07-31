import { prisma } from '@/backend/infrastructure/database/client';
import { Prisma } from '@prisma/client';

export class GoalRepository {
  async findAllByUserId(userId: string) {
    return prisma.goal.findMany({ 
      where: { userId }, 
      orderBy: { createdAt: 'desc' },
      include: {
        aiRecommendations: {
          orderBy: { score: 'desc' },
          take: 5
        }
      }
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.goal.findFirst({ 
      where: { id, userId },
      include: {
        aiRecommendations: {
          orderBy: { score: 'desc' }
        }
      }
    });
  }

  async createGoal(data: Prisma.GoalCreateInput) {
    return prisma.goal.create({ data });
  }

  async updateGoal(id: string, userId: string, data: Prisma.GoalUpdateInput) {
    // using updateMany to apply where condition with userId for safety, 
    // then returning the updated goal
    await prisma.goal.updateMany({
      where: { id, userId },
      data,
    });
    return this.findByIdAndUserId(id, userId);
  }

  async deleteGoal(id: string, userId: string) {
    return prisma.goal.deleteMany({
      where: { id, userId },
    });
  }
}
