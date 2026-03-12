'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GOAL_TYPES, GOAL_LABELS } from '@/lib/constants';

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

const fmt = (val) => `?${Math.round(val).toLocaleString('en-IN')}`;

function GoalCard({ goal, onChange, label, color }) {
  const handleField = (key, val) => onChange(key, val);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 4px 20px rgba(34,76,135,0.08)', padding: 20, flex: 1, minHeight: 420 }}>
      <p className="font-bold text-[14px] uppercase tracking-wider mb-4 border-b border-[#e2e6ed] pb-2" style={{ color }}>{label}</p>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {GOAL_TYPES.map((g) => {
            const parts = GOAL_LABELS[g].split(' ');
            const icon = parts[0];
            const text = parts.slice(1).join(' ');
            const selected = goal.type === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleField('type', g)}
                className="relative rounded-[12px] border px-2 py-3 text-[11px] font-[600] text-center"
                style={{
                  background: selected ? '#e8eef7' : '#ffffff',
                  border: selected ? '2px solid #224c87' : '1px solid #e2e6ed',
                  color: selected ? '#224c87' : '#919090',
                  minHeight: 72,
                }}
              >
                {selected && (
                  <span className="absolute top-1 right-1 text-[10px] bg-[#224c87] text-white rounded-full w-4 h-4 flex items-center justify-center">?</span>
                )}
                <div className="text-[18px] leading-none mb-1">{icon}</div>
                <div className="leading-tight">{text}</div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-500 font-medium">Current cost today</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-semibold">?</span>
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

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-500 font-medium">Inflation override</label>
          <input
            type="number"
            value={goal.inflation}
            onChange={(e) => handleField('inflation', Number(e.target.value))}
            className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[8px] px-[12px] text-[14px] font-semibold text-[#1a1a2e] outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-500 font-medium">Assumed return rate (%)</label>
          <input
            type="number"
            value={goal.annualRet}
            onChange={(e) => handleField('annualRet', Number(e.target.value))}
            className="w-full bg-slate-50 border border-[#e2e6ed] rounded-[10px] py-[8px] px-[12px] text-[14px] font-semibold text-[#1a1a2e] outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export default function GoalComparison() {
  const [goal1, setGoal1] = useState({ type: 'house', cost: 10000000, yrs: 10, inflation: 9, annualRet: 10 });
  const [goal2, setGoal2] = useState({ type: 'education', cost: '', yrs: 5, inflation: 11, annualRet: 10 });

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

  const g1SIP = g1Cost > 0 ? calcSIP(g1Cost, goal1.inflation, goal1.yrs, goal1.annualRet) : 0;
  const g2SIP = g2Cost > 0 ? calcSIP(g2Cost, goal2.inflation, goal2.yrs, goal2.annualRet) : 0;

  const g1TotalInv = g1SIP * goal1.yrs * 12;
  const g2TotalInv = g2SIP * goal2.yrs * 12;

  const showReport = g1Cost > 0 && g2Cost > 0;
  const g1Higher = g1SIP > g2SIP;

  const rows = [
    { label: 'Estimated SIP required', g1: g1SIP, g2: g2SIP, format: fmt },
    { label: 'Goal after inflation', g1: g1FV, g2: g2FV, format: fmt },
    { label: 'Time horizon', g1: goal1.yrs, g2: goal2.yrs, format: (v) => `${v} years` },
    { label: 'Total amount invested', g1: g1TotalInv, g2: g2TotalInv, format: fmt },
    { label: 'Estimated corpus', g1: g1FV, g2: g2FV, format: fmt },
  ];

  const chartData = [
    { metric: 'SIP Required', goal1: g1SIP, goal2: g2SIP },
    { metric: 'Total Invested', goal1: g1TotalInv, goal2: g2TotalInv },
    { metric: 'Estimated Corpus', goal1: g1FV, goal2: g2FV },
  ];

  const winnerType = g1Higher ? 'Goal 1' : 'Goal 2';
  const winnerSIP = g1Higher ? g1SIP : g2SIP;

  return (
    <div
      className="w-full mb-12 max-w-[1120px] mx-auto px-6"
      style={{
        backgroundImage: 'radial-gradient(rgba(34,76,135,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="mb-6 text-center">
        <div className="inline-flex items-center rounded-full bg-[#e8eef7] px-3 py-1 text-[11px] font-[700] tracking-[2px] text-[#224c87]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          COMPARE GOALS
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginTop: 10, marginBottom: 4, fontFamily: 'Montserrat, sans-serif' }}>
          Compare Two Goals
        </h2>
        <p style={{ fontSize: 14, color: '#919090', marginBottom: 16, fontFamily: 'Arial, sans-serif' }}>
          See which goal needs more estimated SIP investment
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-0">
        <GoalCard goal={goal1} onChange={(key, val) => handleChange(setGoal1, key, val)} label="GOAL 1" color="#224c87" />
        <GoalCard goal={goal2} onChange={(key, val) => handleChange(setGoal2, key, val)} label="GOAL 2" color="#da3832" />
      </div>

      {showReport && (
        <>
          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 4px 20px rgba(34,76,135,0.08)', padding: 20, marginTop: 24, borderLeft: '4px solid #224c87' }}>
            <div className="text-[14px] text-[#1a1a2e]">
              {winnerType} needs more attention ? estimated SIP {fmt(winnerSIP)} vs {fmt(g1Higher ? g2SIP : g1SIP)}.
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 4px 20px rgba(34,76,135,0.08)', padding: 24, marginTop: 16, overflow: 'hidden' }}>
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
                    const g1HigherRow = row.g1 > row.g2;
                    return (
                      <tr key={row.label} style={{ background: isAlt ? '#fafafa' : 'white', borderBottom: '1px solid #f1f3f6' }}>
                        <td className="px-4 py-3 font-medium text-gray-600">{row.label}</td>
                        <td className="px-4 py-3" style={g1HigherRow ? { background: '#e8eef7', fontWeight: 700 } : {}}>
                          {row.format(row.g1)}
                        </td>
                        <td className="px-4 py-3" style={!g1HigherRow ? { background: '#e8eef7', fontWeight: 700 } : {}}>
                          {row.format(row.g2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 4px 20px rgba(34,76,135,0.08)', padding: 20, marginTop: 16 }}>
            <p className="text-[14px] font-bold text-[#1a1a2e] mb-4">Estimated SIP Comparison</p>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#919090' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#919090' }} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="goal1" name="Goal 1" fill="#224c87" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="goal2" name="Goal 2" fill="#da3832" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 4px 20px rgba(34,76,135,0.08)', padding: 20, marginTop: 16 }}>
            <p className="text-[14px] font-medium text-[#1a1a2e]">
              Based on your inputs, {g1Higher ? `Goal 1 (${goal1.type}, ${goal1.yrs} years)` : `Goal 2 (${goal2.type}, ${goal2.yrs} years)`} may need earlier attention due to its shorter time horizon.
            </p>
            <p className="text-[11px] text-[#919090] mt-2">
              * All figures estimated and illustrative only. Assumptions may vary. Not financial advice.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="w-full border border-[#e2e6ed] text-[#224c87] rounded-full py-3 text-[14px] font-[600]">
              Compare Another Pair
            </button>
            <button className="w-full bg-[#224c87] text-white rounded-full py-3 text-[14px] font-[600]">
              Go to Goal Calculator
            </button>
          </div>
        </>
      )}
    </div>
  );
}
