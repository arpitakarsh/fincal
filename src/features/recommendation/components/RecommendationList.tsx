import React from 'react';
import { CategoryRecommendation } from '../types';
import { CategoryCard } from './CategoryCard';

interface Props {
  recommendations: CategoryRecommendation[];
  isLoading?: boolean;
}

export function RecommendationList({ recommendations, isLoading }: Props) {
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Analyzing investor profile...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-8 text-center border rounded-xl bg-slate-50">
        <h3 className="text-lg font-bold text-slate-700">Insufficient Data</h3>
        <p className="text-sm text-slate-500 mt-2">Please complete your Investor Profile to see customized category recommendations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Recommended Allocation Categories</h2>
      <div className="flex flex-col gap-2">
        {recommendations.map((rec, index) => (
          <CategoryCard key={rec.category} recommendation={rec} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
