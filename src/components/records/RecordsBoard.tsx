import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { classifyMuscleGroup, MUSCLE_GROUPS, MuscleGroup } from '../../lib/muscleGroups';
import { formatKg } from '../../lib/metrics';
import { ExerciseRecords, RecordsSummary } from '../../lib/records';
import { RecentRecords } from '../dashboard/RecentRecords';
import { Card, EmptyState, cn } from '../ui/primitives';

interface RecordsBoardProps {
  records: RecordsSummary;
  onSelectExercise: (exerciseName: string) => void;
}

type SortKey = 'name' | 'e1rm' | 'heaviest' | 'volume' | 'prs' | 'last';

const sorters: Record<SortKey, (a: ExerciseRecords, b: ExerciseRecords) => number> = {
  name: (a, b) => a.exerciseName.localeCompare(b.exerciseName),
  e1rm: (a, b) => (a.bestE1RM?.value || 0) - (b.bestE1RM?.value || 0),
  heaviest: (a, b) => (a.heaviest?.weight || 0) - (b.heaviest?.weight || 0),
  volume: (a, b) => (a.bestVolume?.value || 0) - (b.bestVolume?.value || 0),
  prs: (a, b) => a.prCount - b.prCount,
  last: (a, b) => a.lastPerformedStr.localeCompare(b.lastPerformedStr),
};

interface SortHeaderProps {
  k: SortKey;
  sortKey: SortKey;
  descending: boolean;
  onSort: (key: SortKey) => void;
  className?: string;
  children: React.ReactNode;
}

const SortHeader: React.FC<SortHeaderProps> = ({
  k,
  sortKey,
  descending,
  onSort,
  className,
  children,
}) => (
  <th
    className={cn('px-3 py-2.5 font-medium', className)}
    aria-sort={sortKey === k ? (descending ? 'descending' : 'ascending') : undefined}
  >
    <button
      onClick={() => onSort(k)}
      className={cn(
        'inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-fg',
        sortKey === k && 'text-fg'
      )}
    >
      {children}
      {sortKey === k &&
        (descending ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
    </button>
  </th>
);

export const RecordsBoard: React.FC<RecordsBoardProps> = ({ records, onSelectExercise }) => {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('e1rm');
  const [descending, setDescending] = useState(true);

  const all = useMemo(() => [...records.byExercise.values()], [records]);

  const presentGroups = useMemo(() => {
    const present = new Set(all.map((r) => classifyMuscleGroup(r.exerciseName)));
    return MUSCLE_GROUPS.filter((g) => present.has(g));
  }, [all]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = all.filter(
      (r) =>
        (!query || r.exerciseName.toLowerCase().includes(query)) &&
        (group === 'ALL' || classifyMuscleGroup(r.exerciseName) === group)
    );
    filtered.sort(sorters[sortKey]);
    if (descending) filtered.reverse();
    return filtered;
  }, [all, search, group, sortKey, descending]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setDescending(!descending);
    else {
      setSortKey(key);
      setDescending(key !== 'name');
    }
  };

  const sortProps = { sortKey, descending, onSort: handleSort };

  return (
    <div className="space-y-4">
      <RecentRecords events={records.events} onSelectExercise={onSelectExercise} limit={5} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2.5 border-b border-line p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              placeholder="Search exercises"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as MuscleGroup | 'ALL')}
            className="input sm:w-56"
            aria-label="Filter by muscle group"
          >
            <option value="ALL">All muscle groups</option>
            {presentGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No exercises match" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11px] text-faint">
                  <SortHeader k="name" className="pl-5" {...sortProps}>
                    Exercise
                  </SortHeader>
                  <SortHeader k="e1rm" className="text-right" {...sortProps}>
                    Best e1RM
                  </SortHeader>
                  <SortHeader k="heaviest" className="text-right" {...sortProps}>
                    Heaviest set
                  </SortHeader>
                  <SortHeader k="volume" className="text-right" {...sortProps}>
                    Best volume
                  </SortHeader>
                  <SortHeader k="prs" className="text-right" {...sortProps}>
                    Records
                  </SortHeader>
                  <SortHeader k="last" className="pr-5 text-right" {...sortProps}>
                    Last logged
                  </SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {rows.map((r) => (
                  <tr
                    key={r.exerciseName}
                    onClick={() => onSelectExercise(r.exerciseName)}
                    className="cursor-pointer transition-colors hover:bg-raised/60"
                  >
                    <td className="py-2.5 pl-5 pr-3">
                      <button className="text-left font-medium text-fg hover:underline">
                        {r.exerciseName}
                      </button>
                      <div className="text-xs text-faint">
                        {classifyMuscleGroup(r.exerciseName)} · {r.sessionsCount}{' '}
                        {r.sessionsCount === 1 ? 'session' : 'sessions'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {r.bestE1RM ? (
                        <>
                          <div className="font-medium text-fg">{r.bestE1RM.value} kg</div>
                          <div className="text-xs text-faint">{r.bestE1RM.dateStr}</div>
                        </>
                      ) : (
                        <span className="text-faint">–</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-fg">
                      {r.heaviest ? (
                        `${r.heaviest.weight} kg × ${r.heaviest.reps}`
                      ) : r.mostReps ? (
                        `BW × ${r.mostReps.reps}`
                      ) : (
                        <span className="text-faint">–</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-fg">
                      {r.bestVolume ? (
                        formatKg(r.bestVolume.value)
                      ) : (
                        <span className="text-faint">–</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-fg">
                      {r.prCount || <span className="text-faint">–</span>}
                    </td>
                    <td className="py-2.5 pl-3 pr-5 text-right tabular-nums text-muted">
                      {r.lastPerformedStr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
