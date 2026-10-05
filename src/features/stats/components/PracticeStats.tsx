import React from 'react';
import type { PracticeSession } from '../../../types';
import { Clock, Trophy, Flame, Database, Trash2, CheckCircle2, Zap, Calendar, Target } from 'lucide-react';
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
  const avgIntonationScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.intonationScore || 0), 0) / sessions.length)
      : 0;

  return (
    <div className="practice-stats-container flex flex-col gap-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={<Clock size={22} />}
          label="Practice Time"
          value={totalMinutes}
          unit="mins"
        />
        <StatTile
          icon={<Flame size={22} />}
          label="Sessions Drilled"
          value={sessions.length}
        />
        <StatTile
          icon={<Trophy size={22} />}
          label="Avg Note Accuracy"
          value={`${avgScore}%`}
        />
        <StatTile
          icon={<Target size={22} />}
          label="Avg Intonation"
          value={`${avgIntonationScore}%`}
        />
      </div>

      {/* History Log Table */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Database size={17} className="text-slate-700 dark:text-slate-300" />
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
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                      <Zap size={12} /> {session.bpm} BPM
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                      <Clock size={12} /> {session.durationSeconds}s
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Calendar size={12} /> {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Scores & PocketBase Sync Badge */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold font-mono px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {session.score}% notes
                  </span>

                  <span className="text-xs font-semibold font-mono px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {session.intonationScore || 0}% tuning
                  </span>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200 dark:border-slate-700 ${
                      session.syncedToPocketBase
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {session.syncedToPocketBase ? (
                      <>
                        <CheckCircle2 size={11} className="text-slate-700 dark:text-slate-300" /> Synced
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

