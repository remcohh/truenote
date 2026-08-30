// Audio Synthesizer, Metronome, and Real-time Microphone Pitch Detection Engine

class AudioEngine {
  private audioCtx: AudioContext | null = null;

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

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
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
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  public playCountInClick(isAccent: boolean = false) {
    this.initAudioContext();
    if (this.audioCtx) {
      this.playClick(this.audioCtx.currentTime, isAccent, true);
    }
  }



  // --- Play Reference Tone (e.g. C4 = 261.63Hz) ---
  public playTone(freq: number, durationSeconds: number = 0.5) {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + durationSeconds);
  }

  // --- Real-time Pitch Detection (Mic Input) ---
  // Runs on an AudioWorkletNode: sample accumulation happens on the dedicated
  // audio rendering thread (fixed cadence tied to the mic's own sample rate,
  // unaffected by main-thread jank or tab visibility), which posts finished
  // 2048-sample blocks back here for the actual autocorrelation math.
  public async startPitchDetection(
    onPitchDetected: (data: { note: string; frequency: number; cents: number }) => void
  ): Promise<boolean> {
    this.initAudioContext();
    if (!this.audioCtx) return false;

    this.onPitchDetectedCallback = onPitchDetected;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioCtx.createMediaStreamSource(this.micStream);

      if (!this.workletModuleLoaded) {
        await this.audioCtx.audioWorklet.addModule('/pitch-processor.js');
        this.workletModuleLoaded = true;
      }

      this.workletNode = new AudioWorkletNode(this.audioCtx, 'pitch-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      this.workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        this.handlePitchBuffer(event.data);
      };

      source.connect(this.workletNode);
      // The processor never writes to its output, so this stays silent —
      // it's only here to keep the node from being pruned from the audio graph.
      this.workletNode.connect(this.audioCtx.destination);

      this.isDetectingPitch = true;
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      return false;
    }
  }

  public stopPitchDetection() {
    this.isDetectingPitch = false;
    this.lastDetectedPitch = null;
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

    const freq = autoCorrelate(buffer, this.audioCtx.sampleRate);
    if (freq !== -1 && freq > 50 && freq < 2000) {
      const noteData = frequencyToNote(freq);
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
}

// Autocorrelation pitch detection algorithm
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // Noise floor threshold
  if (rms < 0.01) return -1;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;

  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmedBuffer = buffer.slice(r1, r2);
  const trimmedSize = trimmedBuffer.length;

  const c = new Array(trimmedSize).fill(0);
  for (let i = 0; i < trimmedSize; i++) {
    for (let j = 0; j < trimmedSize - i; j++) {
      c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;

  for (let i = d; i < trimmedSize; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // Parabolic interpolation for fine accuracy
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

const NOTE_STRINGS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function frequencyToNote(frequency: number): { note: string; cents: number } {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const roundedNote = Math.round(noteNum) + 69;
  const noteIndex = (roundedNote % 12 + 12) % 12;
  const octave = Math.floor(roundedNote / 12) - 1;
  const expectedFreq = 440 * Math.pow(2, (roundedNote - 69) / 12);
  const cents = Math.floor(1200 * (Math.log(frequency / expectedFreq) / Math.log(2)));

  return {
    note: `${NOTE_STRINGS[noteIndex]}${octave}`,
    cents,
  };
}

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
