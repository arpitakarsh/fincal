import React, { useState } from 'react';
import { InvestorProfileData } from '../schemas/investor.schema';

interface Props {
  data: Partial<InvestorProfileData>;
  prevStep: () => void;
  validateComplete: () => boolean;
}

export function StepReview({ data, prevStep, validateComplete }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validateComplete()) return;
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/v1/investor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert('Profile saved successfully! (Simulated)');
      } else {
        alert('Validation failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Review Your Profile</h2>
      <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>

      <div className="flex justify-between mt-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded" disabled={submitting}>Back</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-success text-white rounded" disabled={submitting}>
          {submitting ? 'Saving...' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  );
}
