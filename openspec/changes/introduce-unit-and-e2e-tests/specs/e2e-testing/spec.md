## ADDED Requirements

### Requirement: Playwright E2E Test Suite Infrastructure
The project SHALL provide Playwright configuration and test execution scripts for running browser-based end-to-end integration tests.

#### Scenario: Running E2E tests against local dev server
- **WHEN** developer runs `npm run test:e2e`
- **THEN** Playwright launches the browser, loads the application, and executes all test suites under `e2e/`.

### Requirement: User Flow Navigation E2E Verification
The E2E test suite SHALL verify critical user navigation and interactive flows across pages and components.

#### Scenario: Navigation and exercise library selection flow
- **WHEN** user loads the application and selects an exercise from the library
- **THEN** the app opens the Practice View loaded with the selected exercise details.

#### Scenario: Metronome and practice view control flow
- **WHEN** user opens the practice screen and interacts with metronome controls (play, pause, BPM adjustments)
- **THEN** the UI updates to reflect the active playback state and updated BPM values.

#### Scenario: Auth login page flow
- **WHEN** user navigates to the login screen and fills in credentials
- **THEN** form controls accept user input and process authentication submission cleanly.
