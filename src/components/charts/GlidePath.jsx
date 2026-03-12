import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { COLORS } from '@/lib/constants';

export default function GlidePath({ years }) {
  if (!years || years <= 5) return null;

  const data = Array.from({ length: years }, (_, i) => {
    const year = i + 1;
    const equity = Math.max(80 - Math.floor((year - 1) / 2) * 5, 20);
    const debt = 100 - equity;
    return { year: `Y${year}`, Equity: equity, Debt: debt };
  });

  return (
    <div className="w-full h-full flex flex-col justify-end">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,76,135,0.12)" />
              <stop offset="100%" stopColor="rgba(34,76,135,0)" />
            </linearGradient>
            <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.grey} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.grey} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: COLORS.grey }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: COLORS.grey }}
            axisLine={false}
            tickLine={false}
            width={36}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: COLORS.text }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="Equity"
            stackId="1"
            stroke={COLORS.blue}
            strokeWidth={2}
            fill="url(#equityGrad)"
          />
          <Area
            type="monotone"
            dataKey="Debt"
            stackId="1"
            stroke={COLORS.grey}
            strokeWidth={2}
            fill="url(#debtGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
