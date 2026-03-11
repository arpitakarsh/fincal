import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function StepUpBarChart({ stepUpData }) {
  if (!stepUpData || stepUpData.length === 0) return null;

  const chartData = stepUpData.map((row) => ({
    year: `Y${row.year}`,
    SIP: row.sipAmount,
  }));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Step-up SIP Growth
      </span>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: COLORS.grey }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 11, fill: COLORS.grey }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value), 'Monthly SIP']}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
            }}
          />
          <Bar dataKey="SIP" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}