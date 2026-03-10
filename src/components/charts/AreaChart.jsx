'use client';

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SCENARIOS = [
  { id: 'conservative', label: 'Conservative', color: '#64748b' },
  { id: 'moderate',     label: 'Moderate',     color: '#224c87' },
  { id: 'aggressive',  label: 'Aggressive',   color: '#059669' },
];

function buildData(scenarios, yrs) {
  return Array.from({ length: yrs }, (_, i) => {
    const yr = i + 1;
    const row = { year: `Yr ${yr}` };
    scenarios.forEach(s => {
      const r = s.annualRet / 12 / 100;
      const n = yr * 12;
      const corpus = s.sip * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
      row[s.id] = Math.round(corpus);
    });
    return row;
  });
}

function formatY(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000)   return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val}`;
}

export default function AreaChart({ scenarios, yrs, activeProfile }) {
  if (!scenarios?.length) return null;

  const data = buildData(scenarios, yrs);

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #e2e6ed' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>
        Corpus Growth Over Time
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ReAreaChart data={data}>
          <defs>
            {SCENARIOS.map(s => (
              <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#919090' }} />
          <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: '#919090' }} width={60} />
          <Tooltip formatter={(val) => formatY(val)} />
          <Legend />

          {SCENARIOS.map(s => (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              name={s.label}
              stroke={s.color}
              strokeWidth={activeProfile === s.id || s.id === 'moderate' ? 3 : 1.5}
              fill={`url(#grad-${s.id})`}
            />
          ))}
        </ReAreaChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 11, color: '#919090', marginTop: 8 }}>* Illustrative only. Assumes constant monthly SIP.</p>
    </div>
  );
}