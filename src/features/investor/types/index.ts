import { InvestorProfileData } from '../schemas/investor.schema';

export interface InvestorWizardState {
  currentStep: number;
  data: Partial<InvestorProfileData>;
  errors: Record<string, string>;
}
