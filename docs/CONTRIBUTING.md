# Contributing Guidelines

Welcome to the FinCal development team. Whether you are a human engineer or an AI assistant, these rules ensure that our codebase remains clean, maintainable, and scalable.

## Coding Standards

### React Components
- **Functional Only:** Always use React functional components with Hooks. Never use class components.
- **Single Responsibility:** A component should do one thing. If a component grows beyond 150 lines, it usually needs to be split.
- **Pure Functions:** Components should be as pure as possible. Keep data fetching at the top level or within dedicated custom hooks.

### Styling
- **Tailwind CSS:** Use Tailwind for all styling.
- **No Inline Styles:** Do not use `style={{...}}` unless calculating dynamic properties (e.g., width based on a dynamic percentage) that Tailwind cannot handle.
- **Class Merging:** Use `clsx` or `tailwind-merge` when combining conditional classes.

### The Engine (`src/engine/`)
- Must contain zero React code.
- Must not produce side effects (e.g., no `console.log` in production, no network calls).
- All functions must be fully documented using JSDoc, explaining inputs, outputs, and the mathematical formula used.

## Folder Conventions
- `src/app/`: Only for Next.js routing.
- `src/components/`: Grouped by domain (e.g., `/inputs`, `/charts`). Do not dump everything into a single components folder.
- `src/lib/`: Shared, generic utilities only. Business math goes in `engine`.

## Naming Conventions
- **Components:** PascalCase (e.g., `GoalInputForm.jsx`).
- **Files/Folders (non-component):** camelCase (e.g., `formulas.js`, `stepUp.js`).
- **Hooks:** camelCase, prefixed with `use` (e.g., `useFinCalState.js`).
- **Variables/Functions:** camelCase (e.g., `calculateSIP`, `annualReturn`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_INFLATION_RATE`).

## Commit Message Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` A new feature.
- `fix:` A bug fix.
- `docs:` Documentation only changes.
- `style:` Changes that do not affect the meaning of the code (white-space, formatting).
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Changes to the build process or auxiliary tools.

Example: `feat(calculator): implement step-up sip logic`

## Documentation Requirements
- If you add a new feature, update `docs/FEATURES.md` and `docs/CHANGELOG.md`.
- If you change an architectural pattern, log the reason in `docs/DECISIONS.md`.
- If you introduce a bug or technical debt, document it in `docs/KNOWN_ISSUES.md`.
