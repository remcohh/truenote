import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export interface BeatMapResult {
  map: number[];
  beatsPerMeasure: number;
}

/**
 * Builds a non-mutating beat-to-step index map by inspecting OSMD's Sheet data model.
 */
export function buildBeatStepMap(osmd: OpenSheetMusicDisplay | null): BeatMapResult {
  if (!osmd || !osmd.Sheet) return { map: [], beatsPerMeasure: 4 };

  const measures = osmd.Sheet.SourceMeasures;
  if (!measures || measures.length === 0) return { map: [], beatsPerMeasure: 4 };

  // Detect time signature numerator (beats per measure)
  const activeTimeSig = measures[0]?.ActiveTimeSignature;
  const beatsPerMeasure = activeTimeSig?.Numerator || 4;

  const stepTimestamps: number[] = [];

  for (let m = 0; m < measures.length; m++) {
    const measure = measures[m];
    const containers = measure.VerticalSourceStaffEntryContainers;
    if (containers && containers.length > 0) {
      for (let c = 0; c < containers.length; c++) {
        const container = containers[c];
        if (container && container.Timestamp) {
          const absFraction = (measure.AbsoluteTimestamp ? measure.AbsoluteTimestamp.realValue : 0) + container.Timestamp.realValue;
          const startBeat = absFraction * 4.0;
          stepTimestamps.push(startBeat);
        }
      }
    }
  }

  if (stepTimestamps.length === 0) return { map: [], beatsPerMeasure };

  const lastBeat = stepTimestamps[stepTimestamps.length - 1];
  const totalBeats = Math.ceil(lastBeat + 1);
  const map: number[] = [];

  for (let b = 0; b < totalBeats; b++) {
    let matchingStep = 0;
    for (let s = 0; s < stepTimestamps.length; s++) {
      if (stepTimestamps[s] <= b + 0.02) {
        matchingStep = s;
      }
    }
    map.push(matchingStep);
  }

  return { map, beatsPerMeasure };
}
