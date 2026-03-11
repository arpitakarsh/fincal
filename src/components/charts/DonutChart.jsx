import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      <tspan
        x="50%"
        dy="-0.4em"
        fontSize={13}
        fill={COLORS.grey}
        fontFamily="Arial, sans-serif"
      >
        Total Corpus
      </tspan>
      <tspan
        x="50%"
        dy="1.4em"
        fontSize={16}
        fontWeight={700}
        fill={COLORS.text}
        fontFamily="Montserrat, sans-serif"
      >
        {formatLakh(total)}
      </tspan>
    </text>
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Corpus Breakdown
      </span>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="75%"
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
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: COLORS.text }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}