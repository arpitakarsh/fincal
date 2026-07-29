# Known Issues & Technical Debt

## Architectural Problems

1. **The "God Component" (`FinCalApp.jsx`)**
   - **Issue:** The root calculator component (`src/FinCalApp.jsx`) is nearly 900 lines long. It handles URL routing logic (tabs), all user input state, orchestrates the engine calculations via `useMemo`, and defines layout.
   - **Impact:** Hard to maintain, prone to merge conflicts, and causes unnecessary full-tree re-renders when a single input changes.
   - **Required Fix:** Implement a global state manager (like Context API or Zustand) to decouple state from the layout. Extract tab views into separate components.

2. **Inline Styling mixed with Tailwind**
   - **Issue:** Several components (especially `FinCalApp.jsx`) use a mix of Tailwind utility classes and React inline `style={{...}}` objects.
   - **Impact:** Reduces code readability and makes global theme changes difficult.
   - **Required Fix:** Move all inline styles to Tailwind classes or custom CSS classes in `globals.css`.

## Technical Debt

1. **Missing Automated Tests**
   - **Issue:** There are zero unit tests for the mathematical logic in `src/engine/`.
   - **Impact:** **Critical.** A financial calculator must be provably accurate. Any future refactoring risks breaking calculations silently.
   - **Required Fix:** Setup Jest or Vitest immediately and write unit tests covering edge cases for `formulas.js`, `scenarios.js`, and `yearByYear.js`.

2. **Unauthenticated API Route**
   - **Issue:** The `/api/ai` route is completely public.
   - **Impact:** Anyone could hit this endpoint and exhaust the Google Generative AI API quota.
   - **Required Fix:** Implement basic rate limiting (e.g., using Upstash Redis or Vercel KV) before going to production.

## Current Bugs

1. (No critical bugs identified in current manual testing, but edge cases in math remain unverified without unit tests).

## Missing Validation

1. **Extreme Values**
   - **Issue:** While `validators.js` catches some issues, a user can still input extremely large numbers (e.g., ₹100 Crores for a wedding) which might cause floating-point precision issues or chart rendering glitches.
   - **Required Fix:** Add strict max constraints to input fields.
