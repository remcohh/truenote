import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundfontPlayer, INSTRUMENT_OPTIONS } from './soundfontPlayer';
import type { NoteTimelineEntry } from '../features/practice/utils/noteTimelineGenerator';

// Mock smplr
vi.mock('smplr', () => {
  return {
    SplendidGrandPiano: vi.fn().mockImplementation(function (this: any) {
      return {
        ready: Promise.resolve(),
        start: vi.fn(),
        stop: vi.fn(),
        output: { volume: 80 },
      };
    }),
    Soundfont: vi.fn().mockImplementation(function (this: any) {
      return {
        ready: Promise.resolve(),
        start: vi.fn(),
        stop: vi.fn(),
        output: { volume: 80 },
      };
    }),
  };
});

describe('SoundfontPlayer Service', () => {
  beforeEach(() => {
    soundfontPlayer.stop();
    soundfontPlayer.setVolume(0.8);
    soundfontPlayer.setMuted(false);
  });

  it('exposes instrument options list', () => {
    expect(INSTRUMENT_OPTIONS.length).toBeGreaterThanOrEqual(6);
    expect(INSTRUMENT_OPTIONS.some((i) => i.id === 'acoustic_grand_piano')).toBe(true);
    expect(INSTRUMENT_OPTIONS.some((i) => i.id === 'trumpet')).toBe(true);
    expect(INSTRUMENT_OPTIONS.some((i) => i.id === 'warm_synth')).toBe(true);
  });

  it('manages volume and mute states', () => {
    soundfontPlayer.setVolume(0.5);
    expect(soundfontPlayer.getVolume()).toBe(0.5);

    soundfontPlayer.setVolume(1.5); // Clamped
    expect(soundfontPlayer.getVolume()).toBe(1.0);

    soundfontPlayer.setMuted(true);
    expect(soundfontPlayer.getIsMuted()).toBe(true);

    soundfontPlayer.setMuted(false);
    expect(soundfontPlayer.getIsMuted()).toBe(false);
  });

  it('switches instruments and notifies loading state', async () => {
    const loadingHistory: boolean[] = [];
    const unsubscribe = soundfontPlayer.onLoadingStateChange((loading) => {
      loadingHistory.push(loading);
    });

    await soundfontPlayer.loadInstrument('trumpet');
    expect(soundfontPlayer.getInstrument()).toBe('trumpet');
    expect(loadingHistory.length).toBeGreaterThan(0);

    unsubscribe();
  });

  it('plays single note without throwing', () => {
    expect(() => {
      soundfontPlayer.playNote(60, 0.5, 90);
    }).not.toThrow();
  });

  it('handles timeline playback lifecycle: play, pause, resume, stop', async () => {
    const mockTimeline: NoteTimelineEntry[] = [
      { startBeat: 0, endBeat: 1, startTime: 0, endTime: 0.5, halfTone: 60 },
      { startBeat: 1, endBeat: 2, startTime: 0.5, endTime: 1.0, halfTone: 62 },
    ];

    const progressSpy = vi.fn();
    const finishedSpy = vi.fn();

    await soundfontPlayer.playTimeline(mockTimeline, {
      bpm: 120,
      transpose: 0,
      onProgress: progressSpy,
      onFinished: finishedSpy,
    });

    expect(soundfontPlayer.isPlaying()).toBe(true);
    expect(soundfontPlayer.isPaused()).toBe(false);

    soundfontPlayer.pause();
    expect(soundfontPlayer.isPlaying()).toBe(false);
    expect(soundfontPlayer.isPaused()).toBe(true);

    soundfontPlayer.resume();
    expect(soundfontPlayer.isPlaying()).toBe(true);

    soundfontPlayer.stop();
    expect(soundfontPlayer.isPlaying()).toBe(false);
    expect(soundfontPlayer.isPaused()).toBe(false);
  });
});
