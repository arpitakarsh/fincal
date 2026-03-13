<div align="center">

# FinCal

**Plan smarter. Invest with clarity. Reach every goal.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fincal--eight.vercel.app-2ea44f?style=for-the-badge)](https://fincal-eight.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js&logoColor=white&style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-gemini--2.0--flash-4285F4?logo=google&logoColor=white&style=for-the-badge)
![Hackathon](https://img.shields.io/badge/TECHNEX%20'26%20%7C%20HDFC%20Mutual%20Fund%20%7C%20%E2%82%B940%2C000%20Prize-DA3832?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [AI Features](#-ai-features)
- [Financial Logic](#-financial-logic)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How to Use the App](#-how-to-use-the-app)
- [How to Run Locally](#-how-to-run-locally)
- [UI/UX](#-uiux)
- [Charts & Visualizations](#-charts--visualizations)
- [Accessibility](#-accessibility)
- [Compliance](#-compliance)
- [Team](#-team)
- [Disclaimer](#-disclaimer)

---

## 🌟 Overview

FinCal is a goal-based investment calculator that estimates the SIP required to reach a future goal, with scenario analysis, sensitivity checks, and optional lumpsum and step-up modeling.

It solves the core question every investor has — *"how much should I invest per month?"* — by turning a present-day goal cost into an inflation-adjusted future value and deriving the required SIP with fully transparent, editable assumptions.

Built for **TECHNEX '26 — FinCal Innovation Hackathon**, co-sponsored by HDFC Mutual Fund (₹40,000 prize pool).

---

## 🚀 Live Demo

### 👉 [https://fincal-eight.vercel.app/](https://fincal-eight.vercel.app/)

> AI features require `GEMINI_API_KEY`. College networks may block Google APIs — use a mobile hotspot if AI calls fail.

---

## ✨ Features

### Goal Types

| Goal Type | Default Inflation |
|-----------|------------------|
| House | 9% |
| Education | 11% |
| Healthcare | 9% |
| Wedding | 8% |
| Travel | 6.5% |
| Car | 6% |
| General | 6% |

### Scenario Returns

| Scenario | Annual Return |
|----------|--------------|
| Conservative | 8% |
| Moderate | 10% |
| Aggressive | 12% |

### Return Defaults by Time Horizon

| Horizon | Default Return | Asset Class |
|---------|---------------|-------------|
| < 3 years | 6.5% | Debt |
| 3-5 years | 9.5% | Hybrid |
| > 5 years | 12% | Equity |

### Calculation Modes

- SIP calculation from inflation-adjusted future cost
- Lumpsum offset — one-time investment reduces required monthly SIP
- Step-up SIP — annual SIP increment models income growth over time

### Additional Features

- Sensitivity Heatmap — 6x6 grid across inflation (4-14%) x return (6-16%)
- Cost of Delay — 1-3 year delay impact on required SIP
- Goal Reality Indicator — confidence score from input sanity checks
- Reverse Calculator — SIP to Goal and Goal to SIP
- Compare Goals — side-by-side comparison with chart
- Export PDF report from the calculator
- AI-powered goal parsing, validation, and insight summary
- Sticky compliance disclaimer always visible
- LTCG pre-tax banner

### Feature Comparison

| Feature | Goal Calculator | Reverse Calculator | Compare Goals |
|---------|----------------|-------------------|---------------|
| Goal-based SIP calculation | Yes | Yes (Goal to SIP) | Yes (per goal) |
| SIP to Goal projection | No | Yes | No |
| Scenario cards (8/10/12%) | Yes | No | No |
| Sensitivity heatmap | Yes | No | No |
| Step-up SIP toggle | Yes | No | No |
| Lumpsum toggle | Yes | No | No |
| AI insights/validation | Yes | No | No |
| Export PDF | Yes | No | No |
| Goal comparison chart | No | No | Yes |

---

## 🤖 AI Features

All AI runs server-side via `src/app/api/ai/route.js` using `GEMINI_API_KEY`. The key is never sent to the client. Compliance guardrails are enforced in all prompt templates.

### Natural Language Goal Parser
Parses plain-English input like *"Buy a house in 10 years for 50 lakhs"* into `{ goalType, cost, yrs }` and applies it to the form. Triggered manually by user action (Enter / Go button). Always confirms before filling — never auto-fills silently.

### Goal Insight Paragraph
Auto-generates a 3-4 line personalised summary after input changes. Triggered automatically on result updates with a **1.5s debounce** to avoid spammy API calls.

### Goal Validator
Auto-checks realism of cost, inflation, and return assumptions, returning warning flags as dismissible blue cards. Triggered automatically when results update.

---

## 🧮 Financial Logic

All formulas are extracted directly from `src/engine/`.

**Step 1 — Inflation-Adjusted Future Value**
```
FV = cost * (1 + inflation/100) ^ yrs
```

**Step 2 — Required Monthly SIP**
```
r   = annualRet / 12 / 100
n   = yrs * 12
SIP = (FV * r) / (((1 + r) ^ n - 1) * (1 + r))
```

**Lumpsum Future Value**
```
lumpsumFV = lumpsumAmount * (1 + annualReturn/100) ^ years
```

**Effective SIP with Lumpsum**
```
effFV = max(0, FV - lumpsumFV)
SIP   = calcSIP(effFV, annualReturn, years)
```

**Step-Up SIP (annual increase)**
```
sipThisYear = baseSIP * (1 + stepUpPercent/100) ^ (year - 1)
```

**Year-by-Year Compounding**
```
monthlyRate  = annualReturn / 100 / 12
corpusValue  = (corpusValue + sipThisYear) * (1 + monthlyRate)
```

**Cost of Delay (1-3 years)**
```
newSIP   = calculateSIP({ presentCost, inflation, annualReturn, years: remainingYears })
extraSIP = newSIP - originalSIP
extraTotal = extraSIP * remainingYears * 12
```

**Sensitivity Grid (6x6)**
```
INFLATIONS = [4, 6, 8, 10, 12, 14]
RETURNS    = [6, 8, 10, 12, 14, 16]
SIP        = calcSIP(calcFV(cost, inflation, yrs), return, yrs)
```

**Variable Definitions**

| Variable | Meaning |
|----------|---------|
| `cost` | Present-day goal amount |
| `inflation` | Annual inflation rate (%) |
| `yrs` | Time horizon in years |
| `annualRet` | Expected annual return (%) |
| `r` | Monthly return rate (`annualRet / 12 / 100`) |
| `n` | Total months (`yrs * 12`) |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.x |
| UI Library | React | 19.0.0 |
| AI SDK | @google/generative-ai | 0.24.1 |
| Charts | Recharts | 3.8.0 |
| Animation | Framer Motion | 12.35.2 |
| Styling | Tailwind CSS | 3.4.1 |
| UI Primitives | Radix UI | 1.2.x-1.3.x |
| Icons | lucide-react | 0.482.0 |
| PDF Export | html2canvas + jsPDF | 1.4.1 + 4.2.0 |
| Deployment | Vercel | — |

---

## 📁 Project Structure

```
.
├── package.json                      # Scripts and dependencies
├── next.config.js                    # Next.js configuration
├── public/
│   └── logo.png                      # FinCal logo used in header
└── src/
    ├── app/
    │   ├── layout.js                 # Root layout + Montserrat font + global body styles
    │   ├── globals.css               # Tailwind base + key animations
    │   ├── page.js                   # Landing page (marketing + feature highlights)
    │   ├── calculator/
    │   │   └── page.js               # Calculator entry point (renders FinCalApp)
    │   └── api/
    │       └── ai/
    │           └── route.js          # AI API handler (insight / validator / parser)
    ├── FinCalApp.jsx                 # Main app orchestrator — global state, tabs, data flow
    ├── engine/                       # Pure financial calculation engine (no side effects)
    │   ├── defaults.js               # Goal inflation and return defaults
    │   ├── delay.js                  # Cost-of-delay computation
    │   ├── formulas.js               # FV, SIP, lumpsum, aggregate outputs
    │   ├── lumpsum.js                # Lumpsum future value
    │   ├── scenarios.js              # Conservative / Moderate / Aggressive scenarios
    │   ├── sensitivity.js            # Inflation x return heatmap grid
    │   ├── stepUp.js                 # Step-up SIP calculator
    │   ├── validators.js             # Input validation + confidence score
    │   └── yearByYear.js             # Year-by-year compounding engine
    ├── lib/
    │   ├── constants.js              # Colors, goals, presets, ranges, breakpoints
    │   ├── utils.js                  # Currency formatters + helpers
    │   └── ai/
    │       ├── parser.js             # AI JSON response parsing
    │       ├── prompts.js            # Prompt templates + compliance guardrails
    │       └── service.js            # Gemini model wrapper (server-side only)
    └── components/
        ├── ai/
        │   ├── GoalValidator.jsx     # AI warning flags for inputs
        │   ├── InsightParagraph.jsx  # AI-generated goal summary
        │   └── NLGoalInput.jsx       # Natural-language goal parser input
        ├── blocks/
        │   └── feature-section.jsx   # Landing page stepper block
        ├── charts/
        │   ├── AreaChart.jsx         # Scenario growth over time
        │   ├── DonutChart.jsx        # Invested vs returns breakdown
        │   ├── GlidePath.jsx         # Equity/debt glide path
        │   ├── SensitivityHeatTable.jsx  # Inflation vs return SIP heatmap
        │   ├── StackedBarChart.jsx   # Year-by-year invested vs returns
        │   ├── StepUpBarChart.jsx    # Step-up SIP yearly bars
        │   └── TimelineVisual.jsx    # Goal milestone timeline
        ├── inputs/
        │   ├── GoalInputForm.jsx     # Cost, years, inflation inputs + validation
        │   ├── GoalSelector.jsx      # Goal type selector
        │   ├── LumpsumToggle.jsx     # Lumpsum toggle + input
        │   ├── QuickPresets.jsx      # Goal amount presets
        │   ├── RiskProfileSelector.jsx  # Safe / Balanced / Growth selection
        │   ├── SliderInput.jsx       # Reusable slider with tooltip
        │   └── StepUpToggle.jsx      # Step-up SIP toggle + percent slider
        ├── layout/
        │   ├── BottomSheet.jsx       # Mobile bottom sheet container
        │   ├── EducationTips.jsx     # Education-specific tips block
        │   ├── Header.jsx            # Sticky header with logo + tab bar
        │   ├── HeroSection.jsx       # Full-screen hero
        │   ├── StickyDisclaimer.jsx  # Fixed compliance disclaimer bar
        │   └── TaxationBanner.jsx    # LTCG pre-tax banner
        ├── magicui/
        │   ├── animated-shiny-text.jsx  # Shimmering badge text
        │   └── border-beam.jsx       # Decorative border animation
        ├── results/
        │   ├── AnalyticsSection.jsx  # Aggregated analysis blocks
        │   ├── CostOfDelayCard.jsx   # Delay impact card
        │   ├── GoalComparison.jsx    # Compare two goals view
        │   ├── GoalRealityIndicator.jsx  # Confidence score visual
        │   ├── HeadlineSIP.jsx       # Primary SIP hero card
        │   ├── ReverseCalculator.jsx # SIP to Goal calculator
        │   └── ScenarioCards.jsx     # Scenario SIP cards
        ├── shared/
        │   ├── AmberWarning.jsx      # Soft warning block
        │   ├── AssumptionLock.jsx    # Lock/unlock assumptions
        │   ├── AssumptionTransparency.jsx  # Formula disclosure accordion
        │   ├── ErrorMessage.jsx      # Error message with shake animation
        │   ├── ExportPdfButton.jsx   # PDF export action
        │   ├── SkeletonLoader.jsx    # Loading placeholder
        │   └── Tooltip.jsx           # Radix-based tooltip
        └── ui/
            ├── Accordion.jsx         # Styled accordion wrapper
            ├── AnimatedCircularProgressBar.jsx  # Circular gauge
            ├── card-hover-effect.jsx # Hoverable feature cards
            ├── GlowMenu.jsx          # Animated tab selector
            └── NumberCounter.jsx     # Animated number ticker
```

---

## 📱 How to Use the App

1. Open the calculator from the landing page or go directly to `/calculator`
2. Pick a goal type and enter today's cost, time horizon, and inflation assumption
3. Use Quick Presets for a goal amount or type a custom value directly
4. Choose a risk profile or adjust the return slider — lock it to preserve a value
5. Toggle Step-up SIP or Lumpsum to model alternate investment strategies
6. Review the SIP result, scenario cards, sensitivity heatmap, and goal reality indicator
7. Switch tabs to use the Reverse Calculator or Compare Goals views
8. Export a PDF report from the main calculator when ready
9. On mobile, use the floating SIP pill to jump back to results quickly

---

## 💻 How to Run Locally

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A Google Gemini API key — [get one free here](https://aistudio.google.com/app/apikey)

### Setup

```bash
# Clone the repo
git clone https://github.com/arpitakarsh/fincal.git
cd fincal

# Install dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> Never commit `.env.local` — it is already in `.gitignore`. The API key is only used server-side in `/api/ai/route.js`.

### Production Build

```bash
npm run build
npm start
```

> If campus network blocks Google APIs, switch to a mobile hotspot when testing AI features locally.

---

## 🎨 UI/UX

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Blue | `#224c87` | Primary actions, focus rings, headings |
| Red | `#da3832` | Warnings, error states |
| Grey | `#919090` | Secondary text, borders |
| Background | `#f8f9fb` | Page background |
| Card | `#ffffff` | Card surfaces |
| Text | `#1a1a2e` | Primary body text |

### Typography

- **Montserrat** — numerals and headings (via Next.js font loader)
- **Arial** — body copy

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| `sm` | 480px | Mobile single column |
| `md` | 768px | Tablet 2-col |
| `lg` | 1024px | Desktop 3-panel |
| `xl` | 1280px | Wide desktop |

### Micro-interactions

- Framer Motion transitions on cards, panels, and tab UI
- Animated number counters via react-countup + custom NumberCounter
- Shimmer loaders and skeleton states while AI generates
- Accordion open/close with smooth height animation
- Confetti celebration for "goal already met" state
- Error shake animation `x: [-4, 4, -4, 0]`

---

## 📊 Charts & Visualizations

| Component | Description |
|-----------|-------------|
| `AreaChart` | Scenario-wise corpus growth across years using SIP compounding |
| `DonutChart` | Invested vs returns breakdown with growth multiple label |
| `GlidePath` | Equity/debt glide path shifting toward debt as horizon reduces |
| `SensitivityHeatTable` | 6x6 heatmap of SIP across inflation and return assumptions |
| `StackedBarChart` | Year-by-year invested vs returns stacked bars |
| `StepUpBarChart` | Annual SIP growth bars for step-up mode |
| `TimelineVisual` | Goal milestone timeline with corpus count-up |

---

## ♿ Accessibility

WCAG 2.1 AA compliance applied throughout:

- `aria-label` on all interactive controls and inputs
- `aria-pressed` / `aria-expanded` for toggles and accordions
- `role="alert"` for inline error messages
- `role="contentinfo"` for the sticky disclaimer
- Visible focus styles — 3px solid `#224c87` ring on all focusable elements
- Keyboard-friendly components via Radix UI primitives
- Minimum touch target size of 44x44px on all mobile controls
- No color-only information — always paired with text or icon

---

## 📜 Compliance

- Sticky disclaimer always visible at the bottom of every page
- AI prompts explicitly forbid guarantee language — no "assured" or "certain" returns
- No specific fund promotion in UI text or AI outputs
- All assumptions (inflation, return, horizon) are fully user-editable and lockable
- All results labeled as estimated / assumed / illustrative only throughout the UI
- HDFC AMC retains intellectual property ownership per hackathon submission terms

---

## 👥 Team

Built at **MNNIT Allahabad** for **TECHNEX '26 — FinCal Innovation Hackathon**

| Member | Ownership |
|--------|-----------|
| **Arpit** | `engine/`, `lib/ai/`, `app/api/ai/`, `FinCalApp.jsx`, results components, AI components, chart components, accessibility + responsiveness audit |
| **Himanshu** | Input components, layout components, shared utilities |

---

## ⚠️ Disclaimer

All figures generated by FinCal are **estimated, assumed, and illustrative only.** They do not constitute financial advice. Past performance is not indicative of future results. Please consult a SEBI-registered investment advisor before making investment decisions. Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.

*HDFC AMC retains intellectual property ownership of this submission.*

---

<div align="center">
<img src="https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F%20at-MNNIT%20Allahabad-224c87?style=for-the-badge" />
</div>
