## Why

TrueNote currently lacks automated testing infrastructure, leaving code changes vulnerable to regressions in music practice logic, audio processing utilities, UI components, and user workflows. Introducing unit and E2E test suites establishes confidence when refactoring code, ensures core note parsing/metronome calculations remain accurate, and guarantees critical end-to-end user journeys function reliably.

## What Changes

- Set up **Vitest** + **React Testing Library** + **jsdom** for unit and component testing.
- Add unit tests for core utilities (`noteParser`, `beatMapGenerator`, `noteTimelineGenerator`) and key hooks/components (`useAuth`, `LoginPage`, `ExerciseSelector`, `MetronomeControls`).
- Set up **Playwright** for end-to-end (E2E) testing of critical user flows.
- Add E2E tests covering exercise navigation, metronome & practice view interactions, and authentication page flows.
- Update `package.json` with test runner scripts (`test`, `test:unit`, `test:e2e`, `test:coverage`, `test:ui`).

## Capabilities

### New Capabilities
- `unit-testing`: Unit and component test runner infrastructure (Vitest + React Testing Library) to test pure functions, hooks, and React UI components.
- `e2e-testing`: End-to-end testing infrastructure (Playwright) to validate full user workflows in actual browser environments.

### Modified Capabilities

## Impact

- **Dependencies**: Adds `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, and `@playwright/test` to `devDependencies`.
- **Scripts**: Adds `test`, `test:unit`, `test:e2e`, `test:coverage` scripts to `package.json`.
- **Config files**: Adds `vitest.config.ts` (or updates `vite.config.ts`) and `playwright.config.ts`.
- **Codebase**: Creates unit test files (`*.test.ts`, `*.test.tsx`) under `src/` and E2E test files (`*.spec.ts`) under `e2e/`.
