import React from 'react';
import { EducationalTipResponse } from '../schemas/aiResponses';

interface Props {
  tip: EducationalTipResponse;
}

export function EducationalTipCard({ tip }: Props) {
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 max-w-sm">
      <h5 className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-2">
        What is {tip.term}?
      </h5>
      <p className="text-xs text-purple-800 mb-2">
        {tip.simpleDefinition}
      </p>
      <div className="text-xs mt-2">
        <strong className="text-purple-900 block">Why it matters:</strong>
        <span className="text-purple-800">{tip.whyItMatters}</span>
      </div>
      <div className="text-xs mt-2 pt-2 border-t border-purple-200">
        <strong className="text-red-700 block">Common Misconception:</strong>
        <span className="text-purple-800">{tip.commonMisconception}</span>
      </div>
    </div>
  );
}
