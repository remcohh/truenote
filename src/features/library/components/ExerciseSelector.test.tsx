import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ExerciseSelector } from './ExerciseSelector';
import { SAMPLE_EXERCISES } from '../data/sampleExercises';
import type { Exercise } from '../../../types';

describe('ExerciseSelector Component', () => {
  const currentExercise: Exercise = SAMPLE_EXERCISES[0];
  const defaultProps = {
    currentExercise,
    onSelectExercise: vi.fn(),
    customExercises: [],
    onUploadCustomExercise: vi.fn(),
  };

  it('renders exercise category filters and search bar', () => {
    render(<ExerciseSelector {...defaultProps} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getAllByText('Scales').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Search exercises...')).toBeInTheDocument();
  });

  it('filters exercises by search query', () => {
    render(<ExerciseSelector {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search exercises...');
    fireEvent.change(searchInput, { target: { value: 'Arpeggio' } });
    expect(screen.getAllByText(/Arpeggio/i).length).toBeGreaterThan(0);
  });

  it('calls onSelectExercise when an exercise card is clicked', () => {
    const onSelectExercise = vi.fn();
    render(<ExerciseSelector {...defaultProps} onSelectExercise={onSelectExercise} />);

    const secondExerciseTitle = SAMPLE_EXERCISES[1].title;
    const card = screen.getByText(secondExerciseTitle);
    fireEvent.click(card);

    expect(onSelectExercise).toHaveBeenCalledWith(SAMPLE_EXERCISES[1]);
  });

  it('opens upload modal when Upload XML button is clicked', () => {
    render(<ExerciseSelector {...defaultProps} />);
    const uploadBtn = screen.getByRole('button', { name: /Upload XML/i });
    fireEvent.click(uploadBtn);

    expect(screen.getByText('Upload Custom MusicXML')).toBeInTheDocument();
    expect(screen.getByText('Exercise Title')).toBeInTheDocument();
  });
});
