import type { ScoreSample } from '../../../types';
import { audioEngine, noteToFrequency } from '../../../services/audioEngine';
import { midiHalfToneToNoteName } from './noteParser';
import type { NoteTimelineEntry } from './noteTimelineGenerator';

type DetectedPitch = ReturnType<typeof audioEngine.getLastDetectedPitch>;

// No fresh mic detection within this window = "not playing".
export const DEFAULT_STALE_PITCH_MS = 150;

// A sample landing in the final 20% of a note's duration also accepts silence as
// correct — the player may have already released the note to prepare for the next
// one, which shouldn't be scored as a wrong/missed note.
export const DEFAULT_RELEASE_WINDOW_FRACTION = 0.2;

// How far (in cents, octave-folded) the played pitch may be from the target note and
// still count as "the right note" for note accuracy — a severely-out-of-tune-but-
// correct note should still score as correct here; only intonation accuracy cares how
// close within that window it landed. 50c (a half semitone) is the widest a fixed
// threshold can go without starting to overlap a chromatically-adjacent note.
export const DEFAULT_NOTE_MATCH_TOLERANCE_CENTS = 50;

// How close (in cents) a correctly-identified note must be to its target pitch to
// count as "in tune" for the intonation score. Note accuracy (right note, any tuning
// within the ±50c nearest-note range) and intonation accuracy (right note, tightly in
// tune) are reported separately since they measure different skills.
export const DEFAULT_INTONATION_TOLERANCE_CENTS = 10;

export interface SampleEvaluationInput {
  /** The note (or null for a rest) that is supposed to be sounding right now. */
  activeNote: NoteTimelineEntry | null;
  /** Beats elapsed since the piece started, as a continuous fraction - same units as activeNote.startBeat/endBeat. */
  elapsedBeats: number;
  played: DetectedPitch;
  transpose: number;
  elapsedSeconds: number;
  now?: number;
  /** How recent (ms) a mic detection must be to count as "currently sounding". Defaults to DEFAULT_STALE_PITCH_MS. */
  stalePitchMs?: number;
  /** Fraction (0-1) of a note's tail where silence is also accepted as correct. Defaults to DEFAULT_RELEASE_WINDOW_FRACTION. */
  releaseWindowFraction?: number;
  /** How far (cents) the played pitch may stray from the target and still count as the right note. Defaults to DEFAULT_NOTE_MATCH_TOLERANCE_CENTS. */
  noteMatchToleranceCents?: number;
}

/** Folds a raw signed cents value to its nearest octave-equivalent, in range [-600, 600). */
function foldCents(rawCents: number): number {
  return (((rawCents + 600) % 1200) + 1200) % 1200 - 600;
}

/** How far into activeNote's duration elapsedBeats falls, from 0 (start) to 1 (end). */
function noteProgress(activeNote: NoteTimelineEntry, elapsedBeats: number): number {
  const duration = activeNote.endBeat - activeNote.startBeat;
  if (duration <= 0) return 0;
  return (elapsedBeats - activeNote.startBeat) / duration;
}

/**
 * Evaluates one instant of a practice run: does the sampled (mic-detected) pitch land
 * within `noteMatchToleranceCents` of the expected note from the sheet music, or - for
 * a rest - is it correctly silent. This is the single place "correctness" is
 * determined, so the definition can grow (e.g. rhythm/timing accuracy, partial credit)
 * without touching the sampler loop that calls it.
 *
 * Correctness is judged purely by cents-distance to the specific requested note, never
 * by `played.note` (the mic engine's own nearest-note label). That label carries
 * hysteresis meant to stop a *sustained* note's on-screen tuner display from flickering
 * across a boundary — exactly the wrong tool here, where a note change means the
 * "previous note" is stale context, not a stable reference to stick to. Using it for
 * scoring could keep a fresh, in-tolerance note at the previous note's label a moment
 * longer, marking a legitimately (if badly) in-tune sample as a wrong note.
 */
export function evaluateSample(input: SampleEvaluationInput): ScoreSample {
  const {
    activeNote,
    elapsedBeats,
    played,
    transpose,
    elapsedSeconds,
    now = Date.now(),
    stalePitchMs = DEFAULT_STALE_PITCH_MS,
    releaseWindowFraction = DEFAULT_RELEASE_WINDOW_FRACTION,
    noteMatchToleranceCents = DEFAULT_NOTE_MATCH_TOLERANCE_CENTS,
  } = input;

  const isFresh = played !== null && now - played.timestamp <= stalePitchMs;

  if (!activeNote) {
    // Resting: correct means staying silent, any detected pitch is a false entry.
    return { t: elapsedSeconds, isRest: true, isCorrect: !isFresh, centsOff: null, expectedNote: null };
  }

  const requestedNoteName = midiHalfToneToNoteName(activeNote.halfTone + transpose);

  const centsOff = isFresh
    ? foldCents(1200 * Math.log2(played!.frequency / noteToFrequency(requestedNoteName)))
    : null;
  const isSameNote = centsOff !== null && Math.abs(centsOff) <= noteMatchToleranceCents;

  const isInReleaseWindow = noteProgress(activeNote, elapsedBeats) >= 1 - releaseWindowFraction;
  const isCorrect = isSameNote || (isInReleaseWindow && !isFresh);

  // The chart labels the note as printed on the sheet (pre-transpose), not the
  // transposed pitch that's actually supposed to sound.
  const sheetNoteName = midiHalfToneToNoteName(activeNote.halfTone);

  return { t: elapsedSeconds, isRest: false, isCorrect, centsOff, expectedNote: sheetNoteName };
}

export interface AccuracyScores {
  /** % of samples where the right note (any octave, within the ~50c nearest-note range) was sounding. */
  noteAccuracy: number;
  /**
   * % of *correctly-played, pitched* samples that were also within `intonationToleranceCents`
   * of the target pitch. A wrong note or a correctly-silent rest carries no intonation
   * information, so neither counts toward this score's denominator.
   */
  intonationAccuracy: number;
}

/** Aggregates a session's per-instant samples into the two headline scores. */
export function computeAccuracyScores(
  samples: ScoreSample[],
  intonationToleranceCents: number = DEFAULT_INTONATION_TOLERANCE_CENTS
): AccuracyScores {
  const total = samples.length;
  const correct = samples.filter((s) => s.isCorrect).length;
  const noteAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const pitchedCorrectSamples = samples.filter((s) => s.isCorrect && s.centsOff !== null);
  const inTuneSamples = pitchedCorrectSamples.filter((s) => Math.abs(s.centsOff!) <= intonationToleranceCents);
  const intonationAccuracy =
    pitchedCorrectSamples.length > 0 ? Math.round((inTuneSamples.length / pitchedCorrectSamples.length) * 100) : 0;

  return { noteAccuracy, intonationAccuracy };
}
