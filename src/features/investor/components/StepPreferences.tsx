import React from 'react';
import { InvestorProfileData } from '../schemas/investor.schema';

interface Props {
  data: Partial<InvestorProfileData>;
  updateData: (data: Partial<InvestorProfileData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function StepPreferences({ data, updateData, nextStep, prevStep }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Investment Preferences</h2>
      
      <div>
        <label className="block text-sm">Risk Appetite</label>
        <select 
          className="w-full p-2 border rounded"
          value={data.riskAppetite || ''} 
          onChange={(e) => updateData({ riskAppetite: e.target.value as any })}
        >
          <option value="">Select risk</option>
          <option value="low">Low (Conservative)</option>
          <option value="moderate">Moderate (Balanced)</option>
          <option value="high">High (Growth)</option>
        </select>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>
        <button onClick={nextStep} className="px-4 py-2 bg-primary text-white rounded">Review</button>
      </div>
    </div>
  );
}
