const GOAL_INFLATION_MAP = {
  house: 9,
  education: 11,
  healthcare: 9,
  wedding: 8,
  travel: 6.5,
  car: 6,
  general: 6,
};

export function getInflationDefault(goalType) {
  return GOAL_INFLATION_MAP[goalType] ?? 6;
}

export function getReturnDefault(years) {
  if (years < 3) return { return: 6.5, fundType: 'Debt' };
  if (years <= 5) return { return: 9.5, fundType: 'Hybrid' };
  return { return: 12, fundType: 'Equity' };
}