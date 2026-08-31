import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API for jsdom environment
if (typeof window !== 'undefined') {
  const mockAudioContext = vi.fn().mockImplementation(() => ({
    createAnalyser: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      getFloatTimeDomainData: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: { value: 1 },
    }),
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 },
    }),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  }));

  // Assign to window
  (window as unknown as { AudioContext: unknown }).AudioContext = mockAudioContext;
  (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext = mockAudioContext;
}
