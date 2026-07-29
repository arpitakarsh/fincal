import { calculateRiskAnalytics } from '../engine/risk';
import { generateProbabilityDistribution } from '../engine/probability';
import { calculateSuccessProbability } from '../engine/success';

// Mocked Array of 3Y Rolling Returns (e.g. 100 historical periods)
const mock3YReturns = [
  -5.2, 2.1, 8.4, 9.2, 10.5, 11.2, 12.1, 12.8, 13.5, 14.1, 
  14.8, 15.2, 16.5, 18.2, 22.4, 8.1, 10.1, 11.8, 13.2, 16.9
];

function runTests() {
  console.log('--- Probability Engine Test ---');
  
  const risk = calculateRiskAnalytics(mock3YReturns);
  console.log('Risk Analytics:', risk);
  
  const dist = generateProbabilityDistribution(mock3YReturns);
  console.log('\nProbability Distribution:');
  dist.forEach(d => console.log(`${d.label.padEnd(15)}: ${d.probabilityPercent}%`));

  const successRate = calculateSuccessProbability(mock3YReturns, 200000, 100000, 3);
  console.log(`\nChance of doubling money in 3 years: ${successRate}%`);
}

runTests();
