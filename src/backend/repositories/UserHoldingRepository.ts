import { prisma } from '@/backend/infrastructure/database/client';
import { Prisma } from '@prisma/client';



export class UserHoldingRepository {
  async findByPortfolioId(portfolioId: string) {
    return prisma.userHolding.findMany({
      where: { portfolioId }
    });
  }

  async findById(id: string) {
    return prisma.userHolding.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.UserHoldingCreateInput) {
    return prisma.userHolding.create({
      data
    });
  }

  async update(id: string, data: Prisma.UserHoldingUpdateInput) {
    return prisma.userHolding.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.userHolding.delete({
      where: { id }
    });
  }
}
