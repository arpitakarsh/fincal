import { NavService } from './NavService';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';
import { prisma } from '@/backend/infrastructure/database/client';
import { callAI } from './ai.service';
import { logger } from '@/lib/logger';
import { CalculatorInput } from '@/shared/dtos/calculator.dto';

export interface FundDetails {
  schemeCode: string;
  fundName: string;
  category: string;
  amc: string;
  currentNav: number;
  navDate: string;
  returnsUnavailable?: boolean;
  returns: {
    '1M': number | null;
    '3M': number | null;
    '6M': number | null;
    '1Y': number | null;
    '3Y': number | null;
    '5Y': number | null;
    'inception': number | null;
  };
  risk: {
    volatility: number | null;
    sharpeRatio: number | null;
    maxDrawdown: number | null;
  };
}

export class FundAnalyticsService {
  private readonly RISK_FREE_RATE = 0.065; // 6.5% assumed for India
  private readonly TRADING_DAYS_PER_YEAR = 252;

  /**
   * Fetch scheme details, live NAV, and compute historical + risk metrics.
   * Cached for 60 minutes.
   */
  async getFundDetails(schemeCode: string): Promise<FundDetails> {
    const cacheKey = `fund:details:${schemeCode}`;
    const cached = await CacheManager.get<FundDetails>(cacheKey);
    if (cached) return cached;

    // 1. Get Latest NAV
    const liveNav = await NavService.getLatestNav(schemeCode);

    // 2. Get Historical Data
    const history = await NavService.getHistoricalNav(schemeCode); // Ordered newest first

    let returnsUnavailable = history.length < 30; // need at least a month of data
    let returns: FundDetails['returns'] = { '1M': null, '3M': null, '6M': null, '1Y': null, '3Y': null, '5Y': null, 'inception': null };
    let risk: FundDetails['risk'] = { volatility: null, sharpeRatio: null, maxDrawdown: null };

    if (!returnsUnavailable && liveNav.nav > 0) {
      try {
        returns = this.calculateReturns(liveNav.nav, history);
        risk = this.calculateRiskMetrics(history);
      } catch (e: any) {
        logger.warn(`Failed to calculate metrics for ${schemeCode}: ${e.message}`);
        returnsUnavailable = true;
      }
    }

    const details: FundDetails = {
      schemeCode,
      fundName: liveNav.schemeName || `Fund ${schemeCode}`,
      category: liveNav.category || 'Unknown Category',
      amc: liveNav.amc || 'Unknown AMC',
      currentNav: liveNav.nav,
      navDate: liveNav.date,
      returnsUnavailable,
      returns,
      risk,
    };

    await CacheManager.set(cacheKey, details, 3600); // 60 mins
    return details;
  }

  /**
   * Goal-aware AI insights. Cached 24h per scheme+goal combo (or general if no goal).
   */
  async getFundInsights(schemeCode: string, goalId: string | null, userId: string) {
    const cacheKey = goalId 
      ? `fund:insights:${schemeCode}:${goalId}`
      : `fund:insights:${schemeCode}:general`;
      
    const cached = await CacheManager.get(cacheKey);
    if (cached) return cached;

    // Rate Limiting (10 req / hour)
    const rateLimitKey = `ratelimit:fund_insights:${userId}`;
    const requestsCount = await CacheManager.get<number>(rateLimitKey) || 0;
    if (requestsCount >= 10) {
      throw new Error('Rate limit exceeded: You can only view detailed AI insights 10 times per hour.');
    }

    // Fetch data context
    let goalContext = '';
    if (goalId) {
      const goal = await prisma.goal.findUnique({ where: { id: goalId, userId } });
      if (goal) {
        goalContext = `
GOAL DETAILS:
- Goal Type: ${goal.goalType}
- Time Horizon: ${goal.timeHorizonYears} years
- Investment Type: ${goal.investmentType}
- User Risk Appetite: ${goal.riskAppetite}
`;
      }
    }

    const fundDetails = await this.getFundDetails(schemeCode);

    const prompt = `
You are an expert financial analyst. Analyze the mutual fund '${fundDetails.fundName}'.
${goalContext ? "Analyze if this fund is suitable for the user's specific financial goal below." : "Provide a general analysis of this fund's performance and risk profile."}

FUND DETAILS:
- Category: ${fundDetails.category}
- 1Y Return: ${fundDetails.returns['1Y'] !== null ? fundDetails.returns['1Y']?.toFixed(2) + '%' : 'N/A'}
- 3Y Return: ${fundDetails.returns['3Y'] !== null ? fundDetails.returns['3Y']?.toFixed(2) + '%' : 'N/A'}
- Annualized Volatility: ${fundDetails.risk.volatility !== null ? (fundDetails.risk.volatility * 100).toFixed(2) + '%' : 'N/A'}
- Sharpe Ratio: ${fundDetails.risk.sharpeRatio !== null ? fundDetails.risk.sharpeRatio.toFixed(2) : 'N/A'}
${goalContext}
Output strictly valid JSON only:
{
  "pros": ["pro 1", "pro 2"],
  "cons": ["con 1", "con 2"],
  "suitabilityScore": ${goalContext ? 85 : "null"},
  "analysis": "2-3 sentences max analyzing the fund."
}
`;

    const responseText = await callAI(prompt, 'json');
    let insights: any;
    try {
      insights = JSON.parse(responseText);
    } catch (e) {
      throw new Error('AI returned an invalid format for insights.');
    }

    await CacheManager.set(rateLimitKey, requestsCount + 1, 3600); // 1hr TTL
    await CacheManager.set(cacheKey, insights, 86400); // 24h TTL

    return insights;
  }

  /**
   * SIP / Lumpsum Projection Calculator
   */
  async calculateProjection(input: CalculatorInput, userId: string) {
    // Rate Limiting (30 req / hour)
    const rateLimitKey = `ratelimit:calculator:${userId}`;
    const requestsCount = await CacheManager.get<number>(rateLimitKey) || 0;
    if (requestsCount >= 30) {
      throw new Error('Rate limit exceeded: You can only run calculations 30 times per hour.');
    }

    // Get live metrics and historical returns
    const details = await this.getFundDetails(input.schemeCode);

    // Determine return rate to use
    let usedReturnPercent = input.expectedReturnPercent;
    if (usedReturnPercent === undefined || usedReturnPercent === null) {
      if (input.years <= 3) {
        usedReturnPercent = details.returns['3Y'] ?? details.returns['1Y'] ?? undefined;
      } else {
        usedReturnPercent = details.returns['5Y'] ?? details.returns['3Y'] ?? details.returns['1Y'] ?? undefined;
      }

      if (usedReturnPercent === undefined || usedReturnPercent === null) {
        throw new Error('Not enough historical data to auto-calculate expected returns. Please provide expectedReturnPercent manually.');
      }
    }

    const p = input.monthlyAmount;
    const n = input.years * 12;
    const r = (usedReturnPercent / 100) / 12;

    let totalInvested = 0;
    let estimatedValue = 0;

    if (input.type === 'sip') {
      totalInvested = p * n;
      if (r === 0) {
        estimatedValue = totalInvested;
      } else {
        estimatedValue = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      }
    } else { // lumpsum
      totalInvested = p; // in lumpsum, monthlyAmount acts as the one-time principal
      if (r === 0) {
        estimatedValue = totalInvested;
      } else {
        const annualRate = usedReturnPercent / 100;
        estimatedValue = p * Math.pow(1 + annualRate, input.years);
      }
    }

    const estimatedGains = estimatedValue - totalInvested;
    const absoluteReturnPercent = totalInvested > 0 ? (estimatedGains / totalInvested) * 100 : 0;

    await CacheManager.set(rateLimitKey, requestsCount + 1, 3600); // 1hr TTL

    return {
      schemeCode: details.schemeCode,
      fundName: details.fundName,
      monthlyAmount: input.monthlyAmount,
      years: input.years,
      type: input.type,
      totalInvested,
      estimatedValue,
      estimatedGains,
      absoluteReturnPercent,
      usedReturnPercent,
      historicalReturns: {
        '1Y': details.returns['1Y'],
        '3Y': details.returns['3Y'],
        '5Y': details.returns['5Y'],
        'sinceInception': details.returns['inception'],
      },
      calculationDate: new Date().toISOString()
    };
  }

  // --- Helpers ---

  private calculateReturns(currentNav: number, history: { date: string; nav: number }[]) {
    // history is ordered newest first. history[0] is the most recent date from mfapi.
    const today = new Date(); // or use history[0].date
    if (history.length > 0) {
      const parts = history[0]!.date.split('-');
      if (parts.length === 3) {
        today.setFullYear(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }

    const getNavAgo = (monthsAgo: number): number | null => {
      const targetDate = new Date(today.getTime());
      targetDate.setMonth(targetDate.getMonth() - monthsAgo);
      return this.findClosestNav(targetDate, history);
    };

    const inceptionNav = history[history.length - 1]!.nav;
    const inceptionDate = this.parseDate(history[history.length - 1]!.date);
    const yearsSinceInception = (today.getTime() - inceptionDate.getTime()) / (1000 * 3600 * 24 * 365.25);

    return {
      '1M': this.pctChange(currentNav, getNavAgo(1)),
      '3M': this.pctChange(currentNav, getNavAgo(3)),
      '6M': this.pctChange(currentNav, getNavAgo(6)),
      '1Y': this.pctChange(currentNav, getNavAgo(12)),
      '3Y': this.cagr(currentNav, getNavAgo(36), 3),
      '5Y': this.cagr(currentNav, getNavAgo(60), 5),
      'inception': yearsSinceInception >= 1 ? this.cagr(currentNav, inceptionNav, yearsSinceInception) : this.pctChange(currentNav, inceptionNav)
    };
  }

  private calculateRiskMetrics(history: { date: string; nav: number }[]) {
    if (history.length < 252) {
      // Need at least 1 year of data for meaningful annualized metrics
      return { volatility: null, sharpeRatio: null, maxDrawdown: null };
    }

    // history is newest first, let's reverse to oldest first for easier iteration
    const chronological = [...history].reverse();
    
    // Calculate daily returns
    const dailyReturns: number[] = [];
    for (let i = 1; i < chronological.length; i++) {
      const prev = chronological[i - 1]!.nav;
      const curr = chronological[i]!.nav;
      if (prev > 0) dailyReturns.push((curr - prev) / prev);
    }

    // Volatility (Standard Deviation)
    const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / dailyReturns.length;
    const dailyVolatility = Math.sqrt(variance);
    const annualizedVolatility = dailyVolatility * Math.sqrt(this.TRADING_DAYS_PER_YEAR);

    // Annualized Return for Sharpe
    const years = dailyReturns.length / this.TRADING_DAYS_PER_YEAR;
    const totalReturn = (chronological[chronological.length - 1]!.nav / chronological[0]!.nav) - 1;
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

    // Sharpe Ratio
    const sharpeRatio = annualizedVolatility > 0 ? (annualizedReturn - this.RISK_FREE_RATE) / annualizedVolatility : null;

    // Max Drawdown
    let maxDrawdown = 0;
    let peak = chronological[0]!.nav;

    for (let i = 1; i < chronological.length; i++) {
      const nav = chronological[i]!.nav;
      if (nav > peak) {
        peak = nav;
      }
      const drawdown = (peak - nav) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      volatility: annualizedVolatility,
      sharpeRatio: sharpeRatio,
      maxDrawdown: maxDrawdown * 100 // as percentage
    };
  }

  private findClosestNav(targetDate: Date, history: { date: string; nav: number }[]): number | null {
    // history is newest first
    for (const h of history) {
      const d = this.parseDate(h.date);
      if (d <= targetDate) return h.nav;
    }
    return null;
  }

  private parseDate(dStr: string): Date {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date(dStr);
  }

  private pctChange(current: number, past: number | null): number | null {
    if (!past || past <= 0) return null;
    return ((current - past) / past) * 100;
  }

  private cagr(current: number, past: number | null, years: number): number | null {
    if (!past || past <= 0 || years <= 0) return null;
    return (Math.pow(current / past, 1 / years) - 1) * 100;
  }
}
