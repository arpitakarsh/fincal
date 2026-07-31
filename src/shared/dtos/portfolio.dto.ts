import { z } from 'zod';

// ─── Add Holding ──────────────────────────────────────────────────────────────

export const addHoldingSchema = z.object({
  schemeCode: z.string().min(1, 'schemeCode is required').max(20),
  units: z.number().positive('units must be a positive number').optional(),
  amount: z.number().positive('amount must be a positive number').optional(),
  purchaseDate: z.coerce.date().optional(),
  // Optional override — if not supplied, we fetch from mfapi at time of adding
  purchaseNav: z.number().positive().optional(),
  source: z.enum(['ai_recommendation', 'manual']).optional(),
  recommendationId: z.string().optional(),
}).refine(
  data => data.units !== undefined || data.amount !== undefined,
  { message: 'Either units or amount must be provided' }
);

export type AddHoldingInput = z.infer<typeof addHoldingSchema>;

// ─── Update Holding ───────────────────────────────────────────────────────────

export const updateHoldingSchema = z.object({
  units: z.number().positive('units must be positive').optional(),
  averageNav: z.number().positive('averageNav must be positive').optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;

// ─── Portfolio (legacy — kept for compatibility) ──────────────────────────────

export const portfolioSchema = z.object({
  totalInvested: z.number().min(0),
  currentValue: z.number().min(0),
  totalMonthlySip: z.number().min(0),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
