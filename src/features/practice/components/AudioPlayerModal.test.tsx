import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayerModal } from './AudioPlayerModal';
import { soundfontPlayer } from '../../../services/soundfontPlayer';
import type { NoteTimelineEntry } from '../utils/noteTimelineGenerator';

// Mock soundfontPlayer
vi.mock('../../../services/soundfontPlayer', () => {
  return {
    INSTRUMENT_OPTIONS: [
      { id: 'acoustic_grand_piano', name: 'Grand Piano', icon: '🎹', category: 'piano' },
      { id: 'trumpet', name: 'Trumpet', icon: '🎺', category: 'brass' },
      { id: 'warm_synth', name: 'Warm Synth / E-Piano', icon: '⚡', category: 'synth' },
    ],
    soundfontPlayer: {
      getInstrument: vi.fn().mockReturnValue('acoustic_grand_piano'),
      getVolume: vi.fn().mockReturnValue(0.8),
      getIsMuted: vi.fn().mockReturnValue(false),
      getIsLoading: vi.fn().mockReturnValue(false),
      setVolume: vi.fn(),
      setMuted: vi.fn(),
      loadInstrument: vi.fn().mockResolvedValue(undefined),
      playTimeline: vi.fn().mockResolvedValue(undefined),
      playNote: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      seekToBeat: vi.fn(),
      onLoadingStateChange: vi.fn().mockImplementation((cb) => {
        cb(false);
        return () => {};
      }),
    },
  };
});

describe('AudioPlayerModal Component', () => {
  const sampleTimeline: NoteTimelineEntry[] = [
    { startBeat: 0, endBeat: 1, startTime: 0, endTime: 0.5, halfTone: 60 },
    { startBeat: 1, endBeat: 2, startTime: 0.5, endTime: 1.0, halfTone: 62 },
    { startBeat: 2, endBeat: 4, startTime: 1.0, endTime: 2.0, halfTone: 64 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders disabled state when isEnabled is false', () => {
    render(
      <AudioPlayerModal
        isEnabled={false}
        onToggleEnabled={vi.fn()}
        isSessionActive={false}
        timeline={sampleTimeline}
        bpm={120}
        transpose={0}
      />
    );

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(/Disabled — silent practice/)).toBeInTheDocument();
  });

  it('renders enabled state when isEnabled is true', () => {
    render(
      <AudioPlayerModal
        isEnabled={true}
        onToggleEnabled={vi.fn()}
        isSessionActive={false}
        timeline={sampleTimeline}
        bpm={120}
        transpose={0}
      />
    );

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/Enabled — starts automatically when you press Start Session/)).toBeInTheDocument();
  });

  it('indicates live playing state when session is active and audio enabled', () => {
    render(
      <AudioPlayerModal
        isEnabled={true}
        onToggleEnabled={vi.fn()}
        isSessionActive={true}
        timeline={sampleTimeline}
        bpm={120}
        transpose={0}
      />
    );

    expect(screen.getByText(/Playing live with active practice session/)).toBeInTheDocument();
  });

  it('triggers onToggleEnabled when switch is clicked', () => {
    const toggleSpy = vi.fn();
    render(
      <AudioPlayerModal
        isEnabled={false}
        onToggleEnabled={toggleSpy}
        isSessionActive={false}
        timeline={sampleTimeline}
        bpm={120}
        transpose={0}
      />
    );

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);
    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });

  it('allows instrument switching', () => {
    render(
      <AudioPlayerModal
        isEnabled={true}
        onToggleEnabled={vi.fn()}
        isSessionActive={false}
        timeline={sampleTimeline}
        bpm={120}
        transpose={0}
      />
    );

    const trumpetBtn = screen.getByText('Trumpet');
    fireEvent.click(trumpetBtn);

    expect(soundfontPlayer.loadInstrument).toHaveBeenCalledWith('trumpet');
  });

  it('adjusts volume and toggles mute', () => {
    render(
      <AudioPlayerModal
        isEnabled={true}
        onToggleEnabled={vi.fn()}
        isSessionActive={false}
        timeline={sampleTimeline}
        bpm={120}
        transpose={0}
      />
    );

    const muteBtn = screen.getByTitle('Mute Audio');
    fireEvent.click(muteBtn);
    expect(soundfontPlayer.setMuted).toHaveBeenCalledWith(true);

    const volumeSlider = screen.getByLabelText('Volume');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    expect(soundfontPlayer.setVolume).toHaveBeenCalledWith(0.5);
  });

  it('plays a test note when Test Sound button is clicked', () => {
    render(
      <AudioPlayerModal
        isEnabled={true}
        onToggleEnabled={vi.fn()}
        isSessionActive={false}
        timeline={sampleTimeline}
        bpm={120}
        transpose={2}
      />
    );

    const testBtn = screen.getByText('Test Sound');
    fireEvent.click(testBtn);

    // 60 + transpose(2) = 62
    expect(soundfontPlayer.playNote).toHaveBeenCalledWith(62, 0.7, 95);
  });
});
