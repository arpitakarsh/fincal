# FinCal — Complete Project Plan

## Overview

**Project:** FinCal Goal-Based Investment Calculator  
**Hackathon:** FinCal Innovation Hackathon at TECHNEX '26  
**Co-sponsor:** HDFC Mutual Fund  
**Prize Pool:** ₹40,000  
**Deadline:** March 15, 2026  
**Tech Stack:** Next.js 15.5.9 (mandatory), Node.js 22.11.0, NPM 10.9.0  
**No separate backend required**

---

## Judging Criteria

| Category | Weight |
|---|---|
| Financial Logic | 25% |
| Compliance | 20% |
| Accessibility | 15% |
| UX Clarity | 15% |
| Technical Quality | 15% |
| Responsiveness | 10% |

Non-compliant entries are disqualified.

---

## Core Math Engine

### Formulas (`engine/formulas.js`)

Two-step SIP calculation:

- **Step 1:** `FV = PresentCost × (1 + inflation)^years`
- **Step 2:** `RequiredSIP = FV × r ÷ [((1+r)^n − 1) × (1+r)]`
  - `r = annualReturn / 12`
  - `n = years × 12`
- Monthly compounding throughout
- Intermediate FV value displayed between inputs and results
- `toFixed(10)` for intermediate precision
- 2 decimal rounding for final display
- QA against HDFC calculator before submission

---

## Defaults (`engine/defaults.js`)

### Goal Inflation Defaults

| Goal | Inflation Range |
|---|---|
| House | 8–10% |
| Education | 10–12% |
| Healthcare | 8–10% |
| Wedding | 8% |
| Travel | 6–7% |
| Car | 6% |
| General | 6% |

### Return by Duration

| Timeline | Return | Fund Type |
|---|---|---|
| < 3 years | 6–7% | Debt |
| 3–5 years | 9–10% | Hybrid |
| > 5 years | 12% | Equity |

---

## Scenarios (`engine/scenarios.js`)

Three scenarios always shown side by side:

| Scenario | Return | Color |
|---|---|---|
| Conservative | 8% | `#64748b` |
| Moderate | 10% | `#224c87` (highlighted) |
| Aggressive | 12% | `#059669` |

Selected profile is highlighted blue.

---

## Other Engine Files

- **`engine/stepUp.js`** — Step-up SIP calculations
- **`engine/lumpsum.js`** — Lumpsum + SIP combined mode
- **`engine/delay.js`** — Cost of delay logic
- **`engine/yearByYear.js`** — Year-by-year table data generator
- **`engine/sensitivity.js`** — Heat table data (return × inflation grid)
- **`engine/validators.js`** — Hard errors + soft warnings logic

---

## Validation & Error Handling

### Hard Errors (block calculation)
- Empty / zero / negative / non-numeric inputs
- Red border + inline error message
- Error shake animation: `x: [-4, 4, -4, 0]`

### Soft Warnings (amber, allow proceed)
- Unrealistic cost for goal type
- Timeline too short or too long
- Duration mismatch between risk profile and timeline

### Edge Cases
- Negative SIP result → celebration card (lumpsum covers goal)
- Impossibly high SIP → red indicator + suggestions
- AI validator flags → dismissible blue cards

**Rule: Never punish the user. Always guide with next action.**

---

## AI Features (`lib/ai/`)

Three confirmed AI features — all prompts must forbid guarantee language:

### 1. Natural Language Goal Input (`lib/ai/parser.js`)
- User types plain English (e.g. "I want to buy a house in 10 years for 50 lakhs")
- AI parses to structured form fields
- Always confirms with user before filling form

### 2. Personalized Insight Paragraph (`lib/ai/prompts.js`)
- AI generates 3–4 line warm summary post-calculation
- Debounced regeneration on input change (300ms)

### 3. Smart Goal Validator (`lib/ai/prompts.js`)
- Checks cost vs goal type realism
- Flags low/high inflation assumptions
- Warns if return is too high for the timeline
- Flags shown as dismissible blue cards

All AI logic lives in `lib/ai/`. Components in `components/ai/` only render output — they never make API calls or define prompts.

---

## Compliance Rules (20% of score — disqualification risk)

- Mandatory sticky footer with exact HDFC disclaimer text, always visible
- No guarantee language anywhere: no "will earn", no "guaranteed"
- No promotion of specific funds
- All assumptions must be user-editable
- Label all outputs as "estimated / assumed / illustrative only"
- HDFC AMC retains IP ownership
- Taxation: pre-tax only + disclosure banner + LTCG/STCG tooltip (no tax calculations)
- AI prompts must explicitly forbid guarantee language

---

## Features — Must Build

- Two-step SIP calculation (FV then SIP)
- Goal-specific inflation defaults
- Duration-based return suggestions
- 3 scenarios side by side (Conservative / Moderate / Aggressive)
- Sensitivity analysis (heat table)
- Step-up SIP toggle
- Lumpsum + SIP combined mode
- Year-by-year table
- Cost of delay card
- Goal reality indicator
- Example goals auto-fill
- Sticky disclaimer (always visible)
- Smart copywriting throughout

---

## Features — Good to Build

- Assumption lock/unlock
- Quick presets (₹50L / ₹75L / ₹1Cr)
- High contrast toggle
- Font size controls
- Contextual education tips
- Inflation reality visual
- Donut chart
- Financial health score
- Asset allocation glide path
- Reverse calculator mode
- Affordability checker

---

## Features — Skip Entirely

- User auth / login
- Saving goals to DB
- Real fund recommendations
- Live market data
- Monte Carlo simulation
- XIRR
- Multilingual support
- SIP reminders
- Separate Express backend
- Product renaming

---

## Charts & Visuals (`components/charts/`)

| File | Chart |
|---|---|
| `DonutChart.jsx` | SIP invested vs returns |
| `AreaChart.jsx` | Corpus growth, gradient fill |
| `StackedBarChart.jsx` | Year-by-year breakdown |
| `SensitivityHeatTable.jsx` | Return × inflation grid, color-coded |
| `InflationRealityVisual.jsx` | Two cards + animated arrow |
| `StepUpBarChart.jsx` | Step-up SIP bar chart |
| `GlidePath.jsx` | Asset allocation glide path |

Additional visuals: Cost of delay card (rows animate in), Goal reality indicator (horizontal zone bar), Financial health score (radial gauge).

---

## UX Structure

### Risk Profile Selector — Two-Layer State System
- `riskProfile` and `annualReturn` coexist as separate state values
- Safe → `riskProfile='safe'`, `annualReturn=8`
- Balanced → `riskProfile='balanced'`, `annualReturn=10`
- Growth → `riskProfile='growth'`, `annualReturn=12`
- User manually moves return slider → `riskProfile='custom'`, no pill highlighted
- Clicking a profile pill after custom → snaps back to that profile's return
- **AssumptionLock wins over RiskProfile:** if return is locked, clicking a profile updates display only, does NOT override return value. Lock icon turns amber, tooltip explains conflict.
- Duration mismatch warning if profile conflicts with timeline

### Progressive Disclosure
- **L1** (HeadlineSIP + floating pill) — visible immediately on page load with pre-filled defaults
- **L2** (ScenarioCards + CostOfDelayCard) — visible immediately below L1, pre-calculated with defaults
- **L3** (Charts + AI) — on desktop: always visible, charts animate on first load only. On mobile: lives inside bottom sheet, triggered manually
- AI Insight regenerates after 1500ms debounce on any input change, NOT on cold page load
- GoalValidator runs every recalculation, flags only appear if something is actually wrong
- Default state on load: House goal, ₹50L cost, 10 years — calculator is never empty

---

## Layout

### Desktop (> 1024px) — "Command Center"
- `h-screen`, no page scroll, 3 fixed panels side by side
- **Left Panel (25%)** — Control Room:
  - RiskProfileSelector (3 pills: Safe / Balanced / Growth)
  - GoalSelector (horizontal scrollable pills)
  - GoalInputForm + SliderInputs (cost, years, inflation)
  - StepUpToggle → inline slider animates in below on enable
  - LumpsumToggle → inline input animates in below on enable
  - QuickPresets (₹50L / ₹75L / ₹1Cr chips)
  - AssumptionLock icon per slider
  - NLGoalInput (collapsible bar at top of panel)
- **Center Panel (50%)** — The Hero:
  - HeadlineSIP (massive Montserrat Bold, most visible element)
  - 3 ScenarioCards side by side (Conservative / Moderate / Aggressive)
  - DonutChart (SIP invested vs returns)
  - AreaChart (all 3 scenarios overlaid, active = 3px line)
  - YearByYear table (collapsible)
  - TaxationBanner (thin strip at bottom of panel)
- **Right Panel (25%)** — Financial Coaching:
  - GoalRealityIndicator (horizontal zone bar)
  - CostOfDelayCard (rows animate in)
  - AIInsightParagraph (3–4 line warm summary card)
  - AIValidatorFlags (dismissible blue cards)
  - EducationTips (contextual)
- **StickyDisclaimer** — fixed full width at viewport bottom, above everything

### Tablet (768px–1024px) — 2-Column
- Left column (45%): Full input stack, no accordion, all fields visible
- Right column (55%): HeadlineSIP → DonutChart → ScenarioCards → GoalRealityIndicator → CostOfDelayCard (stacked, right column scrolls independently)
- No bottom sheet on tablet
- StickyDisclaimer full width at bottom

### Mobile (< 768px) — Scroll to Reveal
- Single column, vertical stack, mobile-first
- **Fixed floating SIP pill** — bottom of viewport, always visible, updates live as user interacts
- **NLGoalInput** — collapsible bar at very top, collapsed by default
- **GoalSelector** — horizontal scrollable pills, always visible (not in accordion)
- **Accordion A: Goal Details** — presentCost, years, inflation (collapsed by default, opens on tap)
- **Accordion B: Strategy** — RiskProfileSelector pills, annualReturn slider, StepUp, Lumpsum (collapsed by default)
- **QuickPresets** — horizontal chip row below accordions
- **DonutChart** — simplified, legend below chart
- **ScenarioCards** — 3 cards stacked vertically
- **GoalRealityIndicator**
- **CostOfDelayCard** (red-bordered warning card)
- **"See Detailed Analysis" button** — triggers bottom sheet (80% screen height)
- **TaxationBanner** — thin strip above floating pill
- **StickyDisclaimer** — above floating SIP pill
- **Bottom Sheet contents** (slides up): AreaChart, StackedBarChart, SensitivityHeatTable, FinancialHealthScore, AIInsightParagraph, AIValidatorFlags, GlidePath
- Font sizes: 16px minimum body, 14px for captions/labels only
- NO bottom tab bar (dropped — scroll model replaces it)

---

## Animations & Micro-interactions

### Confirmed Animations
- Number count-up via `react-countup`
- Result cards reveal: `staggerChildren 100ms`
- Chart update on input: debounced 300ms
- Button hover: `scale: 1.02`, tap: `scale: 0.97`
- Input focus: CSS transition
- Chart tooltip: Recharts built-in

### Conditional (not always)
- Slider result-only
- Chart draw: first load only

### Skip Entirely
- Circular progress animation
- Inflation toggle animation
- Timeline journey animation

### 13 Confirmed Micro-interactions
1. Button hover scale
2. Button tap scale
3. Input focus border transition
4. Input validation red border
5. Error shake animation
6. Slider live value label
7. Radix tooltips
8. Recharts tooltips
9. Chart hover state
10. Number count-up
11. Result reveal stagger 100ms
12. Tab switch transition
13. Keyboard focus ring (3px `#224c87`)
14. AI skeleton/spinner

---

## Accessibility — WCAG 2.1 AA

- Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Full keyboard navigation
- Visible focus indicators: 3px solid `#224c87`
- Proper `for`/`id` form label pairing
- ARIA labels on all inputs
- `aria-live` regions for dynamic results
- Semantic HTML throughout
- Screen reader compatible
- Minimum touch target: 44×44px
- Logical tab order
- No color-only information conveyance

---

## Responsiveness

### Breakpoints
| Range | Layout |
|---|---|
| `< 480px` | Mobile — single column, bottom sheet, floating pill |
| `480px–768px` | Large mobile — same as mobile, more padding |
| `768px–1024px` | Tablet — 2-column, no bottom sheet |
| `> 1024px` | Desktop — 3-panel, h-screen |

- Mobile-first CSS, `clamp()` for typography
- `ResponsiveContainer` from Recharts on all charts
- Radix UI touch-friendly sliders, 44px+ tap targets everywhere
- `inputmode="numeric"` on all number inputs
- Dynamic chart legends (simplified on mobile)
- Responsive Radix tooltips

---

## Brand & Design

### Colors
| Token | Value |
|---|---|
| Primary Blue | `#224c87` |
| Primary Red | `#da3832` |
| Grey | `#919090` |
| Background | `#f8f9fb` |
| Card | `#ffffff` |
| Text | `#1a1a2e` |
| Border | `#e2e6ed` |
| Light Blue | `#e8eef7` |
| Green | `#2e7d32` |
| Amber | `#d97706` |

### Typography
- Numbers: Montserrat Bold
- Body: Arial
- Labels/UI: Verdana

### Dimensions
- Card border radius: 16px
- Input border radius: 10px
- Pill border radius: 999px

### Design Feel
- Fi Money warmth + Zerodha data density
- No growth arrows
- No currency imagery

---

## Libraries

| Library | Purpose |
|---|---|
| Recharts | All charts |
| Framer Motion | Animations |
| Radix UI | Sliders, tooltips |
| react-countup | Number count-up animation |

---

## Folder Structure

```
fincal/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout, fonts, metadata
│   │   ├── page.js                # Thin server component (<100 lines), renders FinCalApp
│   │   ├── globals.css            # Base styles, CSS variables, resets
│   │   └── api/
│   │       └── ai/
│   │           └── route.js       # Next.js Route Handler for all AI calls
│   │
│   ├── components/
│   │   ├── inputs/
│   │   │   ├── GoalSelector.jsx        # Horizontal scrollable goal type pills
│   │   │   ├── GoalInputForm.jsx       # Cost, years, inflation fields
│   │   │   ├── RiskProfileSelector.jsx # Safe / Balanced / Growth pills
│   │   │   ├── SliderInput.jsx         # Radix slider + text box dual input
│   │   │   ├── QuickPresets.jsx        # ₹50L / ₹75L / ₹1Cr chips
│   │   │   ├── StepUpToggle.jsx        # Toggle + inline slider (animates in)
│   │   │   └── LumpsumToggle.jsx       # Toggle + inline input (animates in)
│   │   │
│   │   ├── results/
│   │   │   ├── HeadlineSIP.jsx         # L1 — massive Montserrat SIP number
│   │   │   ├── ScenarioCards.jsx       # L2 — 3 cards side by side
│   │   │   ├── CostOfDelayCard.jsx     # Rows animate in, red-bordered
│   │   │   ├── GoalRealityIndicator.jsx # Horizontal zone bar
│   │   │   └── FinancialHealthScore.jsx # Radial gauge
│   │   │
│   │   ├── charts/
│   │   │   ├── DonutChart.jsx          # SIP invested vs returns
│   │   │   ├── AreaChart.jsx           # 3 scenarios overlaid, gradient fill
│   │   │   ├── StackedBarChart.jsx     # Year-by-year breakdown
│   │   │   ├── SensitivityHeatTable.jsx # 6×6 grid, color-coded
│   │   │   ├── InflationRealityVisual.jsx # Two cards + animated arrow
│   │   │   ├── StepUpBarChart.jsx      # Step-up SIP bar chart
│   │   │   └── GlidePath.jsx           # Renders only if years > 5
│   │   │
│   │   ├── ai/                         # Rendering ONLY — no logic, no API calls
│   │   │   ├── NLGoalInput.jsx         # Collapsible bar → inline preview card
│   │   │   ├── InsightParagraph.jsx    # 3-4 line warm summary card
│   │   │   └── GoalValidator.jsx       # Dismissible blue flag cards
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── StickyDisclaimer.jsx    # Fixed full-width viewport bottom
│   │   │   ├── BottomSheet.jsx         # Mobile L3 drawer (80% screen height)
│   │   │   ├── TaxationBanner.jsx      # Pre-tax disclosure + LTCG tooltip
│   │   │   └── EducationTips.jsx       # Contextual education sidebar
│   │   │
│   │   └── shared/
│   │       ├── Tooltip.jsx             # Radix UI tooltip wrapper
│   │       ├── ErrorMessage.jsx        # Inline red error + shake animation
│   │       ├── AmberWarning.jsx        # Soft warning banner
│   │       ├── SkeletonLoader.jsx      # AI loading skeleton
│   │       └── AssumptionLock.jsx      # Lock icon per slider
│   │
│   ├── engine/                         # Pure math — zero UI, zero AI
│   │   ├── formulas.js                 # FV + SIP core formulas
│   │   ├── defaults.js                 # Goal inflation + return defaults
│   │   ├── scenarios.js                # Conservative / Moderate / Aggressive
│   │   ├── stepUp.js                   # Step-up SIP calculations
│   │   ├── lumpsum.js                  # Lumpsum + SIP combined
│   │   ├── delay.js                    # Cost of delay logic
│   │   ├── yearByYear.js               # Year-by-year table generator
│   │   ├── sensitivity.js              # 6×6 heat table data
│   │   └── validators.js               # Hard errors + soft warnings
│   │
│   ├── lib/
│   │   ├── ai/                         # Pure AI logic — no JSX
│   │   │   ├── prompts.js              # All prompt templates (no guarantee lang)
│   │   │   ├── parser.js               # NL input → structured form fields
│   │   │   └── service.js              # Anthropic API call wrapper
│   │   │
│   │   ├── constants.js                # Brand colors, goal types, breakpoints
│   │   └── utils.js                    # formatCurrency, clamp, debounce
│   │
│   └── FinCalApp.jsx                   # "use client" root — all global state
│
├── .env.local                          # ANTHROPIC_API_KEY (server-side only)
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## State Management

### Global State (`FinCalApp.jsx`)
```js
{
  // Goal inputs
  goalType,          // 'house' | 'education' | 'wedding' | 'car' | 'travel' | 'healthcare' | 'general'
  presentCost,       // number
  years,             // number
  inflation,         // number
  inflationSource,   // 'default' | 'custom'

  // Strategy inputs
  riskProfile,       // 'safe' | 'balanced' | 'growth' | 'custom'
  annualReturn,      // number
  stepUpEnabled,     // boolean
  stepUpPercent,     // number
  lumpsumEnabled,    // boolean
  lumpsumAmount,     // number

  // UI state
  activeBottomSheet, // boolean (mobile)
  activeAccordion,   // 'goal' | 'strategy' | null (mobile)
  assumptionLocks,   // { inflation: bool, annualReturn: bool }
}
```

**Key rules:**
- Computed results are derived variables, NOT stored in state — calculated inline on every render: `const results = calculateSIP(inputs)`
- No `useEffect` to sync results — avoids stale state bugs entirely
- Calculation triggers on every input change — no Calculate button
- AI regenerates after 1500ms debounce, not on every keystroke, not on cold load

### Local Component State
- `SliderInput` — hover/focus state only
- `NLGoalInput` — raw text being typed, loading state
- `GoalValidator` — which flags are dismissed
- `InsightParagraph` — loading state, current AI text
- `CostOfDelayCard` — which rows are expanded
- `BottomSheet` — drag position, animation state

---

## Component Interactions

| Trigger | Effect |
|---|---|
| GoalSelector changes | Resets `inflation` only if `inflationSource='default'`. Resets `annualReturn` only if `riskProfile!='custom'`. Never resets `presentCost` or `years`. |
| QuickPresets clicked | Sets `presentCost` only. Nothing else touched. Highlights active preset if cost matches. |
| StepUpToggle enabled | Inline slider animates in below toggle. Default 10%. Value preserved if re-toggled off then on. |
| LumpsumToggle enabled | Same inline pattern. Default ₹0. |
| AssumptionLock activated | Slider turns read-only and greyed. Excluded from ALL RiskProfile and GoalSelector overrides. |
| RiskProfile clicked | Sets `riskProfile` + `annualReturn` unless that field is locked (lock wins, amber icon). |
| Manual return slider move | Sets `riskProfile='custom'`, no pill highlighted. |

---

## Chart Specifications

### SensitivityHeatTable
- 6×6 grid
- Rows: inflation 4% → 14%, step 2%
- Columns: return 6% → 16%, step 2%
- Current user selection: highlighted blue border cell
- Color scale: green (low SIP) → amber → red (high SIP)

### AreaChart
- All 3 scenarios overlaid as 3 lines
- Active scenario: 3px stroke width
- Inactive scenarios: 1.5px stroke width
- X-axis: years 1 to n, Y-axis: corpus value

### GlidePath
- Only renders when `years > 5`
- Returns null silently if `years <= 5`

### DonutChart (mobile)
- Simplified version — legend below chart, not beside it

---

## Environment & Config

### AI API
- All AI calls via Next.js Route Handler: `app/api/ai/route.js`
- `ANTHROPIC_API_KEY` in `.env.local`, accessed server-side only
- Frontend calls `/api/ai` — never touches the key directly

### `next.config.js`
```js
const nextConfig = {
  experimental: { optimizePackageImports: ['recharts', 'framer-motion'] }
}
```

### `tailwind.config.js`
```js
theme: {
  extend: {
    colors: {
      brand: { blue: '#224c87', red: '#da3832', grey: '#919090' },
      bg: '#f8f9fb', card: '#ffffff', appText: '#1a1a2e',
      border: '#e2e6ed', lightBlue: '#e8eef7',
      green: '#2e7d32', amber: '#d97706'
    },
    fontFamily: {
      montserrat: ['Montserrat', 'sans-serif'],
      body: ['Arial', 'sans-serif']
    },
    screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px' }
  }
}
```

### AI Feature UX Flow
- **NLGoalInput:** collapsible bar at top of left panel (desktop) / top of page (mobile). After AI parses, shows inline preview card listing parsed values with "Apply" and "Edit" buttons. Never auto-fills without confirmation.
- **InsightParagraph:** renders as a styled card in right panel (desktop) / bottom sheet (mobile). NOT a chat bubble.
- **GoalValidator:** runs on every recalculation. Flags render in right panel (desktop) / bottom sheet (mobile). Each flag independently dismissible. Dismissed flags reappear if relevant input changes by >10%.

---

## Architecture Rules

- `engine/` files — pure JS, no React imports, no AI imports
- `lib/ai/` files — pure JS, no React imports, no engine imports
- `components/ai/` files — JSX only, import from `lib/ai/`, never do math or API calls inline
- `FinCalApp.jsx` — only `"use client"` root, holds state, wires engine output to components
- `page.js` — thin server component, under 100 lines, just renders `<FinCalApp />`
- No component does math inline
- No engine file imports React

---

## Data Flow

```
User Input
  → components/inputs/  (captures)
    → FinCalApp.jsx  (state)
      → engine/  (calculates)
      → components/results/  (renders numbers)
      → components/charts/  (renders visuals)
      → lib/ai/service.js  (calls AI)
        ← lib/ai/prompts.js  (supplies prompt)
        → lib/ai/parser.js  (parses response)
      → components/ai/  (renders AI output)
```

---

## Build Order (8 Days)

| Day | Focus |
|---|---|
| 1–2 | `engine/` all 9 files + test against HDFC calculator + example goals + sticky disclaimer |
| 3 | Sliders + quick presets + assumption lock |
| 4 | Result card + cost of delay + goal reality indicator |
| 5 | Charts (donut) + year-by-year table + inflation visual |
| 6 | Contextual tips + smart copywriting + health score |
| 7 | Accessibility (contrast + font + ARIA) |
| 8 | Polish + demo video + compliance check |

**AI features are built last** — after all math and UI is stable.

---

## Pre-submission Checklist

- [ ] All formulas QA'd against HDFC calculator
- [ ] Sticky disclaimer visible on all screen sizes
- [ ] Zero guarantee language anywhere (including AI outputs)
- [ ] All assumptions user-editable
- [ ] All outputs labelled as estimated/illustrative
- [ ] WCAG 2.1 AA contrast checked
- [ ] Full keyboard navigation tested
- [ ] All ARIA labels present
- [ ] Mobile layout tested on real device
- [ ] Demo video recorded
- [ ] Compliance check passed
