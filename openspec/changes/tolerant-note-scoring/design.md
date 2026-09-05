## Context

Note accuracy is currently computed by `evaluateSample` (`src/features/practice/utils/sampleEvaluation.ts`), called once per sampler tick (10Hz by default) from `usePracticeSession`. Each call independently decides whether *that instant* matches the target note (within a fixed cents tolerance) and pushes a `ScoreSample { isCorrect, centsOff, ... }` onto a flat log. `computeAccuracyScores` then derives `noteAccuracy` and `intonationAccuracy` purely by counting samples in that flat log — there is no notion of "this note, as a whole, was played correctly."

That per-instant model is what makes the score sensitive to things that aren't real mistakes: a note started a touch early or cut a touch short, or a single misread frame in the middle of an otherwise-solid note, currently costs points at the same rate as a genuinely wrong note held for its entire duration.

A prior fix already decoupled tuning from note-letter correctness (a badly out-of-tune sample can still be pitch-class-correct); this change is a level above that — deciding correctness per **note instance** rather than per instant, without disturbing that existing intonation calculation.

## Goals / Non-Goals

**Goals:**
- A note instance counts as correct if at least `majorityThreshold` (default 70%) of its *core* samples were pitch-class-correct, tolerating brief misdetection bursts.
- Samples near a note's start/end (within `voteBoundaryMarginFraction` of its duration on either side) are excluded from that vote, so a note started slightly early/late or released slightly early doesn't get judged on its transitional, ambiguous samples.
- Intonation accuracy is computed exactly as today, from raw per-sample pitch data — unaffected by the majority vote.
- Both new thresholds are live-tunable via `ScoringTuningPanel`, matching the existing pattern for `releaseWindowFraction`, `stalePitchMs`, and `intonationToleranceCents`.

**Non-Goals:**
- No change to rest scoring (false-entry-during-rest stays a straight per-sample check, per the proposal).
- No change to `SampleAccuracyChart` — it keeps rendering the raw, per-instant `isCorrect`/`centsOff` values exactly as evaluated, so it stays a truthful moment-by-moment view even for a note that passes its majority vote overall.
- No retroactive rescoring of previously-saved sessions; the new algorithm applies going forward only.

## Decisions

**1. Identify note instances via two new `ScoreSample` fields, not a name-based grouping.**
Samples are logged as a flat, timestamped list. To vote on a note, its samples need to be grouped first — and the obvious approach, grouping consecutive samples that share the same `expectedNote` string, breaks on repeated notes: two consecutive quarter notes both at C4, with no rest in between, would get merged into one "C4" blob. If the player nails the first and completely misses the second, string-grouping would average a perfect note with a totally wrong one instead of voting on them independently.

Each note in the piece's timeline (`NoteTimelineEntry`) already has a `startBeat` that's unique per occurrence — the two C4s have different `startBeat` values despite sharing a pitch. So instead of grouping by note *name*, `evaluateSample` stamps each non-rest sample with:
- `noteOnsetBeat: number | null` — the active note's `startBeat`, `null` for rests. Grouping by this value can never merge two distinct note instances, regardless of repeated pitches.
- `isNoteBoundary: boolean` — `true` when the sample falls within `voteBoundaryMarginFraction` of the note's start or end. Unrelated to grouping; it exists for the separate "exclude boundary samples from the vote" requirement.

Both fields are bundled into this decision because they're computed at the same place (`evaluateSample`/`noteProgress`, where the beat-position math already lives), for the same reason: to make the later aggregation step "dumb" — group-by and filter, no timing math.

*Alternative considered*: pass the full note timeline into `computeAccuracyScores` and re-derive grouping/margins there from raw sample timestamps. Rejected — the aggregation function would then need to know about beats-per-second, note durations, etc., duplicating logic that already exists in `evaluateSample`. Keeping one copy of that math avoids the two drifting out of sync over time.

**2. Leave `isCorrect`/`centsOff` on each raw sample untouched; add a separate note-accuracy aggregation step.**
`isCorrect` keeps meaning exactly what it means today: "was this instant pitch-class-correct." `intonationAccuracy` keeps reading it directly, so intonation scoring is provably unaffected by this change. A new pure function computes `noteAccuracy` by grouping non-rest samples by `noteOnsetBeat`, discarding `isNoteBoundary` samples from each group (falling back to the full group if that leaves zero samples — see Risks), and counting a group as correct when the correct fraction of its remaining samples is `>= majorityThreshold`. Rest samples continue to count individually, as today.

*Alternative considered*: overwrite `isCorrect` to the note's aggregate verdict for every sample in a passing instance. Rejected — a genuinely wrong-pitch sample inside an otherwise-passing note has a large, meaningless `centsOff`; letting it flip to "correct" would leak that nonsense value into intonation accuracy's average.

**3. Add the boundary-margin exclusion as a new, separate mechanism alongside the existing tail-only release window, not a replacement for it.**
`releaseWindowFraction` already makes a silent tail sample individually "correct" (useful for the chart and for notes that don't get grouped, e.g. isolated single-sample notes). The new margin only controls which samples are *eligible to vote* on their note's overall verdict. Keeping them separate avoids touching tested behavior; the trade-off is two boundary-related concepts existing side by side (see Risks).

## Risks / Trade-offs

- **Two overlapping "boundary forgiveness" concepts** (existing release-window silence-acceptance vs. new vote-margin exclusion) → Mitigate by keeping their responsibilities crisply documented: release window affects individual-sample display/silence handling; vote margin affects only which samples count toward a note's pass/fail.
- **Very short notes** (duration small enough that head+tail margins would exclude every sample) → the aggregator falls back to voting over the full, unfiltered sample set for that instance rather than an empty one.
- **Very few samples per note** (e.g. a fast passage sampled at 10Hz yielding 1-2 samples per note) → the majority vote degenerates toward a single sample's verdict regardless of threshold; this is an inherent limit of the sample rate, not something this change can fully solve. `SAMPLES_PER_SECOND` is already configurable via `VITE_SAMPLE_RATE` if this proves too coarse in practice.
- **Two new tunables added to an already-growing `ScoringTuningPanel`** → both default to values described directly in the request (70%, and a modest boundary margin); no additional tunables are introduced beyond what's needed to express this behavior.

## Migration Plan

Pure logic change with no data migration: existing saved sessions keep whatever score they were computed with; only sessions scored after this ships use the new per-note majority-vote algorithm. No schema change to `PracticeSession`/PocketBase — `ScoreSample` gains two fields, but `ScoreSample` values only ever live in-memory for the duration of a session (they aren't persisted), so there's nothing to backfill.
