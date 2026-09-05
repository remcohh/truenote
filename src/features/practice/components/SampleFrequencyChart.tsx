import React, { useEffect, useRef, useState } from 'react';
import type { ScoreSample } from '../../../types';
import { midiHalfToneToNoteName } from '../utils/noteParser';

interface SampleFrequencyChartProps {
  samples: ScoreSample[];
}

const CHART_HEIGHT = 280;
const AXIS_LABEL_HEIGHT = 16;
const SVG_HEIGHT = CHART_HEIGHT + AXIS_LABEL_HEIGHT;
const FALLBACK_WIDTH = 600; // used only for the first paint, before the container is measured
const DOT_RADIUS = 2;
const Y_AXIS_LABEL_WIDTH = 28;
// Semitones of headroom added above/below the detected pitch range, so the line never
// touches the very top/bottom edge of the chart.
const PITCH_PADDING_SEMITONES = 1;

/** Picks a readable tick spacing (in seconds) given the total duration. */
function pickTickIntervalSeconds(durationSeconds: number): number {
  if (durationSeconds <= 15) return 1;
  if (durationSeconds <= 40) return 2;
  if (durationSeconds <= 90) return 5;
  return 10;
}

/** Picks a readable semitone spacing between note-axis labels given the pitch span. */
function pickHalfToneTickInterval(spanSemitones: number): number {
  if (spanSemitones <= 12) return 1;
  if (spanSemitones <= 24) return 2;
  if (spanSemitones <= 48) return 4;
  return 6;
}

/** Continuous (fractional) MIDI half-tone for a frequency - the "sounding pitch" scale. */
function frequencyToHalfTone(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/**
 * Plots the raw mic-detected pitch (Hz) at every sampled instant, with no reference to
 * the expected note - a literal trace of what was actually played, gaps and all, as
 * opposed to SampleAccuracyChart's cents-off-from-target view.
 */
export const SampleFrequencyChart: React.FC<SampleFrequencyChartProps> = ({ samples }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(FALLBACK_WIDTH);

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

  const halfTones = samples
    .map((s) => s.playedFrequency)
    .filter((f): f is number => f !== null)
    .map(frequencyToHalfTone);

  if (halfTones.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Played Pitch Over Time
          </span>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-600">
          No pitch was detected during this session.
        </div>
      </div>
    );
  }

  // Pitch is perceived logarithmically in Hz, so the axis is scaled linearly in
  // semitones (a "sounding note" scale) rather than linearly in Hz - equal on-screen
  // distances then always represent the same musical interval.
  const rawMin = Math.min(...halfTones);
  const rawMax = Math.max(...halfTones);
  const minHalfTone = rawMin - PITCH_PADDING_SEMITONES;
  const maxHalfTone = Math.max(rawMax + PITCH_PADDING_SEMITONES, minHalfTone + 1);

  const durationSeconds = samples[samples.length - 1].t;
  const pxPerSecond = durationSeconds > 0 ? chartWidth / durationSeconds : chartWidth;

  const tickInterval = pickTickIntervalSeconds(durationSeconds);
  const timeTicks: number[] = [];
  for (let t = 0; t <= durationSeconds; t += tickInterval) timeTicks.push(t);

  const yFor = (halfTone: number) =>
    CHART_HEIGHT - ((halfTone - minHalfTone) / (maxHalfTone - minHalfTone)) * CHART_HEIGHT;

  // A gridline for every semitone in range, so the exact target pitch for any note
  // always has a line to read the trace against - not just whichever notes happen to
  // land on the sparser labeled-tick spacing below.
  const semitoneLines: number[] = [];
  for (let ht = Math.ceil(minHalfTone); ht <= maxHalfTone; ht++) semitoneLines.push(ht);

  // Note-axis labels: a readable subset of those semitones, at a spacing aligned to
  // clean multiples so e.g. octave-spaced ticks land on the same note letter.
  const halfToneTickInterval = pickHalfToneTickInterval(rawMax - rawMin);
  const firstTick = Math.ceil(minHalfTone / halfToneTickInterval) * halfToneTickInterval;
  const noteTicks: number[] = [];
  for (let ht = firstTick; ht <= maxHalfTone; ht += halfToneTickInterval) noteTicks.push(ht);

  // Times where a new note (or rest) instance starts, so the raw pitch trace can be
  // lined up against the note timeline the same way SampleAccuracyChart does.
  const noteStartTimes: number[] = [];
  const instanceKeyOf = (s: ScoreSample) => (s.isRest ? 'rest' : `note-${s.noteOnsetBeat}`);
  for (let i = 0; i < samples.length; i++) {
    if (i === 0 || instanceKeyOf(samples[i]) !== instanceKeyOf(samples[i - 1])) {
      noteStartTimes.push(samples[i].t);
    }
  }

  // Break the line into separate segments wherever a sample has no detected pitch, so
  // gaps in mic detection show up as gaps rather than being bridged by a straight line.
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const s of samples) {
    if (s.playedFrequency === null) {
      if (current.length > 0) segments.push(current);
      current = [];
      continue;
    }
    current.push({ x: s.t * pxPerSecond, y: yFor(frequencyToHalfTone(s.playedFrequency)) });
  }
  if (current.length > 0) segments.push(current);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Played Pitch Over Time
        </span>
      </div>

      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex gap-1.5">
          {/* Y-axis: sounding note name, on a scale linear in semitones. Fixed, doesn't scroll. */}
          <div className="relative shrink-0" style={{ height: CHART_HEIGHT, width: Y_AXIS_LABEL_WIDTH }}>
            {noteTicks.map((ht) => (
              <span
                key={ht}
                className="absolute right-0 -translate-y-1/2 text-[9px] font-mono text-slate-400 dark:text-slate-600 whitespace-nowrap"
                style={{ top: yFor(ht) }}
              >
                {midiHalfToneToNoteName(Math.round(ht))}
              </span>
            ))}
          </div>

          {/* X-axis: real elapsed time in seconds, stretched to fill the available width. */}
          <div ref={containerRef} className="flex-1 min-w-0">
            <svg width={chartWidth} height={SVG_HEIGHT} viewBox={`0 0 ${chartWidth} ${SVG_HEIGHT}`} className="block">
              {/* Note-axis gridlines: one per semitone, so any target pitch has an exact
                  line to read the trace against, not just the labeled ticks. */}
              {semitoneLines.map((ht) => (
                <line
                  key={`grid-${ht}`}
                  x1={0}
                  y1={yFor(ht)}
                  x2={chartWidth}
                  y2={yFor(ht)}
                  stroke="currentColor"
                  className={
                    noteTicks.includes(ht)
                      ? 'text-slate-200 dark:text-slate-800'
                      : 'text-slate-100 dark:text-slate-900'
                  }
                  strokeWidth={1}
                />
              ))}

              {/* Note-boundary markers: where each new note (or rest) was expected to start. */}
              {noteStartTimes.map((t, i) => (
                <line
                  key={`boundary-${i}`}
                  x1={t * pxPerSecond}
                  y1={0}
                  x2={t * pxPerSecond}
                  y2={CHART_HEIGHT}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth={1}
                  strokeDasharray="2,3"
                />
              ))}

              {segments.map((segment, i) => (
                <React.Fragment key={i}>
                  <polyline
                    points={segment.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#6366f1" /* indigo-500 */
                    strokeWidth={1.5}
                  />
                  {segment.map((p, j) => (
                    <circle key={j} cx={p.x} cy={p.y} r={DOT_RADIUS} fill="#6366f1" /* indigo-500 */ />
                  ))}
                </React.Fragment>
              ))}

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
