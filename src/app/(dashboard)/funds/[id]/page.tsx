'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, TrendingUp, BarChart3, AlertTriangle, CheckCircle2, Sparkles 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { HoldingModal } from '@/components/portfolio/HoldingModal';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 4
  }).format(value);
};

export default function FundDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fund, setFund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchFundDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/funds/${id}/details`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/funds');
            return;
          }
          throw new Error('Failed to fetch fund details');
        }
        const json = await res.json();
        setFund(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFundDetails();
  }, [id, router]);

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await fetch(`/api/funds/${id}/insights`);
      if (res.ok) {
        const json = await res.json();
        setInsights(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const chartData = useMemo(() => {
    if (!fund?.history) return [];
    // MFAPI returns history in descending order (latest first), so reverse for chart
    return [...fund.history].reverse().map(h => ({
      date: h.date, // "DD-MM-YYYY"
      nav: h.nav
    }));
  }, [fund?.history]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-48 bg-gray-200 rounded-xl"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        {error || 'Failed to load fund details'}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-12">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <Link href="/funds" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {fund.fundName || fund.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 uppercase tracking-wider">
                {fund.category || 'N/A'}
              </span>
              <span className="text-sm font-medium text-gray-500">{fund.amc || 'Unknown AMC'}</span>
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">#{fund.schemeCode}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm w-full md:w-auto justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Portfolio
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* NAV Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 col-span-1 md:col-span-1">
          <p className="text-sm font-medium text-gray-500 mb-1">Current NAV</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(fund.currentNav || fund.nav || 0)}</h2>
          </div>
          {(fund.navDate || fund.date) && (
            <p className="text-xs text-gray-400 mt-2">As of {fund.navDate || fund.date}</p>
          )}
        </div>

        {/* Metrics Cards */}
        {fund.returns && (
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>1Y Return</span>
              </div>
              <h3 className={`text-2xl font-bold ${fund.returns['1Y'] >= 0 ? 'text-emerald-600' : fund.returns['1Y'] < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                {fund.returns['1Y'] !== null && fund.returns['1Y'] !== undefined && !isNaN(fund.returns['1Y']) ? `${fund.returns['1Y'] > 0 ? '+' : ''}${fund.returns['1Y'].toFixed(2)}%` : 'N/A'}
              </h3>
            </div>
            
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>3Y Return (CAGR)</span>
              </div>
              <h3 className={`text-2xl font-bold ${fund.returns['3Y'] >= 0 ? 'text-emerald-600' : fund.returns['3Y'] < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                {fund.returns['3Y'] !== null && fund.returns['3Y'] !== undefined && !isNaN(fund.returns['3Y']) ? `${fund.returns['3Y'] > 0 ? '+' : ''}${fund.returns['3Y'].toFixed(2)}%` : 'N/A'}
              </h3>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col justify-center">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>5Y Return (CAGR)</span>
              </div>
              <h3 className={`text-2xl font-bold ${fund.returns['5Y'] >= 0 ? 'text-emerald-600' : fund.returns['5Y'] < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                {fund.returns['5Y'] !== null && fund.returns['5Y'] !== undefined && !isNaN(fund.returns['5Y']) ? `${fund.returns['5Y'] > 0 ? '+' : ''}${fund.returns['5Y'].toFixed(2)}%` : 'N/A'}
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Historical NAV (Last 100 Days)</h2>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#9ca3af' }} 
                  dy={10} 
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `₹${value}`}
                  dx={-10}
                  domain={['auto', 'auto']}
                />
                <RechartsTooltip 
                  formatter={(value) => [formatCurrency(Number(value || 0)), 'NAV']}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nav" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">AI Fund Insights</h2>
          </div>
          {!insights && (
            <button 
              onClick={loadInsights}
              disabled={insightsLoading}
              className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {insightsLoading ? 'Analyzing...' : 'Generate Insights'}
            </button>
          )}
        </div>
        
        {insights && (
          <div className="p-6">
            <p className="text-gray-700 mb-6">{insights.analysis}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                  Pros
                </h4>
                <ul className="space-y-2">
                  {insights.pros?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                  Cons
                </h4>
                <ul className="space-y-2">
                  {insights.cons?.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 mr-2 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Fund suitability score:</span>
              <span className="text-lg font-bold text-indigo-700">{insights.suitabilityScore}/10</span>
            </div>
          </div>
        )}
      </div>


      {/* Add Holding Modal Component */}
      <HoldingModal 
        isOpen={isAddModalOpen} 
        holding={null} 
        prefilledFund={{ id: fund.schemeCode, name: fund.name, category: fund.category }}
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          showToast('Holding added to portfolio', 'success');
        }}
      />
    </div>
  );
}
