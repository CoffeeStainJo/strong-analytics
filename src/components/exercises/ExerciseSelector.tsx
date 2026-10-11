import React, { useState } from 'react';
import { Search, EyeOff } from 'lucide-react';
import { ExercisePlateauReport } from '../../types/workout';

interface ExerciseSelectorProps {
  plateauReports: ExercisePlateauReport[];
  selectedExercise: string;
  onSelect: (exerciseName: string) => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  plateauReports,
  selectedExercise,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'active' | 'all' | 'ignored'>('active');

  const activeCount = plateauReports.filter((r) => r.isActive && !r.isIgnored).length;
  const ignoredCount = plateauReports.filter((r) => r.isIgnored).length;

  const filtered = plateauReports.filter((item) => {
    const matchesSearch = item.exerciseName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'active') {
      return item.isActive && !item.isIgnored;
    }
    if (filterMode === 'ignored') {
      return item.isIgnored;
    }
    return true; // 'all'
  });

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            EXERCISES ({filtered.length})
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => setFilterMode('active')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                filterMode === 'active'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              All ({plateauReports.length})
            </button>
            {ignoredCount > 0 && (
              <button
                onClick={() => setFilterMode('ignored')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                  filterMode === 'ignored'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>Ignored ({ignoredCount})</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
        {filtered.map((item) => {
          const isSelected = item.exerciseName === selectedExercise;
          const isPlateau = item.status === 'plateaued' && item.isActive && !item.isIgnored;
          const isRegressing = item.status === 'regressing' && item.isActive && !item.isIgnored;

          return (
            <button
              key={item.exerciseName}
              onClick={() => onSelect(item.exerciseName)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                  : item.isIgnored
                  ? 'bg-slate-950/60 text-slate-500 border-dashed border-slate-700 hover:border-slate-500'
                  : item.isActive
                  ? 'bg-slate-900/60 text-slate-300 border-white/5 hover:border-white/20'
                  : 'bg-slate-950/60 text-slate-500 border-white/5 hover:border-white/20'
              }`}
            >
              <span>{item.exerciseName}</span>
              {isPlateau && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-glow-gold" title="Plateaued" />
              )}
              {isRegressing && (
                <span className="w-2 h-2 rounded-full bg-rose-400 shadow-glow-rose" title="Regressing" />
              )}
              {item.isIgnored && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Ignored
                </span>
              )}
              {!item.isIgnored && !item.isActive && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                  Dormant
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
