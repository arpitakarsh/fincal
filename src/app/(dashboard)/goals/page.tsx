'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Target, Plus, Edit2, Trash2, Home, GraduationCap, 
  Car, Plane, Heart, Briefcase, AlertTriangle, CheckCircle2,
  MoreVertical, Sparkles, X, Loader2
} from 'lucide-react';

interface Goal {
  id: string;
  name?: string;
  investmentType: 'sip' | 'lumpsum';
  lumpsumAmount?: number;
  sipAmount?: number;
  targetAmount: number;
  timeHorizonYears: number;
  isFlexibleHorizon: boolean;
  goalType: 'wealth_generation' | 'education' | 'retirement' | 'house' | 'other';
  riskAppetite: 'low' | 'moderate' | 'high';
  age: number;
  additionalNotes?: string;
  createdAt: string;
  _count?: {
    recommendations: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const getGoalIcon = (type: string) => {
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

const calculateTimeRemaining = (years: number) => {
  return `${years} yr${years > 1 ? 's' : ''} left`;
};

export default function GoalsListPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const router = useRouter();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      const json = await res.json();
      setGoals(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete goal');
      showToast('Goal deleted successfully', 'success');
      setDeleteConfirmId(null);
      fetchGoals();
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your financial milestones.</p>
        </div>
        <button 
          onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Goals Yet</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Set your first financial goal to get personalized AI investment recommendations.
          </p>
          <button 
            onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const Icon = getGoalIcon(goal.goalType || 'target');
            
            // Derive a fake progress or remove it. Let's just calculate total value from SIP or Lumpsum
            const amount = goal.investmentType === 'sip' ? (goal.sipAmount || 0) : (goal.lumpsumAmount || 0);
            
            return (
              <div 
                key={goal.id} 
                className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
                onClick={() => router.push(`/goals/${goal.id}`)}
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{goal.name || 'Financial Goal'}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{goal.goalType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    {/* Quick Actions Dropdown / Hover Menu */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      {deleteConfirmId === goal.id ? (
                        <div className="absolute right-0 top-0 bg-white shadow-lg border border-gray-200 rounded-lg p-2 z-10 w-48">
                          <p className="text-xs text-gray-600 font-medium mb-2 text-center">Delete goal?</p>
                          <div className="flex space-x-2">
                            <button onClick={() => handleDeleteGoal(goal.id)} className="flex-1 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Yes</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">No</button>
                          </div>
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingGoal(goal); setIsModalOpen(true); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(goal.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Investment Type</span>
                        <span className="font-semibold text-gray-900 capitalize">{goal.investmentType}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1 mt-2">
                        <span className="text-gray-500">Risk Appetite</span>
                        <span className="font-semibold text-gray-900 capitalize">{goal.riskAppetite}</span>
                      </div>
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
                        <span className="text-xs text-blue-600 font-semibold">{goal.isFlexibleHorizon ? 'Flexible Timeline' : 'Fixed Timeline'}</span>
                        <span className="text-xs text-gray-500">{calculateTimeRemaining(goal.timeHorizonYears)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">Amount: <span className="font-semibold text-gray-900">{formatCurrency(goal.investmentType === 'sip' ? (goal.sipAmount || 0) : (goal.lumpsumAmount || 0))}</span></span>
                  </div>
                  
                  {goal._count && goal._count.recommendations > 0 && (
                    <div className="flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Recommended
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <GoalModal 
          isOpen={true} 
          goal={editingGoal} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
          }} 
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
            fetchGoals();
            showToast(editingGoal ? 'Goal updated' : 'Goal created', 'success');
          }}
        />
      )}
    </div>
  );
}

// Goal Form Modal
function GoalModal({ isOpen, goal, onClose, onSuccess }: { isOpen: boolean, goal: Goal | null, onClose: () => void, onSuccess: () => void }) {
  const [investmentType, setInvestmentType] = useState<'sip'|'lumpsum'>(goal ? goal.investmentType : 'sip');
  const [lumpsumAmount, setLumpsumAmount] = useState(goal?.lumpsumAmount?.toString() || '');
  const [sipAmount, setSipAmount] = useState(goal?.sipAmount?.toString() || '');
  const [timeHorizonYears, setTimeHorizonYears] = useState(goal?.timeHorizonYears?.toString() || '5');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [isFlexibleHorizon, setIsFlexibleHorizon] = useState(goal ? goal.isFlexibleHorizon : false);
  const [goalType, setGoalType] = useState(goal ? goal.goalType : 'wealth_generation');
  const [riskAppetite, setRiskAppetite] = useState(goal ? goal.riskAppetite : 'moderate');
  const [age, setAge] = useState(goal?.age?.toString() || '30');
  const [additionalNotes, setAdditionalNotes] = useState(goal?.additionalNotes || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload: any = {
        investmentType,
        targetAmount: parseFloat(targetAmount),
        timeHorizonYears: parseFloat(timeHorizonYears),
        isFlexibleHorizon,
        goalType,
        riskAppetite,
        age: parseInt(age, 10),
      };

      if (investmentType === 'lumpsum') {
        payload.lumpsumAmount = parseFloat(lumpsumAmount);
      } else {
        payload.sipAmount = parseFloat(sipAmount);
      }

      if (additionalNotes.trim()) {
        payload.additionalNotes = additionalNotes.trim();
      }

      const url = goal ? `/api/goals/${goal.id}` : `/api/goals`;
      const method = goal ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.message || 'Failed to save goal');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInvestmentType('sip')}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    investmentType === 'sip' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Monthly SIP
                </button>
                <button
                  type="button"
                  onClick={() => setInvestmentType('lumpsum')}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    investmentType === 'lumpsum' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  One-time Lumpsum
                </button>
              </div>
            </div>
            
            {investmentType === 'lumpsum' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lumpsum Amount (₹)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lumpsumAmount}
                  onChange={(e) => setLumpsumAmount(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly SIP Amount (₹)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Purpose</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
              >
                <option value="wealth_generation">Wealth Generation</option>
                <option value="education">Education</option>
                <option value="retirement">Retirement</option>
                <option value="house">House / Property</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Corpus (₹)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon (Years)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timeHorizonYears}
                  onChange={(e) => setTimeHorizonYears(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Age</label>
                <input 
                  type="number"
                  required
                  min="18"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  checked={isFlexibleHorizon}
                  onChange={(e) => setIsFlexibleHorizon(e.target.checked)}
                />
                <span>Is your time horizon flexible?</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Appetite</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
              <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
                placeholder="Any other details for the AI..."
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {goal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
