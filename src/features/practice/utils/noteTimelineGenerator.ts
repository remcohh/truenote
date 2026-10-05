import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export interface NoteTimelineEntry {
  startBeat: number;
  endBeat: number;
  /** Seconds from the start of the piece, at the bpm the timeline was built with. */
  startTime: number;
  /** Seconds from the start of the piece, at the bpm the timeline was built with. */
  endTime: number;
  halfTone: number;
}

/**
 * Builds a beat-indexed timeline of every non-rest note in the piece, read directly
 * from the score's source data rather than the display cursor. The cursor only
 * advances (and reports a target note) once per metronome tick, so it can't tell us
 * what note is "correct" at an arbitrary instant between ticks — this timeline can,
 * which is what continuous fixed-rate scoring needs.
 *
 * `startTime`/`endTime` are derived from `bpm` and are only valid for that tempo —
 * the caller must rebuild the timeline if bpm changes. This is fine because tempo is
 * fixed for the duration of a practice session (the UI disables tempo controls while
 * playing) and the timeline is rebuilt whenever bpm changes between sessions.
 */
export function buildNoteTimeline(osmd: OpenSheetMusicDisplay | null, bpm: number): NoteTimelineEntry[] {
  if (!osmd || !osmd.Sheet) return [];

  const measures = osmd.Sheet.SourceMeasures;
  if (!measures || measures.length === 0) return [];

  const timeline: NoteTimelineEntry[] = [];
  const secondsPerBeat = 60 / bpm;

  for (let m = 0; m < measures.length; m++) {
    const measure = measures[m];
    const measureStart = measure.AbsoluteTimestamp ? measure.AbsoluteTimestamp.realValue : 0;
    const containers = measure.VerticalSourceStaffEntryContainers;
    if (!containers) continue;

    for (let c = 0; c < containers.length; c++) {
      const container = containers[c];
      if (!container || !container.Timestamp) continue;

      const staffEntries = container.StaffEntries;
      if (!staffEntries) continue;

      // Mirror getCurrentTargetPitch's convention: take the first sounding note found
      // on the primary solo instrument (Staff 0), skipping rests and ignoring accompaniment.
      let firstNote: any = null;
      for (let se = 0; se < staffEntries.length && !firstNote; se++) {
        const staffEntry = staffEntries[se];
        // If staffEntry belongs to a subsequent instrument / staff, ignore it for solo scoring
        const staffId = staffEntry?.ParentStaff?.idInMusicSheet;
        if (staffId !== undefined && staffId !== 0) {
          continue;
        }
        const voiceEntries = staffEntry?.VoiceEntries;
        if (!voiceEntries) continue;
        for (let ve = 0; ve < voiceEntries.length && !firstNote; ve++) {
          const notes = voiceEntries[ve].Notes;
          if (!notes) continue;
          for (let n = 0; n < notes.length; n++) {
            if (!notes[n].isRest() && notes[n].Pitch) {
              firstNote = notes[n];
              break;
            }
          }
        }
      }

      if (!firstNote) continue; // rest at this timestamp — nothing to request

      const startBeat = (measureStart + container.Timestamp.realValue) * 4.0;
      const durationBeats = firstNote.Length.realValue * 4.0;
      const endBeat = startBeat + durationBeats;

      timeline.push({
        startBeat,
        endBeat,
        startTime: startBeat * secondsPerBeat,
        endTime: endBeat * secondsPerBeat,
        halfTone: firstNote.Pitch.halfTone,
      });
    }
  }

  return timeline;
}

/**
 * Builds a timeline of ALL non-rest notes across all instruments and staves (solo and accompaniment)
 * for audio playback. Multiple notes sounding at the same time (chords, multi-part) are all included.
 */
export function buildScorePlaybackTimeline(osmd: OpenSheetMusicDisplay | null, bpm: number): NoteTimelineEntry[] {
  if (!osmd || !osmd.Sheet) return [];

  const measures = osmd.Sheet.SourceMeasures;
  if (!measures || measures.length === 0) return [];

  const timeline: NoteTimelineEntry[] = [];
  const secondsPerBeat = 60 / bpm;

  for (let m = 0; m < measures.length; m++) {
    const measure = measures[m];
    const measureStart = measure.AbsoluteTimestamp ? measure.AbsoluteTimestamp.realValue : 0;
    const containers = measure.VerticalSourceStaffEntryContainers;
    if (!containers) continue;

    for (let c = 0; c < containers.length; c++) {
      const container = containers[c];
      if (!container || !container.Timestamp) continue;

      const staffEntries = container.StaffEntries;
      if (!staffEntries) continue;

      for (let se = 0; se < staffEntries.length; se++) {
        const staffEntry = staffEntries[se];
        const voiceEntries = staffEntry?.VoiceEntries;
        if (!voiceEntries) continue;

        for (let ve = 0; ve < voiceEntries.length; ve++) {
          const notes = voiceEntries[ve].Notes;
          if (!notes) continue;

          for (let n = 0; n < notes.length; n++) {
            const note = notes[n];
            if (!note.isRest() && note.Pitch) {
              const startBeat = (measureStart + container.Timestamp.realValue) * 4.0;
              const durationBeats = (note.Length ? note.Length.realValue : 0.25) * 4.0;
              const endBeat = startBeat + durationBeats;

              timeline.push({
                startBeat,
                endBeat,
                startTime: startBeat * secondsPerBeat,
                endTime: endBeat * secondsPerBeat,
                halfTone: note.Pitch.halfTone,
              });
            }
          }
        }
      }
    }
  }

  timeline.sort((a, b) => a.startTime - b.startTime);
  return timeline;
}

/** Finds the timeline entry (if any) that is the active target note at a given beat position. */
export function findActiveNote(timeline: NoteTimelineEntry[], beatPosition: number): NoteTimelineEntry | null {
  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i];
    if (beatPosition >= entry.startBeat && beatPosition < entry.endBeat) {
      return entry;
    }
  }
  return null;
}
