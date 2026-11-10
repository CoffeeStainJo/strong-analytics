import React from 'react';
import { format } from 'date-fns';
import { ArrowRight, Trophy } from 'lucide-react';
import { RecordEvent } from '../../lib/records';
import { Button, Card, CardHeader, EmptyState } from '../ui/primitives';

interface RecentRecordsProps {
  /** Chronological record events (oldest first) */
  events: RecordEvent[];
  onSelectExercise: (exerciseName: string) => void;
  onViewAll?: () => void;
  limit?: number;
}

export const RecentRecords: React.FC<RecentRecordsProps> = ({
  events,
  onSelectExercise,
  onViewAll,
  limit = 6,
}) => {
  const recent = events.slice(-limit).reverse();

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent records"
        description="Latest sessions that beat an all-time best e1RM"
        action={
          onViewAll &&
          events.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onViewAll}>
              All records <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )
        }
      />

      {recent.length === 0 ? (
        <EmptyState icon={<Trophy className="h-7 w-7" />} title="No records yet">
          A record is logged when an exercise beats its previous best estimated 1RM.
        </EmptyState>
      ) : (
        <ul className="mt-3 flex-1 divide-y divide-line">
          {recent.map((event) => (
            <li key={`${event.sessionId}-${event.exerciseName}`}>
              <button
                onClick={() => onSelectExercise(event.exerciseName)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-raised/60 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-fg">{event.exerciseName}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {format(event.date, 'MMM d, yyyy')} ·{' '}
                    <span className="font-mono tabular-nums">
                      {event.weight} kg × {event.reps}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium tabular-nums text-fg">
                    {event.e1RM} kg
                  </div>
                  <div className="text-xs font-medium tabular-nums text-good">
                    +{event.improvementPct.toFixed(1)}%
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
