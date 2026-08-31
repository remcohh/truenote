import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, Volume2, Award, Waves } from 'lucide-react';
import { audioEngine, noteToFrequency } from '../../../services/audioEngine';
import { noteLetter } from '../utils/noteParser';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { CardHeader } from '../../../components/CardHeader';

interface PitchDetectorProps {
  currentTargetNote: string | null;
}

// How far the synth test-tone offset slider reaches in either direction.
const SYNTH_OFFSET_RANGE = 50;

export const PitchDetector: React.FC<PitchDetectorProps> = ({
  currentTargetNote,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [cents, setCents] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isMatch, setIsMatch] = useState<boolean>(false);

  // Test source: feeds a synth tone into the same detection pipeline as the mic,
  // at a controllable cents offset, so detection + scoring can be sanity-checked
  // against a known ground-truth pitch instead of a real (imprecise) instrument.
  const [sourceMode, setSourceMode] = useState<'mic' | 'synth'>('mic');
  const [synthOffsetCents, setSynthOffsetCents] = useState<number>(0);

  const currentTargetNoteRef = useRef(currentTargetNote);
  useEffect(() => {
    currentTargetNoteRef.current = currentTargetNote;
  }, [currentTargetNote]);

  const computeSynthFrequency = (offsetCents: number) => {
    const base = currentTargetNoteRef.current ? noteToFrequency(currentTargetNoteRef.current) : 440;
    return base * Math.pow(2, offsetCents / 1200);
  };

  // Keep the running synth test tone tracking the sheet's target note and the
  // chosen offset, rather than requiring a restart every time either changes.
  useEffect(() => {
    if (isListening && sourceMode === 'synth') {
      audioEngine.setSynthTestFrequency(computeSynthFrequency(synthOffsetCents));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTargetNote, synthOffsetCents, isListening, sourceMode]);

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

    const success =
      sourceMode === 'synth'
        ? await audioEngine.startSynthTestSource(onPitchData, computeSynthFrequency(synthOffsetCents))
        : await audioEngine.startPitchDetection(onPitchData);

    if (success) {
      setIsListening(true);
    } else {
      setMicError(
        sourceMode === 'synth'
          ? 'Could not start the test synth.'
          : 'Could not access microphone. Please allow mic permissions in browser.'
      );
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

  const handlePlayReferenceTone = () => {
    if (currentTargetNote) {
      const freq = noteToFrequency(currentTargetNote);
      audioEngine.playTone(freq, 0.8);
    }
  };

  return (
    <div className="pitch-detector-card glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-lg flex flex-col gap-3.5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardHeader
          icon={<Mic size={18} />}
          iconColorClass="bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 dark:border-teal-500/30"
          title="Pitch Tuner"
          subtitle="Mic pitch analyzer"
        />

        {/* Mic/Synth Toggle Button */}
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
              {sourceMode === 'synth' ? <Waves size={14} /> : <Mic size={14} />}
              {sourceMode === 'synth' ? 'Synth Playing...' : 'Listening...'}
            </>
          ) : sourceMode === 'synth' ? (
            <>
              <Waves size={14} /> Start Test Synth
            </>
          ) : (
            <>
              <MicOff size={14} /> Enable Mic
            </>
          )}
        </button>
      </div>

      {/* Source Selector: real mic vs. a synth test tone for validating detection/scoring */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-extrabold">Source</span>
        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          {(['mic', 'synth'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSourceMode(mode)}
              disabled={isListening}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                sourceMode === mode
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {mode === 'mic' ? 'Mic' : 'Test Synth'}
            </button>
          ))}
        </div>
      </div>

      {sourceMode === 'synth' && (
        <div className="flex flex-col gap-1 -mt-1">
          <div className="flex justify-between text-[10px] text-slate-700 dark:text-slate-400 font-mono font-extrabold">
            <span>FLAT</span>
            <span>
              {synthOffsetCents === 0 ? 'IN TUNE' : synthOffsetCents > 0 ? `+${synthOffsetCents}c` : `${synthOffsetCents}c`}
            </span>
            <span>SHARP</span>
          </div>
          <input
            type="range"
            min={-SYNTH_OFFSET_RANGE}
            max={SYNTH_OFFSET_RANGE}
            step={1}
            value={synthOffsetCents}
            onChange={(e) => setSynthOffsetCents(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Plays the sheet's target note (or A4 if none), offset by this many cents — use it to confirm the tuner and score
            correctly report sharp vs. flat against a known pitch.
          </p>
        </div>
      )}

      {micError && <ErrorBanner message={micError} className="text-xs p-3 font-medium" />}

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

