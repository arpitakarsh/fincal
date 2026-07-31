import { prisma } from '@/backend/infrastructure/database/client';
import { Prisma } from '@prisma/client';



export class PortfolioRepository {
  async findByUserId(userId: string) {
    return prisma.portfolio.findUnique({
      where: { userId },
      include: { 
        snapshots: { orderBy: { date: 'desc' } },
        holdings: true
      }
    });
  }

  async upsertPortfolio(userId: string, data: Prisma.PortfolioCreateWithoutUserInput) {
    return prisma.portfolio.upsert({
      where: { userId },
      create: { ...data, user: { connect: { id: userId } } },
      update: data,
    });
  }

  async deletePortfolio(userId: string) {
    return prisma.portfolio.delete({
      where: { userId },
    });
  }
}
