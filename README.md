# FinCal - Goal-Based Investment Calculator

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Node.js](https://img.shields.io/badge/Node.js-22-green) ![License](https://img.shields.io/badge/License-MIT-blue)

🌐 **Live Demo**: [https://fincal-eight.vercel.app/](https://fincal-eight.vercel.app/)

## Project Overview

FinCal is a sophisticated goal-based investment calculator designed for the TECHNEX '26 FinCal Innovation Hackathon, co-sponsored by HDFC Mutual Fund. This web application empowers users to plan their financial goals through real-time SIP (Systematic Investment Plan) calculations, interactive visualizations, and AI-driven insights. Built as a modern single-page application, FinCal provides an intuitive interface for investors to explore different investment scenarios without requiring a separate backend.

The application focuses on accessibility, compliance, and user experience, featuring WCAG 2.1 AA compliance and responsive design that adapts seamlessly across desktop, tablet, and mobile devices.

## Key Features

- **Real-Time SIP Calculator**: Instant calculations with goal-based planning - no "Calculate" button needed
- **Investment Scenarios**: Three predefined risk profiles (Conservative 8%, Moderate 10%, Aggressive 12%)
- **Advanced Options**: Step-up SIP functionality, lumpsum investments, and delay analysis
- **Interactive Visualizations**: Year-by-year projections with comprehensive charts using Recharts
- **AI-Powered Features**: Natural language goal input, intelligent insight paragraphs, and smart goal validation
- **Mobile-First Design**: Bottom sheet interface with floating SIP pill for optimal mobile experience
- **Accessibility**: Full WCAG 2.1 AA compliance for inclusive user experience
- **HDFC Compliance**: Sticky disclaimer, no guarantee language, pre-tax outputs with LTCG/STCG tooltips, user-editable assumptions, and illustrative labeling

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework for production |
| Node.js | 22 | JavaScript runtime |
| Recharts | Latest | Data visualization library |
| Framer Motion | Latest | Animation library |
| Radix UI | Latest | Accessible UI components |
| react-countup | Latest | Number animation component |

## Folder Structure

```
FinCal/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Home page
│   │   ├── api/ai/route.js    # AI API endpoint
│   │   └── calculator/page.js # Calculator page
│   ├── components/            # Reusable components
│   │   ├── ai/                # AI-related components
│   │   ├── blocks/            # Feature sections
│   │   ├── charts/            # Chart components
│   │   ├── inputs/            # Input form components
│   │   ├── layout/            # Layout components
│   │   ├── magicui/           # Custom UI effects
│   │   ├── results/           # Result display components
│   │   ├── shared/            # Shared utilities
│   │   └── ui/                # Base UI components
│   ├── engine/                # Calculation engine
│   │   ├── defaults.js        # Default values
│   │   ├── delay.js           # Delay analysis
│   │   ├── formulas.js        # Core formulas
│   │   ├── lumpsum.js         # Lumpsum calculations
│   │   ├── scenarios.js       # Scenario management
│   │   ├── sensitivity.js     # Sensitivity analysis
│   │   ├── stepUp.js          # Step-up SIP logic
│   │   ├── validators.js      # Input validation
│   │   └── yearByYear.js      # Year-by-year projections
│   └── lib/                   # Utility libraries
│       ├── constants.js       # Application constants
│       ├── utils.js           # Helper functions
│       └── ai/                # AI utilities
├── eslint.config.mjs          # ESLint configuration
├── jsconfig.json              # JavaScript configuration
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.mjs        # Tailwind CSS configuration
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fincal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Build for Production

```bash
npm run build
npm start
```

## How to Use

FinCal is designed for intuitive, real-time goal-based investment planning. Here's how users can easily navigate and utilize the application:

### Interface Layout
- **Desktop**: Three-panel layout (Inputs 25% | Results & Charts 50% | AI Coaching 25%)
- **Tablet**: Two-column responsive design
- **Mobile**: Single-column with bottom sheet interface and floating SIP pill

### Step-by-Step Guide

1. **Set Your Goal**
   - Use the natural language input: "I want to save ₹50 lakhs for my child's education in 15 years"
   - Or manually input your target amount and time horizon using the sliders

2. **Choose Investment Scenario**
   - Select from three risk profiles: Conservative (8%), Moderate (10%), or Aggressive (12%)
   - All calculations update instantly as you change scenarios

3. **Customize Your Plan**
   - Adjust monthly SIP amount or let the calculator suggest optimal investments
   - Enable step-up SIP for increasing contributions over time
   - Add lumpsum investments for additional capital
   - Analyze delay impact to understand the cost of postponing investments

4. **Explore Results**
   - View year-by-year projections in interactive charts
   - Compare different scenarios side-by-side
   - Check goal achievement probability and required adjustments
   - Export results as PDF for record-keeping

5. **AI-Powered Insights**
   - Read personalized insight paragraphs explaining your plan
   - Get smart validation for unrealistic goals
   - Receive coaching suggestions for better outcomes

### Key Interactions
- **Real-Time Updates**: No "Calculate" button needed - results update instantly as you type or slide
- **Mobile Experience**: Tap the floating SIP pill to open the input panel
- **Accessibility**: Full keyboard navigation and screen reader support
- **Compliance**: All assumptions are editable, outputs are pre-tax and illustrative only

The application processes everything locally in your browser for privacy and speed.

## Math Methodology

FinCal employs a two-step SIP calculation methodology for accurate investment projections:

### Step 1: Future Value Calculation
The core formula calculates the future value of a SIP investment using compound interest:

```
FV = P × [(1 + r)^n - 1] × (1 + r) / r
```

Where:
- `FV` = Future Value
- `P` = Monthly investment amount
- `r` = Monthly interest rate (annual rate / 12)
- `n` = Number of months

### Step 2: Goal Achievement Analysis
The system then compares the calculated future value against the user's target goal amount, providing insights on:
- Required monthly investment for goal achievement
- Time needed to reach the goal
- Impact of different investment scenarios
- Effects of step-up SIP and lumpsum additions

All calculations assume monthly compounding and provide pre-tax projections with clear labeling of assumptions.

## Compliance Notes

FinCal adheres to HDFC Mutual Fund compliance requirements:

- **No Guarantee Language**: All projections are clearly labeled as "illustrative" with no guaranteed returns
- **Pre-Tax Outputs**: All calculations show pre-tax values with tooltips explaining LTCG (Long-term Capital Gains) and STCG (Short-term Capital Gains) implications
- **User-Editable Assumptions**: All default values (rates, inflation, etc.) can be modified by users
- **Sticky Disclaimer**: Persistent disclaimer visible throughout the application
- **Regulatory Compliance**: Built to meet SEBI and mutual fund regulatory standards

## Disclaimer

**Important Notice:** This application is developed for educational and illustrative purposes only. The calculations and projections provided are based on the assumptions and inputs entered by the user. Actual investment returns may vary significantly due to market conditions, economic factors, and individual circumstances.

**No Financial Advice:** This tool does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. Users should consult with qualified financial advisors before making any investment decisions.

**HDFC Mutual Fund Disclaimer:** HDFC Mutual Fund or its affiliates do not guarantee the accuracy of the information provided herein. Past performance does not guarantee future results. Mutual fund investments are subject to market risks, and investors should read the scheme information document carefully before investing.

**Data Privacy:** User inputs are processed locally and not stored or transmitted to external servers.

