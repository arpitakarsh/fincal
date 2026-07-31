'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export default function SIPCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  // SIP Formula: FV = P × ({[1 + i]^n - 1} / i) × (1 + i)
  const calculateSIP = () => {
    const P = monthlyInvestment;
    const i = expectedReturn / 100 / 12;
    const n = timePeriod * 12;
    
    const investedAmount = P * n;
    let estimatedReturns = 0;
    let totalValue = 0;

    if (expectedReturn > 0) {
      totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      estimatedReturns = totalValue - investedAmount;
    } else {
      totalValue = investedAmount;
    }

    return {
      investedAmount,
      estimatedReturns,
      totalValue
    };
  };

  const results = calculateSIP();

  const chartData = [
    { name: 'Invested Amount', value: results.investedAmount },
    { name: 'Estimated Returns', value: results.estimatedReturns }
  ];

  const COLORS = ['#93c5fd', '#2563eb']; // light blue for invested, solid blue for returns

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="w-6 h-6 mr-2 text-blue-600" />
          SIP Calculator
        </h1>
        <p className="text-sm text-gray-500 mt-1">Calculate the future value of your monthly investments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Monthly Investment</label>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {formatCurrency(monthlyInvestment)}
              </span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="100000" 
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Expected Return Rate (p.a)</label>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {expectedReturn}%
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Time Period</label>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {timePeriod} Years
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>1 Yr</span>
              <span>40 Yrs</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-start border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Mutual fund investments are subject to market risks. The expected return is assumed to be constant over the investment period.
            </p>
          </div>
        </div>

        {/* Output Results */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Investment Breakdown</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Invested Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(results.investedAmount)}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium mb-1">Est. Returns</p>
              <p className="text-xl font-bold text-emerald-700">+{formatCurrency(results.estimatedReturns)}</p>
            </div>
          </div>
          
          <div className="p-5 bg-blue-600 rounded-xl text-center text-white mb-8 shadow-md">
            <p className="text-sm font-medium text-blue-100 mb-1">Total Value</p>
            <p className="text-3xl font-black">{formatCurrency(results.totalValue)}</p>
          </div>

          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? '#3b82f6'} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(Number(value || 0))}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
