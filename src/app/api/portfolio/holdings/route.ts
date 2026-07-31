import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PortfolioService } from '@/backend/services/PortfolioService';
import { addHoldingSchema } from '@/shared/dtos/portfolio.dto';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const portfolioService = new PortfolioService();

/**
 * POST /api/portfolio/holdings
 * Add a new holding.
 * Body: { schemeCode, units?, amount?, purchaseDate?, purchaseNav? }
 * Either units OR amount must be provided.
 * If amount is provided, units = amount / currentNav (fetched live from mfapi.in).
 */
export const POST = withApiAuthAndError(async (req: NextRequest, { session }) => {
  const body = await req.json();
  const input = addHoldingSchema.parse(body);

  const holding = await portfolioService.addHolding(session.user.id, input);

  return NextResponse.json({ success: true, data: holding }, { status: 201 });
});
