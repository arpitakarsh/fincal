import { prisma } from '@/backend/infrastructure/database/client';
import { NavService, LiveNAV } from './NavService';
import { CacheManager } from '../infrastructure/redis/cache/CacheManager';
import { CacheKeys } from '../infrastructure/redis/cache/CacheKeys';
import { logger } from '@/lib/logger';
import { AddHoldingInput, UpdateHoldingInput } from '@/shared/dtos/portfolio.dto';

export interface EnrichedHolding {
  id: string;
  schemeCode: string | null;
  fundName: string | null;
  fundId: string | null;
  amc: string;
  category: string;
  units: number;
  purchaseNav: number;        // averageNav in DB
  investedAmount: number;     // investedValue in DB
  currentNav: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  navDate: string;
  navUnavailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSummary {
  id: string;
  userId: string;
  totalInvested: number;
  totalCurrentValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  holdingsCount: number;
  lastUpdated: Date;
  holdings: EnrichedHolding[];
  assetAllocation: { name: string; value: number; percentage: number }[];
  categoryAllocation: { name: string; value: number; percentage: number }[];
  amcAllocation: { name: string; value: number; percentage: number }[];
}

const PORTFOLIO_CACHE_TTL = 5 * 60; // 5 minutes

export class PortfolioService {

  // ─── GET Portfolio with live NAVs ─────────────────────────────────────────

  async getPortfolio(userId: string): Promise<PortfolioSummary | null> {
    const cacheKey = CacheKeys.userPortfolio(userId);
    const cached = await CacheManager.get<PortfolioSummary>(cacheKey);
    if (cached) return cached;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: true },
    });

    if (!portfolio) return null;
    if (portfolio.holdings.length === 0) {
      return {
        id: portfolio.id,
        userId,
        totalInvested: 0,
        totalCurrentValue: 0,
        totalPnl: 0,
        totalPnlPercentage: 0,
        holdingsCount: 0,
        lastUpdated: portfolio.updatedAt,
        holdings: [],
        assetAllocation: [],
        categoryAllocation: [],
        amcAllocation: [],
      };
    }

    // Batch-fetch all NAVs concurrently (5 at a time max)
    const schemeCodes = portfolio.holdings
      .map(h => h.schemeCode)
      .filter((s): s is string => !!s);

    const navMap = await NavService.batchGetLatestNavs(schemeCodes);

    // Enrich holdings and write back updated values to DB in parallel
    const enrichedHoldings: EnrichedHolding[] = await Promise.all(
      portfolio.holdings.map(async (h) => {
        const navData: LiveNAV = h.schemeCode
          ? navMap[h.schemeCode] ?? { schemeCode: h.schemeCode!, schemeName: h.fundName || '', nav: 0, date: '', amc: '', category: '', navUnavailable: true }
          : { schemeCode: '', schemeName: '', nav: 0, date: '', amc: '', category: '', navUnavailable: true };

        const currentNav = navData.navUnavailable ? (h.averageNav ?? 0) : navData.nav;
        const currentValue = h.units * currentNav;
        const investedAmount = h.investedValue ?? 0;
        const pnl = currentValue - investedAmount;
        const pnlPercentage = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;

        // Persist fresh NAV back to DB (fire and forget)
        if (!navData.navUnavailable) {
          prisma.userHolding.update({
            where: { id: h.id },
            data: { currentValue },
          }).catch(err => logger.warn(`Failed to update holding ${h.id}: ${err.message}`));
        }

        return {
          id: h.id,
          schemeCode: h.schemeCode,
          fundName: h.fundName || navData.schemeName || h.schemeCode,
          fundId: h.fundId,
          amc: navData.amc || 'Unknown AMC',
          category: navData.category || 'Unknown',
          units: h.units,
          purchaseNav: h.averageNav ?? 0,
          investedAmount,
          currentNav,
          currentValue,
          pnl,
          pnlPercentage,
          navDate: navData.date || '',
          navUnavailable: navData.navUnavailable ?? false,
          createdAt: h.createdAt,
          updatedAt: h.updatedAt,
        };
      })
    );

    // Compute aggregated summary
    const totalInvested = enrichedHoldings.reduce((s, h) => s + h.investedAmount, 0);
    const totalCurrentValue = enrichedHoldings.reduce((s, h) => s + h.currentValue, 0);
    const totalPnl = totalCurrentValue - totalInvested;
    const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Allocation breakdowns
    const assetAllocation = PortfolioService.buildAllocation(enrichedHoldings, 'category', totalCurrentValue, true);
    const categoryAllocation = PortfolioService.buildAllocation(enrichedHoldings, 'category', totalCurrentValue, false);
    const amcAllocation = PortfolioService.buildAllocation(enrichedHoldings, 'amc', totalCurrentValue, false);

    // Update portfolio totals in DB
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        totalInvested,
        currentValue: totalCurrentValue,
      },
    });

    const result: PortfolioSummary = {
      id: portfolio.id,
      userId,
      totalInvested,
      totalCurrentValue,
      totalPnl,
      totalPnlPercentage,
      holdingsCount: enrichedHoldings.length,
      lastUpdated: new Date(),
      holdings: enrichedHoldings,
      assetAllocation,
      categoryAllocation,
      amcAllocation,
    };

    await CacheManager.set(cacheKey, result, PORTFOLIO_CACHE_TTL);
    return result;
  }

  // ─── Add Holding ──────────────────────────────────────────────────────────

  async addHolding(userId: string, input: AddHoldingInput) {
    // 1. Ensure portfolio exists
    let portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId, totalInvested: 0, currentValue: 0, totalMonthlySip: 0 },
      });
    }

    // 2. Fetch current NAV (this is what the user is buying at if no purchaseNav supplied)
    const navData = await NavService.getLatestNav(input.schemeCode);

    if (navData.navUnavailable || navData.nav <= 0) {
      if (!input.purchaseNav) {
        throw new Error(`Cannot fetch valid live NAV for scheme ${input.schemeCode}. NAV returned was ${navData.nav}. Please verify this scheme code.`);
      }
    }

    const purchaseNav = input.purchaseNav ?? navData.nav;
    if (purchaseNav <= 0 || purchaseNav > 100000) {
      throw new Error(`The fetched or provided NAV (₹${purchaseNav}) seems absurdly high or low. Operation rejected for safety.`);
    }

    logger.info(`Adding holding for ${userId}: schemeCode=${input.schemeCode}, using purchaseNav=${purchaseNav} (Live NAV was ${navData.nav})`);

    // 3. Resolve units ← either given directly or derived from amount
    let units: number;
    let investedAmount: number;

    if (input.units !== undefined) {
      units = input.units;
      investedAmount = units * purchaseNav;
    } else {
      // amount given — derive units
      investedAmount = input.amount!;
      units = investedAmount / purchaseNav;
    }

    // 4. Create holding
    const holding = await prisma.userHolding.create({
      data: {
        portfolioId: portfolio.id,
        schemeCode: input.schemeCode,
        fundName: navData.schemeName || input.schemeCode,
        units,
        averageNav: purchaseNav,
        investedValue: investedAmount,
        currentValue: units * navData.nav,
        source: input.source || null,
        recommendationId: input.recommendationId || null,
      },
    });

    if (input.recommendationId) {
      await prisma.aIRecommendation.update({
        where: { id: input.recommendationId },
        data: { addedToPortfolio: true },
      }).catch(e => logger.warn(`Failed to update recommendation ${input.recommendationId}: ${e.message}`));
    }

    // 5. Invalidate caches
    await CacheManager.delete(CacheKeys.userPortfolio(userId));
    await CacheManager.delete(`portfolio:analytics:${userId}`);

    return {
      ...holding,
      purchaseNav,
      investedAmount,
      currentNav: navData.nav,
      currentValue: units * navData.nav,
      pnl: units * navData.nav - investedAmount,
      pnlPercentage: investedAmount > 0 ? ((units * navData.nav - investedAmount) / investedAmount) * 100 : 0,
      amc: navData.amc,
      category: navData.category,
    };
  }

  // ─── Update Holding ───────────────────────────────────────────────────────

  async updateHolding(userId: string, holdingId: string, input: UpdateHoldingInput) {
    const holding = await prisma.userHolding.findUnique({ where: { id: holdingId } });
    if (!holding) throw new Error('Holding not found');

    // Verify the holding belongs to this user's portfolio
    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio || holding.portfolioId !== portfolio.id) {
      throw new Error('Unauthorized: holding does not belong to your portfolio');
    }

    const newUnits = input.units ?? holding.units;
    const newNav = input.averageNav ?? (holding.averageNav ?? 0);
    const investedValue = newUnits * newNav;

    const updated = await prisma.userHolding.update({
      where: { id: holdingId },
      data: {
        units: newUnits,
        averageNav: newNav,
        investedValue,
      },
    });

    await CacheManager.delete(CacheKeys.userPortfolio(userId));
    await CacheManager.delete(`portfolio:analytics:${userId}`);

    return updated;
  }

  // ─── Delete Holding ───────────────────────────────────────────────────────

  async deleteHolding(userId: string, holdingId: string) {
    const holding = await prisma.userHolding.findUnique({ where: { id: holdingId } });
    if (!holding) throw new Error('Holding not found');

    const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
    if (!portfolio || holding.portfolioId !== portfolio.id) {
      throw new Error('Unauthorized: holding does not belong to your portfolio');
    }

    await prisma.userHolding.delete({ where: { id: holdingId } });
    await CacheManager.delete(CacheKeys.userPortfolio(userId));
    await CacheManager.delete(`portfolio:analytics:${userId}`);
    return true;
  }

  // ─── Delete Full Portfolio ────────────────────────────────────────────────

  async deletePortfolio(userId: string) {
    // deleteMany won't throw an error if the record doesn't exist
    await prisma.portfolio.deleteMany({ where: { userId } });
    await CacheManager.delete(CacheKeys.userPortfolio(userId));
    await CacheManager.delete(`portfolio:analytics:${userId}`);
    return true;
  }

  // ─── Legacy getAnalytics (kept for dashboard route compatibility) ──────────

  async getAnalytics(userId: string) {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) return null;
    return {
      totalInvested: portfolio.totalInvested,
      currentValue: portfolio.totalCurrentValue,
      absoluteGainLoss: portfolio.totalPnl,
      gainLossPercentage: portfolio.totalPnlPercentage,
      assetAllocation: Object.fromEntries(portfolio.assetAllocation.map(a => [a.name, a.percentage])),
      categoryAllocation: Object.fromEntries(portfolio.categoryAllocation.map(a => [a.name, a.percentage])),
      amcAllocation: Object.fromEntries(portfolio.amcAllocation.map(a => [a.name, a.percentage])),
    };
  }

  // ─── Utility: Build allocation breakdown ─────────────────────────────────

  private static buildAllocation(
    holdings: EnrichedHolding[],
    field: 'category' | 'amc',
    totalValue: number,
    bucketEquityDebt: boolean
  ): { name: string; value: number; percentage: number }[] {
    const map: Record<string, number> = {};

    for (const h of holdings) {
      let key = field === 'amc' ? h.amc : h.category;

      if (bucketEquityDebt && field === 'category') {
        const lower = h.category.toLowerCase();
        if (lower.includes('equity') || lower.includes('elss')) key = 'Equity';
        else if (lower.includes('debt') || lower.includes('liquid') || lower.includes('money market')) key = 'Debt';
        else if (lower.includes('hybrid') || lower.includes('balanced')) key = 'Hybrid';
        else if (lower.includes('gold') || lower.includes('commodity')) key = 'Gold / Commodity';
        else if (lower.includes('index') || lower.includes('etf')) key = 'Index / ETF';
        else key = 'Other';
      }

      map[key] = (map[key] ?? 0) + h.currentValue;
    }

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }));
  }
}
