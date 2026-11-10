import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';
import { formatKg } from '../../lib/metrics';
import { ExerciseSessionEntry } from '../../lib/records';
import { Badge, Button, Card, CardHeader } from '../ui/primitives';
import { SetTable } from '../ui/SetTable';

interface ExerciseHistoryProps {
  exerciseName: string;
  /** Chronological history of the exercise (oldest first) */
  history: ExerciseSessionEntry[];
}

const PAGE_SIZE = 8;

export const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({ exerciseName, history }) => {
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [exerciseName]);

  const newestFirst = [...history].reverse();
  const shown = newestFirst.slice(0, visible);

  return (
    <Card>
      <CardHeader
        title="Set history"
        description={`Every logged set, newest first · ${history.length} ${
          history.length === 1 ? 'session' : 'sessions'
        }`}
      />

      <div className="mt-3 divide-y divide-line">
        {shown.map((entry) => (
          <div key={entry.sessionId} className="px-5 py-4 sm:px-6">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-fg">
                  {format(entry.date, 'EEE, MMM d, yyyy')}
                </span>
                <span className="text-[13px] text-muted">{entry.sessionName}</span>
                {entry.isPR && (
                  <Badge tone="good">
                    <Trophy className="h-3 w-3" /> Record
                  </Badge>
                )}
              </div>
              <div className="flex gap-4 text-xs tabular-nums text-muted">
                {entry.exercise.totalVolume > 0 && (
                  <span>Volume {formatKg(entry.exercise.totalVolume)}</span>
                )}
                {entry.exercise.peakE1RM > 0 && <span>e1RM {entry.exercise.peakE1RM} kg</span>}
              </div>
            </div>
            <SetTable sets={entry.exercise.sets} highlightE1RM={entry.exercise.peakE1RM} />
          </div>
        ))}
      </div>

      {visible < newestFirst.length && (
        <div className="border-t border-line p-3 text-center">
          <Button variant="ghost" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE * 2)}>
            Show older sessions ({newestFirst.length - visible} more)
          </Button>
        </div>
      )}
    </Card>
  );
};
