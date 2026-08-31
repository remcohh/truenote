## 1. Unit Testing Setup

- [x] 1.1 Add unit testing dependencies (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitest/coverage-v8`) to `package.json`
- [x] 1.2 Create Vitest configuration (`vitest.config.ts`) and global test setup file (`src/test/setup.ts`) with Web Audio API mocks
- [x] 1.3 Add `test:unit` and `test:coverage` scripts to `package.json`

## 2. Unit Tests for Utilities & Core Logic

- [x] 2.1 Write unit tests for `noteParser.ts` (`src/features/practice/utils/noteParser.test.ts`)
- [x] 2.2 Write unit tests for `beatMapGenerator.ts` (`src/features/practice/utils/beatMapGenerator.test.ts`)
- [x] 2.3 Write unit tests for `noteTimelineGenerator.ts` (`src/features/practice/utils/noteTimelineGenerator.test.ts`)

## 3. Unit Tests for Hooks & Components

- [x] 3.1 Write unit tests for `useAuth` hook (`src/features/auth/hooks/useAuth.test.ts`)
- [x] 3.2 Write unit tests for `ExerciseSelector` component (`src/features/library/components/ExerciseSelector.test.tsx`)
- [x] 3.3 Write unit tests for `MetronomeControls` component (`src/features/practice/components/MetronomeControls.test.tsx`)
- [x] 3.4 Write unit tests for `LoginPage` component (`src/features/auth/components/LoginPage.test.tsx`)

## 4. E2E Testing Setup

- [x] 4.1 Add Playwright dependency (`@playwright/test`) and install browser binaries
- [x] 4.2 Create Playwright configuration (`playwright.config.ts`) with dev server auto-start settings
- [x] 4.3 Add `test:e2e` script to `package.json`

## 5. E2E Test Implementation & Verification

- [x] 5.1 Implement E2E tests for main navigation and exercise selection (`e2e/exercise-navigation.spec.ts`)
- [x] 5.2 Implement E2E tests for metronome and practice view interaction (`e2e/practice-view.spec.ts`)
- [x] 5.3 Implement E2E tests for authentication page (`e2e/auth.spec.ts`)
- [x] 5.4 Run unit and E2E test suites to verify all tests pass cleanly
