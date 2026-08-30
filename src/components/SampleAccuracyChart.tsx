import React from 'react';
import type { ScoreSample } from '../types';

interface SampleAccuracyChartProps {
  samples: ScoreSample[];
}

const CHART_HEIGHT = 120;
const CENTER_Y = CHART_HEIGHT / 2;
const CENTS_RANGE = 600; // chart spans -600..+600 folded cents
const AXIS_LABEL_HEIGHT = 16;
const SVG_HEIGHT = CHART_HEIGHT + AXIS_LABEL_HEIGHT;
const PX_PER_SECOND = 40; // x-axis is real elapsed time, not sample index
const BAR_WIDTH = 3;
const NO_SIGNAL_TICK = 4; // px, half-height of the flat marker drawn when there's no pitch data

/** Picks a readable tick spacing (in seconds) given the total duration. */
function pickTickIntervalSeconds(durationSeconds: number): number {
  if (durationSeconds <= 15) return 1;
  if (durationSeconds <= 40) return 2;
  if (durationSeconds <= 90) return 5;
  return 10;
}

export const SampleAccuracyChart: React.FC<SampleAccuracyChartProps> = ({ samples }) => {
  if (samples.length === 0) return null;

  const durationSeconds = samples[samples.length - 1].t;
  const chartWidth = Math.max(durationSeconds * PX_PER_SECOND + BAR_WIDTH, 260);

  const tickInterval = pickTickIntervalSeconds(durationSeconds);
  const timeTicks: number[] = [];
  for (let t = 0; t <= durationSeconds; t += tickInterval) timeTicks.push(t);

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

          {/* X-axis: real elapsed time in seconds. Scrolls together with the bars. */}
          <div className="overflow-x-auto">
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

              {samples.map((sample, i) => {
                const x = sample.t * PX_PER_SECOND;
                const color = sample.isCorrect ? '#10b981' /* emerald-500 */ : '#f43f5e' /* rose-500 */;

                if (sample.centsOff === null) {
                  // No pitch detected this instant — draw a flat marker at the center
                  // line rather than implying an extreme cents value.
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={CENTER_Y - NO_SIGNAL_TICK / 2}
                      width={BAR_WIDTH}
                      height={NO_SIGNAL_TICK}
                      fill={color}
                      opacity={0.5}
                    />
                  );
                }

                const clamped = Math.max(-CENTS_RANGE, Math.min(CENTS_RANGE, sample.centsOff));
                const barY = CENTER_Y - (clamped / CENTS_RANGE) * CENTER_Y;
                const y = Math.min(CENTER_Y, barY);
                const height = Math.abs(barY - CENTER_Y);

                return <rect key={i} x={x} y={y} width={BAR_WIDTH} height={Math.max(height, 1)} fill={color} />;
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
                const x = t * PX_PER_SECOND;
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
