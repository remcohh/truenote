import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { MusicSheetViewer } from './components/MusicSheetViewer';
import { MetronomeControls } from './components/MetronomeControls';
import { PitchDetector } from './components/PitchDetector';
import { ExerciseSelector } from './components/ExerciseSelector';
import { PocketBaseModal } from './components/PocketBaseModal';
import { PracticeStats } from './components/PracticeStats';
import { PracticeCompleteModal } from './components/PracticeCompleteModal';
import { audioEngine, noteToFrequency } from './services/audioEngine';
import { midiHalfToneToNoteName } from './utils/noteParser';
import { findActiveNote, type NoteTimelineEntry } from './utils/noteTimelineGenerator';

import type { Exercise, PracticeSession, ScoreSample, UserProfile } from './types';
import { SAMPLE_EXERCISES } from './data/sampleExercises';
import {
  testPocketBaseConnection,
  getCurrentUser,
  savePracticeSession,
  fetchPracticeSessions,
  getLocalCustomExercises,
  saveLocalCustomExercise,
} from './services/pocketbase';
import { Sparkles, Trophy, Music, RotateCcw } from 'lucide-react';

/** Folds a raw signed cents value to its nearest octave-equivalent, in range [-600, 600). */
function foldCents(rawCents: number): number {
  return (((rawCents + 600) % 1200) + 1200) % 1200 - 600;
}

// How many times per second the scoring sampler checks "is the right note playing right now".
// Configurable via VITE_SAMPLE_RATE so it can be tuned per environment without a code change.
const SAMPLES_PER_SECOND = Number(import.meta.env.VITE_SAMPLE_RATE) || 10;

export function App() {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(SAMPLE_EXERCISES[0]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [transpose, setTranspose] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(SAMPLE_EXERCISES[0].defaultBpm);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTargetNote, setCurrentTargetNote] = useState<string | null>(null);

  // Theme state ('light' by default per request, stored in localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('truenote_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('truenote_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // Practice Metrics & Session timer
  const practiceStartTimeRef = useRef<number | null>(null);
  const correctSamplesRef = useRef<number>(0);
  const totalSamplesRef = useRef<number>(0);

  // Continuous fixed-rate scoring: a beat-position timeline of every note in the
  // piece (independent of the metronome-tick-quantized cursor), plus enough state
  // to convert wall-clock time into "where in the piece are we right now" without
  // drifting when bpm changes mid-practice.
  const noteTimelineRef = useRef<NoteTimelineEntry[]>([]);
  const currentBeatIndexRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const bpmRef = useRef<number>(bpm);
  const transposeRef = useRef<number>(transpose);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { transposeRef.current = transpose; }, [transpose]);

  // Per-sample log for the results modal's accuracy chart.
  const sampleLogRef = useRef<ScoreSample[]>([]);
  const [lastSessionSamples, setLastSessionSamples] = useState<ScoreSample[]>([]);


  // Metronome & Count-In options
  const [isMetronomeMuted, setIsMetronomeMuted] = useState<boolean>(false);
  const [isCountInEnabled, setIsCountInEnabled] = useState<boolean>(true);
  const [isCountInActive, setIsCountInActive] = useState<boolean>(false);
  const [countInBeat, setCountInBeat] = useState<number>(4);
  const countInBeatsRemainingRef = useRef<number>(4);
  const [stepTrigger, setStepTrigger] = useState<number>(-1);

  // Sessions & Custom Exercises
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  // PocketBase & User State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isPbModalOpen, setIsPbModalOpen] = useState<boolean>(false);

  // App Tab View
  const [activeTab, setActiveTab] = useState<'practice' | 'library' | 'stats'>('practice');

  // Completed Session Result Banner
  const [lastFinishedSession, setLastFinishedSession] = useState<PracticeSession | null>(null);

  // Initial load
  useEffect(() => {
    // Check PocketBase connection & user
    testPocketBaseConnection().then((ok) => {
      setIsConnected(ok);
      if (ok) {
        getCurrentUser().then(setCurrentUser);
      }
    });

    // Load sessions
    fetchPracticeSessions().then(setSessions);

    // Load custom exercises
    setCustomExercises(getLocalCustomExercises());
  }, []);

  const [detectedBeatsPerMeasure, setDetectedBeatsPerMeasure] = useState<number>(4);
  const [startBeatIndex, setStartBeatIndex] = useState<number>(0);

  const activeBeatsPerMeasure = detectedBeatsPerMeasure || currentExercise.beatsPerMeasure || 4;

  // Update BPM when exercise changes
  const handleSelectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    setBpm(ex.defaultBpm);
    setDetectedBeatsPerMeasure(ex.beatsPerMeasure || 4);
    setTranspose(0);
    setIsPlaying(false);
    setIsCountInActive(false);
    setStepTrigger(-1);
    setLastFinishedSession(null);
  };

  const handleTogglePlay = () => {
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
  };



  const handleBeatTick = useCallback((beat: number) => {
    if (isCountInActive) {
      const remaining = countInBeatsRemainingRef.current - 1;
      countInBeatsRemainingRef.current = remaining;

      if (remaining > 0) {
        setCountInBeat(remaining);
      } else {
        // Click 5 (Measure 1 Beat 1): Accented downbeat, count-in ends, place cursor on Note 1!
        setIsCountInActive(false);
        setStepTrigger(0);
        practiceStartTimeRef.current = Date.now();
        correctSamplesRef.current = 0;
        totalSamplesRef.current = 0;
        sampleLogRef.current = [];
        currentBeatIndexRef.current = 0;
        lastBeatTimeRef.current = Date.now();
      }
    } else if (isPlaying) {
      // Click 6 (Measure 1 Beat 2): Advance cursor!
      setStepTrigger((prev) => prev + 1);
      currentBeatIndexRef.current += 1;
      lastBeatTimeRef.current = Date.now();
    }
  }, [isCountInActive, isPlaying]);




  const startPracticeNow = () => {
    setIsPlaying(true);
    practiceStartTimeRef.current = Date.now();
    correctSamplesRef.current = 0;
    totalSamplesRef.current = 0;
    sampleLogRef.current = [];
    currentBeatIndexRef.current = 0;
    lastBeatTimeRef.current = Date.now();
  };


  const stopPracticeAndSaveLog = async () => {
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
  };





  const handleCurrentNoteChange = (note: string | null) => {
    setCurrentTargetNote(note);
  };

  // Fixed-rate scoring sampler: independent of both the metronome's per-beat cursor
  // advance and the mic's own irregular detection rate. On every tick it works out
  // exactly where in the piece we are right now (in fractional beats) and what the
  // mic most recently heard, and scores that one instant as right or wrong. A note
  // held or replayed across many ticks accumulates a mix of right/wrong samples
  // rather than a single pass/fail per note.
  useEffect(() => {
    if (!isPlaying) return;

    const STALE_PITCH_MS = 150; // no fresh mic detection within this window = "not playing"

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
      const playedLetter = isFresh ? played!.note.trim().replace(/\d+$/, '').toUpperCase() : null;

      const elapsedSeconds = (Date.now() - (practiceStartTimeRef.current ?? Date.now())) / 1000;

      totalSamplesRef.current += 1;

      if (activeNote) {
        const requestedNoteName = midiHalfToneToNoteName(activeNote.halfTone + transposeRef.current);
        const requestedLetter = requestedNoteName.replace(/\d+$/, '').toUpperCase();
        const isCorrect = playedLetter === requestedLetter;
        if (isCorrect) correctSamplesRef.current += 1;

        const centsOff = isFresh
          ? foldCents(1200 * Math.log2(played!.frequency / noteToFrequency(requestedNoteName)))
          : null;

        sampleLogRef.current.push({ t: elapsedSeconds, isRest: false, isCorrect, centsOff });
      } else {
        // Resting: correct means staying silent, any detected pitch is a false entry.
        const isCorrect = playedLetter === null;
        if (isCorrect) correctSamplesRef.current += 1;

        sampleLogRef.current.push({ t: elapsedSeconds, isRest: true, isCorrect, centsOff: null });
      }
    }, 1000 / SAMPLES_PER_SECOND);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);



  const handleUploadCustomExercise = (newEx: Omit<Exercise, 'id'>) => {
    const saved = saveLocalCustomExercise(newEx);
    setCustomExercises((prev) => [...prev, saved]);
    handleSelectExercise(saved);
  };

  const handleClearSessions = () => {
    localStorage.removeItem('truenote_practice_logs');
    setSessions([]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-ambient-light dark:bg-ambient-dark text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-teal-500 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        isConnected={isConnected}
        onOpenPocketBaseModal={() => setIsPbModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-6 flex flex-col gap-6">


        {/* TAB 1: PRACTICE VIEW */}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main Column: Sheet Viewer */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              {/* Sheet Music Title Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      {currentExercise.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Difficulty: {currentExercise.difficulty}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{currentExercise.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentExercise.description}</p>
                </div>
                <button
                  onClick={() => setActiveTab('library')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Change Sheet
                </button>
              </div>

              {/* Sheet Viewer Container with Floating Overlay */}
              <div className="relative">
                {/* Count-In Translucent Overlay */}
                {isCountInActive && (
                  <div className="absolute top-3 right-3 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in zoom-in-95 border border-white/20">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/30 backdrop-blur-md flex items-center justify-center text-lg font-black font-mono border border-teal-300/40 text-teal-200">
                      {countInBeat}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-teal-200">Count-In</h4>
                      <p className="text-[11px] text-slate-200 font-medium">Ready on 1...</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      {[4, 3, 2, 1].map((beatNum) => (
                        <div
                          key={beatNum}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                            countInBeat === beatNum
                              ? 'bg-teal-400 scale-125 shadow-md shadow-teal-400/50 ring-2 ring-teal-300/40'
                              : 'bg-white/25'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}


                {/* OSMD Sheet Music Renderer */}
                <MusicSheetViewer
                  xmlData={currentExercise.xmlData}
                  zoom={zoom}
                  transpose={transpose}
                  onZoomChange={setZoom}
                  onTransposeChange={setTranspose}
                  isPlaying={isPlaying}
                  bpm={bpm}
                  stepTrigger={stepTrigger}
                  onCurrentNoteChange={handleCurrentNoteChange}
                  onExerciseFinished={stopPracticeAndSaveLog}
                  onTimeSignatureDetected={setDetectedBeatsPerMeasure}
                  onNoteTimelineBuilt={(timeline) => { noteTimelineRef.current = timeline; }}
                />

              </div>


            </div>

            {/* Right Side Column: Controls & Real-time Tuner */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">

              {/* Metronome Controls */}
              <MetronomeControls
                bpm={bpm}
                onBpmChange={setBpm}
                isPlaying={isPlaying || isCountInActive}
                onTogglePlay={handleTogglePlay}
                isMuted={isMetronomeMuted}
                onToggleMute={() => setIsMetronomeMuted((prev) => !prev)}
                isCountInEnabled={isCountInEnabled}
                onToggleCountIn={() => setIsCountInEnabled((prev) => !prev)}
                onBeatTick={handleBeatTick}
                startBeatIndex={startBeatIndex}
                beatsPerMeasure={activeBeatsPerMeasure}
              />







              {/* Real-Time Microphone Pitch Tuner */}
              <PitchDetector
                currentTargetNote={currentTargetNote}
              />
            </div>
          </div>
        )}

        {/* TAB 2: LIBRARY VIEW */}
        {activeTab === 'library' && (
          <ExerciseSelector
            currentExercise={currentExercise}
            onSelectExercise={(ex) => {
              handleSelectExercise(ex);
              setActiveTab('practice');
            }}
            customExercises={customExercises}
            onUploadCustomExercise={handleUploadCustomExercise}
          />
        )}

        {/* TAB 3: STATS & LOGS VIEW */}
        {activeTab === 'stats' && (
          <PracticeStats sessions={sessions} onClearSessions={handleClearSessions} />
        )}
      </main>

      {/* Practice Completed Summary Modal */}
      <PracticeCompleteModal
        session={lastFinishedSession}
        exerciseTitle={currentExercise.title}
        samples={lastSessionSamples}
        onClose={() => setLastFinishedSession(null)}
        onViewStats={() => setActiveTab('stats')}
      />

      {/* PocketBase Configuration & Auth Modal */}
      <PocketBaseModal
        isOpen={isPbModalOpen}
        onClose={() => setIsPbModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={setCurrentUser}
        isConnected={isConnected}
        onConnectionStatusChange={setIsConnected}
      />
    </div>
  );
}


export default App;

