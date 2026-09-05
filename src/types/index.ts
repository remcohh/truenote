export interface Exercise {
  id: string;
  title: string;
  category: 'Scales' | 'Arpeggios' | 'Classical' | 'Rhythm' | 'Custom';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultBpm: number;
  beatsPerMeasure?: number;
  description: string;
  xmlData: string; // MusicXML string or URL
  isCustom?: boolean;
}


export interface PracticeSession {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  bpm: number;
  durationSeconds: number;
  score: number; // note accuracy, 0 to 100% — right note sounding, any tuning within the nearest-note range
  intonationScore: number; // 0 to 100% — of the correctly-played notes, how many were tightly in tune
  timestamp: string;
  syncedToPocketBase?: boolean;
}

export interface ScoreSample {
  t: number; // seconds since practice start
  isRest: boolean;
  isCorrect: boolean;
  /**
   * Signed cents deviation from the target pitch, folded to the nearest octave
   * equivalent (range roughly -600..600). A correct sample (matched pitch class,
   * any octave) shows true intonation error near 0; an incorrect sample shows how
   * far away the wrong pitch class was.
   */
  centsOff: number | null; // null = no sound detected at all
  /** Note name (e.g. "C3") as printed on the sheet at this instant, before transposition. Null during a rest. */
  expectedNote: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface PocketBaseConfig {
  url: string;
  isConnected: boolean;
  user: UserProfile | null;
}
