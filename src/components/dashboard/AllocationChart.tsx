'use client';

import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

interface AllocationChartProps {
  assetAllocation: Record<string, number>;
}

export function AllocationChart({ assetAllocation }: AllocationChartProps) {
  const pieData = Object.entries(assetAllocation || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Asset Allocation</h2>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {pieData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 text-center">
            Add holdings to see your portfolio allocation.
          </div>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? '#3b82f6'} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`${Number(value || 0).toFixed(2)}%`, 'Allocation']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{entry.value.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-auto pt-6">
          <Link
            href="/portfolio"
            className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View full portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
