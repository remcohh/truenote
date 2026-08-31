## ADDED Requirements

### Requirement: Unit Test Environment Infrastructure
The project SHALL provide a Vitest-based test runner environment configured with jsdom and React Testing Library for executing unit tests.

#### Scenario: Running unit test suite
- **WHEN** developer runs `npm run test:unit`
- **THEN** Vitest executes all test files matching `src/**/*.test.{ts,tsx}` and outputs the test results.

#### Scenario: Code coverage generation
- **WHEN** developer runs `npm run test:coverage`
- **THEN** Vitest generates a code coverage report for files in `src/`.

### Requirement: Music Utility Function Unit Tests
The test suite SHALL verify the correctness of core music domain helper functions including note parsing, beat map generation, and note timeline calculation.

#### Scenario: Validating note parsing
- **WHEN** `noteParser` utility is called with valid note strings and frequencies
- **THEN** it correctly calculates pitch frequencies, note names, and octave numbers.

#### Scenario: Validating beat map generation
- **WHEN** `beatMapGenerator` is provided with BPM, time signature, and measure count
- **THEN** it returns accurate timestamp arrays for each beat and subdivision.

### Requirement: React Component and Hook Unit Tests
The test suite SHALL verify React UI components and custom hooks using React Testing Library in a jsdom environment.

#### Scenario: Testing authentication hook behavior
- **WHEN** `useAuth` hook is rendered in test context
- **THEN** it properly manages authentication states, login actions, and user session values.

#### Scenario: Testing ExerciseSelector component interaction
- **WHEN** user selects an exercise item in `ExerciseSelector`
- **THEN** the selection callback is triggered with the correct exercise ID.
