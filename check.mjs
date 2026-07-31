import { prisma } from './src/database/client';
async function main() {
  const amcCount = await prisma.aMC.count();
  const fundCount = await prisma.mutualFund.count();
  console.log(`AMC count: ${amcCount}`);
  console.log(`MutualFund count: ${fundCount}`);
}
main().finally(() => prisma.$disconnect());
