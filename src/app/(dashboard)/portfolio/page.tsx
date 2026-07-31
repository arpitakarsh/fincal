'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, Search,
  Edit2, Trash2, X, AlertTriangle, ArrowUpDown, Loader2, CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { HoldingModal, type Holding } from '@/components/portfolio/HoldingModal';

// Types
interface Portfolio {
  id: string;
  totalInvested: number;
  currentValue: number;
  holdings: Holding[];
}

interface Analytics {
  totalInvested: number;
  currentValue: number;
  absoluteGainLoss: number;
  gainLossPercentage: number;
  assetAllocation: Record<string, number>;
  categoryAllocation: Record<string, number>;
  amcAllocation: Record<string, number>;
}

// Formatters
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Holding>('currentValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingPortfolio, setIsDeletingPortfolio] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const [portRes, analyticsRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/portfolio/analytics')
      ]);

      if (!portRes.ok && portRes.status !== 404) throw new Error('Failed to fetch portfolio');
      
      if (portRes.ok) {
        const portData = await portRes.json();
        setPortfolio(portData.data || null);
      } else {
        setPortfolio(null);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.data || null);
      } else {
        setAnalytics(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (field: keyof Holding) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };

  const filteredAndSortedHoldings = useMemo(() => {
    if (!portfolio?.holdings) return [];
    
    return portfolio.holdings
      .filter((h: any) => {
        const name = h.fundName || h.schemeCode || '';
        const amc = h.amc || h.amcName || '';
        const search = searchTerm.toLowerCase();
        return name.toLowerCase().includes(search) || amc.toLowerCase().includes(search);
      })
      .sort((a: any, b: any) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
  }, [portfolio, searchTerm, sortField, sortDirection]);

  const handleDeleteHolding = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/holdings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete holding');
      showToast('Holding deleted successfully', 'success');
      setDeleteConfirmId(null);
      fetchPortfolioData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete portfolio');
      showToast('Portfolio deleted successfully', 'success');
      setIsDeletingPortfolio(false);
      setPortfolio(null);
      setAnalytics(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl mt-6"></div>
      </div>
    );
  }

  const isGain = analytics ? analytics.absoluteGainLoss >= 0 : true;

  const renderDonutChart = (data: any, title: string) => {
    // Backend API was changed to return [{ name: string, value: number, percentage: number }]
    // instead of Record<string, number>. We need to handle both gracefully.
    const chartData = Array.isArray(data)
      ? data.map((d: any) => ({ name: d.name, value: d.value }))
      : Object.entries(data || {}).map(([name, value]) => ({ name, value: Number(value) }));

    if (chartData.length === 0) return null;

    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-72">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? '#3b82f6'} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => [formatCurrency(Number(value || 0)), 'Value']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
          {toast.message}
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
          {analytics && (
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.currentValue)}</span>
              <div className={`flex items-center px-2 py-1 rounded-md text-sm font-semibold ${
                isGain ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {isGain ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {isGain ? '+' : ''}{formatCurrency(analytics.absoluteGainLoss)} ({isGain ? '+' : ''}{analytics.gainLossPercentage.toFixed(2)}%)
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {portfolio && (
            <button 
              onClick={() => setIsDeletingPortfolio(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
            >
              Delete Portfolio
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Holding
          </button>
        </div>
      </div>

      {(!portfolio || portfolio.holdings.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Holdings Yet</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Start tracking your investments by adding your first mutual fund holding.
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add your first holding
          </button>
        </div>
      ) : (
        <>
          {/* Analytics Row */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderDonutChart(analytics.assetAllocation, 'Asset Allocation')}
              {renderDonutChart(analytics.categoryAllocation, 'Category Allocation')}
              {renderDonutChart(analytics.amcAllocation, 'AMC Allocation')}
            </div>
          )}

          {/* Holdings Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Holdings</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Search funds or AMCs..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('fundName')}>
                      <div className="flex items-center">Fund Name <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                    </th>
                    <th className="px-6 py-4">AMC & Category</th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('units')}>
                      <div className="flex items-center justify-end">Units <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('purchaseNav')}>
                      <div className="flex items-center justify-end">Avg NAV <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('currentValue')}>
                      <div className="flex items-center justify-end">Value <ArrowUpDown className="w-3 h-3 ml-1" /></div>
                    </th>
                    <th className="px-6 py-4 text-right">Gain/Loss</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedHoldings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No holdings found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedHoldings.map((h) => {
                      const gl = (h.currentValue ?? 0) - (h.investedValue ?? 0);
                      const glPct = (h.investedValue ?? 0) > 0 ? (gl / (h.investedValue ?? 0)) * 100 : 0;
                      const isRowGain = gl >= 0;

                      return (
                        <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{h.fundName}</div>
                            <div className="text-xs text-gray-500">Code: {h.schemeCode || 'Custom'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{h.amc}</div>
                            <div className="text-xs text-gray-500">{h.category}</div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">{h.units.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            <div>₹{(h.purchaseNav || h.averageNav || 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">
                              LTP: {h.navUnavailable ? <span className="text-red-500">Error</span> : `₹${(h.currentNav || h.liveNav || 0).toFixed(2)}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(h.currentValue ?? 0)}</div>
                            <div className="text-xs text-gray-500">Inv: {formatCurrency(h.investedAmount || h.investedValue || 0)}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className={`text-sm font-semibold ${isRowGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isRowGain ? '+' : ''}{formatCurrency(h.pnl || gl)}
                            </div>
                            <div className={`text-xs ${isRowGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isRowGain ? '+' : ''}{(h.pnlPercentage || glPct).toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {deleteConfirmId === h.id ? (
                              <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => handleDeleteHolding(h.id!)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Yes</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">No</button>
                              </div>
                            ) : (
                              <div className="flex justify-center space-x-3">
                                <button 
                                  onClick={() => setEditingHolding(h)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmId(h.id ?? null)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredAndSortedHoldings.map((h) => {
                const isRowGain = (h.pnl || 0) >= 0;

                return (
                  <div key={h.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{h.fundName}</h3>
                        <p className="text-xs text-gray-500">{h.amc} • {h.category}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Current Value</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(h.currentValue ?? 0)}</p>
                        <p className="text-xs text-gray-500">Inv: {formatCurrency(h.investedAmount ?? 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Gain/Loss</p>
                        <p className={`font-semibold ${isRowGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isRowGain ? '+' : ''}{formatCurrency(h.pnl ?? 0)}
                        </p>
                        <p className={`text-xs ${isRowGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ({isRowGain ? '+' : ''}{(h.pnlPercentage ?? 0).toFixed(2)}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <div className="text-xs text-gray-500">
                        Units: {h.units.toFixed(2)} @ ₹{(h.purchaseNav ?? 0).toFixed(2)}
                      </div>
                      <div className="flex space-x-2">
                        {deleteConfirmId === h.id ? (
                          <>
                            <button onClick={() => handleDeleteHolding(h.id!)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Yes</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">No</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingHolding(h)} className="p-1 text-gray-400 hover:text-blue-600">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(h.id ?? null)} className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Delete Portfolio Confirm Modal */}
      {isDeletingPortfolio && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Entire Portfolio?</h2>
            <p className="text-gray-500 mb-6 text-sm">
              This will permanently delete all your holdings and portfolio analytics. This action cannot be undone. Are you sure?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsDeletingPortfolio(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePortfolio}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Holding Modal Component rendered below */}
      {(isAddModalOpen || editingHolding) && (
        <HoldingModal 
          isOpen={true} 
          holding={editingHolding} 
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHolding(null);
          }} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            setEditingHolding(null);
            fetchPortfolioData();
            showToast(editingHolding ? 'Holding updated' : 'Holding added', 'success');
          }}
        />
      )}
    </div>
  );
}
