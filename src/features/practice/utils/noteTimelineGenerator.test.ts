import { describe, it, expect } from 'vitest';
import { buildNoteTimeline, findActiveNote, NoteTimelineEntry } from './noteTimelineGenerator';

describe('noteTimelineGenerator utility', () => {
  describe('buildNoteTimeline', () => {
    it('returns empty array when osmd is null or sheet is missing', () => {
      expect(buildNoteTimeline(null, 120)).toEqual([]);
      expect(buildNoteTimeline({} as any, 120)).toEqual([]);
    });

    it('parses measures into timeline entries skipping rests', () => {
      const mockOsmd: any = {
        Sheet: {
          SourceMeasures: [
            {
              AbsoluteTimestamp: { realValue: 0.0 },
              VerticalSourceStaffEntryContainers: [
                {
                  Timestamp: { realValue: 0.0 },
                  StaffEntries: [
                    {
                      VoiceEntries: [
                        {
                          Notes: [
                            {
                              isRest: () => false,
                              Pitch: { halfTone: 60 },
                              Length: { realValue: 0.25 },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const timeline = buildNoteTimeline(mockOsmd, 120);
      expect(timeline).toHaveLength(1);
      expect(timeline[0]).toEqual({
        startBeat: 0.0,
        endBeat: 1.0,
        startTime: 0.0,
        endTime: 0.5,
        halfTone: 60,
      });
    });

    it('derives startTime/endTime from the given bpm', () => {
      const mockOsmd: any = {
        Sheet: {
          SourceMeasures: [
            {
              AbsoluteTimestamp: { realValue: 0.0 },
              VerticalSourceStaffEntryContainers: [
                {
                  Timestamp: { realValue: 0.0 },
                  StaffEntries: [
                    {
                      VoiceEntries: [
                        {
                          Notes: [
                            {
                              isRest: () => false,
                              Pitch: { halfTone: 60 },
                              Length: { realValue: 0.5 },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const timeline = buildNoteTimeline(mockOsmd, 60);
      // At 60 bpm, one beat = 1 second; this note spans 2 beats (0.5 whole-note * 4).
      expect(timeline[0].startTime).toBe(0);
      expect(timeline[0].endTime).toBe(2);
    });
  });

  describe('findActiveNote', () => {
    const sampleTimeline: NoteTimelineEntry[] = [
      { startBeat: 0.0, endBeat: 1.0, startTime: 0.0, endTime: 0.5, halfTone: 60 },
      { startBeat: 1.0, endBeat: 2.0, startTime: 0.5, endTime: 1.0, halfTone: 62 },
      { startBeat: 2.0, endBeat: 4.0, startTime: 1.0, endTime: 2.0, halfTone: 64 },
    ];

    it('finds the active note for a valid beat position', () => {
      expect(findActiveNote(sampleTimeline, 0.5)).toEqual(sampleTimeline[0]);
      expect(findActiveNote(sampleTimeline, 1.0)).toEqual(sampleTimeline[1]);
      expect(findActiveNote(sampleTimeline, 3.5)).toEqual(sampleTimeline[2]);
    });

    it('returns null if beat position is before start or after end of timeline', () => {
      expect(findActiveNote(sampleTimeline, -0.5)).toBeNull();
      expect(findActiveNote(sampleTimeline, 4.0)).toBeNull();
      expect(findActiveNote(sampleTimeline, 10.0)).toBeNull();
    });
  });
});
