'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    age: '',
    annualIncome: '',
    monthlyInvestmentCap: '',
    currentCapital: '',
    targetAmount: '',
    targetYear: '',
    riskAppetite: 'MODERATE',
    investmentKnowledge: 'BEGINNER',
    goalType: 'Wealth Creation'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit profile');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Investor Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us about yourself to get personalized mutual fund recommendations.
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" name="age" id="age" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.age} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700">Annual Income (₹)</label>
              <input type="number" name="annualIncome" id="annualIncome" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.annualIncome} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="currentCapital" className="block text-sm font-medium text-gray-700">Current Capital (₹)</label>
              <input type="number" name="currentCapital" id="currentCapital" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.currentCapital} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="monthlyInvestmentCap" className="block text-sm font-medium text-gray-700">Monthly SIP Amount (₹)</label>
              <input type="number" name="monthlyInvestmentCap" id="monthlyInvestmentCap" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.monthlyInvestmentCap} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">Target Goal Amount (₹)</label>
              <input type="number" name="targetAmount" id="targetAmount" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.targetAmount} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="targetYear" className="block text-sm font-medium text-gray-700">Investment Horizon (Years)</label>
              <input type="number" name="targetYear" id="targetYear" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.targetYear} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="riskAppetite" className="block text-sm font-medium text-gray-700">Risk Appetite</label>
              <select name="riskAppetite" id="riskAppetite" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.riskAppetite} onChange={handleChange}>
                <option value="CONSERVATIVE">Conservative</option>
                <option value="MODERATE">Moderate</option>
                <option value="AGGRESSIVE">Aggressive</option>
              </select>
            </div>

            <div>
              <label htmlFor="investmentKnowledge" className="block text-sm font-medium text-gray-700">Investment Knowledge</label>
              <select name="investmentKnowledge" id="investmentKnowledge" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.investmentKnowledge} onChange={handleChange}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div>
              <label htmlFor="goalType" className="block text-sm font-medium text-gray-700">Primary Goal</label>
              <select name="goalType" id="goalType" required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                value={formData.goalType} onChange={handleChange}>
                <option value="Wealth Creation">Wealth Creation</option>
                <option value="Retirement">Retirement</option>
                <option value="Education">Education</option>
                <option value="House Purchase">House Purchase</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
