import { calculateSIP } from './formulas';
import { calculateStepUpSIP } from './stepUp';
import { calculateLumpsum } from './lumpsum';

export function generateYearByYear({
  presentCost,
  inflation,
  annualReturn,
  years,
  stepUpEnabled,
  stepUpPercent,
  lumpsumAmount,
}) {
  const baseSIP = calculateSIP({ presentCost, inflation, annualReturn, years });
  const monthlyRate = parseFloat((annualReturn / 100 / 12).toFixed(10));

  const { lumpsumFV: lumpsumFutureValue } = calculateLumpsum({
    lumpsumAmount: lumpsumAmount || 0,
    annualReturn,
    years,
  });

  const stepUpData = stepUpEnabled
    ? calculateStepUpSIP({ baseSIP, stepUpPercent, years }).yearlyAmounts
    : null;

  const result = [];
  let corpusValue = lumpsumAmount || 0;
  let totalInvested = lumpsumAmount || 0;

  for (let year = 1; year <= years; year++) {
    const sipThisYear = stepUpEnabled
      ? stepUpData[year - 1].sipAmount
      : parseFloat(baseSIP.toFixed(2));

    for (let month = 1; month <= 12; month++) {
      corpusValue = parseFloat(
        ((corpusValue + sipThisYear) * (1 + monthlyRate)).toFixed(10)
      );
    }

    totalInvested += sipThisYear * 12;

    const returns = parseFloat((corpusValue - totalInvested).toFixed(2));

    result.push({
      year,
      sipAmount: parseFloat(sipThisYear.toFixed(2)),
      invested: parseFloat(totalInvested.toFixed(2)),
      corpusValue: parseFloat(corpusValue.toFixed(2)),
      returns,
    });
  }

  return result;
}