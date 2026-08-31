import { useCallback, useEffect, useRef, useState } from 'react';
import type { Exercise, PracticeSession, ScoreSample } from '../../../types';
import { audioEngine, noteToFrequency } from '../../../services/audioEngine';
import { midiHalfToneToNoteName, noteLetter } from '../utils/noteParser';
import { findActiveNote, type NoteTimelineEntry } from '../utils/noteTimelineGenerator';
import { savePracticeSession, fetchPracticeSessions } from '../../../services/pocketbase';

/** Folds a raw signed cents value to its nearest octave-equivalent, in range [-600, 600). */
function foldCents(rawCents: number): number {
  return (((rawCents + 600) % 1200) + 1200) % 1200 - 600;
}

// How many times per second the scoring sampler checks "is the right note playing right now".
// Configurable via VITE_SAMPLE_RATE so it can be tuned per environment without a code change.
const SAMPLES_PER_SECOND = Number(import.meta.env.VITE_SAMPLE_RATE) || 10;

const STALE_PITCH_MS = 150; // no fresh mic detection within this window = "not playing"

interface UsePracticeSessionArgs {
  currentExercise: Exercise;
  bpm: number;
  transpose: number;
}

/**
 * Owns the full lifecycle of a practice run: count-in, the beat-position cursor,
 * the fixed-rate pitch-accuracy sampler, and the resulting session log/history.
 * Exercise/bpm/transpose selection is owned by the caller and passed in.
 */
export function usePracticeSession({ currentExercise, bpm, transpose }: UsePracticeSessionArgs) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTargetNote, setCurrentTargetNote] = useState<string | null>(null);

  const [isCountInEnabled, setIsCountInEnabled] = useState(true);
  const [isCountInActive, setIsCountInActive] = useState(false);
  const [countInBeat, setCountInBeat] = useState(4);
  const countInBeatsRemainingRef = useRef(4);

  const [stepTrigger, setStepTrigger] = useState(-1);
  const [startBeatIndex, setStartBeatIndex] = useState(0);
  const [detectedBeatsPerMeasure, setDetectedBeatsPerMeasure] = useState(4);
  const activeBeatsPerMeasure = detectedBeatsPerMeasure || currentExercise.beatsPerMeasure || 4;

  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [lastFinishedSession, setLastFinishedSession] = useState<PracticeSession | null>(null);
  const [lastSessionSamples, setLastSessionSamples] = useState<ScoreSample[]>([]);

  useEffect(() => {
    fetchPracticeSessions().then(setSessions);
  }, []);

  // A beat-position timeline of every note in the piece (independent of the
  // metronome-tick-quantized cursor), plus enough state to convert wall-clock time
  // into "where in the piece are we right now" without drifting when bpm changes
  // mid-practice.
  const noteTimelineRef = useRef<NoteTimelineEntry[]>([]);
  const currentBeatIndexRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  const bpmRef = useRef(bpm);
  const transposeRef = useRef(transpose);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { transposeRef.current = transpose; }, [transpose]);

  const practiceStartTimeRef = useRef<number | null>(null);
  const correctSamplesRef = useRef(0);
  const totalSamplesRef = useRef(0);
  const sampleLogRef = useRef<ScoreSample[]>([]);

  const resetPracticeCounters = useCallback(() => {
    practiceStartTimeRef.current = Date.now();
    correctSamplesRef.current = 0;
    totalSamplesRef.current = 0;
    sampleLogRef.current = [];
    currentBeatIndexRef.current = 0;
    lastBeatTimeRef.current = Date.now();
  }, []);

  const startPracticeNow = useCallback(() => {
    setIsPlaying(true);
    resetPracticeCounters();
  }, [resetPracticeCounters]);

  const stopPracticeAndSaveLog = useCallback(async () => {
    setIsPlaying(false);
    setIsCountInActive(false);

    const startTime = practiceStartTimeRef.current;
    if (!startTime) return;

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const totalSamples = totalSamplesRef.current;
    const score = totalSamples > 0
      ? Math.round((correctSamplesRef.current / totalSamples) * 100)
      : 0;

    setLastSessionSamples(sampleLogRef.current);

    const newSession = await savePracticeSession({
      exerciseId: currentExercise.id,
      exerciseTitle: currentExercise.title,
      bpm,
      durationSeconds,
      score,
      timestamp: new Date().toISOString(),
    });

    setLastFinishedSession(newSession);
    setSessions((prev) => [newSession, ...prev]);
  }, [currentExercise.id, currentExercise.title, bpm]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying || isCountInActive) {
      setIsPlaying(false);
      setIsCountInActive(false);
      setStepTrigger(-1);
      stopPracticeAndSaveLog();
    } else {
      setLastFinishedSession(null);
      const beatsCount = activeBeatsPerMeasure;
      if (isCountInEnabled) {
        setIsCountInActive(true);
        countInBeatsRemainingRef.current = beatsCount;
        setCountInBeat(beatsCount);
        setStepTrigger(-1);
        setStartBeatIndex(1);
        audioEngine.playCountInClick(false);
        setIsPlaying(true);
      } else {
        setStartBeatIndex(0);
        setStepTrigger(0);
        startPracticeNow();
      }
    }
  }, [isPlaying, isCountInActive, isCountInEnabled, activeBeatsPerMeasure, stopPracticeAndSaveLog, startPracticeNow]);

  const handleBeatTick = useCallback((_beat: number) => {
    if (isCountInActive) {
      const remaining = countInBeatsRemainingRef.current - 1;
      countInBeatsRemainingRef.current = remaining;

      if (remaining > 0) {
        setCountInBeat(remaining);
      } else {
        // Click 5 (Measure 1 Beat 1): Accented downbeat, count-in ends, place cursor on Note 1!
        setIsCountInActive(false);
        setStepTrigger(0);
        resetPracticeCounters();
      }
    } else if (isPlaying) {
      // Click 6 (Measure 1 Beat 2): Advance cursor!
      setStepTrigger((prev) => prev + 1);
      currentBeatIndexRef.current += 1;
      lastBeatTimeRef.current = Date.now();
    }
  }, [isCountInActive, isPlaying, resetPracticeCounters]);

  // Fixed-rate scoring sampler: independent of both the metronome's per-beat cursor
  // advance and the mic's own irregular detection rate. On every tick it works out
  // exactly where in the piece we are right now (in fractional beats) and what the
  // mic most recently heard, and scores that one instant as right or wrong. A note
  // held or replayed across many ticks accumulates a mix of right/wrong samples
  // rather than a single pass/fail per note.
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = window.setInterval(() => {
      const timeline = noteTimelineRef.current;
      if (timeline.length === 0) return;

      const secondsPerBeat = 60 / bpmRef.current;
      const secondsSinceLastBeat = (Date.now() - lastBeatTimeRef.current) / 1000;
      const beatFraction = Math.min(1, secondsSinceLastBeat / secondsPerBeat);
      const currentBeatPosition = currentBeatIndexRef.current + beatFraction;

      const activeNote = findActiveNote(timeline, currentBeatPosition);

      const played = audioEngine.getLastDetectedPitch();
      const isFresh = played !== null && Date.now() - played.timestamp <= STALE_PITCH_MS;
      const playedLetter = isFresh ? noteLetter(played!.note) : null;

      const elapsedSeconds = (Date.now() - (practiceStartTimeRef.current ?? Date.now())) / 1000;

      totalSamplesRef.current += 1;

      if (activeNote) {
        const requestedNoteName = midiHalfToneToNoteName(activeNote.halfTone + transposeRef.current);
        const requestedLetter = noteLetter(requestedNoteName);
        const isCorrect = playedLetter === requestedLetter;
        if (isCorrect) correctSamplesRef.current += 1;

        const centsOff = isFresh
          ? foldCents(1200 * Math.log2(played!.frequency / noteToFrequency(requestedNoteName)))
          : null;

        // The chart labels the note as printed on the sheet (pre-transpose), not the
        // transposed pitch that's actually supposed to sound.
        const sheetNoteName = midiHalfToneToNoteName(activeNote.halfTone);

        sampleLogRef.current.push({ t: elapsedSeconds, isRest: false, isCorrect, centsOff, expectedNote: sheetNoteName });
      } else {
        // Resting: correct means staying silent, any detected pitch is a false entry.
        const isCorrect = playedLetter === null;
        if (isCorrect) correctSamplesRef.current += 1;

        sampleLogRef.current.push({ t: elapsedSeconds, isRest: true, isCorrect, centsOff: null, expectedNote: null });
      }
    }, 1000 / SAMPLES_PER_SECOND);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);

  /** Called when the caller switches exercises: stops any run in progress and clears its state. */
  const resetForExercise = useCallback((ex: Exercise) => {
    setDetectedBeatsPerMeasure(ex.beatsPerMeasure || 4);
    setIsPlaying(false);
    setIsCountInActive(false);
    setStepTrigger(-1);
    setLastFinishedSession(null);
  }, []);

  const handleCurrentNoteChange = useCallback((note: string | null) => {
    setCurrentTargetNote(note);
  }, []);

  const handleNoteTimelineBuilt = useCallback((timeline: NoteTimelineEntry[]) => {
    noteTimelineRef.current = timeline;
  }, []);

  const dismissFinishedSession = useCallback(() => {
    setLastFinishedSession(null);
  }, []);

  const clearSessions = useCallback(() => {
    localStorage.removeItem('truenote_practice_logs');
    setSessions([]);
  }, []);

  const toggleCountIn = useCallback(() => {
    setIsCountInEnabled((prev) => !prev);
  }, []);

  return {
    isPlaying,
    currentTargetNote,
    isCountInEnabled,
    toggleCountIn,
    isCountInActive,
    countInBeat,
    stepTrigger,
    startBeatIndex,
    activeBeatsPerMeasure,
    setDetectedBeatsPerMeasure,
    sessions,
    lastFinishedSession,
    lastSessionSamples,
    handleTogglePlay,
    handleBeatTick,
    handleCurrentNoteChange,
    handleNoteTimelineBuilt,
    onExerciseFinished: stopPracticeAndSaveLog,
    resetForExercise,
    dismissFinishedSession,
    clearSessions,
  };
}

export type PracticeSessionApi = ReturnType<typeof usePracticeSession>;
