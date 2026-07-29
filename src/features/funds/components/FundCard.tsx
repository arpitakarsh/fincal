import React from 'react';
import { RankedFund } from '../engine';

interface Props {
  fund: RankedFund;
}

export function FundCard({ fund }: Props) {
  return (
    <div className="border border-slate-200 p-4 rounded-xl shadow-sm mb-4 bg-white">
      <div className="flex justify-between items-start border-b pb-3 mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            <span className="text-slate-400 mr-2">#{fund.rank}</span>
            {fund.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{fund.amcName} • {fund.category}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-black text-primary">{fund.qualityScore.total}</div>
          <div className="text-xs text-slate-500">Quality Score</div>
        </div>
      </div>
      
      <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm text-slate-700">
        <strong>Why?</strong> {fund.explanation.reason}
        <br/><br/>
        <span className="text-green-700">✓ {fund.explanation.primaryStrength}</span>
        <br/>
        <span className="text-red-700">✗ {fund.explanation.primaryWeakness}</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">3Y CAGR</span>
          <span className="font-semibold">{fund.metrics.cagr3Y}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Expense</span>
          <span className="font-semibold">{fund.expenseRatio}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Sharpe</span>
          <span className="font-semibold">{fund.metrics.sharpeRatio}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">AUM</span>
          <span className="font-semibold">₹{fund.aumCr}Cr</span>
        </div>
      </div>
    </div>
  );
}
