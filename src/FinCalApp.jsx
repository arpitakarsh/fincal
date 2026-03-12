'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import SensitivityHeatTable from '../src/components/charts/SensitivityHeatTable';
import AreaChart from '../src/components/charts/AreaChart';
import GlidePath from '../src/components/charts/GlidePath';
import StackedBarChart from '../src/components/charts/StackedBarChart';
import DonutChart from '../src/components/charts/DonutChart';
import HeroSection from '../src/components/layout/HeroSection';
import CostOfDelayCard from '../src/components/results/CostOfDelayCard';
import GoalRealityIndicator from '../src/components/results/GoalRealityIndicator';
import TaxationBanner from '../src/components/layout/TaxationBanner';
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
import GlowMenu from '../src/components/ui/GlowMenu';

const CalculatorIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const RefreshCwIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const GitCompareIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <path d="M11 18H8a2 2 0 0 1-2-2V9" />
  </svg>
);

const TAB_ITEMS = [
  {
    icon: CalculatorIcon,
    label: "Goal Calculator",
    gradient: "radial-gradient(circle, rgba(34,76,135,0.15) 0%, rgba(34,76,135,0.05) 50%, transparent 100%)",
    iconColor: "#224c87",
  },
  {
    icon: RefreshCwIcon,
    label: "Reverse Calculator",
    gradient: "radial-gradient(circle, rgba(5,150,105,0.15) 0%, rgba(5,150,105,0.05) 50%, transparent 100%)",
    iconColor: "#059669",
  },
  {
    icon: GitCompareIcon,
    label: "Compare Goals",
    gradient: "radial-gradient(circle, rgba(218,56,50,0.15) 0%, rgba(218,56,50,0.05) 50%, transparent 100%)",
    iconColor: "#da3832",
  },
];

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
  if (yrs < 3) return { ret: 6.5, fund: 'Debt' };
  if (yrs <= 5) return { ret: 9.5, fund: 'Hybrid' };
  return { ret: 12, fund: 'Equity' };
}

export default function FinCalApp() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [s, setS] = useState(DEFAULTS);
  const [showHero, setShowHero] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showTaxBanner, setShowTaxBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [step1Open, setStep1Open] = useState(true);
  const [step2Open, setStep2Open] = useState(true);
  const centerPanelRef = useRef(null);
  const heroCardRef = useRef(null);
  const [showFloatingPill, setShowFloatingPill] = useState(false);

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

  const onScenarioSelect = (scenarioId) => {
    setS(prev => {
      if (prev.locks.annualRet) return { ...prev, riskProfile: scenarioId };
      const retMap = { conservative: 8, moderate: 10, aggressive: 12 };
      return { ...prev, riskProfile: scenarioId, annualRet: retMap[scenarioId] };
    });
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
    return calcScenarios({
      cost: s.cost, inflation: s.inflation, yrs: s.yrs,
      lumpsum: s.lumpsumOn ? s.lumpsum : 0,
    });
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

  useEffect(() => {
    centerPanelRef.current?.scrollTo(0, 0);
  }, [results]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const apply = () => {
      setIsMobile(media.matches);
      if (!media.matches) {
        setStep1Open(true);
        setStep2Open(true);
      }
    };
    apply();
    media.addEventListener?.('change', apply);
    return () => media.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowFloatingPill(false);
      return;
    }
    if (!heroCardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingPill(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(heroCardRef.current);
    return () => observer.disconnect();
  }, [isMobile, results]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem('fincal_tax_banner_dismissed');
    if (dismissed === '1') setShowTaxBanner(false);
  }, []);

  const handleTaxBannerClose = () => {
    setShowTaxBanner(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fincal_tax_banner_dismissed', '1');
    }
  };


  const activeLabel =
    activeTab === 'calculator' ? 'Goal Calculator' :
    activeTab === 'reverse' ? 'Reverse Calculator' :
    'Compare Goals';

  const handleGlowMenuClick = (label) => {
    if (label === 'Goal Calculator') setActiveTab('calculator');
    if (label === 'Reverse Calculator') setActiveTab('reverse');
    if (label === 'Compare Goals') setActiveTab('compare');
  };

  const glowMenuDesktop = (
    <div className="header-tabs-desktop">
      <GlowMenu
        items={TAB_ITEMS}
        activeItem={activeLabel}
        onItemClick={handleGlowMenuClick}
      />
    </div>
  );

  const glowMenuMobile = (
    <GlowMenu
      items={TAB_ITEMS}
      activeItem={activeLabel}
      onItemClick={handleGlowMenuClick}
    />
  );

  return (
    <div
      className="app-root"
      style={{
        background: '#f8f9fb',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: "radial-gradient(rgba(34,76,135,0.03) 1px, transparent 1px)",
        backgroundSize: '20px 20px',
      }}
    >
      <style jsx global>{`
        html, body {
          scroll-behavior: smooth;
          overflow-x: hidden;
        }
        .app-root {
          height: 100vh;
          overflow: hidden;
        }
        .panel-height {
          min-height: calc(100vh - 56px - 40px);
          height: calc(100vh - 56px - 40px);
        }
        @media (max-width: 767px) {
          .panel-height {
            height: auto;
          }
        }
        .panel-wrapper {
          overflow: hidden;
          gap: 12px;
        }
        .app-shell {
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (min-width: 1280px) {
          .app-shell {
            max-width: 1400px;
          }
        }
        .content-wrapper {
          padding-top: 24px;
        }
        @media (max-width: 768px) {
          .app-root {
            height: auto !important;
            overflow: auto !important;
          }
          .panel-wrapper {
            flex-direction: column !important;
            overflow: visible !important;
          }
          .panel-scroll {
            overflow: visible !important;
          }
          .panel-left,
          .panel-right {
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            flex-basis: 100% !important;
            overflow: visible !important;
            height: auto !important;
          }
          .content-wrapper {
            padding-top: 56px !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .desktop-only {
            display: none !important;
          }
        }
        .mobile-only {
          display: none;
        }
        .desktop-only {
          display: block;
        }
        .header-tabs-desktop {
          display: flex;
        }
        @media (max-width: 768px) {
          .header-tabs-desktop {
            display: none;
          }
        }
        @keyframes menuSlide {
          from {
            opacity: 0;
            transform: translateY(-6px) scaleY(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }
        .panel-left {
          flex: 0 1 38%;
          min-width: 340px;
          max-width: 440px;
        }
        .panel-right {
          flex: 1 1 62%;
          min-width: 0;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .panel-left {
            flex-basis: 38%;
          }
          .panel-right {
            flex-basis: 62%;
          }
        }
        .panel-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e2e6ed transparent;
        }
        .panel-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .panel-scroll::-webkit-scrollbar-thumb {
          background: #e2e6ed;
          border-radius: 999px;
        }
        @media (max-width: 768px) {
          .mobile-nl {
            margin: 0 16px 16px;
          }
        }
      `}</style>
      <AnimatePresence>
        {showHero ? (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="absolute inset-0 z-50 bg-[#f8f9fb]">
            <HeroSection onGetStarted={() => setShowHero(false)} />
          </motion.div>
        ) : (
          <motion.div key="app" className="bg-gray-50 font-sans w-full relative z-10" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}>

            <div className="w-full pb-0 pt-0 relative z-10">
              <div className="app-shell">
                <Header tabBar={glowMenuDesktop} />
                <div className="mobile-only" style={{ padding: '8px 16px 4px', background: '#f8f9fb', overflowX: 'auto' }}>
                  {glowMenuMobile}
                </div>
                {showTaxBanner && <TaxationBanner onClose={handleTaxBannerClose} />}
              </div>
            </div>

                        {activeTab === 'calculator' && (
              <div key="tab-calculator" className="animate-fadeIn">
                <div className="w-full pb-0 relative z-10 content-wrapper">
                  <div className="app-shell">
                    <div className="panel-height panel-wrapper flex flex-col md:flex-row bg-[#f8f9fb]">
                      <div
                        className="panel-scroll panel-left w-full"
                        style={{
                          height: '100%',
                          minHeight: 0,
                          overflowY: 'scroll',
                          borderRight: '1px solid #e2e6ed',
                          background: '#ffffff',
                          paddingLeft: 24,
                          paddingRight: 24,
                          paddingTop: 16,
                          paddingBottom: 48,
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#e2e6ed transparent',
                          opacity: isFocusMode ? 0.3 : 1,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: isFocusMode ? 'none' : 'auto',
                        }}
                      >
                        <div className="w-full mobile-nl" style={{ marginBottom: 16 }}>
                          <NLGoalInput onApply={(p) => setS(prev => ({ ...prev, ...p, inflationSrc: 'custom' }))} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                          <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#224c87', letterSpacing: 1, textTransform: 'uppercase', background: '#e8eef7', padding: '4px 10px', borderRadius: 999 }}>
                            STEP 1
                          </span>
                          <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
                        </div>
                        <div className="desktop-only" style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
                          Your Financial Goal
                        </div>
                        <button
                          type="button"
                          className="mobile-only transition-colors hover:bg-[#e8eef7]"
                          onClick={() => setStep1Open(v => !v)}
                          aria-expanded={step1Open}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f0f4fb',
                            border: 'none',
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontWeight: 600,
                            color: '#1a1a2e',
                            fontFamily: 'Montserrat, sans-serif',
                            marginBottom: 12,
                            minHeight: 44,
                          }}
                        >
                          <span>Goal Details</span>
                          <span
                            aria-hidden="true"
                            style={{
                              fontSize: 16,
                              color: '#1a1a2e',
                              lineHeight: 1,
                              transform: step1Open ? 'rotate(-90deg)' : 'rotate(90deg)',
                              transition: 'transform 200ms ease',
                              display: 'inline-block',
                            }}
                          >
                            ›
                          </span>
                        </button>

                        <div style={{ marginBottom: 16, display: !step1Open ? 'none' : 'block' }}>
                          <div style={{ marginBottom: 16 }}>
                            <GoalSelector selectedGoal={s.goalType} onGoalChange={onGoalChange} columns={2} />
                          </div>
                          <div>
                            <GoalInputForm
                              presentCost={s.cost} years={s.yrs} inflation={s.inflation}
                              onPresentCostChange={v => set('cost', v)}
                              onYearsChange={v => set('yrs', v)}
                              onInflationChange={v => { set('inflation', v); set('inflationSrc', 'custom'); }}
                              assumptionLocks={s.locks} onLockToggle={setLock}
                              hardErrors={hardErrors} softWarnings={softWarnings}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                          <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#224c87', letterSpacing: 1, textTransform: 'uppercase', background: '#e8eef7', padding: '4px 10px', borderRadius: 999 }}>
                            STEP 2
                          </span>
                          <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
                        </div>
                        <div className="desktop-only" style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
                          Return Assumptions
                        </div>
                        <button
                          type="button"
                          className="mobile-only transition-colors hover:bg-[#e8eef7]"
                          onClick={() => setStep2Open(v => !v)}
                          aria-expanded={step2Open}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f0f4fb',
                            border: 'none',
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontWeight: 600,
                            color: '#1a1a2e',
                            fontFamily: 'Montserrat, sans-serif',
                            marginBottom: 12,
                            minHeight: 44,
                          }}
                        >
                          <span>Strategy</span>
                          <span
                            aria-hidden="true"
                            style={{
                              fontSize: 16,
                              color: '#1a1a2e',
                              lineHeight: 1,
                              transform: step2Open ? 'rotate(-90deg)' : 'rotate(90deg)',
                              transition: 'transform 200ms ease',
                              display: 'inline-block',
                            }}
                          >
                            ›
                          </span>
                        </button>

                        <div style={{ marginBottom: 16, display: !step2Open ? 'none' : 'block' }}>
                          <div style={{ marginBottom: 16 }}>
                            <RiskProfileSelector profile={s.riskProfile} onChange={onProfileChange} locked={s.locks.annualRet} />
                          </div>
                          <div className="flex flex-col gap-1" style={{ marginBottom: 12 }}>
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
                                <span>*</span>
                                <span>Historical markets often average 10-12%. High returns come with higher risk.</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <QuickPresets value={s.cost} onChange={v => set('cost', v)} />
                            <div style={{ marginTop: 12 }}>
                              <StepUpToggle stepUpEnabled={s.stepUpOn} stepUpPercent={s.stepUpPct} onToggle={() => set('stepUpOn', !s.stepUpOn)} onPercentChange={v => set('stepUpPct', v)} />
                            </div>
                            <div style={{ marginTop: 12 }}>
                              <LumpsumToggle lumpsumEnabled={s.lumpsumOn} lumpsumAmount={s.lumpsum} onToggle={() => set('lumpsumOn', !s.lumpsumOn)} onAmountChange={v => set('lumpsum', v)} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="panel-scroll panel-right w-full"
                        style={{
                          height: '100%',
                          minHeight: 0,
                          background: '#f8f9fb',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#e2e6ed transparent',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 20px',
                            background: '#f8f9fb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ width: 2, height: 16, background: '#224c87', borderRadius: 2 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(34,76,135,0.7)', textAlign: 'center', letterSpacing: 1.5 }}>
                            YOUR INVESTMENT PLAN
                          </span>
                          <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
                        </div>

                        <div
                          ref={centerPanelRef}
                          className="panel-scroll"
                          style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 20px 48px', position: 'relative', opacity: isFocusMode ? 0.2 : 1, transition: 'opacity 0.4s ease', pointerEvents: isFocusMode ? 'none' : 'auto' }}
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

                          <div ref={heroCardRef} style={{ marginTop: 12, marginBottom: 16 }}>
                            <HeadlineSIP results={results} fv={results?.fv} yrs={s.yrs} inflation={s.inflation} annualRet={s.annualRet} />
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <InsightParagraph results={results} goalType={s.goalType} yrs={s.yrs} inflation={s.inflation} annualRet={s.annualRet} />
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <GoalValidator results={results} goalType={s.goalType} cost={s.cost} inflation={s.inflation} annualRet={s.annualRet} yrs={s.yrs} />
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <ScenarioCards scenarios={scenarios} activeProfile={s.riskProfile} onSelect={onScenarioSelect} />
                          </div>

                          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)' }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>Sensitivity Analysis - SIP vs Inflation & Return</p>
                            <p style={{ fontSize: 12, color: '#919090', marginBottom: 16 }}>How your SIP changes with different return and inflation assumptions.</p>
                            <div className="overflow-auto w-full">
                              <SensitivityHeatTable data={sensitivity} userInflation={s.inflation} userReturn={s.annualRet} />
                            </div>
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <GoalRealityIndicator
                              presentCost={s.cost}
                              years={s.yrs}
                              inflation={s.inflation}
                              annualReturn={s.annualRet}
                              goalType={s.goalType}
                            />
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <CostOfDelayCard cost={s.cost} inflation={s.inflation} annualRet={s.annualRet} yrs={s.yrs} />
                          </div>

                          <div className="mb-4 flex flex-wrap gap-3 items-center">
                            <span className="text-sm font-medium text-gray-500 w-full md:w-auto mb-1 md:mb-0 mr-2">What If?</span>
                            <button
                              onClick={() => set('cost', Math.round(s.cost * 1.1))}
                              className="px-[14px] py-[6px] border border-[#224c87] bg-white text-[#224c87] text-[12px] font-[600] rounded-[8px] transition-all duration-150 hover:bg-[#224c87] hover:text-white active:scale-[0.97]"
                            >
                              Increase target by 10%
                            </button>
                            <button
                              onClick={() => set('yrs', s.yrs + 2)}
                              className="px-[14px] py-[6px] border border-[#224c87] bg-white text-[#224c87] text-[12px] font-[600] rounded-[8px] transition-all duration-150 hover:bg-[#224c87] hover:text-white active:scale-[0.97]"
                            >
                              Delay by 2 years
                            </button>
                          </div>

                          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)' }}>
                            <div style={{ height: 240 }}>
                              <AreaChart scenarios={scenarios} yrs={s.yrs} activeProfile={s.riskProfile} />
                            </div>
                          </div>

                          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)' }}>
                            <div style={{ height: 220 }} className="w-full relative">
                              <div className="absolute inset-0">
                                <StackedBarChart yearByYearData={yearByYear} />
                              </div>
                            </div>
                          </div>

                          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)' }}>
                            <div style={{ height: 200 }} className="w-full relative">
                              <div className="absolute inset-0">
                                <GlidePath years={s.yrs} />
                              </div>
                            </div>
                          </div>

                          <div style={{ marginBottom: 8 }}>
                            <div style={{ height: 280 }} className="w-full">
                              <DonutChart totalInvested={results?.invested || 0} totalReturns={results?.returns || 0} />
                            </div>
                          </div>

                          <ExportPdfButton variant="panel" className="mt-2 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'reverse' && (
              <div key="tab-reverse" className="animate-fadeIn w-full" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)', paddingBottom: 48, paddingTop: 24 }}>
                <div className="max-w-[860px] mx-auto px-6">
                  <ReverseCalculator initialAnnualRet={s.annualRet} initialInflation={s.inflation} />
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div key="tab-compare" className="animate-fadeIn w-full" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)', paddingBottom: 48, paddingTop: 24 }}>
                <div className="max-w-[960px] mx-auto px-6">
                  <GoalComparison />
                </div>
              </div>
            )}

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
                  <div style={{ width: '100%', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e6ed', paddingBottom: '12px', color: '#919090', fontWeight: 600 }}>
                      <div>Milestone</div>
                      <div>Expected Corpus</div>
                    </div>
                    <div>
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
                            <div key={yr} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
                              <div style={{ fontWeight: 500, color: '#1a1a2e' }}>
                                Year {yr} {yr === s.yrs && <span style={{ color: '#059669', fontSize: '12px', marginLeft: '4px' }}>(Target)</span>}
                              </div>
                              <div style={{ textAlign: 'right', fontWeight: 600, color: '#224c87' }}>
                                ???{Math.round(corpusval).toLocaleString('en-IN')}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #e2e6ed', paddingTop: '12px' }}>
                <p style={{ fontSize: '10px', color: '#919090', textAlign: 'center', marginBottom: '4px' }}>* This report is AI-generated and for illustrative purposes only. Not financial advice. All figures are estimated.</p>
                <p style={{ fontSize: '10px', color: '#919090', textAlign: 'center', fontWeight: 600 }}>Powered by FinCal — TECHNEX '26 | HDFC Mutual Fund</p>
              </div>
            </div>

            <div className="w-full relative">
              <StickyDisclaimer />
            </div>

            {activeTab === 'calculator' && isMobile && showFloatingPill && results?.sip > 0 && (
              <div className="fixed bottom-[44px] left-0 right-0 z-40 px-4">
                <motion.button
                  type="button"
                  onClick={() => heroCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full rounded-full bg-[#224c87] text-white px-5 py-3 shadow-[0_-4px_16px_rgba(34,76,135,0.2)] text-[14px] font-[600] h-[56px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {`\u20B9${results.sip.toLocaleString('en-IN')} / month \u00B7 ${s.riskProfile === 'balanced' ? 'Moderate' : s.riskProfile === 'safe' ? 'Conservative' : s.riskProfile === 'growth' ? 'Aggressive' : 'Custom'}`}
                </motion.button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
