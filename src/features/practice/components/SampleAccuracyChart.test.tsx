import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SampleAccuracyChart } from './SampleAccuracyChart';
import type { ScoreSample } from '../../../types';

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('SampleAccuracyChart Component', () => {
  it('renders note labels at their corresponding pitch Y-axis position', () => {
    const samples: ScoreSample[] = [
      {
        t: 0,
        isRest: false,
        isCorrect: true,
        centsOff: 0,
        expectedNote: 'C4',
        soundingHalfTone: 60,
        noteOnsetBeat: 0,
        isNoteBoundary: false,
        playedFrequency: 261.63,
      },
      {
        t: 1,
        isRest: false,
        isCorrect: true,
        centsOff: 0,
        expectedNote: 'G4',
        soundingHalfTone: 67,
        noteOnsetBeat: 1,
        isNoteBoundary: false,
        playedFrequency: 392.0,
      },
    ];

    const { container } = render(<SampleAccuracyChart samples={samples} />);

    const labelC4 = Array.from(container.querySelectorAll('text')).find((el) => el.textContent === 'C4');
    const labelG4 = Array.from(container.querySelectorAll('text')).find((el) => el.textContent === 'G4');

    expect(labelC4).toBeInTheDocument();
    expect(labelG4).toBeInTheDocument();

    const yC4 = parseFloat(labelC4?.getAttribute('y') || '0');
    const yG4 = parseFloat(labelG4?.getAttribute('y') || '0');

    // Higher pitch (G4) should be higher on the screen, meaning smaller y value in SVG coords
    expect(yG4).toBeLessThan(yC4);

    // Labels must not be hardcoded to y=10
    expect(yC4).not.toBe(10);
  });
});
