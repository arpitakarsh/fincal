import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PortfolioService } from '@/backend/services/PortfolioService';
import { updateHoldingSchema } from '@/shared/dtos/portfolio.dto';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const portfolioService = new PortfolioService();

/**
 * PATCH /api/portfolio/holdings/[id]
 * Update a holding's units and/or averageNav.
 * Body (all optional): { units?, averageNav?, notes? }
 */
export const PATCH = withApiAuthAndError(async (req: NextRequest, { params, session }) => {
  const { id: holdingId } = await params;
  const body = await req.json();
  const input = updateHoldingSchema.parse(body);

  const holding = await portfolioService.updateHolding(session.user.id, holdingId, input);
  return NextResponse.json({ success: true, data: holding });
});

/**
 * PUT /api/portfolio/holdings/[id]
 * Alias for PATCH — full replacement of units + averageNav.
 */
export const PUT = withApiAuthAndError(async (req: NextRequest, { params, session }) => {
  const { id: holdingId } = await params;
  const body = await req.json();
  const input = updateHoldingSchema.parse(body);

  const holding = await portfolioService.updateHolding(session.user.id, holdingId, input);
  return NextResponse.json({ success: true, data: holding });
});

/**
 * DELETE /api/portfolio/holdings/[id]
 * Remove a single holding.
 */
export const DELETE = withApiAuthAndError(async (req: NextRequest, { params, session }) => {
  const { id: holdingId } = await params;
  await portfolioService.deleteHolding(session.user.id, holdingId);
  return NextResponse.json({ success: true, message: 'Holding removed from portfolio' });
});
