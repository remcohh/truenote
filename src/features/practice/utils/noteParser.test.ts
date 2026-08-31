import { describe, it, expect, vi } from 'vitest';
import { midiHalfToneToNoteName, noteLetter, getCurrentTargetPitch } from './noteParser';

describe('noteParser utility', () => {
  describe('midiHalfToneToNoteName', () => {
    it('converts MIDI pitch numbers to note name and octave string', () => {
      expect(midiHalfToneToNoteName(60)).toBe('C4');
      expect(midiHalfToneToNoteName(69)).toBe('A4');
      expect(midiHalfToneToNoteName(61)).toBe('C#4');
      expect(midiHalfToneToNoteName(71)).toBe('B4');
      expect(midiHalfToneToNoteName(72)).toBe('C5');
    });

    it('handles low octaves and negative halftone values gracefully', () => {
      expect(midiHalfToneToNoteName(0)).toBe('C-1');
      expect(midiHalfToneToNoteName(12)).toBe('C0');
    });
  });

  describe('noteLetter', () => {
    it('strips octave digits and normalizes to uppercase', () => {
      expect(noteLetter('C#4')).toBe('C#');
      expect(noteLetter('eb3')).toBe('EB');
      expect(noteLetter('  a4  ')).toBe('A');
      expect(noteLetter('G5')).toBe('G');
    });
  });

  describe('getCurrentTargetPitch', () => {
    it('returns null if cursor is missing or notes are empty', () => {
      expect(getCurrentTargetPitch(null)).toBeNull();
      const mockEmptyCursor = { NotesUnderCursor: vi.fn().mockReturnValue([]) };
      expect(getCurrentTargetPitch(mockEmptyCursor)).toBeNull();
    });

    it('returns transposed note name from cursor note pitch', () => {
      const mockCursor = {
        NotesUnderCursor: vi.fn().mockReturnValue([
          { Pitch: { halfTone: 60 } },
        ]),
      };

      expect(getCurrentTargetPitch(mockCursor, 0)).toBe('C4');
      expect(getCurrentTargetPitch(mockCursor, 2)).toBe('D4');
      expect(getCurrentTargetPitch(mockCursor, -2)).toBe('A#3');
    });
  });
});
