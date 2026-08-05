import { TrendingUp, TrendingDown, Wallet, Target, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { DashboardData } from '@/hooks/useDashboard';

interface SummaryCardsProps {
  portfolio: DashboardData['portfolio'];
  goalsTotal: number;
}

export function SummaryCards({ portfolio, goalsTotal }: SummaryCardsProps) {
  const isGain = portfolio.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-500">Total Portfolio</p>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          {formatCurrency(portfolio.totalValue)}
        </h3>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-500">Overall Gain/Loss</p>
          <div className={`p-2 rounded-lg ${isGain ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <h3 className={`text-2xl font-bold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isGain ? '+' : ''}{formatCurrency(portfolio.totalGainLoss)}
          </h3>
          <span className={`text-sm font-medium ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
            ({isGain ? '+' : ''}{portfolio.totalGainLossPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-500">Active Holdings</p>
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          {portfolio.holdingsCount}
        </h3>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-500">Active Goals</p>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          {goalsTotal}
        </h3>
      </div>
    </div>
  );
}
