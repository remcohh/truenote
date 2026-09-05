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

// Fraction (0-1) of a note's duration, at both its start and its end, excluded from
// that note's majority vote (see DEFAULT_MAJORITY_THRESHOLD) — a note started a touch
// early/late or released a touch early shouldn't be judged on those transitional,
// ambiguous samples.
export const DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION = 0.15;

// Fraction of a note instance's (non-boundary) samples that must be pitch-class-correct
// for the whole note to count as correct. Lets a note tolerate a brief burst of
// misdetected samples without failing outright.
export const DEFAULT_MAJORITY_THRESHOLD = 0.7;

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
  /** Fraction (0-1) of a note's duration, at each end, excluded from its majority vote. Defaults to DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION. */
  voteBoundaryMarginFraction?: number;
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
 * Explains, in the browser console, why a sample was marked incorrect - what was
 * actually heard (note label + frequency), not just how far off it was. Dev-only: this
 * fires on every rejected sample, which is too noisy for production use.
 */
function logRejection(_reason: string, _played: DetectedPitch) {
  // Silenced: fires on every rejected sample, drowning out other console output
  // while diagnosing the test-tone retuning issue. Re-enable if needed.
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
    voteBoundaryMarginFraction = DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION,
  } = input;

  const isFresh = played !== null && now - played.timestamp <= stalePitchMs;
  const playedFrequency = isFresh ? played!.frequency : null;

  if (!activeNote) {
    // Resting: correct means staying silent, any detected pitch is a false entry.
    const isCorrect = !isFresh;
    if (!isCorrect) logRejection('sound detected during a rest', played);
    return {
      t: elapsedSeconds,
      isRest: true,
      isCorrect,
      centsOff: null,
      playedFrequency,
      expectedNote: null,
      noteOnsetBeat: null,
      isNoteBoundary: false,
    };
  }

  const requestedNoteName = midiHalfToneToNoteName(activeNote.halfTone + transpose);

  const centsOff = isFresh
    ? foldCents(1200 * Math.log2(played!.frequency / noteToFrequency(requestedNoteName)))
    : null;
  const isSameNote = centsOff !== null && Math.abs(centsOff) <= noteMatchToleranceCents;

  const progress = noteProgress(activeNote, elapsedBeats);
  const isInReleaseWindow = progress >= 1 - releaseWindowFraction;
  const isCorrect = isSameNote || (isInReleaseWindow && !isFresh);
  const isNoteBoundary = progress < voteBoundaryMarginFraction || progress >= 1 - voteBoundaryMarginFraction;

  if (!isCorrect) {
    const progressPct = Math.round(progress * 100);
    const reason = !isFresh
      ? `no fresh pitch for ${requestedNoteName} (${progressPct}% through note, outside release window)`
      : `expected ${requestedNoteName} but off by ${centsOff!.toFixed(0)}c (${progressPct}% through note)`;
    logRejection(reason, played);
  }

  // The chart labels the note as printed on the sheet (pre-transpose), not the
  // transposed pitch that's actually supposed to sound.
  const sheetNoteName = midiHalfToneToNoteName(activeNote.halfTone);

  return {
    t: elapsedSeconds,
    isRest: false,
    isCorrect,
    centsOff,
    playedFrequency,
    expectedNote: sheetNoteName,
    noteOnsetBeat: activeNote.startBeat,
    isNoteBoundary,
  };
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

/**
 * Groups non-rest samples by the note instance they belong to (`noteOnsetBeat`) and
 * votes each instance correct when at least `majorityThreshold` of its non-boundary
 * samples were pitch-class-correct. Boundary samples (note start/end margins) are
 * excluded from the vote unless excluding them would leave nothing to vote on.
 *
 * Exported so any other view of a session (e.g. `SampleAccuracyChart`) can look up the
 * exact same per-note verdict this score is built from, keyed by `noteOnsetBeat`,
 * instead of approximating its own - two independent "was this note correct"
 * calculations disagreeing is worse than one shared source of truth.
 */
export function voteNoteInstances(
  samples: ScoreSample[],
  majorityThreshold: number = DEFAULT_MAJORITY_THRESHOLD
): Map<number, boolean> {
  const byInstance = new Map<number, ScoreSample[]>();
  for (const s of samples) {
    if (s.isRest || s.noteOnsetBeat === null) continue;
    const group = byInstance.get(s.noteOnsetBeat) ?? [];
    group.push(s);
    byInstance.set(s.noteOnsetBeat, group);
  }

  const verdicts = new Map<number, boolean>();
  for (const [onsetBeat, group] of byInstance) {
    const coreSamples = group.filter((s) => !s.isNoteBoundary);
    const votingPool = coreSamples.length > 0 ? coreSamples : group;
    const correctCount = votingPool.filter((s) => s.isCorrect).length;
    verdicts.set(onsetBeat, correctCount / votingPool.length >= majorityThreshold);
  }
  return verdicts;
}

/** Aggregates a session's per-instant samples into the two headline scores. */
export function computeAccuracyScores(
  samples: ScoreSample[],
  intonationToleranceCents: number = DEFAULT_INTONATION_TOLERANCE_CENTS,
  majorityThreshold: number = DEFAULT_MAJORITY_THRESHOLD
): AccuracyScores {
  const restSamples = samples.filter((s) => s.isRest);
  const noteVerdicts = Array.from(voteNoteInstances(samples, majorityThreshold).values());

  const totalUnits = restSamples.length + noteVerdicts.length;
  const correctUnits = restSamples.filter((s) => s.isCorrect).length + noteVerdicts.filter(Boolean).length;
  const noteAccuracy = totalUnits > 0 ? Math.round((correctUnits / totalUnits) * 100) : 0;

  const pitchedCorrectSamples = samples.filter((s) => s.isCorrect && s.centsOff !== null);
  const inTuneSamples = pitchedCorrectSamples.filter((s) => Math.abs(s.centsOff!) <= intonationToleranceCents);
  const intonationAccuracy =
    pitchedCorrectSamples.length > 0 ? Math.round((inTuneSamples.length / pitchedCorrectSamples.length) * 100) : 0;

  return { noteAccuracy, intonationAccuracy };
}
