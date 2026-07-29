import React from 'react';
import { InvestorProfileData } from '../schemas/investor.schema';

interface Props {
  data: Partial<InvestorProfileData>;
  updateData: (data: Partial<InvestorProfileData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function StepFinancialDetails({ data, updateData, nextStep, prevStep }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Your Financial Snapshot</h2>
      
      <div>
        <label className="block text-sm">Current Invested Capital</label>
        <input type="number" name="currentCapital" className="w-full p-2 border rounded" value={data.currentCapital || ''} onChange={handleChange} />
      </div>
      
      <div>
        <label className="block text-sm">Monthly Investment Capacity</label>
        <input type="number" name="monthlyInvestmentCap" className="w-full p-2 border rounded" value={data.monthlyInvestmentCap || ''} onChange={handleChange} />
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>
        <button onClick={nextStep} className="px-4 py-2 bg-primary text-white rounded">Next</button>
      </div>
    </div>
  );
}
