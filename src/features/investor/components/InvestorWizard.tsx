'use client';

import React from 'react';
import { useInvestorWizard } from '../hooks/useInvestorWizard';
import { WizardProgress } from './WizardProgress';
import { StepBasicDetails } from './StepBasicDetails';
import { StepFinancialDetails } from './StepFinancialDetails';
import { StepGoals } from './StepGoals';
import { StepPreferences } from './StepPreferences';
import { StepReview } from './StepReview';

export default function InvestorWizard() {
  const wizard = useInvestorWizard();

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <WizardProgress currentStep={wizard.currentStep} />
      
      {wizard.currentStep === 1 && (
        <StepBasicDetails data={wizard.data} updateData={wizard.updateData} nextStep={wizard.nextStep} />
      )}
      {wizard.currentStep === 2 && (
        <StepFinancialDetails data={wizard.data} updateData={wizard.updateData} nextStep={wizard.nextStep} prevStep={wizard.prevStep} />
      )}
      {wizard.currentStep === 3 && (
        <StepGoals data={wizard.data} updateData={wizard.updateData} nextStep={wizard.nextStep} prevStep={wizard.prevStep} />
      )}
      {wizard.currentStep === 4 && (
        <StepPreferences data={wizard.data} updateData={wizard.updateData} nextStep={wizard.nextStep} prevStep={wizard.prevStep} />
      )}
      {wizard.currentStep === 5 && (
        <StepReview data={wizard.data} prevStep={wizard.prevStep} validateComplete={wizard.validateComplete} />
      )}
    </div>
  );
}
