import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  Play,
  Music,
} from 'lucide-react';
import { CardHeader } from '../../../components/CardHeader';
import {
  soundfontPlayer,
  INSTRUMENT_OPTIONS,
  type InstrumentVoice,
} from '../../../services/soundfontPlayer';
import type { NoteTimelineEntry } from '../utils/noteTimelineGenerator';

interface AudioPlayerModalProps {
  isEnabled: boolean;
  onToggleEnabled: () => void;
  isSessionActive: boolean;
  timeline: NoteTimelineEntry[];
  bpm: number;
  transpose: number;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isEnabled,
  onToggleEnabled,
  isSessionActive,
  timeline,
  bpm,
  transpose,
}) => {
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentVoice>(
    soundfontPlayer.getInstrument()
  );
  const [volume, setVolume] = useState<number>(soundfontPlayer.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(soundfontPlayer.getIsMuted());
  const [isLoadingInstrument, setIsLoadingInstrument] = useState<boolean>(
    soundfontPlayer.getIsLoading()
  );
  const [totalDuration, setTotalDuration] = useState(0);

  // Subscribe to soundfont loading status
  useEffect(() => {
    return soundfontPlayer.onLoadingStateChange((loading) => {
      setIsLoadingInstrument(loading);
    });
  }, []);

  // Compute total duration
  useEffect(() => {
    if (timeline.length > 0) {
      const duration = Math.max(...timeline.map((n) => n.endTime), 0);
      setTotalDuration(duration);
    } else {
      setTotalDuration(0);
    }
  }, [timeline, bpm]);

  const handleSelectInstrument = (voice: InstrumentVoice) => {
    setCurrentInstrument(voice);
    soundfontPlayer.loadInstrument(voice);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundfontPlayer.setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
      soundfontPlayer.setMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundfontPlayer.setMuted(nextMuted);
  };

  const handleTestNote = () => {
    // Play middle C (60) with transposition
    soundfontPlayer.playNote(60 + transpose, 0.7, 95);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-lg flex flex-col gap-5 min-w-0">
      <CardHeader
        icon={<Volume2 size={20} />}
        iconColorClass="bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 dark:border-teal-500/30"
        title="Audio Playback & Accompaniment"
        subtitle="Soundfont and synthesizer accompaniment during practice"
      />

      {/* Enable / Disable Master Toggle Card */}
      <div className="flex flex-col gap-2.5 bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Session Audio Playback
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Play sheet music notes automatically along with the metronome
            </div>
          </div>

          <button
            onClick={onToggleEnabled}
            role="switch"
            aria-checked={isEnabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            title={isEnabled ? 'Click to disable audio playback' : 'Click to enable audio playback'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out mt-1 ml-1 ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 text-[11px]">
          {isEnabled ? (
            isSessionActive ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Playing live with active practice session
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                Enabled — starts automatically when you press Start Session
              </span>
            )
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Disabled — silent practice (metronome and pitch scoring only)
            </span>
          )}
        </div>
      </div>

      {/* Instrument Selection Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Music size={14} className="text-teal-600 dark:text-teal-400" />
            Instrument Voice
          </span>
          {isLoadingInstrument && (
            <span className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
              <Loader2 size={12} className="animate-spin" /> Loading soundfont...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INSTRUMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelectInstrument(opt.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                currentInstrument === opt.id
                  ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-500/60 text-teal-900 dark:text-teal-200 shadow-sm ring-1 ring-teal-500/30 font-bold'
                  : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
              }`}
            >
              <span className="text-lg select-none">{opt.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs truncate">{opt.name}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{opt.category}</div>
              </div>
              {currentInstrument === opt.id && (
                <CheckCircle2 size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Slider & Test Note */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex-1 flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span>Volume</span>
              <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
            />
          </div>
        </div>

        {/* Test Sound Button */}
        <button
          onClick={handleTestNote}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition shadow-sm"
          title="Play a test note to check volume and sound"
        >
          <Play size={12} fill="currentColor" />
          <span>Test Sound</span>
        </button>
      </div>

      {/* Piece Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
        <span>Tempo: <strong className="text-slate-700 dark:text-slate-300">{bpm} BPM</strong></span>
        <span>Duration: <strong className="text-slate-700 dark:text-slate-300">{formatTime(totalDuration)}</strong></span>
        <span>Notes: <strong className="text-slate-700 dark:text-slate-300">{timeline.length}</strong></span>
      </div>
    </div>
  );
};
