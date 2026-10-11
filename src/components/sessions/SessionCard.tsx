import React, { useState } from 'react';
import { WorkoutSession } from '../../types/workout';
import { ChevronDown, ChevronUp, Clock, Dumbbell, FileText, Layers } from 'lucide-react';
import { formatKg } from '../../lib/metrics';

interface SessionCardProps {
  session: WorkoutSession;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 transition-all border border-white/10 hover:border-white/20">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {session.dateStr}
              </span>
              {session.notes && (
                <span title="Has Session Notes">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight font-heading mt-0.5">
              {session.name}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {session.exercises.map((ex, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900/80 text-slate-300 border border-white/5"
                >
                  {ex.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
            <span className="text-sm font-semibold text-slate-200 flex items-center sm:justify-end space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{session.rawDuration}</span>
            </span>
          </div>

          <div className="text-left sm:text-right border-l border-white/10 pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tonnage</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center sm:justify-end space-x-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatKg(session.totalVolume)}</span>
            </span>
          </div>

          <button
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition ml-2"
            aria-label="Toggle Session Details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Workout Breakdown */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-white/10 space-y-5 animate-in fade-in duration-200">
          {session.notes && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-400 mb-0.5">
                Session Notes:
              </span>
              <p className="whitespace-pre-wrap">{session.notes}</p>
            </div>
          )}

          <div className="space-y-4">
            {session.exercises.map((exercise, exIdx) => (
              <div
                key={exIdx}
                className="bg-slate-900/60 rounded-xl p-4 border border-white/5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <span className="font-bold text-sm text-white font-heading">
                    {exercise.name}
                  </span>
                  <div className="text-xs text-slate-400 space-x-3">
                    <span>Vol: {formatKg(exercise.totalVolume)}</span>
                    {exercise.peakE1RM > 0 && (
                      <span className="text-cyan-400">Peak e1RM: {exercise.peakE1RM} kg</span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 text-[10px] uppercase font-bold border-b border-white/5">
                        <th className="py-1">Set</th>
                        <th className="py-1">Weight</th>
                        <th className="py-1">Reps</th>
                        <th className="py-1">e1RM</th>
                        <th className="py-1">RPE</th>
                        <th className="py-1">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {exercise.sets.map((set, sIdx) => {
                        const isWarmup = set.type === 'warmup';
                        const isDrop = set.type === 'dropset';
                        const isFailure = set.type === 'failure';
                        const isRest = set.type === 'rest_timer';

                        return (
                          <tr key={sIdx} className="hover:bg-white/5 transition">
                            <td className="py-1.5 font-bold">
                              {isWarmup && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  W
                                </span>
                              )}
                              {isDrop && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  D
                                </span>
                              )}
                              {isFailure && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  F
                                </span>
                              )}
                              {isRest && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-500/20 text-slate-400">
                                  REST
                                </span>
                              )}
                              {!isWarmup && !isDrop && !isFailure && !isRest && (
                                <span className="text-slate-400 font-mono">
                                  #{set.order || sIdx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 font-mono font-semibold">
                              {isRest ? '-' : `${set.weight} kg`}
                            </td>
                            <td className="py-1.5 font-mono font-semibold">
                              {isRest ? '-' : set.reps}
                            </td>
                            <td className="py-1.5 font-mono text-cyan-400">
                              {set.e1RM > 0 ? `${set.e1RM} kg` : '-'}
                            </td>
                            <td className="py-1.5 font-mono text-slate-400">
                              {set.rpe ? `@${set.rpe}` : '-'}
                            </td>
                            <td className="py-1.5 text-slate-400 italic max-w-xs truncate">
                              {set.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
