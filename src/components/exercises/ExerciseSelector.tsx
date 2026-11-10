import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ExercisePlateauReport } from '../../types/workout';
import { Card, Segmented, cn, describeStatus, toneDot } from '../ui/primitives';

interface ExerciseSelectorProps {
  plateauReports: ExercisePlateauReport[];
  selectedExercise: string;
  onSelect: (exerciseName: string) => void;
}

type FilterMode = 'active' | 'all' | 'ignored';

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  plateauReports,
  selectedExercise,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('active');

  const activeCount = plateauReports.filter((r) => r.isActive && !r.isIgnored).length;
  const ignoredCount = plateauReports.filter((r) => r.isIgnored).length;

  const query = search.trim().toLowerCase();
  const filtered = plateauReports.filter((item) => {
    if (query && !item.exerciseName.toLowerCase().includes(query)) return false;
    // Searching looks across every exercise so nothing is hidden behind a filter
    if (query) return true;
    if (filterMode === 'active') return item.isActive && !item.isIgnored;
    if (filterMode === 'ignored') return item.isIgnored;
    return true;
  });

  const options: { value: FilterMode; label: string }[] = [
    { value: 'active', label: `Active ${activeCount}` },
    { value: 'all', label: `All ${plateauReports.length}` },
  ];
  if (ignoredCount > 0 || filterMode === 'ignored') {
    options.push({ value: 'ignored', label: `Ignored ${ignoredCount}` });
  }

  return (
    <Card className="flex max-h-72 flex-col overflow-hidden lg:sticky lg:top-28 lg:max-h-[calc(100vh-8.5rem)]">
      <div className="space-y-2.5 border-b border-line p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            placeholder="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-8"
          />
        </div>
        <Segmented
          aria-label="Exercise filter"
          value={filterMode}
          onChange={setFilterMode}
          options={options}
          className="flex [&>button]:flex-1"
        />
      </div>

      <ul className="flex-1 overflow-y-auto p-1.5">
        {filtered.length === 0 && (
          <li className="px-3 py-6 text-center text-[13px] text-muted">No exercises found</li>
        )}
        {filtered.map((item) => {
          const isSelected = item.exerciseName === selectedExercise;
          const { label, tone } = describeStatus(item);
          return (
            <li key={item.exerciseName}>
              <button
                onClick={() => onSelect(item.exerciseName)}
                aria-current={isSelected ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                  isSelected ? 'bg-accent/10 text-fg' : 'text-muted hover:bg-raised hover:text-fg'
                )}
              >
                <span
                  className={cn('h-1.5 w-1.5 shrink-0 rounded-full', toneDot[tone])}
                  title={label}
                />
                <span className={cn('min-w-0 flex-1 truncate', isSelected && 'font-medium')}>
                  {item.exerciseName}
                </span>
                {item.currentE1RM > 0 && (
                  <span className="font-mono text-xs tabular-nums text-faint">
                    {Math.round(item.currentE1RM)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
