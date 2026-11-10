import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { WorkoutSession } from '../../types/workout';
import { formatKg } from '../../lib/metrics';
import { buildActivityGrid } from '../../lib/trends';
import { Card, CardHeader, cn } from '../ui/primitives';

interface ConsistencyHeatmapProps {
  sessions: WorkoutSession[];
  weeks?: number;
}

const levelClasses = [
  'bg-raised',
  'bg-accent/25',
  'bg-accent/50',
  'bg-accent/75',
  'bg-accent',
];

const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({ sessions, weeks = 26 }) => {
  const grid = useMemo(() => buildActivityGrid(sessions, weeks), [sessions, weeks]);

  if (grid.length === 0) return null;

  const trainedDays = grid.flat().filter((d) => d.sessionNames.length > 0).length;

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Consistency"
        description={`${trainedDays} training ${trainedDays === 1 ? 'day' : 'days'} in the ${weeks} weeks up to your latest session`}
      />

      <div className="flex-1 overflow-x-auto px-5 pb-5 pt-4 sm:px-6">
        <div className="inline-flex gap-2">
          <div className="grid grid-rows-7 gap-[3px] pt-5 text-[10px] leading-[13px] text-faint">
            {dayLabels.map((label, i) => (
              <span key={i} className="h-[13px]">
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {grid.map((week, wi) => {
              const first = week[0].date;
              const showMonth = wi === 0 || first.getDate() <= 7;
              return (
                <div key={week[0].dateStr} className="flex flex-col gap-[3px]">
                  <span className="h-4 w-[13px] overflow-visible whitespace-nowrap text-[10px] text-faint">
                    {showMonth ? format(first, 'MMM') : ''}
                  </span>
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      title={
                        day.inRange
                          ? day.sessionNames.length > 0
                            ? `${format(day.date, 'EEE, MMM d')}: ${day.sessionNames.join(', ')} · ${day.sets} sets · ${formatKg(day.tonnage)}`
                            : `${format(day.date, 'EEE, MMM d')}: rest`
                          : undefined
                      }
                      className={cn(
                        'h-[13px] w-[13px] rounded-[3px]',
                        day.inRange ? levelClasses[day.level] : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
          <span>Fewer sets</span>
          {levelClasses.map((cls) => (
            <span key={cls} className={cn('h-[11px] w-[11px] rounded-[3px]', cls)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </Card>
  );
};
