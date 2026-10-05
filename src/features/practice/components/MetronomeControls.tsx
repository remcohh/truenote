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
          title="Metronome & Options"
          subtitle="Tempo & count-in controls"
        />

        {/* Play/Stop Button */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200 shadow-sm ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-warm-coral hover:bg-[#d94e2d] text-white'
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
              ? 'bg-warm-coral text-white border-warm-coral shadow-xs'
              : 'bg-white dark:bg-[#342b2b] border-[#a8a492]/30 dark:border-[#524646] text-[#a8a492] opacity-80'
          }`}
          title="Toggle sounding metronome click during practice"
        >
          <div className="flex items-center gap-1.5">
            <Volume2 size={14} />
            <span>Click Sound</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-extrabold ${!isMuted ? 'bg-white/20 text-white' : 'bg-warm-cream dark:bg-[#433838] text-warm-dark dark:text-warm-cream'}`}>
            {!isMuted ? 'ON' : 'MUTED'}
          </span>
        </button>

        {/* Count-in Toggle */}
        <button
          onClick={onToggleCountIn}
          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
            isCountInEnabled
              ? 'bg-warm-coral text-white border-warm-coral shadow-xs'
              : 'bg-white dark:bg-[#342b2b] border-[#a8a492]/30 dark:border-[#524646] text-[#a8a492] opacity-80'
          }`}
          title="Toggle 1-bar count-in before session starts"
        >
          <div className="flex items-center gap-1.5">
            <Timer size={14} />
            <span>Count-In</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-extrabold ${isCountInEnabled ? 'bg-white/20 text-white' : 'bg-warm-cream dark:bg-[#433838] text-warm-dark dark:text-warm-cream'}`}>
            {isCountInEnabled ? '1 BAR' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Tempo Display & Slider */}
      <div className="bg-warm-cream/60 dark:bg-[#342b2b] p-4 rounded-xl border border-[#a8a492]/30 dark:border-[#524646] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-warm-dark dark:text-warm-cream font-mono tracking-tight">{bpm}</span>
            <span className="text-xs text-[#a8a492] font-extrabold uppercase tracking-wider">BPM</span>
          </div>

          {/* Preset BPM Buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {[60, 90, 120, 140].map((preset) => (
              <button
                key={preset}
                onClick={() => onBpmChange(preset)}
                disabled={isPlaying}
                title={isPlaying ? 'Stop the session to change tempo' : undefined}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  bpm === preset
                    ? 'bg-warm-coral text-white shadow-xs'
                    : 'bg-white dark:bg-[#433838] text-warm-dark dark:text-warm-cream border border-[#a8a492]/25 dark:border-[#524646] hover:bg-[#f2ece1] dark:hover:bg-[#4d4040]'
                }`}
              >
                {preset}
              </button>
            ))}
            <button
              onClick={handleTapTempo}
              disabled={isPlaying}
              title={isPlaying ? 'Stop the session to change tempo' : undefined}
              className="px-3 py-1 rounded-lg text-xs bg-white dark:bg-[#433838] text-warm-coral border border-[#a8a492]/35 dark:border-[#524646] hover:bg-[#f2ece1] dark:hover:bg-[#4d4040] font-extrabold transition disabled:opacity-40 disabled:cursor-not-allowed"
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
          disabled={isPlaying}
          title={isPlaying ? 'Stop the session to change tempo' : undefined}
          className="w-full h-2 bg-[#e6decf] dark:bg-[#433838] rounded-lg appearance-none cursor-pointer accent-warm-coral disabled:opacity-40 disabled:cursor-not-allowed"
        />

        {/* Beat Lights */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2 border-t border-[#a8a492]/20 dark:border-[#524646]/60">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#a8a492] font-bold mr-1">Time Sig:</span>
            {[2, 3, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setBeatsPerMeasure(num)}
                className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold transition ${
                  beatsPerMeasure === num
                    ? 'bg-warm-coral text-white'
                    : 'bg-white dark:bg-[#433838] text-warm-dark dark:text-warm-cream hover:bg-[#f2ece1] dark:hover:bg-[#4d4040]'
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
                        ? 'bg-warm-coral scale-125 shadow-xs shadow-warm-coral/50'
                        : 'bg-warm-stone scale-110'
                      : 'bg-[#e6decf] dark:bg-[#433838] border border-[#a8a492]/30'
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

