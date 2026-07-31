import { prisma } from '@/backend/infrastructure/database/client';



export class AIInsightRepository {
  async saveInsight(userId: string, topic: string, data: any) {
    return prisma.aIInsightHistory.create({
      data: {
        userId,
        topic,
        insight: data,
      }
    });
  }

  async getInsightsByUserId(userId: string) {
    return prisma.aIInsightHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
