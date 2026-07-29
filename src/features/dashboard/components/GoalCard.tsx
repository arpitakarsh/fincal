import React from 'react';

interface Props {
  goal: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    healthScore: string;
  };
}

export function GoalCard({ goal }: Props) {
  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1);
  
  const getHealthColor = (score: string) => {
    switch(score) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  return (
    <div className="border p-5 rounded-xl shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{goal.name}</h3>
        <span className={`px-2 py-1 text-xs font-bold rounded border ${getHealthColor(goal.healthScore)}`}>
          {goal.healthScore.replace('_', ' ')}
        </span>
      </div>
      
      <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      
      <div className="flex justify-between text-sm text-slate-500">
        <span>₹{goal.currentAmount.toLocaleString()} saved</span>
        <span>{percentage}% of ₹{goal.targetAmount.toLocaleString()}</span>
      </div>
    </div>
  );
}
