'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../src/lib/constants';
import { calcAll } from '../src/engine/formulas';
import { calcScenarios } from '../src/engine/scenarios';
import { calcSensitivity } from '../src/engine/sensitivity';
import { generateYearByYear } from '../src/engine/yearByYear';
import { getHardErrors, getSoftWarnings } from '../src/engine/validators';
import HeadlineSIP from '../src/components/results/HeadlineSIP';
import ScenarioCards from '../src/components/results/ScenarioCards';
import NLGoalInput from '../src/components/ai/NLGoalInput';
import InsightParagraph from '../src/components/ai/InsightParagraph';
import GoalValidator from '../src/components/ai/GoalValidator';
import AreaChart from '../src/components/charts/AreaChart';
import SensitivityHeatTable from '../src/components/charts/SensitivityHeatTable';
import DonutChart from '../src/components/charts/DonutChart';
import GlidePath from '../src/components/charts/GlidePath';
import StackedBarChart from '../src/components/charts/StackedBarChart';
import StepUpBarChart from '../src/components/charts/StepUpBarChart';
import TimelineVisual from '../src/components/charts/TimelineVisual';
import HeroSection from '../src/components/layout/HeroSection';
import EducationTips from '../src/components/layout/EducationTips';

// Newly Built Components
import CostOfDelayCard from '../src/components/results/CostOfDelayCard';
import GoalRealityIndicator from '../src/components/results/GoalRealityIndicator';
import TaxationBanner from '../src/components/layout/TaxationBanner';
import BottomSheet from '../src/components/layout/BottomSheet';

import AnalyticsSection from '../src/components/results/AnalyticsSection';
import ReverseCalculator from '../src/components/results/ReverseCalculator';
import GoalComparison from '../src/components/results/GoalComparison';
import ExportPdfButton from '../src/components/shared/ExportPdfButton';

import Header from '../src/components/layout/Header';
import StickyDisclaimer from '../src/components/layout/StickyDisclaimer';
import GoalSelector from '../src/components/inputs/GoalSelector';
import GoalInputForm from '../src/components/inputs/GoalInputForm';
import RiskProfileSelector from '../src/components/inputs/RiskProfileSelector';
import SliderInput from '../src/components/inputs/SliderInput';
import QuickPresets from '../src/components/inputs/QuickPresets';
import StepUpToggle from '../src/components/inputs/StepUpToggle';
import LumpsumToggle from '../src/components/inputs/LumpsumToggle';

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
  const [activeTab, setActiveTab] = useState('calculator');
  const [s, setS] = useState(DEFAULTS);
  const [showHero, setShowHero] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

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

  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingBottom: 80 }}>
      
      <AnimatePresence>
        {showHero ? (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="absolute inset-0 z-50 bg-[#f8f9fb]">
            <HeroSection onGetStarted={() => setShowHero(false)} />
          </motion.div>
        ) : (
          <motion.div key="app" className="bg-gray-50 min-h-screen font-sans w-full relative z-10" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}>
            
            {/* ===== HEADER + TABS (always visible) ===== */}
            <div className="w-full pb-4 pt-4 relative z-10">
              <div className="max-w-[1120px] mx-auto w-full px-6">
                <Header />
                <TaxationBanner />

                {/* Top Level Navigation Tabs */}
                <div className="flex justify-center mt-6 mb-4 relative z-20">
                  <div className="bg-white border border-[#e2e6ed] p-1.5 rounded-xl flex gap-2 shadow-sm font-semibold text-[13px] md:text-[14px] overflow-x-auto max-w-full">
                    <button 
                      onClick={() => setActiveTab('calculator')}
                      className={`px-4 md:px-6 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === 'calculator' ? 'bg-[#224c87] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-slate-50'}`}
                    >
                      Goal Calculator
                    </button>
                    <button 
                      onClick={() => setActiveTab('reverse')}
                      className={`px-4 md:px-6 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === 'reverse' ? 'bg-[#224c87] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-slate-50'}`}
                    >
                      Reverse Calculator
                    </button>
                    <button 
                      onClick={() => setActiveTab('compare')}
                      className={`px-4 md:px-6 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === 'compare' ? 'bg-[#224c87] text-white shadow-md' : 'text-gray-500 hover:text-[#1a1a2e] hover:bg-slate-50'}`}
                    >
                      Compare Goals
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== TAB 1: GOAL CALCULATOR ===== */}
            {activeTab === 'calculator' && (
              <>
                {/* SECTION 1: Inputs */}
                <div className="w-full pb-12 relative z-10">
                  <div className="max-w-[1120px] mx-auto w-full px-6">
                    <div className="relative pl-0 md:pl-8 mt-4">
                      <div className="hidden md:block absolute left-[15px] top-[40px] bottom-[150px] w-[2px] bg-[#e2e6ed] z-0"></div>

                      {/* HERO AI INPUT */}
                      <div className="mb-10 flex flex-col items-start gap-1 relative z-10">
                        <h2 className="text-[20px] font-bold text-[#1a1a2e] font-montserrat tracking-tight">Describe your goal in plain English</h2>
                        <p className="text-[13px] text-[#919090] mb-3 font-medium">Our AI will set up the calculator for you</p>
                        <div className="w-full relative">
                          <NLGoalInput onApply={(p) => setS(prev => ({ ...prev, ...p, inflationSrc: 'custom' }))} />
                        </div>
                      </div>

                      {/* STEP 1: Goal */}
                      <div className="mb-6 flex flex-col items-start gap-2 relative z-10">
                        <span className="bg-[#eef2ff] text-[#224c87] text-[11px] font-bold px-2.5 py-1 rounded-md tracking-widest uppercase mb-1">Step 1</span>
                        <h2 className="text-[20px] font-bold text-[#1a1a2e] font-montserrat tracking-tight">Your Financial Goal</h2>
                        <p className="text-[13px] text-[#919090] mt-1 font-medium">What are you saving for and how much do you need?</p>
                      </div>

                      <div 
                        className="rounded-[24px] p-6 lg:p-8 mb-8 bg-white" 
                        style={{ border: '1px solid #e2e6ed', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)', opacity: isFocusMode ? 0.3 : 1, transition: 'opacity 0.3s ease', pointerEvents: isFocusMode ? 'none' : 'auto' }}
                      >
                        <div className="mb-4">
                          <GoalSelector selectedGoal={s.goalType} onGoalChange={onGoalChange} />
                        </div>
                        <GoalInputForm
                          presentCost={s.cost} years={s.yrs} inflation={s.inflation}
                          onPresentCostChange={v => set('cost', v)}
                          onYearsChange={v => set('yrs', v)}
                          onInflationChange={v => { set('inflation', v); set('inflationSrc', 'custom'); }}
                          assumptionLocks={s.locks} onLockToggle={setLock}
                          hardErrors={hardErrors} softWarnings={softWarnings}
                        /> 
                      </div>

                      {/* STEP 2: Assumptions */}
                      <div className="mt-12 mb-6 flex flex-col items-start gap-2 relative z-10">
                        <span className="bg-[#eef2ff] text-[#224c87] text-[11px] font-bold px-2.5 py-1 rounded-md tracking-widest uppercase mb-1">Step 2</span>
                        <h2 className="text-[20px] font-bold text-[#1a1a2e] font-montserrat tracking-tight">Return Assumptions</h2>
                        <p className="text-[13px] text-[#919090] mt-1 font-medium">How do you expect your investments to grow?</p>
                      </div>

                      <div 
                        className="rounded-[24px] p-6 lg:p-8 mb-8 bg-white"
                        style={{ border: '1px solid #e2e6ed', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)', position: 'relative', zIndex: isFocusMode ? 10 : 1 }}
                      >
                        <div className="mb-4">
                          <RiskProfileSelector profile={s.riskProfile} onChange={onProfileChange} locked={s.locks.annualRet} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <SliderInput
                            label="Expected Growth" value={s.annualRet}
                            min={1} max={20} step={0.5} unit="%"
                            onChange={onRetSlider}
                            locked={s.locks.annualRet}
                            onLockToggle={() => setLock('annualRet')}
                            onDragStart={() => setIsFocusMode(true)}
                            onDragEnd={() => setIsFocusMode(false)}
                          />
                          {s.annualRet > 12 && (
                            <div className="mt-1 flex items-start gap-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
                              <span>💡</span>
                              <span>Historical markets often average 10-12%. High returns come with higher risk.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ opacity: isFocusMode ? 0.3 : 1, transition: 'opacity 0.3s ease' }}>
                        <QuickPresets value={s.cost} onChange={v => set('cost', v)} />
                        <StepUpToggle enabled={s.stepUpOn} pct={s.stepUpPct} onToggle={() => set('stepUpOn', !s.stepUpOn)} onPctChange={v => set('stepUpPct', v)} />
                        <LumpsumToggle enabled={s.lumpsumOn} amount={s.lumpsum} onToggle={() => set('lumpsumOn', !s.lumpsumOn)} onAmountChange={v => set('lumpsum', v)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center mb-10 mt-2 max-w-[1120px] mx-auto px-6">
                  <div className="h-px bg-[#e2e6ed] flex-1"></div>
                  <span className="px-6 text-[11px] font-bold text-slate-400 tracking-widest uppercase">Your Investment Plan</span>
                  <div className="h-px bg-[#e2e6ed] flex-1"></div>
                </div>

                {/* SECTION 2: Results */}
                <div 
                  style={{ opacity: isFocusMode ? 0.2 : 1, transition: 'opacity 0.4s ease', pointerEvents: isFocusMode ? 'none' : 'auto' }}
                  className="w-full relative"
                >
                  {isFocusMode && (
                    <div className="absolute inset-0 flex items-start pt-32 justify-center z-50 pointer-events-none">
                      <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="px-6 py-3 rounded-full text-white font-semibold text-lg"
                        style={{ backgroundColor: '#224c87', boxShadow: '0 4px 12px rgba(34,76,135,0.3)' }}
                      >
                        Recalculating...
                      </motion.div>
                    </div>
                  )}

                  <div className="w-full pb-8">
                    <div className="max-w-[1120px] mx-auto w-full px-6">

                      <div className="w-full flex justify-end mb-4 pr-1">
                        <ExportPdfButton isFloating={false} />
                      </div>

                      <HeadlineSIP results={results} fv={results?.fv} yrs={s.yrs} inflation={s.inflation} annualRet={s.annualRet} />

                      <div className="mt-8 mb-6">
                        <InsightParagraph results={results} goalType={s.goalType} yrs={s.yrs} inflation={s.inflation} annualRet={s.annualRet} />
                      </div>

                      <div className="mb-8">
                        <GoalValidator results={results} goalType={s.goalType} cost={s.cost} inflation={s.inflation} annualRet={s.annualRet} yrs={s.yrs} />
                      </div>

                      <div className="mb-8">
                        <ScenarioCards scenarios={scenarios} activeProfile={s.riskProfile} />
                      </div>

                      <div className="mb-8 rounded-[16px] border border-[#e2e6ed] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <p className="font-montserrat font-semibold text-[14px] text-[#1a1a2e] mb-3">
                          Sensitivity Analysis — SIP vs Inflation &amp; Return
                        </p>
                        <div className="overflow-auto w-full">
                          <SensitivityHeatTable data={sensitivity} userInflation={s.inflation} userReturn={s.annualRet} />
                        </div>
                      </div>

                      <GoalRealityIndicator results={results} goalType={s.goalType} />
                      <CostOfDelayCard cost={s.cost} inflation={s.inflation} annualRet={s.annualRet} yrs={s.yrs} />

                      <div className="mt-4 mb-6 flex flex-wrap gap-3 items-center">
                        <span className="text-sm font-medium text-gray-500 w-full md:w-auto mb-1 md:mb-0 mr-2">What If?</span>
                        <button onClick={() => set('cost', Math.round(s.cost * 1.1))} className="px-[14px] py-[6px] border border-[#224c87] bg-white text-[#224c87] text-[12px] font-[600] rounded-[8px] transition-all hover:bg-[#224c87] hover:text-white active:scale-[0.97]">
                          Increase target by 10%
                        </button>
                        <button onClick={() => set('yrs', s.yrs + 2)} className="px-[14px] py-[6px] border border-[#224c87] bg-white text-[#224c87] text-[12px] font-[600] rounded-[8px] transition-all hover:bg-[#224c87] hover:text-white active:scale-[0.97]">
                          Delay by 2 years
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* SECTION 3: Analytics */}
                  <div className="w-full pb-12">
                    <div className="max-w-[1120px] mx-auto w-full px-6">
                      <AnalyticsSection
                        scenarios={scenarios} yrs={s.yrs} riskProfile={s.riskProfile}
                        sensitivity={sensitivity} inflation={s.inflation} annualRet={s.annualRet}
                        yearByYear={yearByYear} results={results}
                      />
                      <div className="mt-8">
                        <EducationTips goalType={s.goalType} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ===== TAB 2: REVERSE CALCULATOR ===== */}
            {activeTab === 'reverse' && (
              <div className="w-full pb-12 pt-6">
                <ReverseCalculator initialAnnualRet={s.annualRet} initialInflation={s.inflation} />
              </div>
            )}

            {/* ===== TAB 3: COMPARE GOALS ===== */}
            {activeTab === 'compare' && (
              <div className="w-full pb-12 pt-6">
                <GoalComparison />
              </div>
            )}

            {/* Hidden PDF Export Template */}
            <div id="export-report" style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', padding: '40px', background: 'white', fontFamily: 'Montserrat, sans-serif', zIndex: -1 }}>
              <h1 style={{ fontSize: '28px', color: '#1a1a2e', fontWeight: 800, marginBottom: '8px' }}>FinCal — Goal-Based Investment Report</h1>
              <p style={{ fontSize: '14px', color: '#919090', marginBottom: '16px' }}>Generated on {new Date().toLocaleDateString('en-IN')} | Illustrative purposes only</p>
              <div style={{ height: '2px', background: '#224c87', width: '100%', marginBottom: '32px' }}></div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e6ed', background: '#f8f9fb' }}>
                  <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>Goal Details</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', textTransform: 'capitalize', marginBottom: '4px' }}>Type: {s.goalType}</p>
                  <p style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>Current Cost: ₹{s.cost?.toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>Time Horizon: {s.yrs} years</p>
                  <p style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>Inflation Assumed: {s.inflation}% p.a.</p>
                  <p style={{ fontSize: '14px', color: '#333' }}>Expected Return: {s.annualRet}% p.a.</p>
                </div>
                <div style={{ padding: '24px', borderRadius: '12px', background: '#224c87', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Monthly SIP Required</p>
                  <p style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0', lineHeight: 1 }}>₹{Math.round(results?.sip || 0).toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: '14px', color: '#e2e8f0' }}>Future Goal Value: ₹{Math.round(results?.fv || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>Scenario Projections</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                   {scenarios.map(sc => (
                     <div key={sc.id} style={{ flex: 1, padding: '16px', border: '1px solid #e2e6ed', borderRadius: '8px', textAlign: 'center' }}>
                       <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>{sc.label} ({sc.ret}%)</p>
                       <p style={{ fontSize: '20px', fontWeight: 700, color: '#224c87' }}>₹{Math.round(sc.sip).toLocaleString('en-IN')}/mo</p>
                     </div>
                   ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div style={{ flex: 1, border: '1px solid #e2e6ed', borderRadius: '12px', padding: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>Future Corpus Breakdown</p>
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', color: '#919090', marginBottom: '4px' }}>Total Corpus Goal</p>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a2e' }}>₹{Math.round(results?.fv || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderLeft: '4px solid #224c87', paddingLeft: '12px' }}>
                      <p style={{ fontSize: '13px', color: '#919090', marginBottom: '2px' }}>Amount Invested</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>
                        ₹{Math.round(results?.invested || 0).toLocaleString('en-IN')} 
                        <span style={{ fontSize: '12px', color: '#919090', marginLeft: '6px', fontWeight: 500 }}>
                          ({Math.round(((results?.invested || 0) / (results?.fv || 1)) * 100)}%)
                        </span>
                      </p>
                    </div>
                    <div style={{ borderLeft: '4px solid #059669', paddingLeft: '12px' }}>
                      <p style={{ fontSize: '13px', color: '#919090', marginBottom: '2px' }}>Returns Earned</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>
                        ₹{Math.round(results?.estRet || 0).toLocaleString('en-IN')}
                        <span style={{ fontSize: '12px', color: '#919090', marginLeft: '6px', fontWeight: 500 }}>
                          ({Math.round(((results?.estRet || 0) / (results?.fv || 1)) * 100)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, border: '1px solid #e2e6ed', borderRadius: '12px', padding: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>Wealth Accumulation Roadmap</p>
                  <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e6ed' }}>
                        <th style={{ textAlign: 'left', paddingBottom: '12px', color: '#919090', fontWeight: 600 }}>Milestone</th>
                        <th style={{ textAlign: 'right', paddingBottom: '12px', color: '#919090', fontWeight: 600 }}>Expected Corpus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                         Math.floor(s.yrs * 0.2) || 1,
                         Math.floor(s.yrs * 0.4) || 2,
                         Math.floor(s.yrs * 0.6) || 3,
                         Math.floor(s.yrs * 0.8) || 4,
                         s.yrs
                      ].filter((v, i, a) => a.indexOf(v) === i)
                       .map(yr => {
                         const r = s.annualRet / 12 / 100;
                         const n = yr * 12;
                         const corpusval = (results?.sip || 0) * (((Math.pow(1 + r, n) - 1) * (1 + r)) / r);
                         return (
                           <tr key={yr} style={{ borderBottom: '1px solid #f1f5f9' }}>
                             <td style={{ padding: '12px 0', fontWeight: 500, color: '#1a1a2e' }}>
                               Year {yr} {yr === s.yrs && <span style={{ color: '#059669', fontSize: '12px', marginLeft: '4px' }}>(Target)</span>}
                             </td>
                             <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#224c87' }}>
                               ₹{Math.round(corpusval).toLocaleString('en-IN')}
                             </td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #e2e6ed', paddingTop: '12px' }}>
                <p style={{ fontSize: '10px', color: '#919090', textAlign: 'center', marginBottom: '4px' }}>* This report is AI-generated and for illustrative purposes only. Not financial advice. All figures are estimated.</p>
                <p style={{ fontSize: '10px', color: '#919090', textAlign: 'center', fontWeight: 600 }}>Powered by FinCal — TECHNEX '26 | HDFC Mutual Fund</p>
              </div>
            </div>

            {/* Footer */}
            <div className="max-w-[1120px] mx-auto w-full px-6 pt-12 pb-24 relative">
              <StickyDisclaimer />
              {activeTab === 'calculator' && <ExportPdfButton isFloating={true} />}
            </div>

            {/* Floating SIP Pill (Mobile only, Goal Calculator tab only) */}
            {activeTab === 'calculator' && (
              <div className="fixed bottom-[20px] left-[50%] -translate-x-1/2 z-40 flex justify-center w-[calc(100%-48px)] max-w-sm md:hidden pointer-events-none">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="pointer-events-auto flex w-full items-center justify-between gap-4 rounded-full bg-white/70 backdrop-blur-[10px] px-6 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/80"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Monthly SIP</span>
                    <span className="font-montserrat text-lg font-bold text-[#224c87] leading-none mt-0.5">
                      {results?.sip > 0 ? `₹${results.sip.toLocaleString('en-IN')}` : 'Goal Met 🎉'}
                    </span>
                  </div>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#224c87] text-white shadow-sm"
                  >
                    ↑
                  </button>
                </motion.div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}