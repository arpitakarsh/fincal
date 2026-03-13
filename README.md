# FinCal

**Plan smarter. Invest with clarity. Reach every goal.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fincal--eight.vercel.app-2ea44f?style=for-the-badge)](https://fincal-eight.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js&logoColor=white&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Not%20specified-333?logo=node.js&logoColor=white&style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-gemini--3.1--flash--lite--preview-4285F4?logo=google&logoColor=white&style=for-the-badge)
![Hackathon](https://img.shields.io/badge/TECHNEX%20'26%20%7C%20HDFC%20Mutual%20Fund%20%7C%20%E2%82%B940,000%20prize%20pool-DA3832?style=for-the-badge)

## ?? Table of Contents
- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [AI Features](#ai-features)
- [Financial Logic](#financial-logic)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Use the App](#how-to-use-the-app)
- [How to Run Locally](#how-to-run-locally)
- [UI/UX](#uiux)
- [Charts & Visualizations](#charts--visualizations)
- [Accessibility](#accessibility)
- [Compliance](#compliance)
- [Team](#team)
- [Footer Disclaimer](#footer-disclaimer)

## ?? Overview
FinCal is a goal-based investment calculator that estimates the SIP required to reach a future goal, with scenario analysis, sensitivity checks, and optional lumpsum and step-up modeling.

It solves the common problem of guessing �how much should I invest per month� by turning a present-day goal cost into a future value and deriving the required SIP with transparent assumptions.

Built for TECHNEX '26, the project emphasizes clarity, speed, and investor-safe language for a hackathon-grade financial planning tool.

## ?? Live Demo
**Live Demo:** https://fincal-eight.vercel.app/

Note: AI features require `GEMINI_API_KEY`. College networks may block Google APIs, so use a hotspot if AI calls fail.

## ? Features
**Goal Types (with default inflation):**

| Goal Type | Default Inflation | Source |
| --- | --- | --- |
| House | 9% | `src/engine/defaults.js` |
| Education | 11% | `src/engine/defaults.js` |
| Healthcare | 9% | `src/engine/defaults.js` |
| Wedding | 8% | `src/engine/defaults.js` |
| Travel | 6.5% | `src/engine/defaults.js` |
| Car | 6% | `src/engine/defaults.js` |
| General | 6% | `src/engine/defaults.js` |

**Scenario Returns (hardcoded):**

| Scenario | Annual Return |
| --- | --- |
| Conservative | 8% |
| Moderate | 10% |
| Aggressive | 12% |

**Return Defaults by Time Horizon:**
- `< 3 years` ? 6.5% (Debt)
- `3�5 years` ? 9.5% (Hybrid)
- `> 5 years` ? 12% (Equity)

**Calculation Modes (confirmed):**
- SIP calculation from inflated future cost.
- Lumpsum offset: one-time investment reduces required SIP.
- Step-up SIP modeling: annual SIP increase affects year-by-year projections.

**Other Confirmed Features:**
- Sensitivity Heatmap (6�6 grid of inflation vs return assumptions).
- Cost of Delay: 1�3 year delay impact on SIP.
- Goal Reality Indicator (confidence score from input sanity checks).
- Reverse Calculator (SIP ? Goal and Goal ? SIP).
- Compare Goals (side-by-side comparison with chart).
- Export PDF report from the calculator.
- AI-powered goal parsing, goal validation, and insight summary.
- Sticky compliance disclaimer and pre-tax LTCG banner.

**Features Comparison:**

| Feature | Goal Calculator | Reverse Calculator | Compare Goals |
| --- | --- | --- | --- |
| Goal-based SIP calculation | Yes | Yes (Goal ? SIP) | Yes (per goal) |
| SIP ? Goal projection | No | Yes | No |
| Scenario cards (8/10/12%) | Yes | No | No |
| Sensitivity heatmap | Yes | No | No |
| Step-up SIP toggle | Yes | No | No |
| Lumpsum toggle | Yes | No | No |
| AI insights/validation | Yes | No | No |
| Export PDF | Yes | No | No |
| Goal comparison chart | No | No | Yes |

## ?? AI Features
- **NL Goal Parser** � Parses a plain-English goal into `{goalType, cost, yrs}` via `/api/ai` and applies it to the form. Triggered manually by user action (Enter/Go button).
- **Goal Insight Paragraph** � Auto-generates a 3�4 line summary after input changes with a 1.5s debounce. Triggered automatically when results update.
- **Goal Validator** � Auto-checks realism of cost, inflation, and return assumptions, returning warning flags. Triggered automatically when results update.

All AI runs server-side via `src/app/api/ai/route.js` using `GEMINI_API_KEY`. The API key is never sent to the client.

Compliance guardrails are enforced in prompts (no guaranteed/assured language, JSON-only responses for parser/validator).

## ?? Financial Logic
All formulas below are taken directly from `src/engine/*`.

**Inflated Future Value:**
```text
FV = cost * (1 + inflation/100) ^ yrs
```

**Monthly SIP (end-of-month compounding, contribution at start of month):**
```text
r = annualRet / 12 / 100
n = yrs * 12
SIP = (FV * r) / (( (1 + r) ^ n - 1 ) * (1 + r))
```

**Lumpsum Future Value:**
```text
lumpsumFV = lumpsumAmount * (1 + annualReturn/100) ^ years
```

**Effective SIP When Lumpsum Exists:**
```text
effFV = max(0, FV - lumpsumFV)
SIP = calcSIP(effFV, annualReturn, years)
```

**Step-Up SIP (annual increase):**
```text
sipThisYear = baseSIP * (1 + stepUpPercent/100) ^ (year - 1)
```

**Year-by-Year Compounding:**
```text
monthlyRate = annualReturn / 100 / 12
corpusValue = (corpusValue + sipThisYear) * (1 + monthlyRate)
```

**Cost of Delay (1�3 years):**
```text
newSIP = calculateSIP({ presentCost, inflation, annualReturn, years: remainingYears })
extraSIP = newSIP - originalSIP
extraTotal = extraSIP * remainingYears * 12
```

**Sensitivity Grid (6�6):**
```text
INFLATIONS = [4, 6, 8, 10, 12, 14]
RETURNS    = [6, 8, 10, 12, 14, 16]
SIP = calcSIP(calcFV(cost, inflation, yrs), return, yrs)
```

**Variable Definitions:**
- `cost` = present-day goal amount
- `inflation` = annual inflation rate (%)
- `yrs` = time horizon in years
- `annualRet` / `annualReturn` = expected annual return (%)
- `r` = monthly return rate (`annualRet / 12 / 100`)
- `n` = total months (`yrs * 12`)

## ?? Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js | 16.1.6 |
| UI Library | React | 19.0.0 |
| Runtime | Node.js | Not specified in `package.json` |
| AI SDK | @google/generative-ai | 0.24.1 |
| Charts | Recharts | 3.8.0 |
| Animation | Framer Motion | 12.35.2 |
| Styling | Tailwind CSS | 3.4.1 |
| UI Primitives | Radix UI | 1.2.x�1.3.x |
| Icons | lucide-react | 0.482.0 |
| PDF Export | html2canvas + jsPDF | 1.4.1 + 4.2.0 |
| Deployment | Vercel (live demo URL) | vercel.app |

## ??? Project Structure
```text
.
+- package.json                 # Scripts and dependencies
+- next.config.js               # Next.js configuration
+- public/                      # Static assets
�  +- logo.png                  # FinCal logo used in header
�  +- file.svg                  # Default Next assets
�  +- globe.svg                 # Default Next assets
�  +- next.svg                  # Default Next assets
�  +- vercel.svg                # Default Next assets
�  +- window.svg                # Default Next assets
+- src/
   +- app/
   �  +- layout.js              # Root layout + Montserrat font + global body styles
   �  +- globals.css            # Tailwind base + key animations
   �  +- page.js                # Landing page (marketing + feature highlights)
   �  +- calculator/
   �  �  +- page.js             # Calculator entry (renders FinCalApp)
   �  +- api/
   �     +- ai/
   �        +- route.js          # AI API handler (insight/validator/parser)
   +- FinCalApp.jsx             # Main app orchestrator (state, tabs, data flow)
   +- engine/                   # Financial calculation engine
   �  +- defaults.js            # Goal inflation and return defaults
   �  +- delay.js               # Cost-of-delay computation
   �  +- formulas.js            # FV, SIP, lumpsum, aggregate outputs
   �  +- lumpsum.js             # Lumpsum future value
   �  +- scenarios.js           # Conservative/Moderate/Aggressive scenarios
   �  +- sensitivity.js         # Inflation/return heatmap grid
   �  +- stepUp.js              # Step-up SIP calculator
   �  +- validators.js          # Input validation + confidence score
   �  +- yearByYear.js          # Year-by-year compounding engine
   +- lib/
   �  +- constants.js           # Colors, goals, presets, ranges, breakpoints
   �  +- utils.js               # Currency formatters + helpers
   �  +- ai/
   �     +- parser.js           # AI JSON response parsing
   �     +- prompts.js          # Prompt templates + compliance rule
   �     +- service.js          # Gemini model wrapper (server-side)
   +- components/
      +- ai/
      �  +- GoalValidator.jsx   # AI warning flags for inputs
      �  +- InsightParagraph.jsx# AI-generated goal summary
      �  +- NLGoalInput.jsx     # Natural-language goal parser input
      +- blocks/
      �  +- feature-section.jsx # Landing page stepper block
      +- charts/
      �  +- AreaChart.jsx       # Scenario growth over time
      �  +- DonutChart.jsx      # Invested vs returns breakdown
      �  +- GlidePath.jsx       # Equity/debt glide path
      �  +- SensitivityHeatTable.jsx # Inflation vs return SIP heatmap
      �  +- StackedBarChart.jsx # Year-by-year invested vs returns
      �  +- StepUpBarChart.jsx  # Step-up SIP yearly bars
      �  +- TimelineVisual.jsx  # Goal milestone timeline
      +- inputs/
      �  +- GoalInputForm.jsx   # Cost, years, inflation inputs + validation
      �  +- GoalSelector.jsx    # Goal type selector
      �  +- LumpsumToggle.jsx   # Lumpsum toggle + input
      �  +- QuickPresets.jsx    # Goal amount presets
      �  +- RiskProfileSelector.jsx # Safe/Balanced/Growth selection
      �  +- SliderInput.jsx     # Reusable slider with tooltip
      �  +- StepUpToggle.jsx    # Step-up SIP toggle + percent slider
      +- layout/
      �  +- BottomSheet.jsx     # Mobile bottom sheet container
      �  +- EducationTips.jsx   # Education-specific tips block
      �  +- Header.jsx          # Sticky header with logo + tab bar
      �  +- HeroSection.jsx     # Full-screen hero
      �  +- StickyDisclaimer.jsx# Fixed compliance disclaimer bar
      �  +- TaxationBanner.jsx  # LTCG pre-tax banner
      +- magicui/
      �  +- animated-shiny-text.jsx # Shimmering badge text
      �  +- border-beam.jsx     # Decorative border animation
      +- results/
      �  +- AnalyticsSection.jsx# Aggregated analysis blocks
      �  +- CostOfDelayCard.jsx # Delay impact card
      �  +- GoalComparison.jsx  # Compare two goals view
      �  +- GoalRealityIndicator.jsx # Confidence score visual
      �  +- HeadlineSIP.jsx     # Primary SIP hero card
      �  +- ReverseCalculator.jsx # SIP ? Goal calculator
      �  +- ScenarioCards.jsx   # Scenario SIP cards
      +- shared/
      �  +- AmberWarning.jsx    # Soft warning block
      �  +- AssumptionLock.jsx  # Lock/unlock assumptions
      �  +- AssumptionTransparency.jsx # Formula disclosure accordion
      �  +- ErrorMessage.jsx    # Error message w/ shake animation
      �  +- ExportPdfButton.jsx # PDF export action
      �  +- SkeletonLoader.jsx  # Loading placeholder
      �  +- Tooltip.jsx         # Radix-based tooltip
      +- ui/
         +- Accordion.jsx       # Styled accordion wrapper
         +- AnimatedCircularProgressBar.jsx # Circular gauge
         +- card-hover-effect.jsx # Hoverable feature cards
         +- GlowMenu.jsx        # Animated tab selector
         +- NumberCounter.jsx   # Animated number ticker
```

## ?? How to Use the App
1. Open the calculator from the landing page or directly at `/calculator`.
2. Pick a goal type and enter today�s cost, time horizon, and inflation assumption.
3. Use Quick Presets for goal amount or type directly for custom values.
4. Choose a risk profile or adjust the return slider (lock if you want to preserve a value).
5. Toggle Step-up SIP or Lumpsum to model alternate investment styles.
6. Review the SIP result, scenario cards, sensitivity heatmap, and goal reality indicator.
7. Switch tabs for Reverse Calculator or Compare Goals to explore alternate planning views.
8. Export a PDF report from the main calculator when ready.
9. On mobile, use the floating SIP pill to jump back to results quickly.

## ??? How to Run Locally
```bash
git clone https://github.com/arpitakarsh/fincal.git
cd fincal
npm install
# create .env.local and add required keys
npm run dev
```

**Required Environment Variables:**
```text
GEMINI_API_KEY=
```

Build for production:
```bash
npm run build
```

Note: Use a hotspot if campus networks block Google Gemini API calls.

## ?? UI/UX
**Brand Colors:**

| Token | Hex |
| --- | --- |
| Blue | #224c87 |
| Red | #da3832 |
| Grey | #919090 |
| Background | #f8f9fb |

**Fonts:**
- Montserrat for numerals and headings (via Next font loader)
- Arial for body copy

**Responsive Breakpoints (from code):**
- `sm`: 480px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Micro-interactions & Motion (confirmed):**
- Framer Motion transitions on cards, panels, and tab UI.
- Animated number counters (react-countup + custom NumberCounter).
- Shimmer loaders and skeleton states.
- Accordion open/close animations.
- Confetti celebration for �goal already met� state.

## ?? Charts & Visualizations

| Component | Description |
| --- | --- |
| AreaChart | Scenario-wise corpus growth across years using SIP compounding. |
| DonutChart | Invested vs returns breakdown with growth multiple label. |
| GlidePath | Equity/debt glide path that shifts toward debt as time reduces. |
| SensitivityHeatTable | 6�6 heatmap of SIP vs inflation and return assumptions. |
| StackedBarChart | Year-by-year invested vs returns stacked bars. |
| StepUpBarChart | SIP growth per year for step-up mode. |
| TimelineVisual | Milestone timeline of corpus buildup with count-up. |

## ? Accessibility
WCAG 2.1 AA support is applied where implemented in code:
- `aria-label` on interactive controls and inputs.
- `aria-pressed` / `aria-expanded` for toggles and accordions.
- `role="alert"` for inline error messages.
- `role="contentinfo"` for the sticky disclaimer.
- Focus styles and keyboard-friendly components (Radix primitives).
- Touch-friendly button sizes (many controls use = 44px height).

## ? Compliance
- Sticky disclaimer is always visible at the bottom of the app.
- AI prompts forbid guarantee language (no �assured� or �certain� returns).
- No specific fund promotion in UI or AI outputs.
- All assumptions are user-editable and can be locked.
- Results are labeled estimated/illustrative across UI and prompts.
- HDFC AMC retains IP ownership per hackathon terms.

## ?? Team
- **Arpit**: `engine/`, `lib/ai/`, `app/api/ai/`, `FinCalApp.jsx`, results components, AI components, chart components, accessibility + responsiveness
- **Himanshu**: input components, layout components, shared utilities

## ?? Footer Disclaimer
Results are estimated and illustrative only. Not financial advice. Consult a SEBI-registered investment advisor. HDFC AMC retains IP ownership of this submission.
