export interface CalculationInputs {
  cost: number;
  inflation: number;
  yrs: number;
  annualRet: number;
  lumpsum?: number;
}

export interface CalculationResults {
  fv: number;
  sip: number;
  invested: number;
  returns: number;
}

export interface ScenarioResult {
  id: string;
  label: string;
  ret: number;
  sip: number;
  fv: number;
}

export interface SensitivityPoint {
  inflation: number;
  return: number;
  sip: number;
  fv: number;
}

export interface YearByYearData {
  year: number;
  sipAmount: number;
  investedSoFar: number;
  returnsGenerated: number;
  totalValue: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
