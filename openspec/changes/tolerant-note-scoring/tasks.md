## 1. ScoreSample & evaluateSample

- [x] 1.1 Add `noteOnsetBeat: number | null` and `isNoteBoundary: boolean` fields to `ScoreSample` in `src/types/index.ts`
- [x] 1.2 Add `DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION` constant to `src/features/practice/utils/sampleEvaluation.ts`
- [x] 1.3 Extend `SampleEvaluationInput` with an optional `voteBoundaryMarginFraction` (default to the new constant)
- [x] 1.4 In `evaluateSample`, stamp non-rest samples with `noteOnsetBeat` (`activeNote.startBeat`) and `isNoteBoundary` (true when `noteProgress` is within the margin of either end); rest samples get `noteOnsetBeat: null`, `isNoteBoundary: false`

## 2. Per-Note Majority Vote

- [x] 2.1 Add `DEFAULT_MAJORITY_THRESHOLD` constant (0.7) to `sampleEvaluation.ts`
- [x] 2.2 Implement a pure grouping/voting step used by `computeAccuracyScores`: group non-rest samples by `noteOnsetBeat`, exclude `isNoteBoundary` samples per group (fall back to the full group if that empties it), mark a group correct when its correct-sample fraction is `>= majorityThreshold`
- [x] 2.3 Update `computeAccuracyScores`'s `noteAccuracy` to be `(passing note instances + correct rest samples) / (total note instances + rest samples) * 100`, replacing the old flat per-sample count
- [x] 2.4 Leave `intonationAccuracy`'s calculation untouched (still reads raw `isCorrect`/`centsOff` per sample, independent of the vote)
- [x] 2.5 Accept `majorityThreshold` as an optional parameter on `computeAccuracyScores` (default to the new constant)

## 3. Wire Tunables Through the Session Hook

- [x] 3.1 In `usePracticeSession.ts`, add `majorityThreshold`/`setMajorityThreshold` and `voteBoundaryMarginFraction`/`setVoteBoundaryMarginFraction` state (plus refs for the live sampler loop), following the existing `releaseWindowFraction`/`stalePitchMs` pattern
- [x] 3.2 Pass `voteBoundaryMarginFraction` into each `evaluateSample` call
- [x] 3.3 Pass `majorityThreshold` into the `computeAccuracyScores` call in `stopPracticeAndSaveLog`
- [x] 3.4 Expose both new values/setters from the hook's returned API

## 4. Scoring Tuning Panel

- [x] 4.1 Add `majorityThreshold` and `voteBoundaryMarginFraction` props to `ScoringTuningPanel`
- [x] 4.2 Add a "Note majority threshold" slider (e.g. 50-100%, default 70%)
- [x] 4.3 Add a "Note boundary margin" slider (e.g. 0-30% per side, default matching the new constant)
- [x] 4.4 Wire both through `PracticeView.tsx`

## 5. Tests

- [x] 5.1 Unit test: `evaluateSample` sets `isNoteBoundary` correctly at the head, core, and tail of a note
- [x] 5.2 Unit test: `computeAccuracyScores` counts a note instance correct despite a minority of wrong samples (majority vote)
- [x] 5.3 Unit test: `computeAccuracyScores` counts a note instance incorrect when below threshold
- [x] 5.4 Unit test: boundary samples are excluded from the vote, and a very short note (all samples boundary-flagged) falls back to voting over all its samples
- [x] 5.5 Unit test: two consecutive same-pitch note instances are voted independently (not merged via `noteOnsetBeat`)
- [x] 5.6 Unit test: a wrong-pitch sample inside an otherwise-passing note does not affect `intonationAccuracy`
- [x] 5.7 Update any existing `sampleEvaluation.test.ts` assertions that relied on the old flat per-sample `noteAccuracy` math

## 6. Verification

- [x] 6.1 `npx tsc --noEmit` passes
- [x] 6.2 Full `npx vitest run` suite passes
