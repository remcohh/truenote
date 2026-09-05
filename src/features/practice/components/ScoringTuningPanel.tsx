import { SlidersHorizontal } from 'lucide-react';
import { CardHeader } from '../../../components/CardHeader';
import {
  DEFAULT_RELEASE_WINDOW_FRACTION,
  DEFAULT_STALE_PITCH_MS,
  DEFAULT_INTONATION_TOLERANCE_CENTS,
  DEFAULT_MAJORITY_THRESHOLD,
  DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION,
} from '../utils/sampleEvaluation';

interface ScoringTuningPanelProps {
  releaseWindowFraction: number;
  onReleaseWindowFractionChange: (fraction: number) => void;
  stalePitchMs: number;
  onStalePitchMsChange: (ms: number) => void;
  intonationToleranceCents: number;
  onIntonationToleranceCentsChange: (cents: number) => void;
  majorityThreshold: number;
  onMajorityThresholdChange: (fraction: number) => void;
  voteBoundaryMarginFraction: number;
  onVoteBoundaryMarginFractionChange: (fraction: number) => void;
}

/**
 * Dev-facing controls for the scoring constants in sampleEvaluation.ts. Lets you
 * hear/see the effect of a value live during practice instead of editing code and
 * restarting — these numbers were chosen to feel right, not derived, so they're
 * expected to keep being tuned by ear.
 */
export function ScoringTuningPanel({
  releaseWindowFraction,
  onReleaseWindowFractionChange,
  stalePitchMs,
  onStalePitchMsChange,
  intonationToleranceCents,
  onIntonationToleranceCentsChange,
  majorityThreshold,
  onMajorityThresholdChange,
  voteBoundaryMarginFraction,
  onVoteBoundaryMarginFractionChange,
}: ScoringTuningPanelProps) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-lg flex flex-col gap-5 min-w-0">
      <CardHeader
        icon={<SlidersHorizontal size={18} />}
        iconColorClass="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30"
        title="Scoring Tuning"
        subtitle="Live-adjust how the pitch sampler decides right vs. wrong"
      />

      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="release-window-slider" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Release window
          </label>
          <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400 font-mono">
            {Math.round(releaseWindowFraction * 100)}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Last portion of a note's duration where silence also counts as correct.
        </p>
        <input
          id="release-window-slider"
          type="range"
          min="0"
          max="50"
          step="1"
          value={Math.round(releaseWindowFraction * 100)}
          onChange={(e) => onReleaseWindowFractionChange(parseInt(e.target.value, 10) / 100)}
          className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
        />
        {releaseWindowFraction !== DEFAULT_RELEASE_WINDOW_FRACTION && (
          <button
            onClick={() => onReleaseWindowFractionChange(DEFAULT_RELEASE_WINDOW_FRACTION)}
            className="self-start text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset to default ({Math.round(DEFAULT_RELEASE_WINDOW_FRACTION * 100)}%)
          </button>
        )}
      </div>

      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="stale-pitch-slider" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Pitch staleness tolerance
          </label>
          <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400 font-mono">
            {stalePitchMs}ms
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          How old a mic detection can be and still count as "currently sounding".
        </p>
        <input
          id="stale-pitch-slider"
          type="range"
          min="0"
          max="500"
          step="10"
          value={stalePitchMs}
          onChange={(e) => onStalePitchMsChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
        />
        {stalePitchMs !== DEFAULT_STALE_PITCH_MS && (
          <button
            onClick={() => onStalePitchMsChange(DEFAULT_STALE_PITCH_MS)}
            className="self-start text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset to default ({DEFAULT_STALE_PITCH_MS}ms)
          </button>
        )}
      </div>

      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="intonation-tolerance-slider" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Intonation tolerance
          </label>
          <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400 font-mono">
            ±{intonationToleranceCents}c
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          How close (in cents) a correctly-played note must land to its target pitch to count toward the intonation score.
        </p>
        <input
          id="intonation-tolerance-slider"
          type="range"
          min="1"
          max="50"
          step="1"
          value={intonationToleranceCents}
          onChange={(e) => onIntonationToleranceCentsChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
        />
        {intonationToleranceCents !== DEFAULT_INTONATION_TOLERANCE_CENTS && (
          <button
            onClick={() => onIntonationToleranceCentsChange(DEFAULT_INTONATION_TOLERANCE_CENTS)}
            className="self-start text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset to default (±{DEFAULT_INTONATION_TOLERANCE_CENTS}c)
          </button>
        )}
      </div>

      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="majority-threshold-slider" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Note majority threshold
          </label>
          <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400 font-mono">
            {Math.round(majorityThreshold * 100)}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Share of a note's samples that must be pitch-correct for the whole note to count as correct.
        </p>
        <input
          id="majority-threshold-slider"
          type="range"
          min="50"
          max="100"
          step="1"
          value={Math.round(majorityThreshold * 100)}
          onChange={(e) => onMajorityThresholdChange(parseInt(e.target.value, 10) / 100)}
          className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
        />
        {majorityThreshold !== DEFAULT_MAJORITY_THRESHOLD && (
          <button
            onClick={() => onMajorityThresholdChange(DEFAULT_MAJORITY_THRESHOLD)}
            className="self-start text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset to default ({Math.round(DEFAULT_MAJORITY_THRESHOLD * 100)}%)
          </button>
        )}
      </div>

      <div className="bg-slate-200/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="vote-boundary-margin-slider" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Note boundary margin
          </label>
          <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400 font-mono">
            {Math.round(voteBoundaryMarginFraction * 100)}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Portion of a note's duration, at each end, excluded from its majority vote — forgives a note started
          slightly early/late or released slightly early.
        </p>
        <input
          id="vote-boundary-margin-slider"
          type="range"
          min="0"
          max="30"
          step="1"
          value={Math.round(voteBoundaryMarginFraction * 100)}
          onChange={(e) => onVoteBoundaryMarginFractionChange(parseInt(e.target.value, 10) / 100)}
          className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
        />
        {voteBoundaryMarginFraction !== DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION && (
          <button
            onClick={() => onVoteBoundaryMarginFractionChange(DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION)}
            className="self-start text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset to default ({Math.round(DEFAULT_VOTE_BOUNDARY_MARGIN_FRACTION * 100)}%)
          </button>
        )}
      </div>
    </div>
  );
}
