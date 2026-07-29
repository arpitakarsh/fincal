# Development Rules

These rules are strict guidelines that **all developers and future AI assistants** MUST follow to ensure the maintainability, scalability, and quality of the FinCal codebase.

## 1. Architectural Rules
- **Never put business logic inside React components.** UI components are for presentation only. All mathematical calculations, data transformations, and financial logic must reside in `src/engine/`.
- **Engine functions must remain pure.** Functions in `src/engine/` must not have side effects. They take inputs, perform calculations, and return outputs. They must not read from the DOM, manipulate global state, or perform network requests.
- **UI must never directly access the database.** The client-side application must only communicate with the database via defined API routes (e.g., `src/app/api/`).
- **API routes must remain thin.** API routes should act as controllers. They should validate input, call the appropriate service/engine layer, and format the response. Heavy logic belongs in a service layer, not the API route handler itself.
- **Maintain backward compatibility.** Do not break existing API contracts or engine signatures without a structured migration plan and versioning.

## 2. Code Quality & Standards
- **Never duplicate business logic.** If a calculation (e.g., future value) is needed in two places, abstract it into a shared utility within `src/engine/`.
- **Never hardcode financial data.** Default assumptions (like inflation rates) can be configured in `src/lib/constants.js`, but live data (fund names, NAVs, historical returns) must eventually be fetched from a database or external API.
- **Prefer composition over inheritance.** Use React composition patterns (children, render props) and modular utility functions rather than deep class hierarchies.
- **Every feature should be independently testable.** Write code that can be easily unit tested. If a function is hard to test, it is doing too much and needs to be refactored.
- **Strict Typing:** (Future) When migrating to TypeScript, avoid `any`. Use strict interfaces for all data models and engine inputs/outputs.

## 3. Documentation
- **Always update documentation after every feature.** If a new module is added, update `ARCHITECTURE.md`, `FEATURES.md`, and `CHANGELOG.md`.
- **Document the 'Why'.** Inline comments should explain *why* a particular approach was taken, especially for complex financial math or workarounds, not just *what* the code does.

## 4. State Management
- **Keep state as low as possible.** Do not lift state to the global context unless it is genuinely needed by multiple distant components.
- **Avoid prop drilling.** Use Context or a state manager (like Zustand) for widely shared data (e.g., User Profile, Global Assumptions).

## 5. Security
- **Never expose secrets.** API keys, database credentials, and secret tokens must only exist in `.env` files and be accessed solely on the server side (`src/app/api`).
- **Always validate inputs.** Never trust client-side data. All data arriving at API routes must be validated (e.g., using Zod) before processing.
