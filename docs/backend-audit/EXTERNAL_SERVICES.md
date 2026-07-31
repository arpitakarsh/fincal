# External Services

The backend integrates with several external services to function:

1. **Google Generative AI (Gemini)**
   - Used for all AI features (insights, recommendations, chat).
   - Uses the `@google/generative-ai` SDK.
   - Relies on `GEMINI_API_KEY`.

2. **AMFI India (Association of Mutual Funds in India)**
   - Used by `LiveFundService` to get the latest NAVs for all mutual funds.
   - Endpoint: `https://www.amfiindia.com/spages/NAVAll.txt`.
   - Data parsed manually to extract scheme codes, AMC, category, and NAVs.

3. **MFAPI.in**
   - Used by `LiveFundService` to fetch historical NAV data and basic details for specific funds.
   - Endpoint: `https://api.mfapi.in/mf/[schemeCode]`.

4. **Better Auth**
   - Handles authentication and session management.
   - Integrated with Prisma adapter.
