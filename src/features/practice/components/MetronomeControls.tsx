import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, VolumeX, Music, Flame, Timer } from 'lucide-react';
import { audioEngine } from '../../../services/audioEngine';
import { CardHeader } from '../../../components/CardHeader';

interface MetronomeControlsProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isCountInEnabled?: boolean;
  onToggleCountIn?: () => void;
  onBeatTick?: (beat: number) => void;
  startBeatIndex?: number;
  beatsPerMeasure?: number;
}

export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  bpm,
  onBpmChange,
  isPlaying,
  onTogglePlay,
  isMuted = false,
  onToggleMute,
  isCountInEnabled = true,
  onToggleCountIn,
  onBeatTick,
  startBeatIndex = 0,
  beatsPerMeasure: beatsPerMeasureProp = 4,
}) => {
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(beatsPerMeasureProp);
  const [activeBeat, setActiveBeat] = useState<number>(0);
  const onBeatTickRef = useRef(onBeatTick);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => {
    setBeatsPerMeasure(beatsPerMeasureProp);
  }, [beatsPerMeasureProp]);

  useEffect(() => {
    onBeatTickRef.current = onBeatTick;
  }, [onBeatTick]);

  useEffect(() => {
    if (isPlaying) {
      audioEngine.startMetronome(bpm, beatsPerMeasure, (beat) => {
        setActiveBeat(beat);
        if (onBeatTickRef.current) onBeatTickRef.current(beat);
      }, startBeatIndex);
    } else {
      audioEngine.stopMetronome();
      setActiveBeat(0);
    }

    return () => {
      audioEngine.stopMetronome();
    };
  }, [isPlaying, beatsPerMeasure, startBeatIndex]);


  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  const handleTapTempo = () => {
    const now = Date.now();
    const taps = tapTimesRef.current;
    
    // Reset if last tap was over 2.5 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      tapTimesRef.current = [];
    }

    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.min(240, Math.max(30, Math.round(60000 / avgMs)));
      onBpmChange(calculatedBpm);
    }
  };

  return (
    <div className="metronome-card glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-lg flex flex-col gap-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardHeader
          icon={isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          iconColorClass="bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30"
          title="Metronome & Options"
          subtitle="Tempo & count-in controls"
        />

        {/* Play/Stop Button */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200 shadow-md ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 animate-soft-pulse'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={14} fill="currentColor" /> Stop Session
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" /> Start Session
            </>
          )}
        </button>
      </div>

      {/* Option Toggles Row: Sounding Metronome & Count-In */}
      <div className="grid grid-cols-2 gap-2">
        {/* Sounding Metronome Toggle */}
        <button
          onClick={onToggleMute}
          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
            !isMuted
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-80'
          }`}
          title="Toggle sounding metronome click during practice"
        >
          <div className="flex items-center gap-1.5">
            {!isMuted ? <Volume2 size={14} className="text-indigo-600 dark:text-indigo-400" /> : <VolumeX size={14} />}
            <span>Click Sound</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-extrabold ${!isMuted ? 'bg-indigo-200 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {!isMuted ? 'ON' : 'MUTED'}
          </span>
        </button>

        {/* Count-in Toggle */}
        <button
          onClick={onToggleCountIn}
          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
            isCountInEnabled
              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-500/40 text-teal-800 dark:text-teal-300 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-80'
          }`}
          title="Toggle 1-bar count-in before session starts"
        >
          <div className="flex items-center gap-1.5">
            <Timer size={14} className={isCountInEnabled ? 'text-teal-600 dark:text-teal-400' : ''} />
            <span>Count-In</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-extrabold ${isCountInEnabled ? 'bg-teal-200 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {isCountInEnabled ? '1 BAR' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Tempo Display & Slider */}
      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-teal-700 dark:text-teal-400 font-mono tracking-tight">{bpm}</span>
            <span className="text-xs text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider">BPM</span>
          </div>

          {/* Preset BPM Buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {[60, 90, 120, 140].map((preset) => (
              <button
                key={preset}
                onClick={() => onBpmChange(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold transition ${
                  bpm === preset
                    ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-950 shadow-sm'
                    : 'bg-slate-300/80 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
            <button
              onClick={handleTapTempo}
              className="px-3 py-1 rounded-lg text-xs bg-indigo-100 dark:bg-indigo-600/30 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-600/50 font-extrabold transition"
            >
              TAP
            </button>
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="30"
          max="240"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
        />

        {/* Beat Lights */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2 border-t border-slate-300 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-bold mr-1">Time Sig:</span>
            {[2, 3, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setBeatsPerMeasure(num)}
                className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold transition ${
                  beatsPerMeasure === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-300/80 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {num}/4
              </button>
            ))}
          </div>

          {/* Visual Beat Indicator Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
              const beatNum = idx + 1;
              const isActive = activeBeat === beatNum;
              const isAccent = beatNum === 1;

              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-75 ${
                    isActive
                      ? isAccent
                        ? 'bg-amber-500 dark:bg-amber-400 shadow-md shadow-amber-500/50 scale-125'
                        : 'bg-teal-500 dark:bg-teal-400 shadow-md shadow-teal-500/50 scale-125'
                      : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

