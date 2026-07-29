import React from 'react';

interface Props {
  portfolio: {
    totalInvested: number;
    totalMonthlySip: number;
  };
}

export function PortfolioSummary({ portfolio }: Props) {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 rounded-2xl shadow-lg mb-8">
      <h2 className="text-slate-300 font-semibold mb-2">Total Net Invested</h2>
      <div className="text-5xl font-black tracking-tight mb-8">
        ₹{portfolio.totalInvested.toLocaleString()}
      </div>
      
      <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-6">
        <div>
          <h3 className="text-slate-400 text-sm mb-1">Total Monthly SIP</h3>
          <div className="text-xl font-bold">₹{portfolio.totalMonthlySip.toLocaleString()}</div>
        </div>
        <div>
          <h3 className="text-slate-400 text-sm mb-1">Active Goals</h3>
          <div className="text-xl font-bold">2</div>
        </div>
      </div>
    </div>
  );
}
