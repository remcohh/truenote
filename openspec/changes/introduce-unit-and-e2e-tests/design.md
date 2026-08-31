## Context

TrueNote is a React 19 + TypeScript web app powered by Vite, Tailwind CSS, PocketBase, and Web Audio APIs. Currently, no test framework or test files exist. Adding comprehensive unit and E2E testing ensures reliable development and prevents regression when updating core music practice logic and components.

## Goals / Non-Goals

**Goals:**
- Establish Vitest + React Testing Library + jsdom configuration for unit and component testing.
- Establish Playwright configuration for browser-based E2E integration testing.
- Provide initial unit tests for core utilities (`noteParser`, `beatMapGenerator`, `noteTimelineGenerator`) and components (`ExerciseSelector`, `MetronomeControls`, `LoginPage`, `useAuth`).
- Provide initial E2E tests for main navigation, practice session controls, and authentication views.
- Add test npm scripts for seamless developer workflow (`npm run test:unit`, `npm run test:e2e`, `npm run test:coverage`).

**Non-Goals:**
- 100% code coverage across all legacy UI components in this single change.
- Real hardware audio input/microphone testing in headless E2E (mic input will be mocked where necessary).

## Decisions

### 1. Vitest for Unit & Component Testing
- **Decision**: Use `vitest` with `@testing-library/react` and `jsdom`.
- **Rationale**: Direct integration with Vite config without duplicate TypeScript transformation settings, extremely fast execution, Jest-compatible assertions/spies (`vi.fn()`, `vi.spyOn()`), and native ESM support.
- **Alternatives Considered**: Jest (requires heavy `@babel/preset-typescript` or `ts-jest` setup and duplicate module resolution logic).

### 2. Playwright for End-to-End (E2E) Testing
- **Decision**: Use `@playwright/test`.
- **Rationale**: First-class browser automation (Chromium, Firefox, WebKit), built-in devServer management (`webServer` config block), automatic element waiting, trace viewer, and clean modern API.
- **Alternatives Considered**: Cypress (heavier, slower parallel runner, more complex headless CI configuration).

### 3. Test File Organization & Setup
- Unit test files located alongside source files (`src/**/*.test.ts`, `src/**/*.test.tsx`).
- Global test setup in `src/test/setup.ts` importing `@testing-library/jest-dom` extensions and DOM / Web Audio API polyfills.
- E2E test files located under `e2e/` directory (`e2e/*.spec.ts`).

## Risks / Trade-offs

- **[Risk] Web Audio API in jsdom environment**: `AudioContext` and `AnalyserNode` are not natively implemented in jsdom.
  → **Mitigation**: Mock `AudioContext` and related Web Audio APIs in `src/test/setup.ts`.
- **[Risk] Playwright browser downloads in CI/local**: Playwright requires browser binary installation.
  → **Mitigation**: Add clean setup commands and document `npx playwright install` usage in package scripts.

## Migration Plan

1. Install unit testing dependencies: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitest/coverage-v8`.
2. Configure `vitest.config.ts` and `src/test/setup.ts`.
3. Write unit tests under `src/`.
4. Install E2E testing dependencies: `@playwright/test`.
5. Configure `playwright.config.ts` and write E2E tests under `e2e/`.
6. Add test execution scripts to `package.json` and verify all tests pass.
