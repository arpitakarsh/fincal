import { useState, useMemo } from 'react';
import { calcAll } from '@/engine/formulas';
import { calcScenarios } from '@/engine/scenarios';
import { calcSensitivity } from '@/engine/sensitivity';
import { generateYearByYear } from '@/engine/yearByYear';
import { getHardErrors, getSoftWarnings } from '@/engine/validators';

const DEFAULTS = {
  goalType: 'house',
  cost: 5000000,
  yrs: 10,
  inflation: 9,
  inflationSrc: 'default',
  riskProfile: 'balanced',
  annualRet: 10,
  stepUpOn: false,
  stepUpPct: 10,
  lumpsumOn: false,
  lumpsum: 0,
  activeSheet: false,
  activeAccordion: null,
  locks: { inflation: false, annualRet: false },
};

function getInflationDefault(goalType: string) {
  const map: Record<string, number> = { house:9, education:11, healthcare:9, wedding:8, travel:6.5, car:6, general:6 };
  return map[goalType] ?? 6;
}

function getReturnDefault(yrs: number) {
  if (yrs < 3) return { ret: 6.5, fund: 'Debt' };
  if (yrs <= 5) return { ret: 9.5, fund: 'Hybrid' };
  return { ret: 12, fund: 'Equity' };
}

export function useCalculator() {
  const [s, setS] = useState(DEFAULTS);
  
  const set = (key: string, val: any) => setS(prev => ({ ...prev, [key]: val }));
  
  const setLock = (key: string) => setS(prev => ({
    ...prev,
    locks: { ...prev.locks, [key as keyof typeof prev.locks]: !prev.locks[key as keyof typeof prev.locks] },
  }));

  const onGoalChange = (goalType: string) => setS(prev => ({
    ...prev,
    goalType,
    inflation: prev.inflationSrc === 'default' ? getInflationDefault(goalType) : prev.inflation,
    annualRet: prev.riskProfile !== 'custom' ? getReturnDefault(prev.yrs).ret : prev.annualRet,
  }));

  const onProfileChange = (profile: string) => {
    if (s.locks.annualRet) return;
    const retMap: Record<string, number> = { safe: 8, balanced: 10, growth: 12 };
    setS(prev => ({ ...prev, riskProfile: profile, annualRet: retMap[profile] ?? prev.annualRet }));
  };

  const onScenarioSelect = (scenarioId: string) => {
    setS(prev => {
      if (prev.locks.annualRet) return { ...prev, riskProfile: scenarioId };
      const retMap: Record<string, number> = { conservative: 8, moderate: 10, aggressive: 12 };
      return { ...prev, riskProfile: scenarioId, annualRet: retMap[scenarioId] ?? prev.annualRet };
    });
  };

  const onRetSlider = (val: number) => setS(prev => ({
    ...prev, annualRet: val, riskProfile: 'custom',
  }));

  const inputs = {
    cost: s.cost,
    inflation: s.inflation,
    yrs: s.yrs,
    annualRet: s.annualRet,
    lumpsum: s.lumpsumOn ? s.lumpsum : 0,
  };

  const hardErrors = getHardErrors(inputs);
  const softWarnings = getSoftWarnings({ ...inputs, goalType: s.goalType as any, riskProfile: s.riskProfile });
  const hasErrors = hardErrors.length > 0;

  const results = useMemo(
    () => hasErrors ? null : calcAll(inputs),
    [s.cost, s.inflation, s.yrs, s.annualRet, s.lumpsum, s.lumpsumOn, hasErrors]
  );

  const scenarios = useMemo(() => {
    if (hasErrors) return [];
    return calcScenarios({
      cost: s.cost, inflation: s.inflation, yrs: s.yrs,
      lumpsum: s.lumpsumOn ? s.lumpsum : 0,
    });
  }, [s.cost, s.inflation, s.yrs, s.lumpsum, s.lumpsumOn, hasErrors]);

  const sensitivity = useMemo(
    () => hasErrors ? [] : calcSensitivity({ cost: s.cost, yrs: s.yrs }),
    [s.cost, s.yrs, hasErrors]
  );

  const yearByYear = useMemo(() => {
    if (hasErrors) return [];
    return generateYearByYear({
      presentCost: s.cost,
      inflation: s.inflation,
      annualReturn: s.annualRet,
      years: s.yrs,
      stepUpEnabled: s.stepUpOn,
      stepUpPercent: s.stepUpPct,
      lumpsumAmount: s.lumpsumOn ? s.lumpsum : 0,
    });
  }, [s.cost, s.inflation, s.annualRet, s.yrs, s.stepUpOn, s.stepUpPct, s.lumpsum, s.lumpsumOn, hasErrors]);

  return {
    s,
    setS,
    set,
    setLock,
    onGoalChange,
    onProfileChange,
    onScenarioSelect,
    onRetSlider,
    hardErrors,
    softWarnings,
    hasErrors,
    results,
    scenarios,
    sensitivity,
    yearByYear,
  };
}
