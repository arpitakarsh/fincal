import React from 'react';
import { BucketProbability } from '../engine/probability';

interface Props {
  distribution: BucketProbability[];
  windowYears: number;
}

export function ProbabilityHistogram({ distribution, windowYears }: Props) {
  return (
    <div className="bg-white p-6 border rounded-xl shadow-sm">
      <h3 className="font-bold text-lg mb-4">{windowYears}-Year Historical Returns Probability</h3>
      <p className="text-sm text-slate-500 mb-6">
        Based on all rolling {windowYears}-year windows in history, here is how often returns fell into specific ranges.
      </p>
      
      <div className="flex flex-col gap-3">
        {distribution.map(d => (
          <div key={d.bucketId} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium text-slate-700">{d.label}</div>
            <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden flex">
              <div 
                className={`h-full ${d.bucketId === 'negative' ? 'bg-red-400' : 'bg-primary'}`} 
                style={{ width: `${d.probabilityPercent}%` }}
              />
            </div>
            <div className="w-16 text-right font-bold text-slate-700">{d.probabilityPercent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
