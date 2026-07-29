import React from 'react';
import { CategoryRecommendation } from '../types';

interface Props {
  recommendation: CategoryRecommendation;
  rank: number;
}

export function CategoryCard({ recommendation, rank }: Props) {
  const { category, score, confidence, reason, typicalHorizon, expectedVolatility } = recommendation;
  
  return (
    <div className="border border-slate-200 p-4 rounded-xl shadow-sm mb-4 bg-white flex flex-col gap-2">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-bold text-slate-800">
          <span className="text-slate-400 mr-2">#{rank}</span>
          {category}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded font-medium ${confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {confidence} Confidence
          </span>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100">
            {score}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mt-2">{reason}</p>
      
      <div className="flex gap-4 mt-2 text-xs text-slate-500">
        <div>
          <span className="font-semibold block text-slate-700">Horizon</span>
          {typicalHorizon}
        </div>
        <div>
          <span className="font-semibold block text-slate-700">Volatility</span>
          {expectedVolatility}
        </div>
      </div>
    </div>
  );
}
