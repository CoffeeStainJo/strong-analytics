import React from 'react';
import { WorkoutSession } from '../../types/workout';
import { Calendar } from 'lucide-react';

interface ExerciseHistoryProps {
  exerciseName: string;
  sessions: WorkoutSession[];
}

export const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({
  exerciseName,
  sessions,
}) => {
  // Filter sessions that included this exercise (newest first for log view)
  const sessionsWithExercise = [...sessions]
    .reverse()
    .filter((s) => s.exercises.some((e) => e.name === exerciseName));

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7">
      <div className="border-b border-white/10 pb-4 mb-5">
        <h3 className="text-lg font-bold text-white tracking-tight font-heading">
          SET LOG & CUE HISTORY
        </h3>
        <p className="text-xs text-slate-400">
          Chronological breakdown of every recorded set for {exerciseName}
        </p>
      </div>

      <div className="space-y-4">
        {sessionsWithExercise.map((session) => {
          const exercise = session.exercises.find((e) => e.name === exerciseName);
          if (!exercise) return null;

          return (
            <div
              key={session.id}
              className="bg-slate-900/60 border border-white/5 rounded-xl p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{session.dateStr}</span>
                  </div>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {session.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>Vol: {exercise.totalVolume} kg</span>
                  <span>Peak e1RM: {exercise.peakE1RM} kg</span>
                </div>
              </div>

              {/* Set Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-wider border-b border-white/5 text-[10px]">
                      <th className="py-1.5 pl-1 font-bold">Set</th>
                      <th className="py-1.5 font-bold">Weight</th>
                      <th className="py-1.5 font-bold">Reps</th>
                      <th className="py-1.5 font-bold">e1RM</th>
                      <th className="py-1.5 font-bold">RPE</th>
                      <th className="py-1.5 font-bold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {exercise.sets.map((set, idx) => {
                      const isWarmup = set.type === 'warmup';
                      const isDrop = set.type === 'dropset';
                      const isFailure = set.type === 'failure';
                      const isRest = set.type === 'rest_timer';

                      return (
                        <tr key={idx} className="hover:bg-white/5 transition">
                          <td className="py-2 pl-1 font-bold">
                            {isWarmup && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                W
                              </span>
                            )}
                            {isDrop && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                D
                              </span>
                            )}
                            {isFailure && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                F
                              </span>
                            )}
                            {isRest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-500/20 text-slate-400">
                                REST
                              </span>
                            )}
                            {!isWarmup && !isDrop && !isFailure && !isRest && (
                              <span className="text-slate-400 font-mono">
                                #{set.order || idx + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-2 font-mono font-semibold">
                            {isRest ? '-' : `${set.weight} kg`}
                          </td>
                          <td className="py-2 font-mono font-semibold">
                            {isRest ? '-' : set.reps}
                          </td>
                          <td className="py-2 font-mono text-cyan-400">
                            {set.e1RM > 0 ? `${set.e1RM} kg` : '-'}
                          </td>
                          <td className="py-2 font-mono text-slate-400">
                            {set.rpe ? `@${set.rpe}` : '-'}
                          </td>
                          <td className="py-2 text-slate-400 italic max-w-xs truncate">
                            {set.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
