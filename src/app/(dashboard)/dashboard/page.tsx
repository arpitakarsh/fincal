'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Activity, 
  Sparkles,
  ChevronRight,
  PlusCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';

interface DashboardData {
  user: { name: string; email: string };
  profileCompleted: boolean;
  goals: {
    total: number;
    upcoming: any;
    list: any[];
  };
  portfolio: {
    totalValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
    holdingsCount: number;
    assetAllocation: Record<string, number>;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const json = await res.json();
        // API now returns { success, data: { user, profileCompleted, goals, portfolio } }
        setData(json.data || json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);


  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const { user, profileCompleted, goals, portfolio } = data;
  const isGain = portfolio.totalGainLoss >= 0;

  const pieData = Object.entries(portfolio.assetAllocation || {}).map(([name, value]) => ({
    name,
    value
  }));

  const hasNoData = portfolio.holdingsCount === 0 && goals.total === 0;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Investor'}
          </h1>
          <p className="text-gray-500 mt-1">Here's your financial overview for today.</p>
        </div>
        
        {!profileCompleted && (
          <Link 
            href="/onboarding"
            className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Complete your investor profile</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {hasNoData ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to FinCal</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You don't have any portfolio holdings or active goals yet. Let's get started on your financial journey.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/goals"
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create a Goal
            </Link>
            <Link 
              href="/portfolio/holdings/create"
              className="flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Holding
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Portfolio Summary Strip */}
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
                {goals.total}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goals Preview (Left Column) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Goals Preview */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Your Goals</h2>
                  <Link href="/goals" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {goals.list.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No active goals. <Link href="/goals" className="text-blue-600 hover:underline">Create one</Link>
                    </div>
                  ) : (
                    goals.list.slice(0, 3).map((goal) => (
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
                              {goal.investmentType === 'sip' ? `SIP: ${formatCurrency(goal.sipAmount || 0)}` : `Lumpsum: ${formatCurrency(goal.lumpsumAmount || 0)}`}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${goal.targetAmount ? Math.min(100, ((goal.lumpsumAmount || 0) / goal.targetAmount) * 100) : 0}%` }}
                          />
                        </div>
                        
                        {/* Top AI Rec */}
                        {goal.recommendations && goal.recommendations.length > 0 && (
                          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 flex items-start">
                            <Sparkles className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                {goal.recommendations[0].fundName}
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                                  AI Pick
                                </span>
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                {goal.recommendations[0].reason || 'Recommended to match your risk profile and goal.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Portfolio Analytics (Right Column) */}
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
          </div>
        </>
      )}
    </div>
  );
}
