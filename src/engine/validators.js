const COST_BOUNDS = {
  house:      { min: 1000000, max: 100000000 },
  education:  { min: 100000, max: 10000000 },
  healthcare: { min: 50000, max: 10000000 },
  wedding:    { min: 100000, max: 10000000 },
  travel:     { min: 50000, max: 5000000 },
  car:        { min: 100000, max: 10000000},
  general:    { min: 10000, max: 100000000},
};

export function getHardErrors({ cost, yrs, inflation, annualRet }) {
  const errs = [];
  if (!cost || cost <= 0)        errs.push({ field: 'cost',      msg: 'Enter a valid goal amount' });
  if (!yrs || yrs <= 0)          errs.push({ field: 'yrs',       msg: 'Enter a valid time horizon' });
  if (inflation == null || inflation < 0) errs.push({ field: 'inflation', msg: 'Enter a valid inflation rate' });
  if (!annualRet || annualRet <= 0)       errs.push({ field: 'annualRet', msg: 'Enter a valid return rate' });
  return errs;
}

export function getSoftWarnings({ cost, yrs, annualRet, goalType, riskProfile }) {
  const warns = [];
  const bounds = COST_BOUNDS[goalType];

  if (bounds) {
    if (cost < bounds.min) warns.push({ field: 'cost', msg: `Cost seems low for a ${goalType} goal` });
    if (cost > bounds.max) warns.push({ field: 'cost', msg: `Cost seems high for a ${goalType} goal` });
  }

  if (yrs < 1)  warns.push({ field: 'yrs', msg: 'Timeline is very short' });
  if (yrs > 40) warns.push({ field: 'yrs', msg: 'Timeline is unusually long' });

  if (riskProfile === 'growth' && yrs < 3)  warns.push({ field: 'annualRet', msg: 'Growth profile is risky for short timelines' });
  if (riskProfile === 'safe'   && yrs > 10) warns.push({ field: 'annualRet', msg: 'Safe profile may underperform for long timelines' });

  return warns;
}