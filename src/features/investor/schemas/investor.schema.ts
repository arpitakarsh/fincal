import { z } from 'zod';

export const InvestorProfileSchema = z.object({
  // Basic
  age: z.number().int().min(18, 'Must be at least 18').max(100, 'Must be under 100'),
  
  // Financial
  currentCapital: z.number().min(0, 'Cannot be negative'),
  monthlyInvestmentCap: z.number().min(0, 'Cannot be negative'),
  existingSip: z.number().min(0, 'Cannot be negative'),
  existingLumpsum: z.number().min(0, 'Cannot be negative'),
  emergencyFund: z.number().min(0, 'Cannot be negative'),
  annualIncome: z.number().min(0, 'Cannot be negative').optional(),

  // Goal
  goalType: z.enum([
    'retirement', 'house', 'wedding', 'education', 
    'car', 'vacation', 'wealth_creation', 'other'
  ], { required_error: 'Goal type is required' }),
  targetAmount: z.number().min(0).optional(),
  targetYear: z.number().int().min(new Date().getFullYear(), 'Target year must be in the future'),

  // Behavior
  riskAppetite: z.enum(['low', 'moderate', 'high', 'very_high'], { required_error: 'Risk appetite is required' }),
  investmentKnowledge: z.enum(['beginner', 'intermediate', 'advanced'], { required_error: 'Investment knowledge is required' }),
  liquidityPreference: z.enum(['high', 'medium', 'low'], { required_error: 'Liquidity preference is required' }),
  investmentStyle: z.enum(['lumpsum', 'sip', 'both'], { required_error: 'Investment style is required' }),
});

export type InvestorProfileData = z.infer<typeof InvestorProfileSchema>;
