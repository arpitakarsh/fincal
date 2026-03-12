'use client';

import { useState } from 'react';
import CountUp from 'react-countup';
import { COLORS } from '../../lib/constants';

export default function ReverseCalculator({ initialAnnualRet, initialInflation }) {
  const [mode, setMode] = useState('sip_to_goal'); 
  const [sip, setSip] = useState(10000);
  const [targetCost, setTargetCost] = useState(5000000); // For goal_to_sip mode
  const [yrs, setYrs] = useState(10);
  const [annualRet, setAnnualRet] = useState(initialAnnualRet || 10);
  const [inflation, setInflation] = useState(initialInflation || 6);

  const r = (annualRet / 100) / 12;
  const n = yrs * 12;
  
  // mode: sip_to_goal
  const futureCorpus = sip * (((Math.pow(1 + r, n) - 1)) / r) * (1 + r);
  const presentValue = futureCorpus / Math.pow(1 + inflation / 100, yrs);
  const sipTotalInvested = sip * n;
  const sipEstimatedReturns = futureCorpus - sipTotalInvested;

  // mode: goal_to_sip
  const futureTargetCost = targetCost * Math.pow(1 + inflation / 100, yrs);
  const requiredSip = futureTargetCost * r / (((Math.pow(1 + r, n) - 1)) * (1 + r));
  const goalTotalInvested = requiredSip * n;
  const goalEstimatedReturns = futureTargetCost - goalTotalInvested;

  return (
    <div className="w-full mb-12 max-w-[1120px] mx-auto px-6">
      <div className="mb-6 text-center">
        <h2 className="text-[20px] font-bold text-[#1a1a2e] font-montserrat tracking-tight mb-1">
          What can I achieve with my SIP?
        </h2>
        <p className="text-[13px] text-[#919090] font-medium">
          Enter what you can invest monthly and we'll show you what goal you can reach
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full flex gap-1">
          <button 
            onClick={() => setMode('goal_to_sip')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'goal_to_sip' ? 'bg-[#224c87] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Goal → SIP
          </button>
          <button 
            onClick={() => setMode('sip_to_goal')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'sip_to_goal' ? 'bg-[#224c87] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900'}`}
          >
            SIP → Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
       
        <div className="bg-white border border-[#e2e6ed] rounded-[16px] p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                {mode === 'sip_to_goal' ? 'I can invest every month' : 'My target goal today'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input
                  type="number"
                  value={mode === 'sip_to_goal' ? sip : targetCost}
                  onChange={(e) => mode === 'sip_to_goal' ? setSip(Number(e.target.value)) : setTargetCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[10px] pl-[32px] pr-[14px] text-[14px] font-semibold text-[#1a1a2e] outline-none focus:border-[#224c87] focus:ring-1 focus:ring-[#224c87] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">For how many years?</label>
              <div className="relative">
                <input
                  type="number"
                  value={yrs}
                  onChange={(e) => setYrs(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[10px] px-[14px] text-[14px] font-semibold text-[#1a1a2e] outline-none focus:border-[#224c87] focus:ring-1 focus:ring-[#224c87] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-medium pointer-events-none">years</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-end">
                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">Expected annual return</label>
                <div className="bg-[#eef2ff] px-2 py-0.5 rounded text-[13px] font-bold text-[#224c87]">{annualRet}%</div>
              </div>
              <input 
                type="range" min="1" max="20" step="0.5" 
                value={annualRet} onChange={(e) => setAnnualRet(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#224c87]"
              />
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-end">
                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">Expected inflation</label>
                <div className="bg-gray-100 px-2 py-0.5 rounded text-[13px] font-bold text-gray-600">{inflation}%</div>
              </div>
              <input 
                type="range" min="1" max="15" step="0.5" 
                value={inflation} onChange={(e) => setInflation(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#919090]"
              />
            </div>

            <div className="mt-4 md:hidden flex justify-center text-[#224c87] animate-bounce">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider mb-1">See Results Below</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

          </div>
        </div>


        <div className="bg-[#f0f4ff] border border-[#c7d4f0] rounded-[16px] p-6 lg:p-8 flex flex-col justify-center">
          <p className="text-[13px] text-[#919090] font-medium mb-1">
            {mode === 'sip_to_goal' ? 'You can achieve a goal worth' : 'Monthly SIP Required'}
          </p>
          <div className="text-[32px] font-[700] font-montserrat text-[#224c87] leading-tight mb-1">
            ₹<CountUp end={mode === 'sip_to_goal' ? presentValue || 0 : requiredSip || 0} duration={1} separator="," decimals={0} />
          </div>
          <p className="text-[13px] text-[#919090] italic mb-6">
            {mode === 'sip_to_goal' ? "in today's money (inflation-adjusted)" : "to reach your goal"}
          </p>

          <div className="w-full h-[1px] bg-[#c7d4f0] mb-6"></div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg">
              <span className="text-[13px] font-medium text-gray-700">Future value of corpus</span>
              <span className="text-[14px] font-bold text-[#1a1a2e]">₹{Math.round(mode === 'sip_to_goal' ? futureCorpus : futureTargetCost).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg">
              <span className="text-[13px] font-medium text-gray-600">Total amount invested</span>
              <span className="text-[14px] font-bold text-gray-800">₹{Math.round(mode === 'sip_to_goal' ? sipTotalInvested : goalTotalInvested).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center bg-[#e8f5e9] px-3 py-2 rounded-lg border border-[#c8e6c9]">
              <span className="text-[13px] font-medium text-[#2e7d32]">✨ Estimated returns earned</span>
              <span className="text-[14px] font-bold text-[#1b5e20]">+ ₹{Math.round(mode === 'sip_to_goal' ? sipEstimatedReturns : goalEstimatedReturns).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-6 text-center leading-tight">
            * Illustrative only. Assumes constant monthly SIP over the entire duration.
          </p>
        </div>
      </div>
    </div>
  );
}
