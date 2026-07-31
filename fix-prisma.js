const fs = require('fs');
const files = [
  'src/app/api/dashboard/route.ts',
  'src/app/api/recommendations/generate/route.ts',
  'src/app/api/recommendations/route.ts',
  'src/lib/auth.ts',
  'src/market-data/jobs/syncJob.ts',
  'src/market-data/providers/AMFIProvider.ts',
  'src/market-data/services/MarketDataService.ts',
  'src/services/AIOrchestrationService.ts',
  'src/repositories/InvestorProfileRepository.ts',
  'src/repositories/GoalRepository.ts',
  'src/repositories/UserHoldingRepository.ts',
  'src/repositories/AmcRepository.ts',
  'src/repositories/FundRepository.ts',
  'src/repositories/AIInsightRepository.ts',
  'src/repositories/PortfolioRepository.ts',
  'src/repositories/RecommendationRepository.ts',
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("import { prisma } from '@/database/client'")) {
      content = "import { prisma } from '@/database/client';\n" + content;
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  }
}
