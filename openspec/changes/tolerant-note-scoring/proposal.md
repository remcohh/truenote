## Why

Note accuracy is currently scored per 10Hz sample: each instant is independently correct or wrong, and the session score is just the fraction of correct samples. This makes the score overly sensitive to things that aren't really playing mistakes — a single misread frame during a held note, or a note that starts a beat late or gets cut off slightly early — even when the player clearly played the right note for most of its duration. Scoring per note instead of per instant, with a majority-vote threshold, would make the score track actual note-reading accuracy rather than sampler noise.

## What Changes

- Scoring evaluates correctness per **note instance**, not per raw sample: all samples taken while a given note is active are aggregated, and the note counts as correct if at least a configurable threshold (default 70%) of its samples matched the target pitch class.
- A sample's pitch-class match is unaffected by intonation: a sample within the existing note-match cents window (see prior fix) counts toward the "correct" side of the vote regardless of how far off-cents it is within that window. Intonation accuracy remains a fully separate calculation over the same samples.
- Note-boundary samples (near the very start or very end of a note's timeline window) are excluded from, or down-weighted in, the per-note vote, so a note starting slightly late or ending slightly early doesn't get dragged down by samples that were never really "inside" the intended note.
- A short burst of misdetected samples in the middle of an otherwise-correct note no longer flips that note to wrong, since it's now evaluated as a share of the note's total samples rather than sample-by-sample.
- Rests keep their existing per-sample-style evaluation (a rest is binary: was there a false entry or not) since there's no "majority" concept for silence.

## Capabilities

### New Capabilities
- `note-accuracy-scoring`: How a played note is judged correct — per-note majority vote over its samples, boundary tolerance, and separation from intonation scoring.

### Modified Capabilities

## Impact

- `src/features/practice/utils/sampleEvaluation.ts`: `evaluateSample` currently returns one correct/incorrect verdict per sample immediately; this becomes a two-stage evaluation — per-sample pitch-class classification, then a per-note-instance aggregation step that produces the final per-sample `isCorrect` (or a note-level result) once a note's samples are known.
- `src/features/practice/hooks/usePracticeSession.ts`: the sampler loop currently pushes each sample's verdict straight into the session log; it needs to also finalize the previous note's aggregated verdict when the active note changes (or at session end for the last note).
- `src/types/index.ts` (`ScoreSample`): may need a way to identify which note instance a sample belongs to, so the UI/tests can group samples per note.
- `src/features/practice/components/SampleAccuracyChart.tsx`: reads `sample.isCorrect` per sample today; needs to reconcile with per-note verdicts (e.g. all samples in a correct note render as correct, even the minority that individually mismatched).
- `src/features/practice/components/ScoringTuningPanel.tsx`: gains a "majority threshold" control alongside the existing tolerance sliders, following the same live-tunable pattern.
