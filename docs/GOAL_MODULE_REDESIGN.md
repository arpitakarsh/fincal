# Goal Module Redesign & Recommendation Engine Upgrade

## Objective
The original Goal implementation lacked sufficient financial planning parameters to provide high-quality mutual fund recommendations. This redesign captures comprehensive data points about the user's goal and leverages them to improve the Recommendation Engine's relevance and confidence scores.

## Architecture & Schema Changes
The Prisma `Goal` model has been expanded to include:
- **`initialInvestment` (Float):** Represents the existing savings allocated toward the goal at creation.
- **`expectedInflation` (Float):** The estimated inflation rate the user wants to beat.
- **`flexibility` (String - FIXED | FLEXIBLE):** Determines if the target date is rigid or can be extended.
- **`investmentMode` (String - SIP | LUMPSUM | BOTH):** The preferred method of investing in mutual funds for this goal.
*(Note: `priority` already existed but was not utilized properly. It is now exposed to the user.)*

## Backend & API Adjustments
- **Validation:** `src/domains/goal/validation.ts` has been updated using Zod to enforce strict validation and provide sensible defaults for the new fields.
- **API Routes:** The POST and PUT routes for Goals now seamlessly handle the extended payload and ensure `healthScore` is initialized safely.
- **DTOs:** Backend layers pass the full payload intact to Prisma to ensure nothing is lost during persistence.

## Recommendation Engine Upgrade
The scoring algorithm in `src/engine/RecommendationEngine.ts` has been significantly improved:
1. **Base Scoring:** Adjusted baseline scores and horizon-matching weights to naturally reflect high-confidence matches (80-95 score range) rather than being artificially depressed around 35.
2. **Flexibility & Priority Weighting:** High-priority or 'Fixed' goals penalize extreme volatility (equity) as the target date approaches, preferring stable returns. Flexible goals reward equity for long-term growth.
3. **Inflation Beating:** Goals with an `expectedInflation > 6%` over a medium/long horizon receive a boost for Equity funds capable of outpacing inflation.
4. **Investment Mode Enforcement:** If a user strictly selects `SIP`, the engine penalizes funds that lack a minimum SIP value or require an SIP amount higher than the user's allocated `monthlySip`.

## Frontend Redesign
- **`CreateGoalPage` & `EditGoalPage`:** Both forms were completely redesigned utilizing clean, responsive Tailwind CSS layouts.
- Form fields are logically grouped into "Basic Details", "Financial Details", and "Planning Parameters".
- All fields persist correctly via the updated API integration.

## Testing & Verification
- `npm run build`, `npm run lint`, and `npx prisma validate` executed flawlessly.
- Database schema successfully synchronized via `npx prisma db push`.
- The End-to-End flow remains backward compatible with existing user goals.
