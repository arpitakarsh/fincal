'use client';

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

const COLORS = {
  conservative: '#64748b',
  moderate: '#224c87', // Primary Brand Blue
  aggressive: '#059669',
};

function buildData(scenarios, yrs) {
  return Array.from({ length: yrs }, (_, i) => {
    const yr = i + 1;
    const row = { year: `Yr ${yr}` };
    scenarios.forEach(s => {
      const r = (s.annualRet ?? s.ret) / 12 / 100;
      const n = yr * 12;
     
      const corpus = r === 0 ? s.sip * n : s.sip * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
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

export default function AreaChart({ scenarios, yrs, activeProfile, fv }) {
  if (!scenarios?.length) return null;

  const data = buildData(scenarios, yrs);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart data={data}>
          <defs>
            {scenarios.map(s => {
              const color = COLORS[s.id] || '#224c87';
              return (
                <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#919090' }} />
          <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: '#919090' }} width={60} />
          <Tooltip formatter={(val) => formatY(val)} />
          <Legend />

          {fv && (
            <ReferenceLine 
              y={fv} 
              stroke="#da3832" 
              strokeDasharray="3 3" 
              label={{ position: 'insideTopLeft', value: 'Target Goal', fill: '#da3832', fontSize: 11, fontWeight: 600 }} 
            />
          )}

          {scenarios.map(s => {
            const color = COLORS[s.id] || '#224c87';
            return (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.label}
                stroke={color}
                strokeWidth={activeProfile === s.id ? 3 : 1.5}
                fill={`url(#grad-${s.id})`}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            );
          })}
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}