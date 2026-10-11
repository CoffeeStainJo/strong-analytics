import React, { useState } from 'react';
import { ExercisePlateauReport } from '../../types/workout';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Wrench,
  Archive,
  Clock,
  EyeOff,
  Eye,
} from 'lucide-react';

interface PlateauRadarProps {
  plateauReports: ExercisePlateauReport[];
  onSelectExercise: (exerciseName: string) => void;
  onToggleIgnore: (exerciseName: string) => void;
}

export const PlateauRadar: React.FC<PlateauRadarProps> = ({
  plateauReports,
  onSelectExercise,
  onToggleIgnore,
}) => {
  const [showDormant, setShowDormant] = useState(false);
  const [showIgnored, setShowIgnored] = useState(false);

  // Active, unignored stalled lifts: performed within the last 90 days and not hidden
  const activeAlerts = plateauReports.filter(
    (r) => r.isActive && !r.isIgnored && (r.status === 'plateaued' || r.status === 'regressing')
  );

  const ignoredAlerts = plateauReports.filter(
    (r) => r.isIgnored && (r.status === 'plateaued' || r.status === 'regressing')
  );

  const dormantAlerts = plateauReports.filter(
    (r) => !r.isActive && !r.isIgnored && (r.status === 'plateaued' || r.status === 'regressing')
  );

  let displayedList = [...activeAlerts];
  if (showIgnored) displayedList = [...displayedList, ...ignoredAlerts];
  if (showDormant) displayedList = [...displayedList, ...dormantAlerts];

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-5 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow-gold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                PLATEAU & INTERVENTION RADAR
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ACTIVE (LAST 90 DAYS)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active movements flagged for stagnation or elevated fatigue requiring programming intervention
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {ignoredAlerts.length > 0 && (
            <button
              onClick={() => setShowIgnored(!showIgnored)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                showIgnored
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/10'
              }`}
              title="Toggle exercises you've explicitly ignored"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>
                {showIgnored ? 'Hide Ignored' : `Show ${ignoredAlerts.length} Ignored`}
              </span>
            </button>
          )}

          {dormantAlerts.length > 0 && (
            <button
              onClick={() => setShowDormant(!showDormant)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 transition"
              title="Toggle older dormant lifts not performed in >90 days"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                {showDormant
                  ? 'Hide Dormant'
                  : `Show ${dormantAlerts.length} Dormant`}
              </span>
            </button>
          )}

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            {activeAlerts.length} {activeAlerts.length === 1 ? 'Active Alert' : 'Active Alerts'}
          </span>
        </div>
      </div>

      {displayedList.length === 0 ? (
        <div className="py-8 text-center bg-slate-900/40 rounded-xl border border-white/5">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
          <h4 className="text-base font-bold text-white">No Active Plateaus Detected</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            All active exercises performed within the last 90 days are progressing normally without stagnation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map((item) => {
            const isPlateau = item.status === 'plateaued';
            const isDormant = !item.isActive;
            const isIgnored = item.isIgnored;

            return (
              <div
                key={item.exerciseName}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  isIgnored
                    ? 'bg-slate-950/80 border-dashed border-slate-700 opacity-75'
                    : isDormant
                    ? 'bg-slate-900/60 border-slate-700/50 opacity-80'
                    : isPlateau
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-glow-gold'
                    : 'bg-rose-500/10 border-rose-500/40 shadow-glow-rose'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-white tracking-tight font-heading">
                        {item.exerciseName}
                      </span>
                      {isIgnored && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          IGNORED
                        </span>
                      )}
                      {!isIgnored && isDormant && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          DORMANT
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
                        isPlateau
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isPlateau ? (
                        `STALLED (${item.stalledSessionsCount} SESSIONS)`
                      ) : (
                        <span className="flex items-center space-x-1">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          FATIGUED / REGRESSING
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Top Set Metrics */}
                  <div className="flex items-center space-x-4 my-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Top Working Set
                      </span>
                      <span className="font-extrabold text-white text-sm">
                        {item.lastTopWeight} kg × {item.lastTopReps} reps
                      </span>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Current e1RM
                      </span>
                      <span className="font-extrabold text-cyan-400 text-sm">
                        {item.currentE1RM} kg
                      </span>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Last Logged
                      </span>
                      <span className="font-semibold text-slate-300 text-xs flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.daysSinceLastPerformed}d ago</span>
                      </span>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className="mt-3 flex items-start space-x-2 text-xs text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10">
                    <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-400 block text-[11px] uppercase">
                        Actionable Fix:
                      </span>
                      <p className="mt-0.5 text-slate-300 leading-relaxed">
                        {item.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  {/* Ignore / Restore Action */}
                  <button
                    onClick={() => onToggleIgnore(item.exerciseName)}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-300 transition"
                    title={isIgnored ? "Restore this exercise to active radar" : "Ignore/hide this exercise from radar"}
                  >
                    {isIgnored ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restore to Radar</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ignore Exercise</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectExercise(item.exerciseName)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <span>View Progression Chart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
