import React from 'react';
import { InvestorProfileData } from '../schemas/investor.schema';

interface Props {
  data: Partial<InvestorProfileData>;
  updateData: (data: Partial<InvestorProfileData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function StepGoals({ data, updateData, nextStep, prevStep }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Your Primary Goal</h2>
      
      <div>
        <label className="block text-sm">Goal Type</label>
        <select 
          className="w-full p-2 border rounded"
          value={data.goalType || ''} 
          onChange={(e) => updateData({ goalType: e.target.value as any })}
        >
          <option value="">Select a goal</option>
          <option value="retirement">Retirement</option>
          <option value="house">Buy a House</option>
          <option value="education">Education</option>
          <option value="wealth_creation">Wealth Creation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Target Year</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded"
          value={data.targetYear || ''} 
          onChange={(e) => updateData({ targetYear: parseInt(e.target.value) || undefined })}
        />
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>
        <button onClick={nextStep} className="px-4 py-2 bg-primary text-white rounded">Next</button>
      </div>
    </div>
  );
}
