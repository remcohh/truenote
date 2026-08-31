import { describe, it, expect } from 'vitest';
import { buildBeatStepMap } from './beatMapGenerator';

describe('beatMapGenerator utility', () => {
  it('returns default empty result when osmd is null or sheet is missing', () => {
    expect(buildBeatStepMap(null)).toEqual({ map: [], beatsPerMeasure: 4 });
    expect(buildBeatStepMap({} as any)).toEqual({ map: [], beatsPerMeasure: 4 });
  });

  it('builds step map and detects beatsPerMeasure correctly from sheet measures', () => {
    const mockOsmd: any = {
      Sheet: {
        SourceMeasures: [
          {
            ActiveTimeSignature: { Numerator: 3 },
            AbsoluteTimestamp: { realValue: 0.0 },
            VerticalSourceStaffEntryContainers: [
              { Timestamp: { realValue: 0.0 } },
              { Timestamp: { realValue: 0.25 } },
            ],
          },
          {
            AbsoluteTimestamp: { realValue: 1.0 },
            VerticalSourceStaffEntryContainers: [
              { Timestamp: { realValue: 0.0 } },
            ],
          },
        ],
      },
    };

    const result = buildBeatStepMap(mockOsmd);
    expect(result.beatsPerMeasure).toBe(3);
    expect(result.map.length).toBeGreaterThan(0);
    expect(result.map[0]).toBe(0);
  });
});
