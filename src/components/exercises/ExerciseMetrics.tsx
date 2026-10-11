import React from 'react';
import { ExercisePlateauReport } from '../../types/workout';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Wrench,
  Trophy,
  EyeOff,
  Eye,
} from 'lucide-react';

interface ExerciseMetricsProps {
  report: ExercisePlateauReport;
  onToggleIgnore?: (exerciseName: string) => void;
}

export const ExerciseMetrics: React.FC<ExerciseMetricsProps> = ({
  report,
  onToggleIgnore,
}) => {
  const isPlateau = report.status === 'plateaued';
  const isRegressing = report.status === 'regressing';
  const isProgressing = report.status === 'progressing';

  return (
    <div
      className={`glass-panel rounded-2xl p-6 sm:p-7 mb-6 transition-all ${
        report.isIgnored
          ? 'border-dashed border-slate-700 opacity-90'
          : isPlateau
          ? 'border-amber-500/40 shadow-glow-gold'
          : isRegressing
          ? 'border-rose-500/40'
          : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            MOVEMENT PROFILE
          </span>
          <div className="flex items-center space-x-3 mt-0.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              {report.exerciseName}
            </h2>
            {report.isIgnored && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MUTED / IGNORED
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onToggleIgnore && (
            <button
              onClick={() => onToggleIgnore(report.exerciseName)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                report.isIgnored
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
              }`}
              title={report.isIgnored ? 'Restore to active radar and stats' : 'Mute from active radar and alerts'}
            >
              {report.isIgnored ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Unmute / Restore</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ignore / Mute</span>
                </>
              )}
            </button>
          )}

          {!report.isActive ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              <span>DORMANT (LAST LOGGED {report.daysSinceLastPerformed}D AGO)</span>
            </span>
          ) : isPlateau ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow-gold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STALLED ({report.stalledSessionsCount} SESSIONS)</span>
            </span>
          ) : isRegressing ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow-rose">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>FATIGUED / REGRESSING</span>
            </span>
          ) : isProgressing ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PROGRESSING</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-500/20 text-slate-300 border border-white/10">
              <span>BASELINE</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Key Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Current e1RM
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-cyan-400 mt-1">
            {report.currentE1RM} <span className="text-xs font-normal text-slate-400">KG</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Epley theoretical 1RM</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Peak All-Time e1RM</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-400 mt-1">
            {report.peakHistoricalE1RM} <span className="text-xs font-normal text-slate-400">KG</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Historical benchmark</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Last Top Set
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
            {report.lastTopWeight} <span className="text-xs font-normal text-slate-400">KG</span>{' '}
            <span className="text-slate-500 text-lg">×</span> {report.lastTopReps}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Heavy working set</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Sessions
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-heading text-teal-400 mt-1">
            {report.historySummary.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Times performed</p>
        </div>
      </div>

      {/* Action Recommendation Box */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-start space-x-3">
        <Wrench
          className={`w-5 h-5 mt-0.5 shrink-0 ${
            isPlateau ? 'text-amber-400' : isRegressing ? 'text-rose-400' : 'text-cyan-400'
          }`}
        />
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Programmer / Deload Recommendation:
          </div>
          <div className="text-sm font-medium text-slate-200 mt-0.5">
            {report.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
};
