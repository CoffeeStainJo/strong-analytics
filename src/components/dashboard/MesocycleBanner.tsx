import React from 'react';
import { MesocycleReport } from '../../types/workout';
import { AlertCircle, CheckCircle2, Flame, ShieldAlert, Calendar, Edit3 } from 'lucide-react';

interface MesocycleBannerProps {
  mesocycle: MesocycleReport;
  onOpenSettings?: () => void;
}

export const MesocycleBanner: React.FC<MesocycleBannerProps> = ({
  mesocycle,
  onOpenSettings,
}) => {
  const weeks = Array.from({ length: mesocycle.totalWeeks }, (_, i) => i + 1);

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 transition-all ${
        mesocycle.isDeloadDue ? 'glass-panel-active' : 'glass-panel'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border flex items-center space-x-1.5 ${
                mesocycle.isDeloadDue
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-gold'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {mesocycle.isDeloadDue ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ACTION REQUIRED: DELOAD DUE</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MESOCYCLE ACCUMULATION PHASE</span>
                </>
              )}
            </span>

            {mesocycle.lastDeloadWeekStr && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Last Deload:</span>
                <span className="font-bold text-amber-300">{mesocycle.lastDeloadWeekStr}</span>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="p-0.5 text-slate-400 hover:text-cyan-300 transition"
                    title="Change Last Deload Date"
                  >
                    <Edit3 className="w-3 h-3 ml-0.5" />
                  </button>
                )}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 font-heading">
            TRAINING BLOCK:{' '}
            <span
              className={
                mesocycle.isDeloadDue
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400'
              }
            >
              WEEK {mesocycle.currentWeek} OF {mesocycle.totalWeeks}
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">{mesocycle.triggerReason}</p>
        </div>

        {/* Big Countdown / Status Stat */}
        <div className="flex items-center space-x-4 bg-brand-surface/90 border border-white/10 px-5 py-3.5 rounded-xl self-start md:self-auto">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Next Deload In
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              {mesocycle.isDeloadDue ? (
                <span className="text-amber-400">NOW</span>
              ) : (
                <span className="text-cyan-400">
                  {mesocycle.daysRemaining}{' '}
                  <span className="text-sm font-normal text-slate-400">DAYS</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mesocycle Segmented Weeks Tracker (Styled like the 2025-2028 cards in the user reference screenshot) */}
      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          6-Week Cadence Progression
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {weeks.map((weekNum) => {
            const isCompleted = weekNum < mesocycle.currentWeek;
            const isCurrent = weekNum === mesocycle.currentWeek;
            const isDeloadWeek = weekNum === mesocycle.totalWeeks;

            return (
              <div
                key={weekNum}
                className={`relative rounded-xl p-3 sm:p-4 text-center border transition-all ${
                  isCurrent && isDeloadWeek
                    ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold'
                    : isCurrent
                    ? 'bg-cyan-500/15 border-cyan-400/80 shadow-glow-cyan'
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                    : 'bg-slate-900/30 border-white/5 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  {isDeloadWeek ? 'Deload' : `Week ${weekNum}`}
                </div>
                <div
                  className={`text-lg sm:text-xl font-extrabold font-heading ${
                    isCurrent
                      ? isDeloadWeek
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  W{weekNum}
                </div>
                <div className="mt-1 text-[11px] font-medium flex items-center justify-center space-x-1">
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isCurrent && (
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                  <span className="text-[10px] text-slate-400">
                    {isCompleted
                      ? 'Done'
                      : isCurrent
                      ? isDeloadWeek
                        ? 'Deload Now'
                        : 'Active'
                      : 'Upcoming'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Action Bar */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900/70 border border-white/10 flex items-start space-x-3">
        <AlertCircle
          className={`w-5 h-5 mt-0.5 shrink-0 ${
            mesocycle.isDeloadDue ? 'text-amber-400' : 'text-cyan-400'
          }`}
        />
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Coach's Programming Directive:
          </div>
          <div className="text-sm font-medium text-slate-200 mt-0.5">
            {mesocycle.suggestedAction}
          </div>
        </div>
      </div>
    </div>
  );
};
