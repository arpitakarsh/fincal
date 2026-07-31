import { z } from 'zod';

const baseGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').optional().or(z.literal('')),
  investmentType: z.enum(['lumpsum', 'sip']),
  lumpsumAmount: z.number().positive('Lumpsum amount must be positive').optional(),
  sipAmount: z.number().positive('SIP amount must be positive').optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  timeHorizonYears: z.number().positive('Time horizon must be positive').max(50),
  isFlexibleHorizon: z.boolean().default(false),
  goalType: z.enum(['wealth_generation', 'education', 'retirement', 'house', 'other']),
  riskAppetite: z.enum(['low', 'moderate', 'high']),
  age: z.number().int().positive('Age must be valid').max(100),
  additionalNotes: z.string().optional(),
});

export const goalSchema = baseGoalSchema.refine(
  data => {
    if (data.investmentType === 'lumpsum' && data.lumpsumAmount === undefined) return false;
    if (data.investmentType === 'sip' && data.sipAmount === undefined) return false;
    return true;
  },
  {
    message: 'Amount matching investment type must be provided (lumpsumAmount or sipAmount)',
  }
).refine(
  data => {
    if (data.investmentType === 'lumpsum' && data.lumpsumAmount) {
      return data.targetAmount >= data.lumpsumAmount;
    }
    return true;
  },
  {
    message: 'Target amount must be greater than or equal to your initial lumpsum investment',
    path: ['targetAmount']
  }
);

export const updateGoalSchema = baseGoalSchema.partial();

export type GoalInput = z.infer<typeof goalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
