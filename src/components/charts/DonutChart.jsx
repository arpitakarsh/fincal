import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '@/lib/constants';
import { formatLakh } from '@/lib/utils';

export default function DonutChart({ totalInvested, totalReturns }) {
  const total = totalInvested + totalReturns;

  const data = [
    { name: 'Invested', value: totalInvested },
    { name: 'Returns', value: totalReturns },
  ];

  const PIE_COLORS = [COLORS.blue, COLORS.green];

  const renderCustomLabel = () => (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.4em" fontSize={13} fill={COLORS.grey} fontFamily="Arial, sans-serif">
        Total Corpus
      </tspan>
      <tspan x="50%" dy="1.4em" fontSize={16} fontWeight={700} fill="#1a1a2e" fontFamily="Montserrat, sans-serif">
        {formatLakh(total)}
      </tspan>
    </text>
  );

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div style={{ width: 400, height: 240, maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index]} />
              ))}
            </Pie>
            {renderCustomLabel()}
            <Tooltip
              formatter={(value, name) => [formatLakh(value), name]}
              contentStyle={{
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#919090' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i] }} />
            {d.name}: {formatLakh(d.value)}
          </div>
        ))}
      </div>
    </div>
  );
}