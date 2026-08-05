import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { DashboardGoal } from '@/hooks/useDashboard';

interface GoalsPreviewProps {
  goals: DashboardGoal[];
}

export function GoalsPreview({ goals }: GoalsPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Your Goals</h2>
        <Link href="/goals" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {goals.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No active goals. <Link href="/goals" className="text-blue-600 hover:underline">Create one</Link>
          </div>
        ) : (
          goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                  <p className="text-xs text-gray-500">
                    Target: {goal.targetAmount ? formatCurrency(goal.targetAmount) : 'Not set'} • {goal.timeHorizonYears} Years
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {goal.investmentType === 'sip'
                      ? `SIP: ${formatCurrency(goal.sipAmount || 0)}`
                      : `Lumpsum: ${formatCurrency(goal.lumpsumAmount || 0)}`}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${goal.targetAmount ? Math.min(100, (((goal.investmentType === 'sip' ? goal.sipAmount : goal.lumpsumAmount) || 0) / goal.targetAmount) * 100) : 0}%`,
                  }}
                />
              </div>

              {goal.recommendations && goal.recommendations.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 flex items-start">
                  <Sparkles className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      {goal.recommendations[0]?.fundName}
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                        AI Pick
                      </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {goal.recommendations[0]?.reason || 'Recommended to match your risk profile and goal.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
