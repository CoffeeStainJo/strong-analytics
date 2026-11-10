import React from 'react';
import { WorkoutSet } from '../../types/workout';
import { cn } from './primitives';

const typeLabels: Partial<Record<WorkoutSet['type'], { label: string; title: string; className: string }>> = {
  warmup: { label: 'W', title: 'Warm-up set', className: 'bg-warn/10 text-warn' },
  dropset: { label: 'D', title: 'Drop set', className: 'bg-accent/10 text-accent' },
  failure: { label: 'F', title: 'Set to failure', className: 'bg-bad/10 text-bad' },
  rest_timer: { label: 'Rest', title: 'Rest timer', className: 'bg-raised text-muted' },
};

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

interface SetTableProps {
  sets: WorkoutSet[];
  /** e1RM value to highlight as the session's best set */
  highlightE1RM?: number;
}

/** Set-by-set breakdown for one exercise in one session. */
export const SetTable: React.FC<SetTableProps> = ({ sets, highlightE1RM }) => {
  const hasRpe = sets.some((s) => s.rpe);
  const hasNotes = sets.some((s) => s.notes);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-faint">
            <th className="w-12 py-1.5 font-medium">Set</th>
            <th className="py-1.5 font-medium">Weight</th>
            <th className="py-1.5 font-medium">Reps</th>
            <th className="py-1.5 font-medium">e1RM</th>
            {hasRpe && <th className="py-1.5 font-medium">RPE</th>}
            {hasNotes && <th className="py-1.5 font-medium">Notes</th>}
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {sets.map((set, idx) => {
            const special = typeLabels[set.type];
            const isRest = set.type === 'rest_timer';
            const isBest = !!highlightE1RM && set.e1RM === highlightE1RM && set.type !== 'warmup';
            const repsCell =
              set.reps > 0 ? set.reps : set.seconds > 0 ? formatSeconds(set.seconds) : '–';

            return (
              <tr key={idx} className="border-t border-line/60">
                <td className="py-1.5">
                  {special ? (
                    <span
                      title={special.title}
                      className={cn(
                        'rounded px-1.5 py-0.5 font-sans text-[11px] font-medium',
                        special.className
                      )}
                    >
                      {special.label}
                    </span>
                  ) : (
                    <span className="text-faint">{set.order || idx + 1}</span>
                  )}
                </td>
                <td className="py-1.5 text-fg">
                  {isRest ? '–' : set.weight > 0 ? `${set.weight} kg` : 'BW'}
                </td>
                <td className="py-1.5 text-fg">{isRest ? formatSeconds(set.seconds) : repsCell}</td>
                <td className={cn('py-1.5', isBest ? 'font-medium text-accent' : 'text-muted')}>
                  {set.e1RM > 0 ? set.e1RM : '–'}
                </td>
                {hasRpe && <td className="py-1.5 text-muted">{set.rpe || '–'}</td>}
                {hasNotes && (
                  <td
                    className="max-w-[16rem] truncate py-1.5 font-sans text-muted"
                    title={set.notes || undefined}
                  >
                    {set.notes || ''}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
