import { Soundfont, SplendidGrandPiano } from 'smplr';
import { audioEngine } from './audioEngine';
import type { NoteTimelineEntry } from '../features/practice/utils/noteTimelineGenerator';

export type InstrumentVoice =
  | 'acoustic_grand_piano'
  | 'trumpet'
  | 'tuba'
  | 'acoustic_guitar_nylon'
  | 'violin'
  | 'flute'
  | 'warm_synth';

export interface InstrumentOption {
  id: InstrumentVoice;
  name: string;
  icon: string;
  category: 'piano' | 'brass' | 'strings' | 'woodwind' | 'synth';
}

export const INSTRUMENT_OPTIONS: InstrumentOption[] = [
  { id: 'acoustic_grand_piano', name: 'Grand Piano', icon: '🎹', category: 'piano' },
  { id: 'trumpet', name: 'Trumpet', icon: '🎺', category: 'brass' },
  { id: 'tuba', name: 'Tuba', icon: '📯', category: 'brass' },
  { id: 'acoustic_guitar_nylon', name: 'Nylon Guitar', icon: '🎸', category: 'strings' },
  { id: 'violin', name: 'Violin', icon: '🎻', category: 'strings' },
  { id: 'flute', name: 'Flute', icon: '🪈', category: 'woodwind' },
  { id: 'warm_synth', name: 'Warm Synth / E-Piano', icon: '⚡', category: 'synth' },
];

export interface PlayTimelineProgress {
  currentTime: number;
  totalDuration: number;
  currentBeat: number;
}

export interface PlayTimelineOptions {
  bpm: number;
  transpose?: number;
  startFromBeat?: number;
  onProgress?: (progress: PlayTimelineProgress) => void;
  onFinished?: () => void;
}

class SoundfontPlayer {
  private instruments: Map<InstrumentVoice, any> = new Map();
  private currentVoice: InstrumentVoice = 'acoustic_grand_piano';
  private volume: number = 0.8; // 0.0 to 1.0
  private isMuted: boolean = false;
  private isLoading: boolean = false;
  private loadingListeners: Set<(loading: boolean) => void> = new Set();

  // Playback state
  private activeTimeline: NoteTimelineEntry[] = [];
  private activeOptions: PlayTimelineOptions | null = null;
  private isPlayingScore: boolean = false;
  private isPausedScore: boolean = false;
  private playbackStartAudioTime: number = 0;
  private playbackStartScoreSeconds: number = 0;
  private currentScoreElapsed: number = 0;
  private currentScoreDuration: number = 0;
  private currentBpm: number = 120;
  private progressIntervalId: number | null = null;

  // Active synth voices to stop on pause/stop
  private activeSynthNodes: Array<{ stop: (time?: number) => void }> = [];

  constructor() {
    // Volume defaults
  }

  public getInstrument(): InstrumentVoice {
    return this.currentVoice;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    const smplrVolume = Math.round(this.volume * 100);
    this.instruments.forEach((inst) => {
      if (inst && inst.output) {
        inst.output.volume = smplrVolume;
      }
    });
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public onLoadingStateChange(callback: (loading: boolean) => void): () => void {
    this.loadingListeners.add(callback);
    callback(this.isLoading);
    return () => {
      this.loadingListeners.delete(callback);
    };
  }

  private notifyLoading(loading: boolean) {
    this.isLoading = loading;
    this.loadingListeners.forEach((cb) => cb(loading));
  }

  /**
   * Pre-loads an instrument soundfont. If network fails or offline,
   * gracefully falls back to warm synth without throwing.
   */
  public async loadInstrument(voice: InstrumentVoice): Promise<void> {
    this.currentVoice = voice;
    if (voice === 'warm_synth' || this.instruments.has(voice)) {
      return;
    }

    this.notifyLoading(true);

    try {
      const audioCtx = audioEngine.getAudioContext();
      const destination = audioEngine.getDestinationNode();
      const smplrVolume = Math.round(this.volume * 100);

      let inst: any;
      if (voice === 'acoustic_grand_piano') {
        inst = new SplendidGrandPiano(audioCtx, {
          destination,
          volume: smplrVolume,
        });
      } else {
        inst = new Soundfont(audioCtx, {
          instrument: voice,
          kit: 'MusyngKite',
          destination,
          volume: smplrVolume,
        });
      }

      if (inst && (inst.ready || inst.load)) {
        await (inst.ready || inst.load);
      }
      this.instruments.set(voice, inst);
    } catch (err) {
      console.warn(`Soundfont load failed for ${voice}, falling back to built-in synth:`, err);
    } finally {
      this.notifyLoading(false);
    }
  }

  /**
   * Immediately plays a single note (useful for note preview or clicks on the sheet).
   */
  public playNote(midiPitch: number, duration: number = 0.8, velocity: number = 85) {
    if (this.isMuted || this.volume <= 0) return;

    try {
      const audioCtx = audioEngine.getAudioContext();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const inst = this.instruments.get(this.currentVoice);
      if (inst && this.currentVoice !== 'warm_synth') {
        inst.start({
          note: midiPitch,
          time: audioCtx.currentTime,
          duration,
          velocity: Math.round(velocity * this.volume),
        });
      } else {
        this.playSynthNote(midiPitch, audioCtx.currentTime, duration, velocity);
      }
    } catch (err) {
      console.warn('Error playing note:', err);
    }
  }

  /**
   * Polyphonic warm synth fallback built with native Web Audio.
   * Produces a warm, rich tone (triangle + soft octave overtone with gentle lowpass).
   */
  private playSynthNote(midiPitch: number, startTime: number, duration: number, velocity: number = 80) {
    if (this.isMuted || this.volume <= 0) return;

    const audioCtx = audioEngine.getAudioContext();
    const destination = audioEngine.getDestinationNode();

    const freq = 440 * Math.pow(2, (midiPitch - 69) / 12);
    const effectiveVolume = (velocity / 127) * this.volume * 0.4;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Warm second harmonic overtone
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3000, freq * 4), startTime);

    const attack = 0.008;
    const release = 0.12;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, effectiveVolume), startTime + attack);
    gain.gain.setValueAtTime(effectiveVolume * 0.8, startTime + Math.max(attack, duration - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);

    const cleanupItem = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          gain.disconnect();
        } catch (_) {}
      },
    };
    this.activeSynthNodes.push(cleanupItem);
    setTimeout(() => {
      this.activeSynthNodes = this.activeSynthNodes.filter((item) => item !== cleanupItem);
    }, (duration + 0.1) * 1000);
  }

  /**
   * Starts or resumes playback of a score timeline.
   */
  public async playTimeline(timeline: NoteTimelineEntry[], options: PlayTimelineOptions) {
    if (timeline.length === 0) return;

    // Stop any existing timeline playback
    this.stopPlaybackInternal(false);

    const audioCtx = audioEngine.getAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Auto-load current voice in background if not yet loaded
    if (this.currentVoice !== 'warm_synth' && !this.instruments.has(this.currentVoice)) {
      this.loadInstrument(this.currentVoice).catch(console.error);
    }

    this.activeTimeline = timeline;
    this.activeOptions = options;
    this.currentBpm = options.bpm;

    const secondsPerBeat = 60 / options.bpm;
    const totalDuration = Math.max(...timeline.map((n) => n.endTime), 1);
    this.currentScoreDuration = totalDuration;

    const startFromBeat = options.startFromBeat ?? 0;
    const startScoreSeconds = startFromBeat * secondsPerBeat;
    this.playbackStartScoreSeconds = Math.min(startScoreSeconds, totalDuration);

    const scheduleAudioStartTime = audioCtx.currentTime + 0.05;
    this.playbackStartAudioTime = scheduleAudioStartTime;
    this.isPlayingScore = true;
    this.isPausedScore = false;

    const transpose = options.transpose ?? 0;
    const inst = this.instruments.get(this.currentVoice);

    // Schedule each note in Web Audio
    for (const entry of timeline) {
      if (entry.endTime <= this.playbackStartScoreSeconds) continue;

      const noteOffsetSeconds = entry.startTime - this.playbackStartScoreSeconds;
      const noteStartTime = scheduleAudioStartTime + Math.max(0, noteOffsetSeconds);
      const noteDuration = Math.max(0.08, entry.endTime - entry.startTime);
      const midi = entry.halfTone + transpose;

      if (!this.isMuted && this.volume > 0) {
        if (inst && this.currentVoice !== 'warm_synth') {
          inst.start({
            note: midi,
            time: noteStartTime,
            duration: noteDuration,
            velocity: Math.round(90 * this.volume),
          });
        } else {
          this.playSynthNote(midi, noteStartTime, noteDuration, 85);
        }
      }
    }

    // Start progress polling ticker
    this.startProgressTicker();
  }

  private startProgressTicker() {
    if (this.progressIntervalId !== null) {
      clearInterval(this.progressIntervalId);
    }

    const audioCtx = audioEngine.getAudioContext();
    const secondsPerBeat = 60 / this.currentBpm;

    this.progressIntervalId = window.setInterval(() => {
      if (!this.isPlayingScore || this.isPausedScore) return;

      const elapsedSinceStart = audioCtx.currentTime - this.playbackStartAudioTime;
      const currentScoreTime = this.playbackStartScoreSeconds + elapsedSinceStart;
      this.currentScoreElapsed = Math.min(currentScoreTime, this.currentScoreDuration);

      const currentBeat = this.currentScoreElapsed / secondsPerBeat;

      if (this.activeOptions?.onProgress) {
        this.activeOptions.onProgress({
          currentTime: this.currentScoreElapsed,
          totalDuration: this.currentScoreDuration,
          currentBeat,
        });
      }

      if (this.currentScoreElapsed >= this.currentScoreDuration) {
        const finishedCb = this.activeOptions?.onFinished;
        this.stop();
        if (finishedCb) {
          finishedCb();
        }
      }
    }, 30);
  }

  public pause() {
    if (!this.isPlayingScore || this.isPausedScore) return;

    this.isPausedScore = true;
    this.isPlayingScore = false;

    // Cut off all sounding notes
    this.stopAllAudioNodes();

    if (this.progressIntervalId !== null) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
  }

  public resume() {
    if (!this.isPausedScore || !this.activeOptions) return;

    const secondsPerBeat = 60 / this.currentBpm;
    const currentBeat = this.currentScoreElapsed / secondsPerBeat;

    this.playTimeline(this.activeTimeline, {
      ...this.activeOptions,
      startFromBeat: currentBeat,
    });
  }

  public stop() {
    this.stopPlaybackInternal(true);
  }

  public seekToBeat(beat: number) {
    const secondsPerBeat = 60 / this.currentBpm;
    this.currentScoreElapsed = beat * secondsPerBeat;

    if (this.isPlayingScore && this.activeOptions) {
      this.playTimeline(this.activeTimeline, {
        ...this.activeOptions,
        startFromBeat: beat,
      });
    } else if (this.activeOptions?.onProgress) {
      this.activeOptions.onProgress({
        currentTime: this.currentScoreElapsed,
        totalDuration: this.currentScoreDuration,
        currentBeat: beat,
      });
    }
  }

  private stopPlaybackInternal(resetPosition: boolean) {
    this.isPlayingScore = false;
    this.isPausedScore = false;

    if (resetPosition) {
      this.currentScoreElapsed = 0;
    }

    if (this.progressIntervalId !== null) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }

    this.stopAllAudioNodes();
  }

  private stopAllAudioNodes() {
    // Stop all smplr instruments
    this.instruments.forEach((inst) => {
      try {
        if (inst && typeof inst.stop === 'function') {
          inst.stop();
        }
      } catch (_) {}
    });

    // Stop all active synth nodes
    this.activeSynthNodes.forEach((node) => node.stop());
    this.activeSynthNodes = [];
  }

  public isPlaying(): boolean {
    return this.isPlayingScore;
  }

  public isPaused(): boolean {
    return this.isPausedScore;
  }

  public getCurrentElapsed(): number {
    return this.currentScoreElapsed;
  }

  public getTotalDuration(): number {
    return this.currentScoreDuration;
  }
}

export const soundfontPlayer = new SoundfontPlayer();
