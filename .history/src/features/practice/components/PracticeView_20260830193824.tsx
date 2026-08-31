import { useState } from 'react';
import { MusicSheetViewer } from './MusicSheetViewer';
import { MetronomeControls } from './MetronomeControls';
import { PitchDetector } from './PitchDetector';
import { Modal } from '../../../components/Modal';
import type { Exercise } from '../../../types';
import type { PracticeSessionApi } from '../hooks/usePracticeSession';

interface PracticeViewProps {
  currentExercise: Exercise;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  transpose: number;
  onTransposeChange: (transpose: number) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onChangeSheet: () => void;
  isMetronomeMuted: boolean;
  onToggleMetronomeMute: () => void;
  practice: PracticeSessionApi;
}

export function PracticeView({
  currentExercise,
  zoom,
  onZoomChange,
  transpose,
  onTransposeChange,
  bpm,
  onBpmChange,
  onChangeSheet,
  isMetronomeMuted,
  onToggleMetronomeMute,
  practice,
}: PracticeViewProps) {
  const [showMetronomeModal, setShowMetronomeModal] = useState(false);
  const [showPitchTunerModal, setShowPitchTunerModal] = useState(false);

  const isPlaying = practice.isPlaying || practice.isCountInActive;

  return (
    <div className="flex flex-col gap-6">
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
          onClick={onChangeSheet}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition shadow-sm"
        >
          Change Sheet
        </button>
      </div>

      {/* Sheet Viewer Container with Floating Overlay */}
      <div className="relative">
        {/* Count-In Translucent Overlay */}
        {practice.isCountInActive && (
          <div className="absolute top-3 right-3 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in zoom-in-95 border border-white/20">
            <div className="w-8 h-8 rounded-lg bg-teal-500/30 backdrop-blur-md flex items-center justify-center text-lg font-black font-mono border border-teal-300/40 text-teal-200">
              {practice.countInBeat}
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
                    practice.countInBeat === beatNum
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
          onZoomChange={onZoomChange}
          onTransposeChange={onTransposeChange}
          isPlaying={isPlaying}
          bpm={bpm}
          stepTrigger={practice.stepTrigger}
          onCurrentNoteChange={practice.handleCurrentNoteChange}
          onExerciseFinished={practice.onExerciseFinished}
          onTimeSignatureDetected={practice.setDetectedBeatsPerMeasure}
          onNoteTimelineBuilt={practice.handleNoteTimelineBuilt}
          onTogglePlay={practice.handleTogglePlay}
          onOpenMetronome={() => setShowMetronomeModal(true)}
          onOpenPitchTuner={() => setShowPitchTunerModal(true)}
        />
      </div>

      <Modal open={showMetronomeModal} onClose={() => setShowMetronomeModal(false)}>
        <MetronomeControls
          bpm={bpm}
          onBpmChange={onBpmChange}
          isPlaying={isPlaying}
          onTogglePlay={practice.handleTogglePlay}
          isMuted={isMetronomeMuted}
          onToggleMute={onToggleMetronomeMute}
          isCountInEnabled={practice.isCountInEnabled}
          onToggleCountIn={practice.toggleCountIn}
          onBeatTick={practice.handleBeatTick}
          startBeatIndex={practice.startBeatIndex}
          beatsPerMeasure={practice.activeBeatsPerMeasure}
        />
      </Modal>

      <Modal open={showPitchTunerModal} onClose={() => setShowPitchTunerModal(false)}>
        <PitchDetector currentTargetNote={practice.currentTargetNote} />
      </Modal>
    </div>
  );
}
