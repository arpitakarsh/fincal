import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { COLORS } from '@/lib/constants';
import { formatLakh } from '@/lib/utils';

export default function StackedBarChart({ yearByYearData }) {
  if (!yearByYearData || yearByYearData.length === 0) return null;

  const chartData = yearByYearData.map((row) => ({
    year: `Y${row.year}`,
    Invested: row.invested,
    Returns: row.returns,
  }));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Year-by-Year Growth
      </span>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: COLORS.grey }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatLakh(v)}
            tick={{ fontSize: 11, fill: COLORS.grey }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(value, name) => [formatLakh(value), name]}
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
          <Bar dataKey="Invested" stackId="a" fill={COLORS.blue} radius={[0, 0, 4, 4]} />
          <Bar dataKey="Returns" stackId="a" fill={COLORS.green} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}