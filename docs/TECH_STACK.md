# Tech Stack

## Current Stack

### 1. Next.js (App Router)
- **Role:** Full-stack React framework.
- **Reason:** Provides server-side rendering for fast initial loads, SEO benefits for the landing page, and integrated API routes for secure backend calls (like the AI API).
- **Alternatives Considered:** Vite (rejected because it lacks built-in secure API routes for the AI integration without standing up a separate Node server).

### 2. React (v19)
- **Role:** UI Library.
- **Reason:** Industry standard, massive ecosystem, excellent state management capabilities required for a complex interactive calculator.

### 3. Tailwind CSS
- **Role:** Styling framework.
- **Reason:** Utility-first approach ensures design consistency and rapid UI iteration without managing complex CSS files.

### 4. Recharts
- **Role:** Data Visualization.
- **Reason:** React-native charting library that is easy to integrate, responsive, and customizable for financial graphs.
- **Alternatives Considered:** Chart.js (rejected due to less seamless React integration).

### 5. Google Generative AI (Gemini)
- **Role:** Natural Language Processing for the AI Goal Parser.
- **Reason:** High performance, low latency, and excellent parsing of unstructured text into structured JSON parameters.

---

## Future Stack (Planned Additions)

### 1. PostgreSQL
- **Role:** Primary Relational Database.
- **Reason:** Required for Phase 8 to store user accounts, saved portfolios, and historical mutual fund data. ACID compliance is critical for financial data.

### 2. Prisma
- **Role:** Object-Relational Mapper (ORM).
- **Reason:** Provides type-safe database access, excellent developer experience, and easy migrations within the Next.js ecosystem.

### 3. NextAuth.js (or Clerk)
- **Role:** Authentication.
- **Reason:** Standard solutions for Next.js to handle secure login (OAuth, Email) without building custom auth infrastructure.

### 4. Redis
- **Role:** Caching Layer.
- **Reason:** To cache external API responses (e.g., daily mutual fund NAVs) to ensure fast load times and reduce database hits.

### 5. Jest / Vitest
- **Role:** Testing Framework.
- **Reason:** Absolutely necessary to test the mathematical accuracy of the functions in `src/engine/`.
