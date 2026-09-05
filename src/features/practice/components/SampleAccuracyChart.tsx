import React, { useEffect, useRef, useState } from 'react';
import type { ScoreSample } from '../../../types';
import { voteNoteInstances, DEFAULT_MAJORITY_THRESHOLD } from '../utils/sampleEvaluation';

interface SampleAccuracyChartProps {
  samples: ScoreSample[];
  /** Same majority-vote threshold the session's note accuracy was scored with. Defaults to DEFAULT_MAJORITY_THRESHOLD. */
  majorityThreshold?: number;
}

const CHART_HEIGHT = 200;
const CENTER_Y = CHART_HEIGHT / 2;
// A correctly-identified note (the only kind that gets a bar) is by definition within
// ±50c of its target — cross that and the nearest-note assignment flips, which shows
// up as a wrong-note (red dot) sample instead. So ±50c is the entire meaningful range
// for intonation feedback.
const CENTS_RANGE = 50;
const AXIS_LABEL_HEIGHT = 16;
const SVG_HEIGHT = CHART_HEIGHT + AXIS_LABEL_HEIGHT;
const FALLBACK_WIDTH = 600; // used only for the first paint, before the container is measured
const BAR_WIDTH = 3;
const DOT_RADIUS = 3; // px, radius of the axis marker drawn for a wrong note or missing signal

/** Picks a readable tick spacing (in seconds) given the total duration. */
function pickTickIntervalSeconds(durationSeconds: number): number {
  if (durationSeconds <= 15) return 1;
  if (durationSeconds <= 40) return 2;
  if (durationSeconds <= 90) return 5;
  return 10;
}

export const SampleAccuracyChart: React.FC<SampleAccuracyChartProps> = ({
  samples,
  majorityThreshold = DEFAULT_MAJORITY_THRESHOLD,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(FALLBACK_WIDTH);

  // The x-axis always spans the full width of its container — measure it (and
  // track resizes) rather than picking a fixed px-per-second, so pxPerSecond
  // below is recomputed to fit whatever room is actually available.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setChartWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (samples.length === 0) return null;

  const durationSeconds = samples[samples.length - 1].t;
  const pxPerSecond = durationSeconds > 0 ? chartWidth / durationSeconds : chartWidth;

  const tickInterval = pickTickIntervalSeconds(durationSeconds);
  const timeTicks: number[] = [];
  for (let t = 0; t <= durationSeconds; t += tickInterval) timeTicks.push(t);

  // The exact same per-note pass/fail verdicts the score was computed from, keyed by
  // noteOnsetBeat - reused here instead of approximating separately, so the chart's
  // colors can never disagree with the number above it.
  const noteVerdicts = voteNoteInstances(samples, majorityThreshold);

  // Groups consecutive samples belonging to the same note (or rest) instance, so the
  // x-axis can mark exactly where each new note was expected to start.
  interface NoteSegment {
    t: number;
    expectedNote: string | null; // null for a rest
    isCorrect: boolean; // looked up from noteVerdicts, not recomputed
  }
  const noteSegments: NoteSegment[] = [];
  let segmentStart = 0;
  const instanceKeyOf = (s: ScoreSample) => (s.isRest ? 'rest' : `note-${s.noteOnsetBeat}`);
  for (let i = 1; i <= samples.length; i++) {
    const endsHere = i === samples.length || instanceKeyOf(samples[i]) !== instanceKeyOf(samples[segmentStart]);
    if (!endsHere) continue;
    const first = samples[segmentStart];
    noteSegments.push({
      t: first.t,
      expectedNote: first.isRest ? null : first.expectedNote,
      isCorrect: first.isRest || first.noteOnsetBeat === null ? false : noteVerdicts.get(first.noteOnsetBeat) ?? false,
    });
    segmentStart = i;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Sample Accuracy Over Time
        </span>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Correct
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Wrong
          </span>
        </div>
      </div>

      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex gap-1.5">
          {/* Y-axis: cents off from the target pitch (folded to nearest octave). Fixed, doesn't scroll. */}
          <div
            className="flex flex-col justify-between text-[9px] font-mono text-slate-400 dark:text-slate-600 text-right shrink-0"
            style={{ height: CHART_HEIGHT }}
          >
            <span>+{CENTS_RANGE}c</span>
            <span>0c</span>
            <span>-{CENTS_RANGE}c</span>
          </div>

          {/* X-axis: real elapsed time in seconds, stretched to fill the available width. */}
          <div ref={containerRef} className="flex-1 min-w-0">
            <svg width={chartWidth} height={SVG_HEIGHT} viewBox={`0 0 ${chartWidth} ${SVG_HEIGHT}`} className="block">
              {/* Zero-cents (in-tune) reference line */}
              <line
                x1={0}
                y1={CENTER_Y}
                x2={chartWidth}
                y2={CENTER_Y}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth={1}
              />

              {/* Note-boundary markers: where each new note (or rest) was expected to start,
                  so a run of errors can be lined up against the note timeline. */}
              {noteSegments.map((segment, i) => (
                <line
                  key={`boundary-${i}`}
                  x1={segment.t * pxPerSecond}
                  y1={0}
                  x2={segment.t * pxPerSecond}
                  y2={CHART_HEIGHT}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth={1}
                  strokeDasharray="2,3"
                />
              ))}

              {samples.map((sample, i) => {
                const x = sample.t * pxPerSecond;

                if (!sample.isCorrect) {
                  // A wrong note (or silence when a note was expected) isn't a matter of
                  // "how many cents off" — it's a different note entirely, so a bar
                  // positioned by centsOff would either be meaningless (no signal) or
                  // clamped to a spot on the intonation axis that doesn't mean anything.
                  // Mark it as its own kind of event instead: a dot on the axis.
                  return <circle key={i} cx={x + BAR_WIDTH / 2} cy={CENTER_Y} r={DOT_RADIUS} fill="#f43f5e" /* rose-500 */ />;
                }

                if (sample.centsOff === null) {
                  // Correctly resting (silence expected and silence played) — nothing to plot.
                  return <circle key={i} cx={x + BAR_WIDTH / 2} cy={CENTER_Y} r={DOT_RADIUS} fill="#10b981" /* emerald-500 */ opacity={0.5} />;
                }

                const clamped = Math.max(-CENTS_RANGE, Math.min(CENTS_RANGE, sample.centsOff));
                const barY = CENTER_Y - (clamped / CENTS_RANGE) * CENTER_Y;
                const y = Math.min(CENTER_Y, barY);
                const height = Math.abs(barY - CENTER_Y);

                return <rect key={i} x={x} y={y} width={BAR_WIDTH} height={Math.max(height, 1)} fill="#10b981" /* emerald-500 */ />;
              })}

              {/* Expected-note label at the start of every note instance, colored by whether
                  that instance was mostly played correctly - green for correct, red for wrong. */}
              {noteSegments.map((segment, i) => {
                if (!segment.expectedNote) return null; // rests aren't labeled

                const x = segment.t * pxPerSecond;
                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y={10}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor={x < 12 ? 'start' : 'middle'}
                    className={segment.isCorrect ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}
                  >
                    {segment.expectedNote}
                  </text>
                );
              })}

              {/* Time-axis ticks */}
              <line
                x1={0}
                y1={CHART_HEIGHT}
                x2={chartWidth}
                y2={CHART_HEIGHT}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth={1}
              />
              {timeTicks.map((t) => {
                const x = t * pxPerSecond;
                // Anchor the end ticks inward so their labels don't clip past the chart edge.
                const anchor = x < 10 ? 'start' : x > chartWidth - 10 ? 'end' : 'middle';
                return (
                  <text
                    key={t}
                    x={x}
                    y={CHART_HEIGHT + 12}
                    fontSize={9}
                    fontFamily="monospace"
                    textAnchor={anchor}
                    className="fill-slate-400 dark:fill-slate-600"
                  >
                    {t}s
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
