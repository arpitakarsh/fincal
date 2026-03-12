'use client';

import { useState } from 'react';

const calcSIP = (cost, inflation, yrs, annualRet = 10) => {
  const fv = cost * Math.pow(1 + inflation / 100, yrs);
  const r = annualRet / 12 / 100;
  const n = yrs * 12;
  if (r === 0) return fv / n;
  return fv * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
};

const getInflationDefault = (type) => {
  const map = { house: 9, education: 11, healthcare: 9, wedding: 8, travel: 6.5, car: 6, general: 6 };
  return map[type] ?? 6;
};

const fmt = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;

function GoalCard({ goal, onChange, label, color }) {
  const handleField = (key, val) => onChange(key, val);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)', padding: 20, flex: 1 }}>
      <p className="font-bold text-[14px] uppercase tracking-wider mb-4 border-b border-[#e2e6ed] pb-2" style={{ color }}>{label}</p>
      <div className="flex flex-col gap-4">
        <select
          value={goal.type}
          onChange={(e) => handleField('type', e.target.value)}
          className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[10px] px-[14px] text-[14px] font-semibold text-[#1a1a2e] outline-none capitalize"
        >
          <option value="house">House</option>
          <option value="education">Education</option>
          <option value="healthcare">Healthcare</option>
          <option value="wedding">Wedding</option>
          <option value="travel">Travel</option>
          <option value="car">Car</option>
          <option value="general">General Wealth</option>
        </select>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-500 font-medium">Current cost today</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-semibold">₹</span>
            <input
              type="number"
              value={goal.cost}
              placeholder="500000"
              onChange={(e) => handleField('cost', e.target.value)}
              className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[8px] pl-[26px] pr-[12px] text-[14px] font-semibold text-[#1a1a2e] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-500 font-medium">Years to goal</label>
          <input
            type="number"
            value={goal.yrs}
            onChange={(e) => handleField('yrs', Number(e.target.value))}
            className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[8px] px-[12px] text-[14px] font-semibold text-[#1a1a2e] outline-none"
          />
        </div>

        <div className="inline-flex max-w-max bg-gray-100 rounded-md px-2 py-1 items-center">
          <span className="text-[11px] font-medium text-gray-600">Inflation: {goal.inflation}% (default)</span>
        </div>
      </div>
    </div>
  );
}

export default function GoalComparison() {
  const [goal1, setGoal1] = useState({ type: 'house', cost: 10000000, yrs: 10, inflation: 9 });
  const [goal2, setGoal2] = useState({ type: 'education', cost: '', yrs: 5, inflation: 11 });

  const handleChange = (setter, key, val) => {
    setter(p => {
      const next = { ...p, [key]: val };
      if (key === 'type') next.inflation = getInflationDefault(val);
      return next;
    });
  };

  const g1Cost = Number(goal1.cost) || 0;
  const g2Cost = Number(goal2.cost) || 0;

  const g1FV = g1Cost * Math.pow(1 + goal1.inflation / 100, goal1.yrs);
  const g2FV = g2Cost * Math.pow(1 + goal2.inflation / 100, goal2.yrs);

  const g1SIP = g1Cost > 0 ? calcSIP(g1Cost, goal1.inflation, goal1.yrs) : 0;
  const g2SIP = g2Cost > 0 ? calcSIP(g2Cost, goal2.inflation, goal2.yrs) : 0;

  const g1TotalInv = g1SIP * goal1.yrs * 12;
  const g2TotalInv = g2SIP * goal2.yrs * 12;

  const g1Returns = g1FV - g1TotalInv;
  const g2Returns = g2FV - g2TotalInv;

  const showReport = g1Cost > 0 && g2Cost > 0;
  const g1Higher = g1SIP > g2SIP;
  const maxSIP = Math.max(g1SIP, g2SIP);

  const rows = [
    { label: 'Goal Type', g1: <span className="capitalize">{goal1.type}</span>, g2: <span className="capitalize">{goal2.type}</span> },
    { label: 'Current Cost', g1: fmt(g1Cost), g2: fmt(g2Cost) },
    { label: 'Future Cost', g1: fmt(g1FV), g2: fmt(g2FV) },
    { label: 'Inflation Used', g1: `${goal1.inflation}%`, g2: `${goal2.inflation}%` },
    { label: 'Time Horizon', g1: `${goal1.yrs} years`, g2: `${goal2.yrs} years` },
    { label: 'Monthly SIP', g1: fmt(g1SIP), g2: fmt(g2SIP), highlight: true },
    { label: 'Total Investment', g1: fmt(g1TotalInv), g2: fmt(g2TotalInv) },
    { label: 'Returns Earned', g1: fmt(g1Returns), g2: fmt(g2Returns) },
  ];

  const winnerType = g1Higher ? goal1.type : goal2.type;
  const winnerSIP = g1Higher ? g1SIP : g2SIP;

  return (
    <div className="w-full mb-12 max-w-[1120px] mx-auto px-6">
      <div className="mb-6 text-center">
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Compare Two Goals</h2>
        <p style={{ fontSize: 13, color: '#919090', marginBottom: 16 }}>See which goal needs more urgent attention</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-0">
        <GoalCard goal={goal1} onChange={(key, val) => handleChange(setGoal1, key, val)} label="Goal 1" color="#224c87" />
        <GoalCard goal={goal2} onChange={(key, val) => handleChange(setGoal2, key, val)} label="Goal 2" color="#c2410c" />
      </div>

      {showReport && (
        <>
          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)', padding: 24, marginTop: 24, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fb' }}>
                    <th className="text-left px-4 py-3 text-[12px] text-[#919090] font-semibold uppercase tracking-wide">Metric</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[#919090] font-semibold uppercase tracking-wide">Goal 1</th>
                    <th className="text-left px-4 py-3 text-[12px] text-[#919090] font-semibold uppercase tracking-wide">Goal 2</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const isAlt = i % 2 === 1;
                    const g1HigherSIP = g1SIP > g2SIP;
                    return (
                      <tr key={row.label} style={{ background: isAlt ? '#fafafa' : 'white', borderBottom: '1px solid #f1f3f6' }}>
                        <td className="px-4 py-3 font-medium text-gray-600">{row.label}</td>
                        <td className="px-4 py-3" style={row.highlight ? { background: g1HigherSIP ? '#fff5f5' : '#f0fdf4', color: g1HigherSIP ? '#da3832' : '#16a34a', fontWeight: 700 } : {}}>
                          {row.g1}
                        </td>
                        <td className="px-4 py-3" style={row.highlight ? { background: !g1HigherSIP ? '#fff5f5' : '#f0fdf4', color: !g1HigherSIP ? '#da3832' : '#16a34a', fontWeight: 700 } : {}}>
                          {row.g2}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 bg-[#fff8e1] border border-[#fde68a] rounded-[12px] px-5 py-4 flex items-start gap-3">
            <span className="text-[20px] mt-0.5">⚡</span>
            <p className="text-[14px] font-medium text-[#92400e]">
              <span className="capitalize font-bold">{winnerType}</span> needs more urgent SIP ({fmt(winnerSIP)}/mo). Consider starting this investment first.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 8px 32px rgba(34,76,135,0.12)', padding: 20, marginTop: 16 }}>
            <p className="text-[14px] font-bold text-[#1a1a2e] mb-4">Monthly SIP Comparison</p>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium text-gray-600 capitalize">{goal1.type}</span>
                  <span className="text-[13px] font-bold text-[#224c87]">{fmt(g1SIP)}/mo</span>
                </div>
                <div className="w-full bg-slate-100 rounded-md overflow-hidden" style={{ height: 36 }}>
                  <div className="h-full transition-all duration-500" style={{ width: maxSIP > 0 ? `${Math.max((g1SIP / maxSIP) * 100, 2)}%` : '0%', background: '#224c87', borderRadius: 6 }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium text-gray-600 capitalize">{goal2.type}</span>
                  <span className="text-[13px] font-bold text-[#059669]">{fmt(g2SIP)}/mo</span>
                </div>
                <div className="w-full bg-slate-100 rounded-md overflow-hidden" style={{ height: 36 }}>
                  <div className="h-full transition-all duration-500" style={{ width: maxSIP > 0 ? `${Math.max((g2SIP / maxSIP) * 100, 2)}%` : '0%', background: '#059669', borderRadius: 6 }} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#919090] mt-4">
            * Illustrative only. Assumes 10% p.a. return for both goals. Figures are estimated.
          </p>
        </>
      )}
    </div>
  );
}
