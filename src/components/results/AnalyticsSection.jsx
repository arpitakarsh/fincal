'use client';

import AreaChart from '../charts/AreaChart';
import GlidePath from '../charts/GlidePath';
import SensitivityHeatTable from '../charts/SensitivityHeatTable';
import StackedBarChart from '../charts/StackedBarChart';
import DonutChart from '../charts/DonutChart';

export default function AnalyticsSection({
  scenarios,
  yrs,
  riskProfile,
  sensitivity,
  inflation,
  annualRet,
  yearByYear,
  results,
}) {
  return (
    <div className="mt-8 mb-6 flex flex-col gap-10">
      
      {/* Emotional Headline */}
      <div>
        <h2 className="text-2xl font-semibold text-[#1a1a2e] font-montserrat tracking-tight mb-1">See how your money can grow over time</h2>
        <p className="text-sm font-medium text-gray-500">Dive deeper into how your money accumulates and test market scenarios.</p>
      </div>

      {/* 1. Hero Growth Chart */}
      <div className="w-full bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] transition-all duration-200 border border-[#e2e6ed] overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <h3 className="font-montserrat font-semibold text-lg text-[#1a1a2e]">
            See how your wealth can build over time
          </h3>
          <p className="text-sm text-[#555] mt-1">
            Based on assumed return and inflation inputs.
          </p>
        </div>
        <div className="px-8 pb-8" style={{ height: '420px' }}>
          <AreaChart scenarios={scenarios} yrs={yrs} activeProfile={riskProfile} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* Year-by-Year Stacked Bar Card */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-200 border border-[#e2e6ed] p-4 lg:p-6 flex flex-col h-[360px] w-full">
          <p className="font-montserrat font-semibold text-[13px] text-[#1a1a2e] mb-3">
            Corpus Breakdown
          </p>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0">
               <StackedBarChart yearByYearData={yearByYear} />
            </div>
          </div>
        </div>

        {/* Invested vs Returns Donut Card */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-200 border border-[#e2e6ed] p-4 lg:p-6 flex flex-col h-[360px] w-full">
          <p className="font-montserrat font-semibold text-[13px] text-[#1a1a2e] mb-3">
            Asset Allocation
          </p>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0">
               <GlidePath years={yrs} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 w-full gap-6 mt-[-16px]">
        {/* Invested vs Returns Donut Card */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-200 border border-[#e2e6ed] p-4 lg:p-6 flex flex-col h-[360px] max-w-[600px] mx-auto w-full">
          <p className="font-montserrat font-semibold text-[13px] text-[#1a1a2e] mb-3 text-center">
            Investment Summary
          </p>
          <div className="flex-1 w-full relative min-h-[250px]">
            <div className="absolute inset-0 flex items-center justify-center">
               <DonutChart totalInvested={results?.invested || 0} totalReturns={results?.returns || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
