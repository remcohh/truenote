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
});

function sample(overrides: Partial<ScoreSample>): ScoreSample {
  return { t: 0, isRest: false, isCorrect: true, centsOff: 0, expectedNote: 'C4', ...overrides };
}

describe('computeAccuracyScores', () => {
  it('returns 0 for both scores when there are no samples', () => {
    expect(computeAccuracyScores([])).toEqual({ noteAccuracy: 0, intonationAccuracy: 0 });
  });

  it('scores note accuracy as the fraction of correct samples, regardless of tuning', () => {
    const samples = [
      sample({ isCorrect: true, centsOff: 40 }), // right note, badly out of tune
      sample({ isCorrect: true, centsOff: 0 }),
      sample({ isCorrect: false, centsOff: null }),
      sample({ isCorrect: false, centsOff: null }),
    ];
    expect(computeAccuracyScores(samples).noteAccuracy).toBe(50);
  });

  it('scores intonation accuracy only over correctly-played, pitched samples', () => {
    const samples = [
      sample({ isCorrect: true, centsOff: 5 }), // in tune
      sample({ isCorrect: true, centsOff: -5 }), // in tune
      sample({ isCorrect: true, centsOff: 40 }), // right note, out of tune
      sample({ isCorrect: false, centsOff: null }), // wrong note - doesn't count
      sample({ isRest: true, isCorrect: true, centsOff: null, expectedNote: null }), // correct rest - doesn't count
    ];
    const { noteAccuracy, intonationAccuracy } = computeAccuracyScores(samples, 10);
    expect(noteAccuracy).toBe(80); // 4/5 correct
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
