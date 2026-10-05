import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API for jsdom environment
if (typeof window !== 'undefined') {
  const mockAudioContext = vi.fn().mockImplementation(function (this: any) {
    return {
    createAnalyser: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getFloatTimeDomainData: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    }),
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    }),
    createDynamicsCompressor: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      threshold: { setValueAtTime: vi.fn() },
      knee: { setValueAtTime: vi.fn() },
      ratio: { setValueAtTime: vi.fn() },
      attack: { setValueAtTime: vi.fn() },
      release: { setValueAtTime: vi.fn() },
    }),
    createBiquadFilter: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      frequency: { value: 1000, setValueAtTime: vi.fn() },
      Q: { value: 1 },
      type: 'lowpass',
    }),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
});

  // Assign to window
  (window as unknown as { AudioContext: unknown }).AudioContext = mockAudioContext;
  (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext = mockAudioContext;
}
