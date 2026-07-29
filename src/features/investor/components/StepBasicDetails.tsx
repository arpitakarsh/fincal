import React from 'react';
import { InvestorProfileData } from '../schemas/investor.schema';

interface Props {
  data: Partial<InvestorProfileData>;
  updateData: (data: Partial<InvestorProfileData>) => void;
  nextStep: () => void;
}

export function StepBasicDetails({ data, updateData, nextStep }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Let's start with the basics</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Age</label>
        <input 
          type="number" 
          className="w-full p-2 border border-slate-300 rounded"
          value={data.age || ''} 
          onChange={(e) => updateData({ age: parseInt(e.target.value) || undefined })}
          placeholder="e.g. 30"
        />
      </div>
      <button 
        onClick={nextStep}
        disabled={!data.age || data.age < 18}
        className="mt-4 w-full bg-primary text-white p-2 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
