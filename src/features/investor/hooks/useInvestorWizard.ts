import { useState } from 'react';
import { InvestorProfileData, InvestorProfileSchema } from '../schemas/investor.schema';
import { InvestorWizardState } from '../types';

const INITIAL_STATE: InvestorWizardState = {
  currentStep: 1,
  data: {},
  errors: {},
};

export const TOTAL_STEPS = 5;

export function useInvestorWizard() {
  const [state, setState] = useState<InvestorWizardState>(INITIAL_STATE);

  const updateData = (fields: Partial<InvestorProfileData>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...fields },
      // Clear errors for updated fields
      errors: Object.keys(fields).reduce((acc, key) => {
        const { [key]: _, ...rest } = acc;
        return rest;
      }, prev.errors),
    }));
  };

  const nextStep = () => {
    // We could run partial zod validation here if needed, but we'll do it on the UI side before calling nextStep
    if (state.currentStep < TOTAL_STEPS) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const validateComplete = (): boolean => {
    const result = InvestorProfileSchema.safeParse(state.data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setState((prev) => ({ ...prev, errors: fieldErrors }));
      return false;
    }
    return true;
  };

  const reset = () => setState(INITIAL_STATE);

  return {
    ...state,
    updateData,
    nextStep,
    prevStep,
    validateComplete,
    reset,
  };
}
