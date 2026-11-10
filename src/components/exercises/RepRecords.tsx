import React from 'react';
import { ExerciseRecords, nextPrTargets } from '../../lib/records';
import { formatKg } from '../../lib/metrics';
import { Card, CardHeader } from '../ui/primitives';

interface RepRecordsProps {
  records: ExerciseRecords;
  /** Weight of the most recent top set, used as the base for next-record targets */
  lastTopWeight: number;
}

export const RepRecords: React.FC<RepRecordsProps> = ({ records, lastTopWeight }) => {
  const targets = records.bestE1RM ? nextPrTargets(records.bestE1RM.value, lastTopWeight) : [];
  const hasRepMaxes = records.repMaxes.length > 0;

  if (!hasRepMaxes && !records.mostReps) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader
          title="Rep records"
          description={
            hasRepMaxes
              ? 'Heaviest weight lifted for at least this many reps'
              : 'Bests for this unweighted exercise'
          }
        />
        <div className="px-5 pb-5 pt-3 sm:px-6">
          {hasRepMaxes ? (
            <table className="w-full text-[13px]">
              <tbody>
                {records.repMaxes.map((r) => (
                  <tr key={r.target} className="border-t border-line/60 first:border-t-0">
                    <td className="py-1.5 text-muted">{r.target} RM</td>
                    <td className="py-1.5 text-right font-mono font-medium tabular-nums text-fg">
                      {r.weight} kg
                      {r.reps > r.target && (
                        <span className="ml-1 font-normal text-faint">× {r.reps}</span>
                      )}
                    </td>
                    <td className="w-28 py-1.5 text-right tabular-nums text-faint">{r.dateStr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            records.mostReps && (
              <p className="text-[13px] text-muted">
                Most reps in a set:{' '}
                <span className="font-mono font-medium tabular-nums text-fg">
                  {records.mostReps.reps}
                </span>{' '}
                on {records.mostReps.dateStr}
              </p>
            )
          )}
          {records.bestVolume && (
            <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
              Best session volume:{' '}
              <span className="font-mono font-medium tabular-nums text-fg">
                {formatKg(records.bestVolume.value)}
              </span>{' '}
              on {records.bestVolume.dateStr}
            </p>
          )}
        </div>
      </Card>

      {targets.length > 0 && records.bestE1RM && (
        <Card>
          <CardHeader
            title="Next record"
            description={`Any of these beats your best e1RM of ${records.bestE1RM.value} kg`}
          />
          <ul className="grid gap-2 px-5 pb-5 pt-4 sm:px-6">
            {targets.map((t) => (
              <li
                key={t.weight}
                className="flex items-center justify-between rounded-xl bg-raised/60 px-3.5 py-2.5"
              >
                <span className="font-mono text-[15px] font-medium tabular-nums text-fg">
                  {t.weight} kg <span className="text-faint">×</span> {t.reps}
                </span>
                <span className="text-xs tabular-nums text-muted">e1RM {t.e1RM} kg</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
