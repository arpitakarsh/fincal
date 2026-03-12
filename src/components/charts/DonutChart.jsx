import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '@/lib/constants';
import { formatLakh } from '@/lib/utils';

export default function DonutChart({ totalInvested, totalReturns }) {
  const total = totalInvested + totalReturns;
  const multiple = totalInvested > 0 ? total / totalInvested : 0;

  const data = [
    { name: 'Invested', value: totalInvested },
    { name: 'Returns', value: totalReturns },
  ];

  const PIE_COLORS = [COLORS.blue, COLORS.green];

  const renderCustomLabel = () => (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.2em" fontSize={11} fill={COLORS.grey} fontFamily="Arial, sans-serif">
        Total Corpus
      </tspan>
      <tspan x="50%" dy="1.1em" fontSize={14} fontWeight={700} fill="#1a1a2e" fontFamily="Montserrat, sans-serif">
        {formatLakh(total)}
      </tspan>
      {multiple > 0 && (
        <tspan x="50%" dy="1.4em" fontSize={10} fill={COLORS.grey} fontFamily="Arial, sans-serif">
          {multiple.toFixed(1)}x growth
        </tspan>
      )}
    </text>
  );

  return (
    <div className="w-full h-full rounded-[16px] border border-[#e2e6ed] bg-white p-4" style={{ boxShadow: '0 8px 32px rgba(34,76,135,0.12)' }}>
      <div className="text-[13px] font-semibold text-[#1a1a2e] mb-2">Corpus Breakdown</div>
      <div style={{ width: '100%', height: 'calc(100% - 56px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
            <Pie
              data={data}
              cx="50%"
              cy="48%"
              innerRadius="58%"
              outerRadius="88%"
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
      <div className="h-px w-full bg-[#e2e6ed] my-2"></div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
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
