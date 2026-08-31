/**
 * Utility functions for parsing OSMD note pitch information and MIDI values.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiHalfToneToNoteName(halfTone: number): string {
  const noteIndex = ((halfTone % 12) + 12) % 12;
  const octave = Math.floor(halfTone / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/** Strips the octave digits off a note name (e.g. "C#4" -> "C#"), case-insensitively normalized to uppercase. */
export function noteLetter(noteName: string): string {
  return noteName.trim().replace(/\d+$/, '').toUpperCase();
}

export function getCurrentTargetPitch(cursor: any, transpose: number = 0): string | null {
  if (!cursor) return null;
  const notes = cursor.NotesUnderCursor();

  if (notes && notes.length > 0) {
    const pitch = notes[0].Pitch;
    if (pitch) {
      return midiHalfToneToNoteName(pitch.halfTone + transpose);
    }
  }

  return null;
}
