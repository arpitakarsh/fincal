'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Plus, Search,
  Edit2, Trash2, AlertTriangle, ArrowUpDown, CheckCircle2,
  BarChart2, PieChart as PieChartIcon, Layers
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { HoldingModal } from '@/components/portfolio/HoldingModal';
import type { EnrichedHolding, PortfolioSummary } from '@/backend/services/PortfolioService';

// ─────────────────────────────────────────────────────────────────────────────
// Types — derived from actual PortfolioSummary returned by /api/portfolio
// ─────────────────────────────────────────────────────────────────────────────

type AllocationEntry = { name: string; value: number; percentage: number };

// The /api/portfolio route returns PortfolioSummary exactly.
// Holdings come back as EnrichedHolding objects.
// We alias PortfolioSummary so the component is typed against the real shape.
type Portfolio = PortfolioSummary;

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v);

const fmtCurrencyFull = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2,
  }).format(v);

const fmtPct = (v: number, sign = true) =>
  `${sign && v > 0 ? '+' : ''}${v.toFixed(2)}%`;

const fmtUnits = (v: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(v);

const isPos = (v: number) => v > 0;
const isNeg = (v: number) => v < 0;

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#64748b', '#f97316',
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, positive, negative,
}: {
  label: string; value: string; sub?: string;
  positive?: boolean; negative?: boolean;
}) {
  const valueClass = positive ? 'text-emerald-700' : negative ? 'text-rose-700' : 'text-gray-900';
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className={`text-sm mt-0.5 ${positive ? 'text-emerald-600' : negative ? 'text-rose-600' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  );
}

interface AllocationChartProps {
  title: string;
  icon: React.ReactNode;
  data: AllocationEntry[];
  totalValue: number;
}

function AllocationChart({ title, icon, data, totalValue }: AllocationChartProps) {
  if (data.length === 0) return null;

  // Single-item case — skip the donut and show a clean 100% bar
  if (data.length === 1) {
    const item = data[0]!;
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">{item.name}</span>
            <span className="text-sm font-bold text-blue-700">100%</span>
          </div>
          <div className="h-2 w-full bg-blue-100 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full w-full" />
          </div>
          <p className="text-xs text-gray-500">{fmtCurrency(item.value)}</p>
        </div>
      </div>
    );
  }

// Custom tooltip at module level — accepts Recharts' generic TooltipProps
function renderAllocationTooltip(props: { active?: boolean; payload?: readonly { payload: AllocationEntry }[] }) {
  if (!props.active || !props.payload?.length) return null;
  const d = props.payload[0]!.payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-700">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(d.value)}</p>
      <p className="text-gray-500">{d.percentage.toFixed(1)}% of portfolio</p>
    </div>
  );
}

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="45%"
              innerRadius={52} outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length] ?? '#3b82f6'} />
              ))}
            </Pie>
            <RechartsTooltip content={(p) => renderAllocationTooltip(p as Parameters<typeof renderAllocationTooltip>[0])} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry: any) => (
                <span className="text-xs text-gray-700">
                  {value} ({entry.payload?.percentage?.toFixed(1)}%)
                </span>
              )}
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Sort column header
function SortTh({
  label, field, currentField, direction, onSort, right,
}: {
  label: string; field: string; currentField: string;
  direction: 'asc' | 'desc'; onSort: (f: string) => void; right?: boolean;
}) {
  const active = field === currentField;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors select-none ${right ? 'text-right' : ''}`}
      onClick={() => onSort(field)}
    >
      <span className={`inline-flex items-center gap-1 ${right ? 'justify-end w-full' : ''}`}>
        {label}
        <ArrowUpDown className={`w-3 h-3 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
      </span>
    </th>
  );
}

// P&L display — handles zero correctly with explicit null check
function PnlDisplay({
  pnl, pnlPct, size = 'sm',
}: {
  pnl: number; pnlPct: number; size?: 'sm' | 'lg';
}) {
  // pnl === 0 is valid and should display green with +₹0
  const cls = pnl < 0 ? 'text-rose-600' : 'text-emerald-600';
  const sign = pnl > 0 ? '+' : pnl < 0 ? '' : '+'; // show + for zero
  return (
    <div>
      <div className={`${size === 'lg' ? 'text-xl' : 'text-sm'} font-semibold ${cls}`}>
        {sign}{fmtCurrency(pnl)}
      </div>
      <div className={`${size === 'sm' ? 'text-xs' : 'text-sm'} ${cls}`}>
        {sign}{pnlPct.toFixed(2)}%
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

type SortField = keyof Pick<EnrichedHolding,
  'fundName' | 'units' | 'purchaseNav' | 'currentNav' |
  'investedAmount' | 'currentValue' | 'pnl' | 'pnlPercentage'
>;

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<EnrichedHolding | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Data fetch — single endpoint: /api/portfolio returns all data ────────
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/portfolio');
      if (!res.ok) {
        if (res.status === 404) { setPortfolio(null); return; }
        throw new Error(`HTTP ${res.status} — failed to fetch portfolio`);
      }
      const json = await res.json();
      // data is PortfolioSummary or null
      setPortfolio(json.data ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/portfolio');
        if (!alive) return;
        if (!res.ok) {
          if (res.status === 404) { setPortfolio(null); }
          else throw new Error(`HTTP ${res.status}`);
        } else {
          const json = await res.json();
          setPortfolio(json.data ?? null);
        }
      } catch (e: unknown) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (field: string) => {
    const f = field as SortField;
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('desc'); }
  };

  // ── Filtered + sorted holdings ───────────────────────────────────────────
  const filteredHoldings: EnrichedHolding[] = (portfolio?.holdings ?? [])
    .filter(h => {
      const q = searchTerm.toLowerCase();
      return (
        (h.fundName ?? '').toLowerCase().includes(q) ||
        (h.amc ?? '').toLowerCase().includes(q) ||
        (h.category ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return 0;
    });

  // ── Delete holding ───────────────────────────────────────────────────────
  const handleDeleteHolding = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/holdings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete holding');
      showToast('Holding removed from portfolio', 'success');
      setDeleteConfirmId(null);
      fetchPortfolio();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  // ── Delete entire portfolio ──────────────────────────────────────────────
  const handleDeletePortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete portfolio');
      showToast('Portfolio deleted', 'success');
      setDeletingPortfolio(false);
      setPortfolio(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Error state
  // ────────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-8 rounded-xl border border-red-100 flex flex-col items-center text-center">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-400" />
        <p className="font-semibold text-red-900 text-lg mb-1">Unable to load portfolio</p>
        <p className="text-sm text-red-600 mb-5">{error}</p>
        <button
          onClick={fetchPortfolio}
          className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Empty portfolio — zero holdings
  // ────────────────────────────────────────────────────────────────────────
  const isEmpty = !portfolio || portfolio.holdings.length === 0;

  // Derived totals — from backend, not recalculated in React
  const totalInvested    = portfolio?.totalInvested    ?? 0;
  const totalCurrentVal  = portfolio?.totalCurrentValue ?? 0;
  const totalPnl         = portfolio?.totalPnl          ?? 0;
  const totalPnlPct      = portfolio?.totalPnlPercentage ?? 0;
  const holdingsCount    = portfolio?.holdingsCount     ?? 0;

  // Allocation arrays (always arrays from the API)
  const assetAlloc    = portfolio?.assetAllocation    ?? [];
  const categoryAlloc = portfolio?.categoryAllocation ?? [];
  const amcAlloc      = portfolio?.amcAllocation      ?? [];

  // Derived simple metrics
  const uniqueCategories = new Set(portfolio?.holdings.map(h => h.category)).size;
  const uniqueAmcs       = new Set(portfolio?.holdings.map(h => h.amc)).size;

  return (
    <div className="space-y-6 pb-12 relative">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4" />
            : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
          {!isEmpty && portfolio && (
            <p className="text-sm text-gray-500 mt-0.5">
              {holdingsCount} {holdingsCount === 1 ? 'holding' : 'holdings'}
              {uniqueAmcs > 0 && ` · ${uniqueAmcs} AMC${uniqueAmcs > 1 ? 's' : ''}`}
              {uniqueCategories > 0 && ` · ${uniqueCategories} categor${uniqueCategories > 1 ? 'ies' : 'y'}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {portfolio && !isEmpty && (
            <button
              onClick={() => setDeletingPortfolio(true)}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Delete Portfolio
            </button>
          )}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Holding
          </button>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Wallet className="w-14 h-14 text-gray-200 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your portfolio is empty</h2>
          <p className="text-gray-500 mb-7 max-w-sm mx-auto text-sm leading-relaxed">
            Start building your portfolio by adding your first mutual fund holding.
            Track your investments, NAV, and returns all in one place.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm gap-2"
          >
            <Plus className="w-5 h-5" />
            Add your first holding
          </button>
        </div>
      ) : (
        <>
          {/* ── Portfolio Summary Metrics ──────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Current Value"
              value={fmtCurrency(totalCurrentVal)}
            />
            <SummaryCard
              label="Total Invested"
              value={fmtCurrency(totalInvested)}
            />
            <SummaryCard
              label="Total Gain / Loss"
              value={`${totalPnl >= 0 ? '+' : ''}${fmtCurrency(totalPnl)}`}
              sub={fmtPct(totalPnlPct)}
              positive={totalPnl >= 0 && totalInvested > 0}
              negative={totalPnl < 0}
            />
            <SummaryCard
              label="Overall Return"
              value={fmtPct(totalPnlPct)}
              positive={totalPnlPct > 0}
              negative={totalPnlPct < 0}
            />
          </div>

          {/* ── Allocation Charts ──────────────────────────────────────────── */}
          {(assetAlloc.length > 0 || categoryAlloc.length > 0 || amcAlloc.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AllocationChart
                title="Asset Class"
                icon={<BarChart2 className="w-4 h-4 text-blue-500" />}
                data={assetAlloc}
                totalValue={totalCurrentVal}
              />
              <AllocationChart
                title="Category"
                icon={<Layers className="w-4 h-4 text-indigo-500" />}
                data={categoryAlloc}
                totalValue={totalCurrentVal}
              />
              <AllocationChart
                title="AMC"
                icon={<PieChartIcon className="w-4 h-4 text-purple-500" />}
                data={amcAlloc}
                totalValue={totalCurrentVal}
              />
            </div>
          )}

          {/* ── Holdings Table ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Holdings</h2>
                {searchTerm && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {filteredHoldings.length} of {holdingsCount} matching &quot;{searchTerm}&quot;
                  </p>
                )}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search fund, AMC, or category…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredHoldings.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No holdings match your search.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 text-sm mt-2 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <SortTh label="Fund" field="fundName" currentField={sortField} direction={sortDir} onSort={handleSort} />
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">AMC / Category</th>
                        <SortTh label="Units" field="units" currentField={sortField} direction={sortDir} onSort={handleSort} right />
                        <SortTh label="Avg Purchase NAV" field="purchaseNav" currentField={sortField} direction={sortDir} onSort={handleSort} right />
                        <SortTh label="Current NAV" field="currentNav" currentField={sortField} direction={sortDir} onSort={handleSort} right />
                        <SortTh label="Invested" field="investedAmount" currentField={sortField} direction={sortDir} onSort={handleSort} right />
                        <SortTh label="Current Value" field="currentValue" currentField={sortField} direction={sortDir} onSort={handleSort} right />
                        <SortTh label="Gain / Loss" field="pnl" currentField={sortField} direction={sortDir} onSort={handleSort} right />
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredHoldings.map(h => (
                        <tr key={h.id} className="hover:bg-gray-50/70 transition-colors">
                          {/* Fund Name */}
                          <td className="px-4 py-4 max-w-[220px]">
                            <div className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                              {h.fundName ?? h.schemeCode ?? '—'}
                            </div>
                            {h.schemeCode && (
                              <div className="text-xs text-gray-400 font-mono mt-0.5">#{h.schemeCode}</div>
                            )}
                          </td>

                          {/* AMC / Category */}
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-700">{h.amc}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                                {h.category}
                              </span>
                            </div>
                          </td>

                          {/* Units */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm text-gray-900">{fmtUnits(h.units)}</span>
                          </td>

                          {/* Avg Purchase NAV */}
                          <td className="px-4 py-4 text-right">
                            <div className="text-sm text-gray-900">{fmtCurrencyFull(h.purchaseNav)}</div>
                          </td>

                          {/* Current NAV */}
                          <td className="px-4 py-4 text-right">
                            {h.navUnavailable ? (
                              <div className="text-xs text-amber-600 flex items-center justify-end gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                NAV unavailable
                              </div>
                            ) : (
                              <>
                                <div className="text-sm text-gray-900">{fmtCurrencyFull(h.currentNav)}</div>
                                {h.navDate && (
                                  <div className="text-xs text-gray-400 mt-0.5">as of {h.navDate}</div>
                                )}
                              </>
                            )}
                          </td>

                          {/* Invested */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm text-gray-900">{fmtCurrency(h.investedAmount)}</span>
                          </td>

                          {/* Current Value */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-semibold text-gray-900">{fmtCurrency(h.currentValue)}</span>
                          </td>

                          {/* Gain / Loss — backend values, no re-calculation */}
                          <td className="px-4 py-4 text-right">
                            <PnlDisplay pnl={h.pnl} pnlPct={h.pnlPercentage} />
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            {deleteConfirmId === h.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleDeleteHolding(h.id)}
                                  className="text-xs px-2.5 py-1 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                                  title="Confirm delete"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                                  title="Cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditingHolding(h)}
                                  title="Edit holding"
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  aria-label={`Edit ${h.fundName}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(h.id)}
                                  title="Delete holding"
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  aria-label={`Delete ${h.fundName}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {filteredHoldings.map(h => (
                    <div key={h.id} className="p-4 space-y-3">
                      {/* Fund name + actions */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 leading-snug">
                            {h.fundName ?? h.schemeCode ?? '—'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{h.amc} · {h.category}</p>
                        </div>

                        {deleteConfirmId === h.id ? (
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleDeleteHolding(h.id)}
                              className="text-xs px-2 py-1 bg-red-600 text-white rounded-md font-medium"
                            >Delete</button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium"
                            >Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingHolding(h)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"
                              aria-label="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(h.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Value grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Current Value</p>
                          <p className="font-semibold text-gray-900">{fmtCurrency(h.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Invested</p>
                          <p className="text-gray-900">{fmtCurrency(h.investedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gain / Loss</p>
                          <PnlDisplay pnl={h.pnl} pnlPct={h.pnlPercentage} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Units</p>
                          <p className="text-gray-900">{fmtUnits(h.units)}</p>
                        </div>
                      </div>

                      {/* NAV row */}
                      <div className="flex gap-4 pt-1 border-t border-gray-50 text-xs text-gray-500">
                        <div>
                          <span className="text-gray-400">Avg Purchase NAV </span>
                          <span className="text-gray-700 font-medium">{fmtCurrencyFull(h.purchaseNav)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Current NAV </span>
                          {h.navUnavailable ? (
                            <span className="text-amber-600">unavailable</span>
                          ) : (
                            <span className="text-gray-700 font-medium">{fmtCurrencyFull(h.currentNav)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Delete Portfolio Modal ─────────────────────────────────────────── */}
      {deletingPortfolio && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delete Entire Portfolio?</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6 ml-13 leading-relaxed">
              This will permanently delete all {holdingsCount} holding{holdingsCount !== 1 ? 's' : ''} and all portfolio data.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingPortfolio(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePortfolio}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, delete portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Holding Modal ───────────────────────────────────────── */}
      {(isAddOpen || editingHolding !== null) && (
        <HoldingModal
          isOpen={true}
          holding={editingHolding
            ? {
                id: editingHolding.id,
                schemeCode: editingHolding.schemeCode ?? '',
                fundName: editingHolding.fundName ?? '',
                amc: editingHolding.amc,
                category: editingHolding.category,
                units: editingHolding.units,
                purchaseNav: editingHolding.purchaseNav,
                averageNav: editingHolding.purchaseNav,
                investedValue: editingHolding.investedAmount,
                currentValue: editingHolding.currentValue,
                currentNav: editingHolding.currentNav,
                pnl: editingHolding.pnl,
                pnlPercentage: editingHolding.pnlPercentage,
                navUnavailable: editingHolding.navUnavailable,
              }
            : null
          }
          onClose={() => { setIsAddOpen(false); setEditingHolding(null); }}
          onSuccess={() => {
            const isEdit = editingHolding !== null;
            setIsAddOpen(false);
            setEditingHolding(null);
            fetchPortfolio();
            showToast(isEdit ? 'Holding updated' : 'Holding added to portfolio', 'success');
          }}
        />
      )}
    </div>
  );
}
