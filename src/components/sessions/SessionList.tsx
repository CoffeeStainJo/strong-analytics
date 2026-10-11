import React, { useState } from 'react';
import { WorkoutSession } from '../../types/workout';
import { SessionCard } from './SessionCard';
import { Search, Calendar } from 'lucide-react';

interface SessionListProps {
  sessions: WorkoutSession[];
}

export const SessionList: React.FC<SessionListProps> = ({ sessions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState<string>('ALL');

  // Extract unique workout names for filter pills
  const routines = Array.from(new Set(sessions.map((s) => s.name)));

  // Filter sessions (newest first)
  const filtered = [...sessions].reverse().filter((session) => {
    const matchesSearch =
      session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.dateStr.includes(searchTerm) ||
      session.exercises.some((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesRoutine =
      selectedRoutine === 'ALL' || session.name === selectedRoutine;

    return matchesSearch && matchesRoutine;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workouts or exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Routine Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRoutine('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              selectedRoutine === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20'
            }`}
          >
            All Routines
          </button>
          {routines.map((routine) => (
            <button
              key={routine}
              onClick={() => setSelectedRoutine(routine)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                selectedRoutine === routine
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              {routine}
            </button>
          ))}
        </div>
      </div>

      {/* Session Cards */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="font-semibold text-white">No workouts match your filter</p>
          <p className="text-xs mt-1">Try resetting the search or routine filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};
