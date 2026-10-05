// Audio Synthesizer, Metronome, and Real-time Microphone Pitch Detection Engine

import { PitchDetector } from 'pitchy';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  // Every sound-producing node connects here instead of straight to destination, so
  // overlapping sounds (e.g. a metronome click landing during the test tone) get
  // compressed instead of hard-clipping - lets individual gains be pushed louder
  // without risking the "distorted garbage" that comes from summed output over 1.0.
  private limiterNode: DynamicsCompressorNode | null = null;

  // Metronome state
  private metronomeTimer: number | null = null;
  private nextNoteTime: number = 0;
  private currentBeat: number = 0;
  private bpm: number = 120;
  private beatsPerMeasure: number = 4;
  private isMetronomePlaying: boolean = false;
  private onBeatCallback: ((beat: number) => void) | null = null;

  // Pitch Detector state
  private micStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private workletModuleLoaded: boolean = false;
  private isDetectingPitch: boolean = false;
  private isMuted: boolean = false;
  private lastDetectedPitch: { note: string; frequency: number; cents: number; timestamp: number } | null = null;
  private pitchDetector: PitchDetector<Float32Array> | null = null;
  private onPitchDetectedCallback: ((data: { note: string; frequency: number; cents: number }) => void) | null = null;
  // The MIDI note number last assigned to the detected pitch, used to apply
  // hysteresis around semitone boundaries (see `frequencyToNote`).
  private lastNoteMidi: number | null = null;

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (!this.limiterNode) {
      const limiter = this.audioCtx.createDynamicsCompressor();
      // Aggressive brick-wall-ish settings: only kicks in when sources actually
      // overlap and would otherwise clip, transparent the rest of the time.
      limiter.threshold.setValueAtTime(-6, this.audioCtx.currentTime);
      limiter.knee.setValueAtTime(0, this.audioCtx.currentTime);
      limiter.ratio.setValueAtTime(20, this.audioCtx.currentTime);
      limiter.attack.setValueAtTime(0.001, this.audioCtx.currentTime);
      limiter.release.setValueAtTime(0.1, this.audioCtx.currentTime);
      limiter.connect(this.audioCtx.destination);
      this.limiterNode = limiter;
    }
  }

  public getAudioContext(): AudioContext {
    this.initAudioContext();
    return this.audioCtx!;
  }

  public getDestinationNode(): AudioNode {
    this.initAudioContext();
    return this.limiterNode ?? this.audioCtx!.destination;
  }

  // --- Metronome ---
  public startMetronome(bpm: number, beatsPerMeasure: number, onBeat?: (beat: number) => void, startBeatIndex: number = 0) {
    this.stopMetronome(); // Always kill existing timer to prevent overlapping loops
    this.initAudioContext();
    this.bpm = bpm;
    this.beatsPerMeasure = beatsPerMeasure;
    this.onBeatCallback = onBeat || null;
    this.currentBeat = startBeatIndex % beatsPerMeasure;
    this.isMetronomePlaying = true;

    if (this.audioCtx) {
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime = this.audioCtx.currentTime + secondsPerBeat;
      this.scheduler();
    }
  }



  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setBpm(bpm: number) {
    this.bpm = bpm;
  }

  public setBeatsPerMeasure(beats: number) {
    this.beatsPerMeasure = beats;
  }

  public stopMetronome() {
    this.isMetronomePlaying = false;
    if (this.metronomeTimer !== null) {
      window.clearTimeout(this.metronomeTimer);
      this.metronomeTimer = null;
    }
  }

  private scheduler = () => {
    if (!this.isMetronomePlaying || !this.audioCtx) return;

    while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
      this.playClick(this.nextNoteTime, this.currentBeat === 0);
      
      const beatToReport = this.currentBeat + 1;
      const delayMs = Math.max(0, (this.nextNoteTime - this.audioCtx.currentTime) * 1000);
      setTimeout(() => {
        if (this.onBeatCallback && this.isMetronomePlaying) {
          this.onBeatCallback(beatToReport);
        }
      }, delayMs);

      // Advance beat
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime += secondsPerBeat;
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }

    this.metronomeTimer = window.setTimeout(this.scheduler, 25);
  };

  public playClick(time: number, isAccent: boolean, forceAudible: boolean = false) {
    if (!this.audioCtx) return;
    if (this.isMuted && !forceAudible) return;

    // Pleasant woodblock/percussion click (pitch drop + fast decay)
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    const startFreq = isAccent ? 900 : 500;
    const endFreq = isAccent ? 180 : 100;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.03);

    const volume = isAccent ? 0.6 : 0.35;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    osc.connect(gain);
    gain.connect(this.limiterNode ?? this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  public playCountInClick(isAccent: boolean = false) {
    this.initAudioContext();
    if (this.audioCtx) {
      this.playClick(this.audioCtx.currentTime, isAccent, true);
    }
  }



  // --- Real-time Pitch Detection (Mic Input) ---
  // Runs on an AudioWorkletNode: sample accumulation happens on the dedicated
  // audio rendering thread (fixed cadence tied to the mic's own sample rate,
  // unaffected by main-thread jank or tab visibility), which posts finished
  // 2048-sample blocks back here for the actual pitch-detection math.
  public async startPitchDetection(
    onPitchDetected: (data: { note: string; frequency: number; cents: number }) => void
  ): Promise<boolean> {
    this.initAudioContext();
    if (!this.audioCtx) return false;

    this.onPitchDetectedCallback = onPitchDetected;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioCtx.createMediaStreamSource(this.micStream);

      this.workletNode = await this.createWorkletNode();
      source.connect(this.workletNode);

      this.isDetectingPitch = true;
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      return false;
    }
  }

  private async createWorkletNode(): Promise<AudioWorkletNode> {
    if (!this.audioCtx) throw new Error('AudioContext not initialized');

    if (!this.workletModuleLoaded) {
      await this.audioCtx.audioWorklet.addModule('/pitch-processor.js');
      this.workletModuleLoaded = true;
    }

    const node = new AudioWorkletNode(this.audioCtx, 'pitch-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    });
    node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      this.handlePitchBuffer(event.data);
    };

    // The processor never writes to its output, so this stays silent —
    // it's only here to keep the node from being pruned from the audio graph.
    node.connect(this.audioCtx.destination);
    return node;
  }

  public stopPitchDetection() {
    this.isDetectingPitch = false;
    this.lastDetectedPitch = null;
    this.lastNoteMidi = null;
    if (this.workletNode) {
      this.workletNode.port.onmessage = null;
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  /**
   * Latest pitch detected by the mic, independent of the per-frame callback.
   * A fixed-rate scoring sampler polls this instead of relying on the callback firing
   * exactly when it happens to sample, and can check `timestamp` to tell a genuinely
   * silent/undetected moment from a note that's actually still sounding.
   */
  public getLastDetectedPitch(): { note: string; frequency: number; cents: number; timestamp: number } | null {
    return this.lastDetectedPitch;
  }

  private handlePitchBuffer = (buffer: Float32Array) => {
    if (!this.isDetectingPitch || !this.audioCtx) return;

    if (!this.pitchDetector || this.pitchDetector.inputLength !== buffer.length) {
      this.pitchDetector = PitchDetector.forFloat32Array(buffer.length);
      // Matches the previous autocorrelation implementation's RMS noise floor.
      this.pitchDetector.minVolumeAbsolute = 0.01;
    }

    const [freq, clarity] = this.pitchDetector.findPitch(buffer, this.audioCtx.sampleRate);
    if (clarity > 0.9 && freq > 50 && freq < 2000) {
      const noteData = this.frequencyToNote(freq);
      const frequency = Math.round(freq * 10) / 10;
      this.lastDetectedPitch = { note: noteData.note, frequency, cents: noteData.cents, timestamp: Date.now() };
      if (this.onPitchDetectedCallback) {
        this.onPitchDetectedCallback({
          note: noteData.note,
          frequency,
          cents: noteData.cents,
        });
      }
    }
  };

  /**
   * Converts a raw frequency to the nearest note name + signed cents deviation.
   *
   * Applies hysteresis around the semitone boundary (±50c): once a note is
   * assigned, ordinary frame-to-frame jitter in the frequency estimate won't
   * flip it to the neighboring semitone just because the reading crossed
   * exactly ±50c. Without this, a pitch sustained near that boundary flickers
   * between "correct note, sharp" and "next note, flat" from one detection
   * frame to the next — which flips `isCorrect` (letter match) and the tuner's
   * displayed note+cents every other frame, even though the actual pitch
   * barely moved.
   */
  private frequencyToNote(frequency: number): { note: string; cents: number } {
    const HYSTERESIS_CENTS = 5;
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;

    let roundedNote: number;
    if (this.lastNoteMidi !== null && Math.abs(noteNum - this.lastNoteMidi) * 100 <= 50 + HYSTERESIS_CENTS) {
      roundedNote = this.lastNoteMidi;
    } else {
      roundedNote = Math.round(noteNum);
    }
    this.lastNoteMidi = roundedNote;

    const noteIndex = (roundedNote % 12 + 12) % 12;
    const octave = Math.floor(roundedNote / 12) - 1;
    const expectedFreq = 440 * Math.pow(2, (roundedNote - 69) / 12);
    const cents = Math.round(1200 * (Math.log(frequency / expectedFreq) / Math.log(2)));

    return {
      note: `${NOTE_STRINGS[noteIndex]}${octave}`,
      cents,
    };
  }
}

const NOTE_STRINGS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function noteToFrequency(note: string): number {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 440;
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_STRINGS.indexOf(noteName);
  if (noteIndex === -1) return 440;
  const midi = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const audioEngine = new AudioEngine();
