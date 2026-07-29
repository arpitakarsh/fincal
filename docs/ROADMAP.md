# Project Roadmap

This roadmap outlines the evolution of FinCal from a SIP calculator to a full Mutual Fund Recommendation Platform.

---

## Phase 0: Foundation
**Current Status:** Completed / In Progress
**Objectives:** Establish the core SIP calculator, UI architecture, and documentation.
**Pending Tasks:**
- Finalize project documentation (Completed).
- Establish unit testing framework for the core calculation engine.
**Dependencies:** None.

---

## Phase 1: Investor Profiling
**Current Status:** Planned
**Objectives:** Build a robust risk profiling system to understand the user's risk tolerance, capacity, and time horizon.
**Pending Tasks:**
- Design a psychometric risk assessment questionnaire.
- Build UI components for the questionnaire.
- Create scoring logic to map users to Risk Profiles (Conservative, Moderate, Aggressive).
**Dependencies:** Phase 0.

---

## Phase 2: Category Recommendation Engine
**Current Status:** Planned
**Objectives:** Map calculated required returns and user risk profiles to specific Mutual Fund categories (e.g., Large Cap, Mid Cap, Flexi Cap, Liquid).
**Pending Tasks:**
- Define asset allocation models based on time horizon and risk profile.
- Build the mapping logic (Engine: Category Allocator).
- UI to display category-level asset allocation.
**Dependencies:** Phase 1.

---

## Phase 3: Fund Recommendation Engine
**Current Status:** Planned
**Objectives:** Recommend specific Mutual Funds within the selected categories.
**Pending Tasks:**
- Integrate AMFI/Morningstar or similar data sources.
- Develop a scoring model for funds (Alpha, Beta, Sharpe, Expense Ratio).
- Build the recommendation engine logic.
- UI to display specific fund recommendations.
**Dependencies:** Phase 2.

---

## Phase 4: Probability Engine
**Current Status:** Planned
**Objectives:** Move from deterministic calculations to probabilistic ones.
**Pending Tasks:**
- Implement Monte Carlo simulations for portfolio returns.
- Display "Probability of Success" for each goal.
- Suggest actionable adjustments if probability is low.
**Dependencies:** Phase 0 (Engine).

---

## Phase 5: Portfolio Builder
**Current Status:** Planned
**Objectives:** Allow users to build, save, and track multiple goals as a consolidated portfolio.
**Pending Tasks:**
- Portfolio aggregation logic.
- XIRR calculation engine.
- Portfolio overlap analysis.
**Dependencies:** Phase 3.

---

## Phase 6: AI Advisor
**Current Status:** Planned
**Objectives:** Introduce an interactive AI agent to explain recommendations and answer financial queries.
**Pending Tasks:**
- Integrate RAG (Retrieval-Augmented Generation) with mutual fund fact sheets.
- Build chat interface for the AI Advisor.
- Context-aware prompt engineering based on user's portfolio.
**Dependencies:** Phase 5.

---

## Phase 7: Authentication
**Current Status:** Planned
**Objectives:** Allow users to create accounts and securely log in.
**Pending Tasks:**
- Integrate NextAuth.js or Clerk.
- Setup OAuth (Google, Apple) and Email logins.
- Secure API routes.
**Dependencies:** Required before Phase 8.

---

## Phase 8: Database
**Current Status:** Planned
**Objectives:** Persist user data, portfolios, goals, and risk profiles.
**Pending Tasks:**
- Setup PostgreSQL.
- Integrate Prisma ORM.
- Design database schema (Users, Goals, Portfolios, Fund Data).
- Migrate client-side state to server-synced state.
**Dependencies:** Phase 7.

---

## Phase 9: Performance
**Current Status:** Planned
**Objectives:** Optimize the application for speed and scale.
**Pending Tasks:**
- Implement Redis caching for fund data and API responses.
- Optimize client-side bundle size.
- Edge caching and server-side rendering optimizations.
**Dependencies:** Phase 8.

---

## Phase 10: Production
**Current Status:** Planned
**Objectives:** Enterprise-grade launch.
**Pending Tasks:**
- Comprehensive End-to-End (E2E) testing.
- Penetration testing and security audit.
- CI/CD pipeline finalization.
- Public launch.
**Dependencies:** All previous phases.
