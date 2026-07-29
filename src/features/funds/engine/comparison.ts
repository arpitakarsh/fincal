import { RankedFund } from './index';

export interface ComparisonDiff {
  metric: string;
  fundAValue: number;
  fundBValue: number;
  winner: 'A' | 'B' | 'TIE';
}

export function compareTwoFunds(fundA: RankedFund, fundB: RankedFund): ComparisonDiff[] {
  const diffs: ComparisonDiff[] = [];

  const compare = (metricName: string, valA: number = 0, valB: number = 0, higherIsBetter = true) => {
    let winner: 'A' | 'B' | 'TIE' = 'TIE';
    if (valA !== valB) {
      if (higherIsBetter) {
        winner = valA > valB ? 'A' : 'B';
      } else {
        winner = valA < valB ? 'A' : 'B';
      }
    }
    diffs.push({ metric: metricName, fundAValue: valA, fundBValue: valB, winner });
  };

  compare('Sharpe Ratio', fundA.metrics.sharpeRatio, fundB.metrics.sharpeRatio, true);
  compare('3Y CAGR (%)', fundA.metrics.cagr3Y, fundB.metrics.cagr3Y, true);
  compare('Expense Ratio (%)', fundA.expenseRatio, fundB.expenseRatio, false);
  compare('Downside Capture (%)', fundA.metrics.downsideCapture, fundB.metrics.downsideCapture, false);
  compare('AUM (Cr)', fundA.aumCr, fundB.aumCr, true); // Higher AUM implies stability for debt/large cap, though debatable for small caps.

  return diffs;
}
