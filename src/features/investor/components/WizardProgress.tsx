import React from 'react';
import { TOTAL_STEPS } from '../hooks/useInvestorWizard';

interface Props {
  currentStep: number;
}

export function WizardProgress({ currentStep }: Props) {
  const percentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Step {currentStep} of {TOTAL_STEPS}</span>
        <span className="text-sm font-medium text-slate-700">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
