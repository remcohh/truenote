import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MetronomeControls } from './MetronomeControls';

// Mock audioEngine service to isolate component behavior
vi.mock('../../../services/audioEngine', () => ({
  audioEngine: {
    startMetronome: vi.fn(),
    stopMetronome: vi.fn(),
    setBpm: vi.fn(),
  },
}));

describe('MetronomeControls Component', () => {
  const defaultProps = {
    bpm: 120,
    onBpmChange: vi.fn(),
    isPlaying: false,
    onTogglePlay: vi.fn(),
    isMuted: false,
    onToggleMute: vi.fn(),
    isCountInEnabled: true,
    onToggleCountIn: vi.fn(),
  };

  it('renders BPM display and controls accurately', () => {
    render(<MetronomeControls {...defaultProps} />);
    expect(screen.getAllByText('120').length).toBeGreaterThan(0);
    expect(screen.getByText('Start Session')).toBeInTheDocument();
  });

  it('triggers onTogglePlay when play/stop button is clicked', () => {
    const onTogglePlay = vi.fn();
    render(<MetronomeControls {...defaultProps} onTogglePlay={onTogglePlay} />);

    const playBtn = screen.getByRole('button', { name: /Start Session/i });
    fireEvent.click(playBtn);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
  });

  it('triggers onBpmChange when a preset BPM button is clicked', () => {
    const onBpmChange = vi.fn();
    render(<MetronomeControls {...defaultProps} onBpmChange={onBpmChange} />);

    const presetBtn = screen.getByRole('button', { name: '140' });
    fireEvent.click(presetBtn);
    expect(onBpmChange).toHaveBeenCalledWith(140);
  });

  it('triggers onToggleMute and onToggleCountIn when toggle buttons are clicked', () => {
    const onToggleMute = vi.fn();
    const onToggleCountIn = vi.fn();
    render(
      <MetronomeControls
        {...defaultProps}
        onToggleMute={onToggleMute}
        onToggleCountIn={onToggleCountIn}
      />
    );

    const clickSoundBtn = screen.getByTitle(/Toggle sounding metronome click/i);
    fireEvent.click(clickSoundBtn);
    expect(onToggleMute).toHaveBeenCalledTimes(1);

    const countInBtn = screen.getByTitle(/Toggle 1-bar count-in/i);
    fireEvent.click(countInBtn);
    expect(onToggleCountIn).toHaveBeenCalledTimes(1);
  });
});
