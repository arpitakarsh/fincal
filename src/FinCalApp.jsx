'use client';

import { useState, useMemo } from 'react';
import { calcAll } from '../src/engine/formulas';
import { calcScenarios } from '../src/engine/scenarios';
import { calcSensitivity } from '../src/engine/sensitivity';
import { getHardErrors, getSoftWarnings } from '../src/engine/validators';
import HeadlineSIP from '../src/components/results/HeadlineSIP';
import ScenarioCards from '../src/components/results/ScenarioCards';
import NLGoalInput from '../src/components/ai/NLGoalInput';
import InsightParagraph from '../src/components/ai/InsightParagraph';
import GoalValidator from '../src/components/ai/GoalValidator';
import AreaChart from '../src/components/charts/AreaChart';
import SensitivityHeatTable from '../src/components/charts/SensitivityHeatTable';
// import GoalInputForm from './components/inputs/GoalInputForm';
import HeroSection from '../src/components/layout/HeroSection';

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
  const [showHero, setShowHero] = useState(true);
  

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
    cost: s.cost,
    inflation: s.inflation,
    yrs: s.yrs,
    annualRet: s.annualRet,
    lumpsum: s.lumpsumOn ? s.lumpsum : 0,
  };

  const hardErrors = getHardErrors(inputs);
  const softWarnings = getSoftWarnings({ ...inputs, goalType: s.goalType, riskProfile: s.riskProfile });
  const hasErrors = hardErrors.length > 0;

  const results = useMemo(
    () => hasErrors ? null : calcAll(inputs),
    [s.cost, s.inflation, s.yrs, s.annualRet, s.lumpsum, s.lumpsumOn]
  );

  const scenarios = useMemo(() => {
  if (hasErrors) return [];
  const raw = calcScenarios({
    cost: s.cost, inflation: s.inflation, yrs: s.yrs,
    lumpsum: s.lumpsumOn ? s.lumpsum : 0,
  });
  
  return raw;
}, [s.cost, s.inflation, s.yrs, s.lumpsum, s.lumpsumOn]);

  const sensitivity = useMemo(
    () => hasErrors ? [] : calcSensitivity({ cost: s.cost, yrs: s.yrs }),
    [s.cost, s.yrs]
  );

  if (showHero) {
  return <HeroSection onGetStarted={() => setShowHero(false)} />;
}

  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingBottom: 80 }}>
      

      {/* HIMANSHU — Header component here */}
      {/* <Header /> */}

      {/* HIMANSHU — TaxationBanner component here */}
      {/* <TaxationBanner /> */}

      {/* Arpit — NL Goal Input (top of input panel) */}
      <NLGoalInput
        onApply={({ goalType, cost, yrs }) => {
          if (goalType) onGoalChange(goalType);
          if (cost) set('cost', cost);
          if (yrs) set('yrs', yrs);
        }}
      />

      {/* HIMANSHU — GoalSelector component here */}
      {/* <GoalSelector value={s.goalType} onChange={onGoalChange} /> */}

      {/* HIMANSHU — GoalInputForm component here */}
     {/*
     <GoalInputForm
            cost={s.cost} yrs={s.yrs} inflation={s.inflation}
            onCostChange={v => set('cost', v)}
            onYrsChange={v => set('yrs', v)}
            onInflationChange={v => { set('inflation', v); set('inflationSrc', 'custom'); }}
            locks={s.locks} onLockToggle={setLock}
            hardErrors={hardErrors} softWarnings={softWarnings}
          /> 
     
     */}  

      {/* HIMANSHU — RiskProfileSelector component here */}
      {/* <RiskProfileSelector
            profile={s.riskProfile}
            onChange={onProfileChange}
            locked={s.locks.annualRet}
          /> */}

      {/* HIMANSHU — SliderInput for annualRet here */}
      {/* <SliderInput
            label="Expected Return" value={s.annualRet}
            min={1} max={20} step={0.5} unit="%"
            onChange={onRetSlider}
            locked={s.locks.annualRet}
            onLockToggle={() => setLock('annualRet')}
          /> */}

      {/* HIMANSHU — QuickPresets component here */}
      {/* <QuickPresets value={s.cost} onChange={v => set('cost', v)} /> */}

      {/* HIMANSHU — StepUpToggle component here */}
      {/* <StepUpToggle
            enabled={s.stepUpOn} pct={s.stepUpPct}
            onToggle={() => set('stepUpOn', !s.stepUpOn)}
            onPctChange={v => set('stepUpPct', v)}
          /> */}

      {/* HIMANSHU — LumpsumToggle component here */}
      {/* <LumpsumToggle
            enabled={s.lumpsumOn} amount={s.lumpsum}
            onToggle={() => set('lumpsumOn', !s.lumpsumOn)}
            onAmountChange={v => set('lumpsum', v)}
          /> */}

      {/* Arpit — Headline SIP result */}
      <HeadlineSIP
        results={results}
        fv={results?.fv}
        yrs={s.yrs}
        inflation={s.inflation}
      />

      {/* Arpit — 3 Scenario Cards */}
      <ScenarioCards scenarios={scenarios} activeProfile={s.riskProfile} />

      {/* Arpit — Corpus Growth Area Chart */}
      <AreaChart
        scenarios={scenarios}
        yrs={s.yrs}
        activeProfile={s.riskProfile}
      />

      {/* Arpit — Sensitivity Heat Table */}
      <SensitivityHeatTable
        data={sensitivity}
        userInflation={s.inflation}
        userReturn={s.annualRet}
      />

      {/* Arpit — AI Insight Paragraph */}
      <InsightParagraph
        results={results}
        goalType={s.goalType}
        yrs={s.yrs}
        inflation={s.inflation}
        annualRet={s.annualRet}
      />

      {/* Arpit — AI Goal Validator Flags */}
      <GoalValidator
        results={results}
        goalType={s.goalType}
        cost={s.cost}
        inflation={s.inflation}
        annualRet={s.annualRet}
        yrs={s.yrs}
      />

      {/* HIMANSHU — CostOfDelayCard component here */}
      {/* <CostOfDelayCard cost={s.cost} inflation={s.inflation} annualRet={s.annualRet} yrs={s.yrs} /> */}

      {/* HIMANSHU — GoalRealityIndicator component here */}
      {/* <GoalRealityIndicator results={results} goalType={s.goalType} /> */}

      {/* HIMANSHU — EducationTips component here */}
      {/* <EducationTips goalType={s.goalType} /> */}

      {/* HIMANSHU — DonutChart component here */}
      {/* <DonutChart invested={results?.invested} returns={results?.returns} corpus={results?.corpus} /> */}

      {/* HIMANSHU — StackedBarChart component here */}
      {/* <StackedBarChart yearByYearData={yearByYear} /> */}

      {/* HIMANSHU — StickyDisclaimer — always last, always visible */}
      {/* <StickyDisclaimer /> */}

    </div>
  );
}