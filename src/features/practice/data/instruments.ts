export interface Instrument {
  id: string;
  name: string;
  /** Semitones to shift the requested pitch relative to the sheet's written (concert) pitch. */
  transpose: number;
}

export const INSTRUMENTS: Instrument[] = [
  { id: 'concert', name: 'Concert Pitch (C)', transpose: 0 },
  { id: 'trumpet-bb', name: 'Trumpet in B♭', transpose: -3 },
  { id: 'tuba-treble', name: 'Tuba (Treble Clef)', transpose: -26 },
];
