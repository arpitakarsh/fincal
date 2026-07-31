'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Target, Home, GraduationCap, Car, Plane, Heart, Briefcase, 
  ArrowLeft, Edit2, Trash2, CheckCircle2, AlertTriangle, Sparkles, 
  RefreshCw, TrendingUp, TrendingDown, ArrowRight, X, Loader2, Info
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { HoldingModal } from '@/components/portfolio/HoldingModal';

interface Goal {
  id: string;
  name?: string;
  investmentType: 'sip' | 'lumpsum';
  lumpsumAmount?: number;
  sipAmount?: number;
  targetAmount: number;
  timeHorizonYears: number;
  isFlexibleHorizon: boolean;
  goalType: string;
  riskAppetite: string;
  age: number;
  additionalNotes?: string;
  createdAt: string;
}

interface AIRecommendation {
  id: string;
  schemeCode: string;
  fundName: string;
  category: string;
  reason?: string;
  rationale?: string;
  score: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const getGoalIcon = (type: string | undefined) => {
  if (!type) return Target;
  switch (type.toLowerCase()) {
    case 'house': return Home;
    case 'education': return GraduationCap;
    case 'vehicle': return Car;
    case 'travel': return Plane;
    case 'marriage': return Heart;
    case 'retirement': return Briefcase;
    default: return Target;
  }
};

export default function GoalDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[] | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilledFund, setPrefilledFund] = useState<{ id: string; name: string; category?: string } | undefined>(undefined);

  useEffect(() => {
    fetchGoalData();
  }, [id]);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/goals');
          return;
        }
        throw new Error('Failed to fetch goal');
      }
      const data = await res.json();
      setGoal(data.data || data.goal || data);

      // Fetch existing recommendations
      const recsRes = await fetch(`/api/goals/${id}/recommend`);
      if (recsRes.ok) {
        const recsJson = await recsRes.json();
        if (recsJson.data) {
          const recs = Array.isArray(recsJson.data) ? recsJson.data : (recsJson.data.recommendations || []);
          setRecommendations(recs.length > 0 ? recs : null);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete goal');
      router.push('/goals');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const generateRecommendations = async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      const res = await fetch(`/api/goals/${id}/recommend`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to generate recommendations');
      const json = await res.json();
      const recs = Array.isArray(json.data) ? json.data : (json.data.recommendations || []);
      setRecommendations(recs);
      showToast('Recommendations generated!', 'success');
    } catch (err: any) {
      setAiError(err.message);
      showToast(err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !goal) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const Icon = getGoalIcon(goal.goalType);
  const amount = goal.investmentType === 'sip' ? goal.sipAmount : goal.lumpsumAmount;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/goals" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Goals
          </Link>
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4 border border-blue-100 shadow-sm">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {goal.name || 'Financial Goal'}
              </h1>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 uppercase tracking-wider">
                {goal.goalType.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Goal
          </button>
        </div>
      </div>

      {/* Goal Summary Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Goal Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Investment Type</p>
            <h3 className="text-lg font-bold text-gray-900 capitalize">{goal.investmentType === 'sip' ? 'Monthly SIP' : 'One-time Lumpsum'}</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">{goal.investmentType === 'sip' ? 'Monthly Amount' : 'Lumpsum Amount'}</p>
            <h3 className="text-lg font-bold text-blue-700">{formatCurrency(amount || 0)}</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Time Horizon</p>
            <h3 className="text-lg font-bold text-gray-900">
              {goal.timeHorizonYears} Years <span className="text-xs font-normal text-gray-500 ml-1">({goal.isFlexibleHorizon ? 'Flexible' : 'Fixed'})</span>
            </h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Risk Appetite</p>
            <h3 className="text-lg font-bold text-gray-900 capitalize">{goal.riskAppetite}</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Current Age</p>
            <h3 className="text-lg font-bold text-gray-900">{goal.age} Years</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
            <h3 className="text-lg font-bold text-gray-900">
              {goal.createdAt && !isNaN(new Date(goal.createdAt).getTime()) 
                ? new Date(goal.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'}
            </h3>
          </div>
        </div>
        
        {goal.additionalNotes && (
          <div className="mt-6 bg-blue-50/50 rounded-xl p-5 border border-blue-100">
            <p className="text-sm font-medium text-gray-500 mb-2">Additional Notes</p>
            <p className="text-gray-800 text-sm">{goal.additionalNotes}</p>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">AI Recommendations</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              AI Generated
            </span>
          </div>
          {recommendations && recommendations.length > 0 && (
            <button 
              onClick={generateRecommendations}
              disabled={aiLoading}
              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
        </div>

        <div className="p-6">
          {!recommendations ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Expert AI Guidance</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Our AI can analyze your goal parameters, time horizon, and risk profile to recommend the best mutual funds for you.
              </p>
              <button 
                onClick={generateRecommendations}
                disabled={aiLoading}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing your goal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Recommendations
                  </>
                )}
              </button>
              {aiError && <p className="text-red-500 mt-4 text-sm">{aiError}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={rec.id} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">
                          {rec.fundName}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-gray-500 ml-8">{rec.category}</span>
                    </div>
                    {rec.score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">{Math.round(rec.score)}<span className="text-sm text-emerald-500">/100</span></div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Match Score</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-8">
                    <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {rec.rationale || rec.reason}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                      <Link 
                        href={`/funds/${rec.schemeCode}`}
                        className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={`/funds/${rec.schemeCode}?tab=insights`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        View Insights
                      </Link>
                      <button 
                        onClick={() => {
                          setPrefilledFund({ id: rec.schemeCode, name: rec.fundName, category: rec.category });
                          setIsAddModalOpen(true);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm ml-auto"
                      >
                        Add to Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Goal?</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to delete "{goal.name}"? All associated progress history and AI recommendations will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Holding Modal Component */}
      <HoldingModal 
        isOpen={isAddModalOpen} 
        holding={null} 
        {...(prefilledFund ? { prefilledFund } : {})}
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          showToast('Holding added to portfolio', 'success');
        }}
      />
    </div>
  );
}
