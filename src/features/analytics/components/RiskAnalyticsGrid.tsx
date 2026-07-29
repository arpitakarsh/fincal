import React from 'react';
import { RiskMetrics } from '../engine/risk';

interface Props {
  metrics: RiskMetrics;
}

export function RiskAnalyticsGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="p-4 border rounded-xl bg-slate-50 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-semibold mb-1">Worst Case</span>
        <span className="text-xl font-bold text-red-600">{metrics.worstCase}%</span>
      </div>
      
      <div className="p-4 border rounded-xl bg-slate-50 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-semibold mb-1">25th Percentile</span>
        <span className="text-xl font-bold text-slate-700">{metrics.percentile25}%</span>
      </div>
      
      <div className="p-4 border rounded-xl bg-slate-50 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-semibold mb-1">Median Expected</span>
        <span className="text-xl font-bold text-blue-600">{metrics.median}%</span>
      </div>
      
      <div className="p-4 border rounded-xl bg-slate-50 flex flex-col items-center">
        <span className="text-xs text-slate-500 font-semibold mb-1">Best Case</span>
        <span className="text-xl font-bold text-green-600">{metrics.bestCase}%</span>
      </div>
    </div>
  );
}
