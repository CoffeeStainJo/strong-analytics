import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, Trophy } from 'lucide-react';
import { WorkoutSession } from '../../types/workout';
import { formatKg } from '../../lib/metrics';
import { RecordEvent } from '../../lib/records';
import { Badge, Card, cn } from '../ui/primitives';
import { SetTable } from '../ui/SetTable';

interface SessionCardProps {
  session: WorkoutSession;
  /** Records set during this session */
  records?: RecordEvent[];
  onSelectExercise?: (exerciseName: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  records = [],
  onSelectExercise,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const recordNames = new Set(records.map((r) => r.exerciseName));

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-raised/50 sm:px-5"
      >
        <div className="w-11 shrink-0 text-center">
          <div className="text-[11px] font-medium uppercase tracking-wider text-faint">
            {format(session.startTime, 'MMM')}
          </div>
          <div className="text-xl font-semibold leading-tight tabular-nums text-fg">
            {format(session.startTime, 'd')}
          </div>
          <div className="text-[11px] text-faint">{format(session.startTime, 'yyyy')}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-medium text-fg">{session.name}</h3>
            {records.length > 0 && (
              <Badge tone="good" title={records.map((r) => r.exerciseName).join(', ')}>
                <Trophy className="h-3 w-3" />
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {session.exercises.map((e) => e.name).join(' · ')}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs tabular-nums text-muted sm:hidden">
            <span>{session.rawDuration}</span>
            <span>{session.totalWorkingSets} sets</span>
            <span>{formatKg(session.totalVolume)}</span>
          </div>
        </div>

        <dl className="hidden shrink-0 gap-6 text-right sm:flex">
          <div>
            <dt className="eyebrow">Duration</dt>
            <dd className="mt-0.5 text-sm tabular-nums text-fg">{session.rawDuration}</dd>
          </div>
          <div>
            <dt className="eyebrow">Sets</dt>
            <dd className="mt-0.5 text-sm tabular-nums text-fg">{session.totalWorkingSets}</dd>
          </div>
          <div className="w-24">
            <dt className="eyebrow">Volume</dt>
            <dd className="mt-0.5 text-sm tabular-nums text-fg">{formatKg(session.totalVolume)}</dd>
          </div>
        </dl>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-faint transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <div className="animate-fade-up border-t border-line">
          {session.notes && (
            <p className="whitespace-pre-wrap border-b border-line bg-raised/40 px-5 py-3 text-[13px] text-muted">
              <span className="mr-2 font-medium text-fg">Notes</span>
              {session.notes}
            </p>
          )}
          <div className="divide-y divide-line">
            {session.exercises.map((exercise, idx) => (
              <div key={idx} className="px-4 py-3.5 sm:px-5">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectExercise?.(exercise.name)}
                      className="text-sm font-medium text-fg hover:text-accent hover:underline"
                      title="Open exercise"
                    >
                      {exercise.name}
                    </button>
                    {recordNames.has(exercise.name) && (
                      <Badge tone="good">
                        <Trophy className="h-3 w-3" /> Record
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs tabular-nums text-muted">
                    {exercise.totalVolume > 0 && <span>Volume {formatKg(exercise.totalVolume)}</span>}
                    {exercise.peakE1RM > 0 && <span>e1RM {exercise.peakE1RM} kg</span>}
                  </div>
                </div>
                <SetTable sets={exercise.sets} highlightE1RM={exercise.peakE1RM} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
