import { recommendCategories } from '../engine';
import { FundCategory } from '../types';

function runTests() {
  const currentYear = new Date().getFullYear();

  console.log('--- TEST 1: Aggressive Long Term (Retirement) ---');
  const r1 = recommendCategories({
    age: 30,
    currentCapital: 0,
    monthlyInvestmentCap: 50000,
    existingSip: 0,
    existingLumpsum: 0,
    emergencyFund: 100000,
    goalType: 'retirement',
    targetYear: currentYear + 25,
    riskAppetite: 'high',
    investmentKnowledge: 'advanced',
    liquidityPreference: 'low',
    investmentStyle: 'sip'
  });
  console.log(r1.map(r => `${r.category}: ${r.score} (${r.confidence})`));

  console.log('\n--- TEST 2: Conservative Short Term (House DP) ---');
  const r2 = recommendCategories({
    age: 35,
    currentCapital: 1000000,
    monthlyInvestmentCap: 0,
    existingSip: 0,
    existingLumpsum: 0,
    emergencyFund: 500000,
    goalType: 'house',
    targetYear: currentYear + 1,
    riskAppetite: 'low',
    investmentKnowledge: 'beginner',
    liquidityPreference: 'high',
    investmentStyle: 'lumpsum'
  });
  console.log(r2.map(r => `${r.category}: ${r.score} (${r.confidence})`));
}

runTests();
