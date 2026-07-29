import React from 'react';
import { AIInsightCard } from './AIInsightCard';
import { GoalRealityResponse } from '../schemas/aiResponses';

interface Props {
  analysis: GoalRealityResponse;
}

export function GoalAnalysis({ analysis }: Props) {
  return (
    <AIInsightCard title="Goal Reality Check">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs font-bold text-white ${analysis.isRealistic ? 'bg-green-600' : 'bg-red-600'}`}>
            {analysis.isRealistic ? 'Realistic' : 'Needs Adjustment'}
          </div>
        </div>
        
        <p>{analysis.explanation}</p>
        
        <div className="mt-2">
          <h5 className="font-bold mb-1">Action Items:</h5>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.actionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {analysis.riskWarnings && analysis.riskWarnings.length > 0 && (
          <div className="mt-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded">
            <h5 className="font-bold text-xs uppercase mb-1">Warnings</h5>
            <ul className="list-disc pl-4 text-xs">
              {analysis.riskWarnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AIInsightCard>
  );
}
