import { rankCategoryFunds } from '../engine';
import { MutualFundData } from '../services/interfaces/IFundProvider';

const mockFunds: MutualFundData[] = [
  {
    isin: 'INF200K01171', name: 'Alpha High Growth Flexi Cap', category: 'Flexi Cap', amcName: 'Alpha AMC',
    expenseRatio: 1.2, aumCr: 12000, launchDate: new Date('2015-01-01'), benchmark: 'Nifty 500',
    metrics: { cagr3Y: 18.5, sharpeRatio: 1.2, downsideCapture: 85 }
  },
  {
    isin: 'INF200K01172', name: 'Beta Value Flexi Cap', category: 'Flexi Cap', amcName: 'Beta AMC',
    expenseRatio: 0.6, aumCr: 25000, launchDate: new Date('2010-01-01'), benchmark: 'Nifty 500',
    metrics: { cagr3Y: 16.5, sharpeRatio: 1.6, downsideCapture: 65 }
  },
  {
    isin: 'INF200K01173', name: 'Gamma Tiny Flexi Cap', category: 'Flexi Cap', amcName: 'Gamma AMC',
    expenseRatio: 0.5, aumCr: 100, launchDate: new Date('2022-01-01'), benchmark: 'Nifty 500',
    metrics: { cagr3Y: 22.0, sharpeRatio: 2.1, downsideCapture: 90 } // Will be filtered out due to AUM/Age
  }
];

function runTests() {
  console.log('--- Mutual Fund Ranking Engine Test ---');
  const ranked = rankCategoryFunds(mockFunds);
  
  console.log(`Ranked ${ranked.length} eligible funds out of ${mockFunds.length} total.\n`);
  
  ranked.forEach(r => {
    console.log(`#${r.rank} - ${r.name}`);
    console.log(`Score: ${r.qualityScore.total}`);
    console.log(`Why: ${r.explanation.reason}`);
    console.log(`Strength: ${r.explanation.primaryStrength}`);
    console.log(`Weakness: ${r.explanation.primaryWeakness}`);
    console.log('---');
  });
}

runTests();
