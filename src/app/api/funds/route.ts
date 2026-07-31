import { NextResponse } from 'next/server';
import { withApiAuthAndError } from '@/lib/apiWrapper';
import { NavService } from '@/backend/services/NavService';

export const GET = withApiAuthAndError(async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let liveFunds = [];
  if (search) {
    liveFunds = await NavService.searchFunds(search, limit);
  } else {
    const universe = await NavService.getFundUniverse();
    const offset = (page - 1) * limit;
    liveFunds = universe.slice(offset, offset + limit);
  }

  // Format the data to match expected frontend structure if needed,
  // or simply return the LiveNAV items
  const data = liveFunds.map((f) => ({
    id: f.schemeCode,
    name: f.schemeName,
    category: f.category,
    amc: { name: f.amc },
    metrics: { currentNav: f.nav } 
  }));
  
  return NextResponse.json({
    success: true,
    data,
    meta: { page, limit }
  }, { status: 200 });
});
