import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const profileCount = await prisma.investorProfile.count();
  const portfolioCount = await prisma.portfolio.count();
  const amcCount = await prisma.aMC.count();
  const fundCount = await prisma.mutualFund.count();
  const recHistoryCount = await prisma.recommendationHistory.count();
  
  console.log(`InvestorProfile count: ${profileCount}`);
  console.log(`Portfolio count: ${portfolioCount}`);
  console.log(`AMC count: ${amcCount}`);
  console.log(`MutualFund count: ${fundCount}`);
  console.log(`RecommendationHistory count: ${recHistoryCount}`);
}
main().finally(() => prisma.$disconnect());
