import React from 'react';
import { Trophy, Clock, Activity, CheckCircle2, X, BarChart3, RotateCcw, Sparkles } from 'lucide-react';
import type { PracticeSession, ScoreSample } from '../../../types';
import { SampleAccuracyChart } from './SampleAccuracyChart';
import { StatTile } from '../../../components/StatTile';

interface PracticeCompleteModalProps {
  session: PracticeSession | null;
  exerciseTitle: string;
  samples: ScoreSample[];
  onClose: () => void;
  onViewStats: () => void;
}

export const PracticeCompleteModal: React.FC<PracticeCompleteModalProps> = ({
  session,
  exerciseTitle,
  samples,
  onClose,
  onViewStats,
}) => {
  if (!session) return null;

  // Grade classification helper
  const getGradeInfo = (score: number) => {
    if (score >= 90) return { label: 'Outstanding!', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 75) return { label: 'Great Job!', color: 'text-teal-500 bg-teal-500/10 border-teal-500/30' };
    if (score >= 60) return { label: 'Good Effort!', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Keep Practicing!', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const grade = getGradeInfo(session.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card max-w-4xl w-full p-8 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {/* Celebration Trophy Badge */}
        <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400 via-teal-500 to-indigo-600 blur-lg opacity-40 animate-pulse" />
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 via-teal-500 to-indigo-600 p-0.5 shadow-xl shadow-teal-500/20 relative">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Trophy size={36} />
            </div>
          </div>
        </div>

        {/* Headline & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wider mb-2.5 shadow-sm">
            <Sparkles size={13} className="text-amber-500" />
            <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Practice Complete
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Session Recorded!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
            {exerciseTitle}
          </p>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Accuracy Score Card */}
          <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center relative overflow-hidden">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pitch Tuner Accuracy
            </span>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              <span className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight font-mono">
                {session.score}%
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${grade.color}`}>
                {grade.label}
              </span>
            </div>
          </div>

          <StatTile
            size="sm"
            icon={<Activity size={18} />}
            iconColorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            label="Tempo"
            value={session.bpm}
            unit="BPM"
          />
          <StatTile
            size="sm"
            icon={<Clock size={18} />}
            iconColorClass="bg-teal-500/10 text-teal-600 dark:text-teal-400"
            label="Time"
            value={`${session.durationSeconds}s`}
          />
        </div>

        {/* Per-Sample Accuracy Chart */}
        <SampleAccuracyChart samples={samples} />

        {/* Sync Indicator Pill */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold mb-6">
          <CheckCircle2 size={14} /> Saved & Synced to Practice Log
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} /> Practice Again
          </button>
          <button
            onClick={() => {
              onClose();
              onViewStats();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <BarChart3 size={15} /> View Full Stats
          </button>
        </div>
      </div>
    </div>
  );
};
