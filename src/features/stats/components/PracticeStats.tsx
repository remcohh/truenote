import React from 'react';
import type { PracticeSession } from '../../../types';
import { Clock, Trophy, Flame, Database, Trash2, CheckCircle2, Zap, Calendar } from 'lucide-react';
import { StatTile } from '../../../components/StatTile';

interface PracticeStatsProps {
  sessions: PracticeSession[];
  onClearSessions?: () => void;
}

export const PracticeStats: React.FC<PracticeStatsProps> = ({ sessions, onClearSessions }) => {
  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length)
      : 0;

  return (
    <div className="practice-stats-container flex flex-col gap-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          icon={<Clock size={22} />}
          iconColorClass="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20"
          label="Practice Time"
          value={totalMinutes}
          unit="mins"
        />
        <StatTile
          icon={<Flame size={22} />}
          iconColorClass="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20"
          label="Sessions Drilled"
          value={sessions.length}
        />
        <StatTile
          icon={<Trophy size={22} />}
          iconColorClass="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
          label="Avg Accuracy"
          value={`${avgScore}%`}
          valueColorClass="text-teal-600 dark:text-teal-400"
        />
      </div>

      {/* History Log Table */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Database size={17} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Practice Session Logs</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {sessions.length}
            </span>
          </div>
          {sessions.length > 0 && onClearSessions && (
            <button
              onClick={onClearSessions}
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1.5 transition font-semibold"
            >
              <Trash2 size={13} /> Clear Logs
            </button>
          )}
        </div>

        {/* List Content */}
        {sessions.length === 0 ? (
          <div className="py-14 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
            No practice sessions recorded yet. Start practicing to log your metrics!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-[420px] overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Title & Metadata */}
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{session.exerciseTitle}</h5>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Zap size={12} /> {session.bpm} BPM
                    </span>
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                      <Clock size={12} /> {session.durationSeconds}s
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Calendar size={12} /> {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Score & PocketBase Sync Badge */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                      session.score >= 85
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                        : session.score >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                        : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
                    }`}
                  >
                    {session.score}% accuracy
                  </span>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      session.syncedToPocketBase
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {session.syncedToPocketBase ? (
                      <>
                        <CheckCircle2 size={11} className="text-indigo-600 dark:text-indigo-400" /> Synced
                      </>
                    ) : (
                      'Local'
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

