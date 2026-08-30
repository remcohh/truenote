import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, Volume2, Award } from 'lucide-react';
import { audioEngine, noteToFrequency } from '../services/audioEngine';

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

  const toggleMic = async () => {
    setMicError(null);
    if (isListening) {
      audioEngine.stopPitchDetection();
      setIsListening(false);
      setDetectedNote(null);
      setFrequency(null);
    } else {
      const success = await audioEngine.startPitchDetection((data) => {
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
          const normTarget = liveTargetNote.trim().toUpperCase();
          const normDetected = data.note.trim().toUpperCase();

          // Extract note letter without octave (e.g. "C#" from "C#4")
          const targetLetter = normTarget.replace(/\d+$/, '');
          const detectedLetter = normDetected.replace(/\d+$/, '');

          setIsMatch(targetLetter === detectedLetter);
        }


      });

      if (success) {
        setIsListening(true);
      } else {
        setMicError('Could not access microphone. Please allow mic permissions in browser.');
      }
    }
  };

  useEffect(() => {
    return () => {
      audioEngine.stopPitchDetection();
    };
  }, []);

  const handlePlayReferenceTone = () => {
    if (currentTargetNote) {
      const freq = noteToFrequency(currentTargetNote);
      audioEngine.playTone(freq, 0.8);
    }
  };

  return (
    <div className="pitch-detector-card glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-lg flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 dark:border-teal-500/30">
            <Mic size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Pitch Tuner</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mic pitch analyzer</p>
          </div>
        </div>

        {/* Mic Toggle Button */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
            isListening
              ? 'bg-teal-50 dark:bg-teal-500/20 border-teal-300 dark:border-teal-500/50 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 animate-ping"></span>
              <Mic size={14} /> Listening...
            </>
          ) : (
            <>
              <MicOff size={14} /> Enable Mic
            </>
          )}
        </button>
      </div>

      {micError && (
        <div className="text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-xl font-medium">
          ⚠️ {micError}
        </div>
      )}

      {/* Main Pitch Display Box */}
      <div className="grid grid-cols-2 gap-3 bg-slate-200/70 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-300 dark:border-slate-800">
        {/* Current Target Note from Sheet */}
        <div className="flex flex-col gap-1 items-center justify-center p-3.5 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-400 font-extrabold">Sheet Target</span>
          <div className="flex items-center gap-1.5">
            <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 font-mono">
              {currentTargetNote || '—'}
            </span>
            {currentTargetNote && (
              <button
                onClick={handlePlayReferenceTone}
                className="p-1 text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 rounded-lg transition"
                title="Play reference tone audio"
              >
                <Volume2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Live Detected Note from Microphone */}
        <div
          className={`flex flex-col gap-1 items-center justify-center p-3.5 rounded-xl border transition ${
            isMatch
              ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 shadow-sm'
              : 'bg-white dark:bg-slate-950/70 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-300 shadow-sm'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-400 font-extrabold flex items-center gap-1">
            Played Note {isMatch && <CheckCircle2 size={12} className="text-emerald-700 dark:text-emerald-400" />}
          </span>
          <span className={`text-3xl font-extrabold font-mono ${isMatch ? 'text-emerald-700 dark:text-emerald-400' : 'text-teal-700 dark:text-teal-300'}`}>
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
            <span className={Math.abs(cents) < 10 ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : ''}>
              {cents > 0 ? `+${cents}c` : `${cents}c`}
            </span>
            <span>SHARP (+50c)</span>
          </div>


          <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner">
            {/* Center mark */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10"></div>
            {/* Cents indicator needle */}
            <div
              className={`absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-100 -ml-1 ${
                Math.abs(cents) < 10 ? 'bg-emerald-500 dark:bg-emerald-400 shadow-md shadow-emerald-500/50' : 'bg-amber-500 dark:bg-amber-400'
              }`}
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

