import { z } from 'zod';

export const calculatorSchema = z.object({
  schemeCode: z.string().min(1, 'schemeCode is required'),
  monthlyAmount: z.number().positive('Amount must be greater than 0'),
  years: z.number().int().min(1, 'Years must be at least 1').max(40, 'Years cannot exceed 40'),
  expectedReturnPercent: z.number().positive().optional(),
  type: z.enum(['sip', 'lumpsum']).default('sip'),
});

export type CalculatorInput = z.infer<typeof calculatorSchema>;
