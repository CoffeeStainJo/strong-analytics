import React, { useEffect, useMemo, useState } from 'react';
import { CalendarX, Search } from 'lucide-react';
import { WorkoutSession } from '../../types/workout';
import { RecordEvent } from '../../lib/records';
import { Button, Card, EmptyState } from '../ui/primitives';
import { SessionCard } from './SessionCard';

interface SessionListProps {
  sessions: WorkoutSession[];
  recordsBySession?: Map<string, RecordEvent[]>;
  onSelectExercise?: (exerciseName: string) => void;
}

const PAGE_SIZE = 20;

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  recordsBySession,
  onSelectExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState<string>('ALL');
  const [recordsOnly, setRecordsOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Routine names, most frequently used first
  const routines = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sessions) counts.set(s.name, (counts.get(s.name) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...sessions].reverse().filter((session) => {
      if (selectedRoutine !== 'ALL' && session.name !== selectedRoutine) return false;
      if (recordsOnly && !recordsBySession?.has(session.id)) return false;
      if (!query) return true;
      return (
        session.name.toLowerCase().includes(query) ||
        session.dateStr.includes(query) ||
        (session.notes || '').toLowerCase().includes(query) ||
        session.exercises.some((e) => e.name.toLowerCase().includes(query))
      );
    });
  }, [sessions, searchTerm, selectedRoutine, recordsOnly, recordsBySession]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [searchTerm, selectedRoutine, recordsOnly]);

  const isFiltered = searchTerm.trim() !== '' || selectedRoutine !== 'ALL' || recordsOnly;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            placeholder="Search by routine, exercise, note or date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input bg-surface pl-9"
          />
        </div>
        <select
          value={selectedRoutine}
          onChange={(e) => setSelectedRoutine(e.target.value)}
          className="input bg-surface sm:w-56"
          aria-label="Filter by routine"
        >
          <option value="ALL">All routines</option>
          {routines.map(([name, count]) => (
            <option key={name} value={name}>
              {name} ({count})
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={recordsOnly}
            onChange={(e) => setRecordsOnly(e.target.checked)}
            className="accent-[rgb(var(--accent))]"
          />
          Records only
        </label>
      </div>

      <p className="text-[13px] text-muted">
        {isFiltered
          ? `${filtered.length} of ${sessions.length} sessions`
          : `${sessions.length} sessions`}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<CalendarX className="h-7 w-7" />} title="No sessions match">
            Try a different search term or clear the filters.
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.slice(0, visible).map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              records={recordsBySession?.get(session.id)}
              onSelectExercise={onSelectExercise}
            />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="text-center">
          <Button onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show more ({filtered.length - visible} older)
          </Button>
        </div>
      )}
    </div>
  );
};
