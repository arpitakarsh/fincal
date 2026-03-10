//temprory function to remove alter once himanshu builds this




'use client';

import { useState, useMemo } from 'react';
import { calcAll } from '../engine/formulas';
import { calcScenarios } from '../engine/scenarios';
import { calcSensitivity } from '../engine/sensitivity';
import { getHardErrors, getSoftWarnings } from '../engine/validators';

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

// remove these once its build

function getInflationDefault(goalType) {
  const map = { house:9, education:11, healthcare:9, wedding:8, travel:6.5, car:6, general:6 };
  return map[goalType] ?? 6;
}

function getReturnDefault(yrs) {
  if (yrs < 3)  return { ret: 6.5, fund: 'Debt' };
  if (yrs <= 5) return { ret: 9.5, fund: 'Hybrid' };
  return { ret: 12, fund: 'Equity' };
}

export default function FinCalApp() {
  const [s, setS] = useState(DEFAULTS);

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));
  const setLock = (key) => setS(prev => ({
    ...prev,
    locks: { ...prev.locks, [key]: !prev.locks[key] },
  }));

  const onGoalChange = (goalType) => setS(prev => ({
    ...prev,
    goalType,
    inflation: prev.inflationSrc === 'default' ? getInflationDefault(goalType) : prev.inflation,
    annualRet: prev.riskProfile !== 'custom' ? getReturnDefault(prev.yrs).ret : prev.annualRet,
  }));

  const onProfileChange = (profile) => {
    if (s.locks.annualRet) return;
    const retMap = { safe: 8, balanced: 10, growth: 12 };
    setS(prev => ({ ...prev, riskProfile: profile, annualRet: retMap[profile] }));
  };

  const onRetSlider = (val) => setS(prev => ({
    ...prev, annualRet: val, riskProfile: 'custom',
  }));

  const inputs = {
    cost: s.cost, inflation: s.inflation,
    yrs: s.yrs, annualRet: s.annualRet,
    lumpsum: s.lumpsumOn ? s.lumpsum : 0,
  };

  const hardErrors = getHardErrors(inputs);
  const softWarnings = getSoftWarnings({ ...inputs, goalType: s.goalType, riskProfile: s.riskProfile });
  const hasErrors = hardErrors.length > 0;

  const results = useMemo(() => hasErrors ? null : calcAll(inputs), [
    s.cost, s.inflation, s.yrs, s.annualRet, s.lumpsum, s.lumpsumOn,
  ]);

  const scenarios = useMemo(() => hasErrors ? [] : calcScenarios({
    cost: s.cost, inflation: s.inflation, yrs: s.yrs,
    lumpsum: s.lumpsumOn ? s.lumpsum : 0,
  }), [s.cost, s.inflation, s.yrs, s.lumpsum, s.lumpsumOn]);

  const sensitivity = useMemo(() => hasErrors ? [] : calcSensitivity({
    cost: s.cost, yrs: s.yrs,
  }), [s.cost, s.yrs]);

  return (
    <div>
      {/* We both will add compenents here , so chnage it for your use */}

    </div>
  );
}