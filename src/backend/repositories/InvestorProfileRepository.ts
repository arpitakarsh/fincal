import { prisma } from '@/backend/infrastructure/database/client';
import { Prisma } from '@prisma/client';



export class InvestorProfileRepository {
  async getByUserId(userId: string) {
    return prisma.investorProfile.findUnique({
      where: { userId }
    });
  }

  async upsertProfile(userId: string, data: Omit<Prisma.InvestorProfileCreateInput, 'user'>) {
    return prisma.investorProfile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        user: { connect: { id: userId } }
      }
    });
  }
}
