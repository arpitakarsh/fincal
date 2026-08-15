import { prisma } from '@/backend/infrastructure/database/client';
import { callAI } from './ai.service';
import { NavService, LiveNAV } from './NavService';
import { PortfolioService } from './PortfolioService';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// AI RESPONSE SCHEMA
// ---------------------------------------------------------------------------

const AIRecommendationItemSchema = z.object({
  schemeCode: z.string().min(1),
  score: z.number().min(0).max(100),
  reason: z.string().min(1).max(2000),
  suggestedAllocationPercent: z.number().min(0).max(100),
});

const AIRecommendationResponseSchema = z.object({
  recommendations: z
    .array(AIRecommendationItemSchema)
    .min(1)
    .max(6),
});

type AIRecommendationResponse = z.infer<
  typeof AIRecommendationResponseSchema
>;

// ---------------------------------------------------------------------------
// SERVICE
// ---------------------------------------------------------------------------

export class AIRecommendationService {
  private portfolioService = new PortfolioService();

  // -------------------------------------------------------------------------
  // READ EXISTING RECOMMENDATIONS
  // -------------------------------------------------------------------------

  async getGoalRecommendations(goalId: string, userId: string) {
    return prisma.aIRecommendation.findMany({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        score: 'desc',
      },
    });
  }

  // -------------------------------------------------------------------------
  // GENERATE RECOMMENDATIONS
  // -------------------------------------------------------------------------

  async generateRecommendations(userId: string, goalId: string) {
    // -----------------------------------------------------------------------
    // 1. RATE LIMIT
    // -----------------------------------------------------------------------

    const rateLimitKey = `ratelimit:ai_recommend:${userId}`;

    const requestsCount =
      (await CacheManager.get<number>(rateLimitKey)) ?? 0;

    if (requestsCount >= 5) {
      throw new Error(
        'Rate limit exceeded: You can only generate recommendations 5 times per hour.',
      );
    }

    // -----------------------------------------------------------------------
    // 2. LOAD + AUTHORIZE GOAL
    // -----------------------------------------------------------------------

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new Error('Goal not found.');
    }

    // -----------------------------------------------------------------------
    // 3. LOAD PORTFOLIO
    // -----------------------------------------------------------------------

    const portfolio = await this.portfolioService.getPortfolio(userId);

    const existingHoldings =
      portfolio?.holdings
        ?.map((holding: any) => {
          const name = holding.fundName ?? 'Unknown Fund';
          const category = holding.category ?? 'Unknown Category';

          return `${name} (${category})`;
        })
        .join(', ') || 'None';

    // -----------------------------------------------------------------------
    // 4. LOAD AMFI UNIVERSE
    //
    // IMPORTANT:
    // Gemini is NOT allowed to invent funds.
    // Every candidate comes directly from the AMFI universe.
    // -----------------------------------------------------------------------

    const universe = await NavService.getFundUniverse();

    if (!universe.length) {
      throw new Error(
        'Unable to load the mutual fund universe. Please try again later.',
      );
    }

    // -----------------------------------------------------------------------
    // 5. FILTER ELIGIBLE FUNDS
    // -----------------------------------------------------------------------

    const eligibleFunds = this.getEligibleFunds(
      universe,
      goal.riskAppetite,
      goal.timeHorizonYears,
    );

    if (eligibleFunds.length === 0) {
      throw new Error(
        'No suitable Direct Growth mutual funds were found for this goal.',
      );
    }

    // Keep prompt reasonably small.
    // We don't need to send thousands of funds to Gemini.
    const candidates = this.selectCandidatePool(
      eligibleFunds,
      goal.riskAppetite,
      goal.timeHorizonYears,
    );

    if (candidates.length < 4) {
      throw new Error(
        'Not enough suitable mutual funds were found for this goal.',
      );
    }

    // -----------------------------------------------------------------------
    // 6. CREATE AI PROMPT
    // -----------------------------------------------------------------------

    const candidateText = candidates
      .map(
        (fund) =>
          `- schemeCode: ${fund.schemeCode}\n` +
          `  fundName: ${fund.schemeName}\n` +
          `  category: ${fund.category}\n` +
          `  amc: ${fund.amc}`,
      )
      .join('\n');

    const prompt = `
You are the recommendation/ranking engine for FinCal, an Indian mutual-fund
planning application.

IMPORTANT:
You MUST select funds ONLY from the supplied candidate universe.
You MUST NOT invent funds.
You MUST NOT invent scheme codes.
You MUST return schemeCode EXACTLY as provided in the candidate universe.

The application has already filtered the universe for:
- Active funds
- Direct plans
- Growth plans
- Goal risk compatibility
- Time-horizon compatibility

Your job is ONLY to rank the candidates and explain why they fit the goal.

USER GOAL
- Goal Type: ${goal.goalType}
- Investment Type: ${goal.investmentType}
- Lumpsum Amount: ₹${goal.lumpsumAmount ?? 0}
- SIP Amount: ₹${goal.sipAmount ?? 0}
- Target Corpus: ₹${goal.targetAmount}
- Time Horizon: ${goal.timeHorizonYears} years
- Flexible Horizon: ${goal.isFlexibleHorizon}
- Risk Appetite: ${goal.riskAppetite}
- Age: ${goal.age}
- Additional Notes: ${goal.additionalNotes || 'None'}

CURRENT PORTFOLIO:
${existingHoldings}

RECOMMENDATION RULES:

1. Select 4 to 6 funds.

2. ONLY select funds from the candidate universe below.

3. Do not change schemeCode.

4. Do not invent or modify fund names.

5. Prefer diversification rather than recommending multiple highly similar
   funds.

6. Respect the user's risk appetite.

7. Respect the time horizon:
   - Less than 3 years: strongly prefer debt/liquid/short-duration/hybrid
     candidates.
   - 3-5 years: prefer hybrid/large-cap/conservative equity candidates.
   - More than 5 years: equity can have a larger role when risk permits.

8. Consider the user's existing portfolio. Avoid unnecessary duplication.

9. Score each recommendation from 0 to 100.
   The score represents SUITABILITY FOR THIS SPECIFIC GOAL.
   It is NOT a probability of returns.

10. Allocation percentages must be between 0 and 100.
    The total should be approximately 100%.

11. Do not recommend IDCW, Dividend, Regular, or other non-Growth variants.

CANDIDATE UNIVERSE:

${candidateText}

Return ONLY valid JSON:

{
  "recommendations": [
    {
      "schemeCode": "EXACT_SCHEME_CODE_FROM_CANDIDATES",
      "score": 92,
      "reason": "Short explanation of why this candidate fits the goal.",
      "suggestedAllocationPercent": 30
    }
  ]
}
`;

    // -----------------------------------------------------------------------
    // 7. CALL AI
    // -----------------------------------------------------------------------

    let responseText: string;

    try {
      responseText = await callAI(prompt, 'json');
    } catch (error) {
      logger.error('AI recommendation generation failed', {
        goalId,
        userId,
        message: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }

    // -----------------------------------------------------------------------
    // 8. PARSE + VALIDATE AI RESPONSE
    // -----------------------------------------------------------------------

    let parsedAI: AIRecommendationResponse;

    try {
      const raw = JSON.parse(responseText);

      const validation =
        AIRecommendationResponseSchema.safeParse(raw);

      if (!validation.success) {
        logger.error('AI recommendation schema validation failed', {
          goalId,
          errors: validation.error.flatten(),
        });

        throw new Error(
          'AI returned an invalid recommendation structure.',
        );
      }

      parsedAI = validation.data;
    } catch (error) {
      logger.error('Failed to parse AI recommendation response', {
        goalId,
        responsePreview: responseText.slice(0, 1000),
        message: error instanceof Error ? error.message : String(error),
      });

      throw new Error(
        'AI returned an invalid recommendation format. Please try again.',
      );
    }

    // -----------------------------------------------------------------------
    // 9. BUILD AUTHORITATIVE CANDIDATE MAP
    //
    // The AI cannot override these values.
    // -----------------------------------------------------------------------

    const candidateMap = new Map<string, LiveNAV>();

    for (const fund of candidates) {
      candidateMap.set(fund.schemeCode, fund);
    }

    // -----------------------------------------------------------------------
    // 10. VALIDATE EVERY AI SELECTION
    // -----------------------------------------------------------------------

    const validatedRecommendations: Array<{
      schemeCode: string;
      fundName: string;
      category: string;
      score: number;
      reason: string;
      suggestedAllocationPercent: number;
    }> = [];

    const processedSchemeCodes = new Set<string>();

    for (const rec of parsedAI.recommendations) {
      const schemeCode = rec.schemeCode.trim();

      // AI selected a fund that was NOT in our universe.
      if (!candidateMap.has(schemeCode)) {
        logger.warn(
          `AI selected scheme not present in candidate universe: ${schemeCode}`,
        );

        continue;
      }

      // Prevent duplicate recommendations.
      if (processedSchemeCodes.has(schemeCode)) {
        continue;
      }

      const fund = candidateMap.get(schemeCode)!;

      // ---------------------------------------------------------------------
      // Defensive Direct Growth validation
      // ---------------------------------------------------------------------

      const lowerName = fund.schemeName.toLowerCase();

      const isDirect =
        lowerName.includes('direct');

      const isGrowth =
        lowerName.includes('growth');

      const isExcludedPlan =
        lowerName.includes('idcw') ||
        lowerName.includes('dividend') ||
        lowerName.includes('regular');

      if (!isDirect || !isGrowth || isExcludedPlan) {
        logger.warn(
          `Rejected non-Direct-Growth recommendation: ${fund.schemeName}`,
        );

        continue;
      }

      // ---------------------------------------------------------------------
      // Validate NAV
      //
      // AMFI universe already provides NAV, but this additionally verifies
      // that the scheme is currently resolvable by NavService.
      // ---------------------------------------------------------------------

      const liveNav = await NavService.getLatestNav(schemeCode);

      if (liveNav.navUnavailable || liveNav.nav <= 0) {
        logger.warn(
          `Rejected recommendation because NAV unavailable: ${schemeCode}`,
        );

        continue;
      }

      // ---------------------------------------------------------------------
      // Clamp score defensively
      // ---------------------------------------------------------------------

      const score = Math.min(
        100,
        Math.max(0, rec.score),
      );

      const allocation = Math.min(
        100,
        Math.max(0, rec.suggestedAllocationPercent),
      );

      processedSchemeCodes.add(schemeCode);

      validatedRecommendations.push({
        schemeCode,
        // IMPORTANT: use AMFI's canonical values, NOT AI's values.
        fundName: fund.schemeName,
        category: fund.category || liveNav.category || 'Unknown',
        score,
        reason: rec.reason.trim(),
        suggestedAllocationPercent: allocation,
      });
    }

    // -----------------------------------------------------------------------
    // 11. REQUIRE ENOUGH VALID RECOMMENDATIONS
    // -----------------------------------------------------------------------

    if (validatedRecommendations.length < 4) {
      throw new Error(
        'The AI did not produce enough valid mutual fund recommendations. Please try again.',
      );
    }

    // Keep maximum 6.
    validatedRecommendations.sort(
      (a, b) => b.score - a.score,
    );

    const finalRecommendations =
      validatedRecommendations.slice(0, 6);

    // -----------------------------------------------------------------------
    // 12. NORMALIZE ALLOCATION
    //
    // AI may return 30 + 30 + 20 + 10 = 90.
    // Instead of showing an incomplete portfolio, normalize to 100.
    // -----------------------------------------------------------------------

    const allocationTotal = finalRecommendations.reduce(
      (sum, rec) => sum + rec.suggestedAllocationPercent,
      0,
    );

    if (allocationTotal <= 0) {
      const equalAllocation =
        100 / finalRecommendations.length;

      finalRecommendations.forEach((rec) => {
        rec.suggestedAllocationPercent =
          Number(equalAllocation.toFixed(2));
      });
    } else {
      finalRecommendations.forEach((rec) => {
        rec.suggestedAllocationPercent = Number(
          (
            (rec.suggestedAllocationPercent / allocationTotal) *
            100
          ).toFixed(2),
        );
      });

      // Fix rounding error so total is exactly 100.
      const normalizedTotal = finalRecommendations.reduce(
        (sum, rec) => sum + rec.suggestedAllocationPercent,
        0,
      );

      const roundingDifference =
        Number((100 - normalizedTotal).toFixed(2));

      finalRecommendations[0]!.suggestedAllocationPercent =
        Number(
          (
            finalRecommendations[0]!.suggestedAllocationPercent +
            roundingDifference
          ).toFixed(2),
        );
    }

    // -----------------------------------------------------------------------
    // 13. DATABASE TRANSACTION
    //
    // Existing recommendations are deleted ONLY after the new set has
    // completely passed validation.
    // -----------------------------------------------------------------------

    const savedRecommendations =
      await prisma.$transaction(async (tx) => {
        await tx.aIRecommendation.deleteMany({
          where: {
            goalId: goal.id,
            userId,
          },
        });

        const created = [];

        for (const rec of finalRecommendations) {
          const saved =
            await tx.aIRecommendation.create({
              data: {
                goalId: goal.id,
                userId,

                // All of these values come from the validated AMFI universe.
                schemeCode: rec.schemeCode,
                fundName: rec.fundName,
                category: rec.category,

                score: rec.score,
                reason: rec.reason,
                suggestedAllocationPercent:
                  rec.suggestedAllocationPercent,
              },
            });

          created.push(saved);
        }

        return created;
      });

    // -----------------------------------------------------------------------
    // 14. INCREMENT RATE LIMIT
    // -----------------------------------------------------------------------

    await CacheManager.set(
      rateLimitKey,
      requestsCount + 1,
      3600,
    );

    // -----------------------------------------------------------------------
    // 15. RETURN SORTED BY SCORE
    // -----------------------------------------------------------------------

    return savedRecommendations.sort(
      (a, b) => b.score - a.score,
    );
  }

  // =========================================================================
  // ELIGIBILITY
  // =========================================================================

  private getEligibleFunds(
    universe: LiveNAV[],
    riskAppetite: string,
    timeHorizonYears: number,
  ): LiveNAV[] {
    // -----------------------------------------------------------------------
    // First: only currently present/active AMFI schemes.
    //
    // A fund existing in the current NAV universe means it currently has
    // a published NAV.
    // -----------------------------------------------------------------------

    let funds = universe.filter((fund) => {
      if (!fund.schemeCode || !fund.schemeName) {
        return false;
      }

      if (!fund.nav || fund.nav <= 0) {
        return false;
      }

      const name = fund.schemeName.toLowerCase();

      // Strict Direct Growth requirement.
      if (!name.includes('direct')) {
        return false;
      }

      if (!name.includes('growth')) {
        return false;
      }

      // Explicitly exclude unwanted plans.
      if (
        name.includes('regular') ||
        name.includes('idcw') ||
        name.includes('dividend')
      ) {
        return false;
      }

      return true;
    });

    // -----------------------------------------------------------------------
    // Horizon filtering
    // -----------------------------------------------------------------------

    if (timeHorizonYears < 3) {
      const shortTerm = funds.filter((fund) =>
        this.isShortTermSuitableCategory(fund.category),
      );

      if (shortTerm.length >= 4) {
        funds = shortTerm;
      }
    } else if (timeHorizonYears <= 5) {
      const mediumTerm = funds.filter((fund) =>
        this.isMediumTermSuitableCategory(fund.category),
      );

      if (mediumTerm.length >= 4) {
        funds = mediumTerm;
      }
    } else {
      const longTerm = funds.filter((fund) =>
        this.isLongTermSuitableCategory(
          fund.category,
          riskAppetite,
        ),
      );

      if (longTerm.length >= 4) {
        funds = longTerm;
      }
    }

    // -----------------------------------------------------------------------
    // Risk filtering
    // -----------------------------------------------------------------------

    const riskFiltered = funds.filter((fund) =>
      this.isRiskSuitable(fund.category, riskAppetite),
    );

    // Only replace the original set if filtering didn't make the universe
    // unusably small.
    if (riskFiltered.length >= 4) {
      funds = riskFiltered;
    }

    return funds;
  }

  // =========================================================================
  // CANDIDATE POOL
  // =========================================================================

  private selectCandidatePool(
    funds: LiveNAV[],
    riskAppetite: string,
    timeHorizonYears: number,
  ): LiveNAV[] {
    const scored = funds.map((fund) => ({
      fund,
      score: this.categorySuitabilityScore(
        fund.category,
        riskAppetite,
        timeHorizonYears,
      ),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Give Gemini a manageable candidate set.
    return scored
      .slice(0, 60)
      .map((item) => item.fund);
  }

  // =========================================================================
  // CATEGORY RULES
  // =========================================================================

  private isShortTermSuitableCategory(
    category: string,
  ): boolean {
    const c = category.toLowerCase();

    return (
      c.includes('liquid') ||
      c.includes('money market') ||
      c.includes('ultra short') ||
      c.includes('low duration') ||
      c.includes('short duration') ||
      c.includes('overnight') ||
      c.includes('arbitrage') ||
      c.includes('conservative hybrid')
    );
  }

  private isMediumTermSuitableCategory(
    category: string,
  ): boolean {
    const c = category.toLowerCase();

    return (
      c.includes('hybrid') ||
      c.includes('large cap') ||
      c.includes('balanced advantage') ||
      c.includes('equity savings') ||
      c.includes('multi asset') ||
      c.includes('large & mid cap')
    );
  }

  private isLongTermSuitableCategory(
    category: string,
    riskAppetite: string,
  ): boolean {
    const c = category.toLowerCase();

    if (riskAppetite === 'low') {
      return (
        c.includes('large cap') ||
        c.includes('balanced advantage') ||
        c.includes('multi asset') ||
        c.includes('equity savings') ||
        c.includes('hybrid')
      );
    }

    if (riskAppetite === 'moderate') {
      return (
        c.includes('large cap') ||
        c.includes('flexi cap') ||
        c.includes('large & mid cap') ||
        c.includes('multi asset') ||
        c.includes('balanced advantage') ||
        c.includes('hybrid')
      );
    }

    // High risk.
    return (
      c.includes('flexi cap') ||
      c.includes('large & mid cap') ||
      c.includes('mid cap') ||
      c.includes('small cap') ||
      c.includes('large cap') ||
      c.includes('multi asset')
    );
  }

  private isRiskSuitable(
    category: string,
    riskAppetite: string,
  ): boolean {
    const c = category.toLowerCase();

    if (riskAppetite === 'low') {
      return (
        c.includes('liquid') ||
        c.includes('money market') ||
        c.includes('short duration') ||
        c.includes('low duration') ||
        c.includes('conservative') ||
        c.includes('balanced advantage') ||
        c.includes('multi asset') ||
        c.includes('equity savings') ||
        c.includes('large cap') ||
        c.includes('hybrid')
      );
    }

    if (riskAppetite === 'moderate') {
      return (
        c.includes('large cap') ||
        c.includes('flexi cap') ||
        c.includes('large & mid cap') ||
        c.includes('multi asset') ||
        c.includes('balanced advantage') ||
        c.includes('hybrid') ||
        c.includes('mid cap')
      );
    }

    // High.
    return (
      c.includes('flexi cap') ||
      c.includes('large & mid cap') ||
      c.includes('mid cap') ||
      c.includes('small cap') ||
      c.includes('large cap') ||
      c.includes('multi asset') ||
      c.includes('hybrid')
    );
  }

  private categorySuitabilityScore(
    category: string,
    riskAppetite: string,
    timeHorizonYears: number,
  ): number {
    const c = category.toLowerCase();

    let score = 50;

    // -------------------------------------------------------------
    // Horizon
    // -------------------------------------------------------------

    if (timeHorizonYears < 3) {
      if (
        c.includes('liquid') ||
        c.includes('money market') ||
        c.includes('short duration') ||
        c.includes('low duration')
      ) {
        score += 35;
      }

      if (
        c.includes('small cap') ||
        c.includes('mid cap') ||
        c.includes('flexi cap')
      ) {
        score -= 30;
      }
    } else if (timeHorizonYears <= 5) {
      if (
        c.includes('hybrid') ||
        c.includes('balanced advantage') ||
        c.includes('multi asset') ||
        c.includes('large cap')
      ) {
        score += 25;
      }

      if (c.includes('small cap')) {
        score -= 15;
      }
    } else {
      if (
        c.includes('flexi cap') ||
        c.includes('large & mid cap') ||
        c.includes('mid cap')
      ) {
        score += 25;
      }

      if (c.includes('small cap')) {
        score += riskAppetite === 'high' ? 20 : -10;
      }
    }

    // -------------------------------------------------------------
    // Risk
    // -------------------------------------------------------------

    if (riskAppetite === 'low') {
      if (
        c.includes('liquid') ||
        c.includes('money market') ||
        c.includes('short duration') ||
        c.includes('hybrid') ||
        c.includes('balanced advantage')
      ) {
        score += 15;
      }

      if (
        c.includes('small cap') ||
        c.includes('mid cap')
      ) {
        score -= 25;
      }
    }

    if (riskAppetite === 'moderate') {
      if (
        c.includes('large cap') ||
        c.includes('flexi cap') ||
        c.includes('balanced advantage') ||
        c.includes('multi asset')
      ) {
        score += 15;
      }
    }

    if (riskAppetite === 'high') {
      if (
        c.includes('mid cap') ||
        c.includes('small cap') ||
        c.includes('flexi cap')
      ) {
        score += 15;
      }
    }

    return Math.max(0, Math.min(100, score));
  }
}