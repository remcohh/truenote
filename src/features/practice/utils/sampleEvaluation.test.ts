import { describe, it, expect } from 'vitest';
import { evaluateSample, computeAccuracyScores } from './sampleEvaluation';
import { noteToFrequency } from '../../../services/audioEngine';
import type { NoteTimelineEntry } from './noteTimelineGenerator';
import type { ScoreSample } from '../../../types';

// C4, spanning beats [0, 10) so 20% of its duration = 2 beats.
const activeNote: NoteTimelineEntry = {
  startBeat: 0,
  endBeat: 10,
  startTime: 0,
  endTime: 5,
  halfTone: 60,
};

// Correctness is judged by frequency (cents distance to the target), not by this label
// — so the label here is only for readability, and `centsOffset` lets a test place the
// played frequency precisely relative to `note`'s true pitch.
function playedPitch(note: string, timestamp = 0, centsOffset = 0) {
  const frequency = noteToFrequency(note) * Math.pow(2, centsOffset / 1200);
  return { note, frequency, cents: 0, timestamp };
}

describe('evaluateSample', () => {
  it('is correct when the played note matches the expected note', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.isCorrect).toBe(true);
    expect(sample.isRest).toBe(false);
    expect(sample.expectedNote).toBe('C4');
  });

  it('is incorrect for silence early in the note (outside the release window)', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1, // 10% through a 10-beat note
      played: null,
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.isCorrect).toBe(false);
  });

  it('accepts silence in the last 20% of the note as correct', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 8.5, // 85% through a 10-beat note
      played: null,
      transpose: 0,
      elapsedSeconds: 4.25,
      now: 0,
    });
    expect(sample.isCorrect).toBe(true);
  });

  it('still accepts the requested note itself inside the release window', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 8.5,
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 4.25,
      now: 0,
    });
    expect(sample.isCorrect).toBe(true);
  });

  it('rejects a wrong (non-silent) note inside the release window', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 8.5,
      played: playedPitch('D4'),
      transpose: 0,
      elapsedSeconds: 4.25,
      now: 0,
    });
    expect(sample.isCorrect).toBe(false);
  });

  it('rejects silence just before the release window starts', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 7.99, // just under 80% through
      played: null,
      transpose: 0,
      elapsedSeconds: 4,
      now: 0,
    });
    expect(sample.isCorrect).toBe(false);
  });

  it('treats a rest as correct only when silent, regardless of note-progress logic', () => {
    const silent = evaluateSample({
      activeNote: null,
      elapsedBeats: 1,
      played: null,
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(silent.isCorrect).toBe(true);
    expect(silent.isRest).toBe(true);
    expect(silent.noteOnsetBeat).toBeNull();
    expect(silent.isNoteBoundary).toBe(false);

    const notSilent = evaluateSample({
      activeNote: null,
      elapsedBeats: 1,
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(notSilent.isCorrect).toBe(false);
  });

  it('ignores a stale (old) detected pitch as if nothing was played', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: playedPitch('C4', -1000), // far older than the freshness window
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.isCorrect).toBe(false);
  });

  it('counts a severely out-of-tune but still-nearest-note pitch as correct', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: playedPitch('C4', 0, 45), // 45c sharp of C4 - well within the default 50c tolerance
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.isCorrect).toBe(true);
    expect(sample.centsOff).toBeCloseTo(45, 0);
  });

  it('marks a note wrong once it drifts past the note-match tolerance', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: playedPitch('C4', 0, 60), // 60c sharp - past the default 50c tolerance
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.isCorrect).toBe(false);
  });

  it('respects a wider, custom note-match tolerance', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: playedPitch('C4', 0, 70),
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
      noteMatchToleranceCents: 80,
    });
    expect(sample.isCorrect).toBe(true);
  });

  it('never relies on the mic engine\'s own (hysteresis-prone) note label for correctness', () => {
    // Frequency is exactly on-pitch for the target, but the label the mic engine
    // attached to that reading (e.g. via its own hysteresis) claims a different note.
    // Scoring must trust the frequency, not this label.
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: { note: 'B3', frequency: noteToFrequency('C4'), cents: 0, timestamp: 0 },
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.isCorrect).toBe(true);
  });

  it('identifies the note instance via noteOnsetBeat, distinct from the note letter', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1,
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    expect(sample.noteOnsetBeat).toBe(activeNote.startBeat);
  });

  it('flags samples at the head and tail of a note as boundary samples, but not the core', () => {
    // Default margin is 15% of the note's duration on each end of this 10-beat note.
    const head = evaluateSample({
      activeNote,
      elapsedBeats: 1, // 10% through - inside the head margin
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.1,
      now: 0,
    });
    const core = evaluateSample({
      activeNote,
      elapsedBeats: 5, // 50% through - well inside the core
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.5,
      now: 0,
    });
    const tail = evaluateSample({
      activeNote,
      elapsedBeats: 9, // 90% through - inside the tail margin
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.9,
      now: 0,
    });

    expect(head.isNoteBoundary).toBe(true);
    expect(core.isNoteBoundary).toBe(false);
    expect(tail.isNoteBoundary).toBe(true);
  });

  it('respects a custom vote boundary margin', () => {
    const sample = evaluateSample({
      activeNote,
      elapsedBeats: 1, // 10% through
      played: playedPitch('C4'),
      transpose: 0,
      elapsedSeconds: 0.1,
      now: 0,
      voteBoundaryMarginFraction: 0.05, // 10% is now outside a narrower 5% margin
    });
    expect(sample.isNoteBoundary).toBe(false);
  });
});

function sample(overrides: Partial<ScoreSample>): ScoreSample {
  return {
    t: 0,
    isRest: false,
    isCorrect: true,
    centsOff: 0,
    playedFrequency: null,
    expectedNote: 'C4',
    noteOnsetBeat: 0,
    isNoteBoundary: false,
    ...overrides,
  };
}

/** Builds the samples for one note instance from a simple correct/incorrect pattern. */
function noteInstance(
  onsetBeat: number,
  pattern: Array<{ isCorrect: boolean; isNoteBoundary?: boolean }>
): ScoreSample[] {
  return pattern.map(({ isCorrect, isNoteBoundary = false }) =>
    sample({ noteOnsetBeat: onsetBeat, isCorrect, centsOff: isCorrect ? 0 : 300, isNoteBoundary })
  );
}

describe('computeAccuracyScores', () => {
  it('returns 0 for both scores when there are no samples', () => {
    expect(computeAccuracyScores([])).toEqual({ noteAccuracy: 0, intonationAccuracy: 0 });
  });

  it('counts a note instance correct despite a minority of wrong samples (majority vote)', () => {
    // 8/10 correct - above the default 70% majority threshold.
    const samples = noteInstance(0, [
      ...Array(8).fill({ isCorrect: true }),
      ...Array(2).fill({ isCorrect: false }),
    ]);
    expect(computeAccuracyScores(samples).noteAccuracy).toBe(100);
  });

  it('counts a note instance incorrect when below the majority threshold', () => {
    // 5/10 correct - below the default 70% majority threshold.
    const samples = noteInstance(0, [
      ...Array(5).fill({ isCorrect: true }),
      ...Array(5).fill({ isCorrect: false }),
    ]);
    expect(computeAccuracyScores(samples).noteAccuracy).toBe(0);
  });

  it('weighs note accuracy by note instance, not by raw sample count', () => {
    const passingInstance = noteInstance(0, Array(10).fill({ isCorrect: true })); // 10 samples, passes
    const failingInstance = noteInstance(10, [{ isCorrect: false }]); // 1 sample, fails
    // 1 of 2 instances passed - not 10 of 11 samples.
    expect(computeAccuracyScores([...passingInstance, ...failingInstance]).noteAccuracy).toBe(50);
  });

  it('excludes boundary samples from the vote, letting a note with a rough start/end still pass', () => {
    const samples = noteInstance(0, [
      { isCorrect: false, isNoteBoundary: true },
      { isCorrect: false, isNoteBoundary: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: false, isNoteBoundary: true },
      { isCorrect: false, isNoteBoundary: true },
    ]);
    // Core-only: 6/6 correct passes. Including the 4 boundary misses (6/10 = 60%) would fail.
    expect(computeAccuracyScores(samples).noteAccuracy).toBe(100);
  });

  it('falls back to voting over all samples when every sample in a note is a boundary sample', () => {
    // A note short enough that its entire duration falls within the boundary margins.
    const samples = noteInstance(0, [
      { isCorrect: true, isNoteBoundary: true },
      { isCorrect: false, isNoteBoundary: true },
      { isCorrect: false, isNoteBoundary: true },
    ]);
    // 1/3 correct - below threshold, but the vote still runs (no crash, no free pass).
    expect(computeAccuracyScores(samples).noteAccuracy).toBe(0);
  });

  it('votes two consecutive same-pitch note instances independently', () => {
    const firstC4 = noteInstance(0, Array(5).fill({ isCorrect: true })); // passes
    const secondC4 = noteInstance(5, Array(5).fill({ isCorrect: false })); // fails
    // If grouped by note name instead of noteOnsetBeat, these would wrongly merge into one 50%-correct blob.
    expect(computeAccuracyScores([...firstC4, ...secondC4]).noteAccuracy).toBe(50);
  });

  it('counts rest samples individually alongside note instances', () => {
    const passingInstance = noteInstance(0, Array(5).fill({ isCorrect: true }));
    const correctRest = sample({ isRest: true, isCorrect: true, centsOff: null, expectedNote: null, noteOnsetBeat: null });
    const falseEntryRest = sample({ isRest: true, isCorrect: false, centsOff: null, expectedNote: null, noteOnsetBeat: null });
    // 1 passing note instance + 1 correct rest out of (1 instance + 2 rests) = 2/3.
    expect(computeAccuracyScores([...passingInstance, correctRest, falseEntryRest]).noteAccuracy).toBe(67);
  });

  it('respects a custom majority threshold', () => {
    const samples = noteInstance(0, [
      ...Array(6).fill({ isCorrect: true }),
      ...Array(4).fill({ isCorrect: false }),
    ]);
    expect(computeAccuracyScores(samples, 10, 0.7).noteAccuracy).toBe(0); // 60% < 70%
    expect(computeAccuracyScores(samples, 10, 0.5).noteAccuracy).toBe(100); // 60% >= 50%
  });

  it('does not let a wrong-pitch sample inside an otherwise-passing note skew intonation accuracy', () => {
    const samples: ScoreSample[] = [
      ...Array(9)
        .fill(null)
        .map(() => sample({ noteOnsetBeat: 0, isCorrect: true, centsOff: 5 })), // in tune
      sample({ noteOnsetBeat: 0, isCorrect: false, centsOff: 300 }), // a genuine wrong-pitch blip
    ];
    const { noteAccuracy, intonationAccuracy } = computeAccuracyScores(samples, 10);
    expect(noteAccuracy).toBe(100); // 9/10 = 90% >= 70% majority threshold
    expect(intonationAccuracy).toBe(100); // the wrong sample's 300c never enters this calculation
  });

  it('scores intonation accuracy only over correctly-played, pitched samples', () => {
    const samples = [
      sample({ isCorrect: true, centsOff: 5 }), // in tune
      sample({ isCorrect: true, centsOff: -5 }), // in tune
      sample({ isCorrect: true, centsOff: 40 }), // right note, out of tune
      sample({ isCorrect: false, centsOff: null }), // wrong note - doesn't count
      sample({ isRest: true, isCorrect: true, centsOff: null, expectedNote: null, noteOnsetBeat: null }), // correct rest - doesn't count
    ];
    const { intonationAccuracy } = computeAccuracyScores(samples, 10);
    expect(intonationAccuracy).toBe(67); // 2/3 pitched-correct samples within +-10c
  });

  it('respects a custom intonation tolerance', () => {
    const samples = [sample({ isCorrect: true, centsOff: 20 })];
    expect(computeAccuracyScores(samples, 10).intonationAccuracy).toBe(0);
    expect(computeAccuracyScores(samples, 25).intonationAccuracy).toBe(100);
  });

  it('is 0, not NaN, when no sample carries intonation information', () => {
    const samples = [sample({ isCorrect: false, centsOff: null })];
    expect(computeAccuracyScores(samples).intonationAccuracy).toBe(0);
  });
});
