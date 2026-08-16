'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, TrendingUp, TrendingDown, BarChart3, AlertTriangle,
  CheckCircle2, Sparkles, Info, ShieldAlert, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { HoldingModal } from '@/components/portfolio/HoldingModal';
import type { FundDetails, FundInsights } from '@/backend/services/FundAnalyticsService';

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 4,
  }).format(v);

const fmtPct = (v: number, decimals = 2) =>
  `${v > 0 ? '+' : ''}${v.toFixed(decimals)}%`;

const fmtNum = (v: number, decimals = 2) => v.toFixed(decimals);

/** Returns true only when value is a finite number (0 is valid!) */
const isValid = (v: unknown): v is number =>
  typeof v === 'number' && isFinite(v);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  positive?: boolean;   // green
  negative?: boolean;   // red
  neutral?: boolean;    // blue-ish
  tooltip?: string;
}

function MetricCard({ label, value, positive, negative, neutral, tooltip }: MetricCardProps) {
  const valueClass =
    positive ? 'text-emerald-600'
    : negative ? 'text-rose-600'
    : neutral ? 'text-blue-700'
    : 'text-gray-900';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none">
          {label}
        </span>
        {tooltip && (
          <div className="group relative">
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 text-center">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <span className={`text-xl font-bold leading-none ${valueClass}`}>{value}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Suitability score visual gauge
function SuitabilityGauge({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 7.5 ? '#10b981'  // emerald
    : score >= 5 ? '#f59e0b'  // amber
    : '#ef4444';              // red

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-2xl font-bold text-gray-900">{score.toFixed(1)}</span>
          <span className="text-xs text-gray-500">/10</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600">
        {score >= 7.5 ? 'Highly Suitable' : score >= 5 ? 'Moderately Suitable' : 'Low Suitability'}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function FundDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [fund, setFund] = useState<FundDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [insights, setInsights] = useState<FundInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Fetch fund details ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFundDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/funds/${id}/details`);
        if (!res.ok) {
          if (res.status === 404) { router.push('/funds'); return; }
          throw new Error('Failed to fetch fund details');
        }
        const json = await res.json();
        setFund(json.data as FundDetails);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load fund details');
      } finally {
        setLoading(false);
      }
    };
    fetchFundDetails();
  }, [id, router]);

  // ── AI Insights ─────────────────────────────────────────────────────────────
  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      const res = await fetch(`/api/funds/${id}/insights`);
      if (res.status === 429) {
        const json = await res.json();
        setInsightsError(json.error || 'Rate limit exceeded. Try again later.');
        return;
      }
      if (!res.ok) throw new Error('Failed to generate insights');
      const json = await res.json();
      setInsights(json.data as FundInsights);
    } catch (e: unknown) {
      setInsightsError(e instanceof Error ? e.message : 'Failed to generate insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData =
    fund && fund.history && fund.history.length > 0
      ? [...fund.history].reverse().map((h) => ({ date: h.date, nav: h.nav }))
      : [];


  // ─────────────────────────────────────────────────────────────────────────
  // Loading / Error states
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
        {error || 'Failed to load fund details'}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Build metric groups — only include metrics that have valid values
  // ─────────────────────────────────────────────────────────────────────────
  const ret = fund.returns;
  const rsk = fund.risk;

  // Performance metrics (trailing returns + short-term)
  const performanceMetrics: MetricCardProps[] = [
    isValid(ret['1M']) && {
      label: '1M Return', value: fmtPct(ret['1M']!),
      positive: ret['1M']! > 0, negative: ret['1M']! < 0,
    },
    isValid(ret['3M']) && {
      label: '3M Return', value: fmtPct(ret['3M']!),
      positive: ret['3M']! > 0, negative: ret['3M']! < 0,
    },
    isValid(ret['6M']) && {
      label: '6M Return', value: fmtPct(ret['6M']!),
      positive: ret['6M']! > 0, negative: ret['6M']! < 0,
    },
    isValid(ret['1Y']) && {
      label: '1Y Return', value: fmtPct(ret['1Y']!),
      positive: ret['1Y']! > 0, negative: ret['1Y']! < 0,
    },
    isValid(ret['3Y']) && {
      label: '3Y CAGR', value: fmtPct(ret['3Y']!),
      positive: ret['3Y']! > 0, negative: ret['3Y']! < 0,
    },
    isValid(ret['5Y']) && {
      label: '5Y CAGR', value: fmtPct(ret['5Y']!),
      positive: ret['5Y']! > 0, negative: ret['5Y']! < 0,
    },
    isValid(ret['inception']) && {
      label: 'Since Inception', value: fmtPct(ret['inception']!),
      positive: ret['inception']! > 0, negative: ret['inception']! < 0,
      tooltip: 'CAGR since the fund\'s inception date',
    },
  ].filter(Boolean) as MetricCardProps[];

  // Risk metrics
  const riskMetrics: MetricCardProps[] = [
    isValid(rsk.volatility) && {
      label: 'Volatility (1Y Ann.)',
      value: fmtPct(rsk.volatility! * 100, 2),
      negative: rsk.volatility! * 100 > 20,
      neutral: rsk.volatility! * 100 <= 20,
      tooltip: 'Annualized standard deviation of daily returns. Lower = less volatile.',
    },
    isValid(rsk.sharpeRatio) && {
      label: 'Sharpe Ratio',
      value: fmtNum(rsk.sharpeRatio!),
      positive: rsk.sharpeRatio! >= 1,
      negative: rsk.sharpeRatio! < 0,
      neutral: rsk.sharpeRatio! >= 0 && rsk.sharpeRatio! < 1,
      tooltip: 'Risk-adjusted return (excess return / volatility). Higher is better (>1 is good).',
    },
    isValid(rsk.maxDrawdown) && {
      label: 'Max Drawdown',
      value: `-${fmtNum(rsk.maxDrawdown!, 2)}%`,
      negative: rsk.maxDrawdown! > 25,
      neutral: rsk.maxDrawdown! <= 25,
      tooltip: 'Largest peak-to-trough decline in NAV. Measures downside risk.',
    },
  ].filter(Boolean) as MetricCardProps[];

  const hasPerformance = performanceMetrics.length > 0;
  const hasRisk = riskMetrics.length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5" />
            : <AlertTriangle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/funds"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight break-words">
              {fund.fundName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 uppercase tracking-wider">
                {fund.category}
              </span>
              <span className="text-sm font-medium text-gray-500">{fund.amc}</span>
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">#{fund.schemeCode}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full md:w-auto justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* ── Current NAV hero card ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Current NAV</p>
            <h2 className="text-4xl font-bold tracking-tight">{fmtCurrency(fund.currentNav)}</h2>
            {fund.navDate && (
              <p className="text-blue-300 text-xs mt-2">As of {fund.navDate}</p>
            )}
          </div>
          {/* Quick 1Y return badge */}
          {isValid(ret['1Y']) && (
            <div className={`rounded-xl px-4 py-2 text-center ${ret['1Y']! >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <p className="text-blue-200 text-xs mb-0.5">1Y Return</p>
              <p className={`text-2xl font-bold ${ret['1Y']! >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {fmtPct(ret['1Y']!)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── NAV History Chart ────────────────────────────────────────────── */}
      {chartData.length > 0 && (
        <Section
          title={`Historical NAV — Last ${chartData.length} Days`}
          icon={<BarChart3 className="w-4 h-4 text-gray-400" />}
        >
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
                  tickFormatter={(v) => `₹${v}`}
                  dx={-10}
                  domain={['auto', 'auto']}
                />
                <RechartsTooltip
                  formatter={(value) => [fmtCurrency(Number(value || 0)), 'NAV']}
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
        </Section>
      )}

      {/* ── Performance Section ───────────────────────────────────────────── */}
      {hasPerformance && (
        <Section
          title="Performance"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
        >
          {fund.returnsUnavailable && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Insufficient historical data — some return periods may be unavailable.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {performanceMetrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Risk & Risk-Adjusted Section ─────────────────────────────────── */}
      {hasRisk && (
        <Section
          title="Risk Metrics"
          icon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {riskMetrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Risk metrics require at least 1 year of trading history. Calculated using daily NAV data.
            Risk-free rate assumed at 6.5% p.a.
          </p>
        </Section>
      )}

      {/* Show if no metrics at all */}
      {!hasPerformance && !hasRisk && !fund.returnsUnavailable && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 text-sm">
          <p className="font-semibold mb-1">Metrics Unavailable</p>
          <p>Not enough historical data to calculate performance or risk metrics for this fund.</p>
        </div>
      )}

      {/* ── AI Insights ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">AI Fund Insights</h2>
          </div>
          {!insights && (
            <button
              onClick={loadInsights}
              disabled={insightsLoading}
              className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors font-medium"
            >
              {insightsLoading ? 'Analyzing…' : 'Generate Insights'}
            </button>
          )}
          {insights && (
            <button
              onClick={loadInsights}
              disabled={insightsLoading}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Activity className="w-3 h-3" />
              {insightsLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
        </div>

        {/* Error */}
        {insightsError && (
          <div className="px-6 py-4 text-sm text-rose-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {insightsError}
          </div>
        )}

        {/* Empty state */}
        {!insights && !insightsLoading && !insightsError && (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Click &quot;Generate Insights&quot; to get an AI-powered analysis of this fund.
          </div>
        )}

        {/* Loading skeleton */}
        {insightsLoading && !insights && (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        )}

        {/* Insights content */}
        {insights && (
          <div className="p-6 space-y-6">
            {/* Analysis summary */}
            {insights.analysis && (
              <p className="text-gray-700 text-sm leading-relaxed">{insights.analysis}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pros */}
              {insights.pros && insights.pros.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {insights.pros.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {insights.cons && insights.cons.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                    <TrendingDown className="w-4 h-4 text-amber-500 mr-2" />
                    Risks & Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {insights.cons.map((w, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 mr-2 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Suitability Score — only when a valid numeric score is available */}
            {isValid(insights.suitabilityScore) && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">
                  Goal Suitability Score
                </h4>
                <div className="flex justify-center">
                  <SuitabilityGauge score={insights.suitabilityScore!} />
                </div>
                <p className="text-xs text-center text-gray-400 mt-3">
                  Based on your goal context and this fund&apos;s historical metrics.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Holding Modal ─────────────────────────────────────────────── */}
      <HoldingModal
        isOpen={isAddModalOpen}
        holding={null}
        prefilledFund={{ id: fund.schemeCode, name: fund.fundName, category: fund.category }}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          showToast('Holding added to portfolio', 'success');
        }}
      />
    </div>
  );
}
