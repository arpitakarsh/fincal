# Features

## Implemented

### Goal-Based SIP Calculator
- **Description:** Calculates required monthly SIP based on target cost, time horizon, expected return, and inflation.
- **Dependencies:** `src/engine/formulas.js`
- **Current Status:** Implemented.

### AI Goal Parser
- **Description:** Allows users to input goals in natural language, automatically filling out the calculator form.
- **Dependencies:** `@google/generative-ai`, `src/app/api/ai`
- **Current Status:** Implemented.

### Scenario Analysis
- **Description:** Compares the required SIP across Conservative, Moderate, and Aggressive return assumptions.
- **Dependencies:** `src/engine/scenarios.js`
- **Current Status:** Implemented.

### Sensitivity Heatmap
- **Description:** Visualizes how SIP requirements change across a matrix of varying inflation and return rates.
- **Dependencies:** `src/engine/sensitivity.js`
- **Current Status:** Implemented.

### Cost of Delay
- **Description:** Shows the financial impact of delaying the start of investment by 1, 3, or 5 years.
- **Dependencies:** `src/engine/formulas.js`
- **Current Status:** Implemented.

### Step-Up SIP
- **Description:** Calculates the initial SIP required if the user plans to increase their contribution annually by a fixed percentage.
- **Dependencies:** `src/engine/stepUp.js`
- **Current Status:** Implemented.

### Reverse Calculator
- **Description:** Given a monthly SIP amount, calculates the future corpus value.
- **Dependencies:** `src/engine/formulas.js`
- **Current Status:** Implemented.

### Goal Comparison
- **Description:** Compares multiple goals side-by-side.
- **Dependencies:** None
- **Current Status:** Implemented.

### Export to PDF
- **Description:** Generates a downloadable PDF report of the calculation results.
- **Dependencies:** `jspdf`, `html2canvas`
- **Current Status:** Implemented.

---

## Planned

### Investor Risk Profiling
- **Description:** Questionnaire to evaluate user's risk tolerance and map to a profile.
- **Dependencies:** Database (Future)
- **Current Status:** Planned.

### Mutual Fund Category Allocation
- **Description:** Recommends asset class allocation (Equity vs. Debt, Large vs. Mid cap) based on time horizon and risk.
- **Dependencies:** Investor Profiling
- **Current Status:** Planned.

### Specific Fund Recommendations
- **Description:** Suggests specific top-performing funds based on category allocation.
- **Dependencies:** External Fund API integration
- **Current Status:** Planned.

### Monte Carlo Simulation (Probability Engine)
- **Description:** Runs thousands of simulations to determine the probability of reaching the goal.
- **Dependencies:** Historical market data
- **Current Status:** Planned.

### Portfolio Saving & Tracking
- **Description:** Allows authenticated users to save goals and track progress over time.
- **Dependencies:** Authentication, Database
- **Current Status:** Planned.
