import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../../../services/audioEngine';
import { noteLetter } from '../utils/noteParser';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { CardHeader } from '../../../components/CardHeader';

interface PitchDetectorProps {
  currentTargetNote: string | null;
}

export const PitchDetector: React.FC<PitchDetectorProps> = ({
  currentTargetNote,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [cents, setCents] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isMatch, setIsMatch] = useState<boolean>(false);

  const currentTargetNoteRef = useRef(currentTargetNote);
  useEffect(() => {
    currentTargetNoteRef.current = currentTargetNote;
  }, [currentTargetNote]);

  const startListening = async () => {
    setMicError(null);
    const onPitchData = (data: { note: string; frequency: number; cents: number }) => {
      setDetectedNote(data.note);
      setFrequency(data.frequency);
      setCents(data.cents);

      // Check if detected note matches sheet music target note (exact note name or octave harmonic)
      // Read from the ref, not the closed-over prop — this callback is created once when the
      // mic is enabled and reused for every detection frame, so a captured prop value would stay
      // frozen at whatever note was current at that moment instead of tracking playback.
      // This drives only the live tuner display; actual scoring is sampled independently in App.
      const liveTargetNote = currentTargetNoteRef.current;
      if (liveTargetNote) {
        setIsMatch(noteLetter(liveTargetNote) === noteLetter(data.note));
      }
    };

    const success = await audioEngine.startPitchDetection(onPitchData);

    if (success) {
      setIsListening(true);
    } else {
      setMicError('Could not access microphone. Please allow mic permissions in browser.');
    }
  };

  const toggleMic = async () => {
    if (isListening) {
      audioEngine.stopPitchDetection();
      setIsListening(false);
      setDetectedNote(null);
      setFrequency(null);
    } else {
      await startListening();
    }
  };

  // Drop the app straight into listening mode on load, instead of requiring
  // the user to click "Enable Mic" first.
  useEffect(() => {
    startListening();
    return () => {
      audioEngine.stopPitchDetection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Real-time Mic Analyzer
        </span>

        {/* Mic Toggle Button */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
            isListening
              ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 animate-pulse"></span>
              <Mic size={13} />
              Listening
            </>
          ) : (
            <>
              <MicOff size={13} /> Enable Mic
            </>
          )}
        </button>
      </div>

      {micError && <ErrorBanner message={micError} className="text-xs p-3 font-medium" />}

      {/* Main Pitch Display Box */}
      <div className="grid grid-cols-2 gap-3 bg-slate-200/70 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-300 dark:border-slate-800">
        {/* Current Target Note from Sheet */}
        <div className="flex flex-col gap-1 items-center justify-center p-3.5 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-400 font-extrabold">Sheet Target</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {currentTargetNote || '—'}
          </span>
        </div>

        {/* Live Detected Note from Microphone */}
        <div
          className={`flex flex-col gap-1 items-center justify-center p-3.5 rounded-xl border transition ${
            isMatch
              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'bg-white dark:bg-slate-950/70 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-300 shadow-sm'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-400 font-extrabold flex items-center gap-1">
            Played Note {isMatch && <CheckCircle2 size={12} className="text-slate-900 dark:text-slate-100" />}
          </span>
          <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {detectedNote || '—'}
          </span>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold">
            {frequency ? `${frequency} Hz` : 'No sound'}
          </span>
        </div>
      </div>

      {/* Tuner Cent Meter Bar */}
      {isListening && (
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex justify-between text-[10px] text-slate-700 dark:text-slate-400 font-mono font-extrabold">
            <span>FLAT (-50c)</span>
            <span className={Math.abs(cents) < 10 ? 'text-slate-900 dark:text-slate-100 font-black' : ''}>
              {cents > 0 ? `+${cents}c` : `${cents}c`}
            </span>
            <span>SHARP (+50c)</span>
          </div>

          <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner">
            {/* Center mark */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10"></div>
            {/* Cents indicator needle */}
            <div
              className="absolute top-0 bottom-0 w-2 rounded-full transition-all duration-100 -ml-1 bg-slate-900 dark:bg-slate-100"
              style={{
                left: `${Math.max(5, Math.min(95, 50 + cents))}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
