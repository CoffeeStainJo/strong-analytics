import React, { useMemo, useState } from 'react';
import { averageMuscleSets, WeeklyStat } from '../../lib/trends';
import { Card, CardHeader, EmptyState, Segmented } from '../ui/primitives';

interface MuscleGroupChartProps {
  weekly: WeeklyStat[];
}

/** Commonly cited weekly set range for hypertrophy, shown as a reference band. */
const TARGET_MIN = 10;
const TARGET_MAX = 20;

export const MuscleGroupChart: React.FC<MuscleGroupChartProps> = ({ weekly }) => {
  const [windowWeeks, setWindowWeeks] = useState<'4' | '12'>('4');

  const rows = useMemo(
    () => averageMuscleSets(weekly, Number(windowWeeks)),
    [weekly, windowWeeks]
  );

  const scaleMax = Math.max(TARGET_MAX + 4, ...rows.map((r) => r.setsPerWeek));
  const pct = (value: number) => `${(value / scaleMax) * 100}%`;

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Sets per muscle group"
        description="Average working sets per week"
        action={
          weekly.length > 4 && (
            <Segmented
              aria-label="Averaging window"
              value={windowWeeks}
              onChange={setWindowWeeks}
              options={[
                { value: '4', label: '4w' },
                { value: '12', label: '12w' },
              ]}
            />
          )
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="No working sets in this period" />
      ) : (
        <div className="flex-1 px-5 pb-5 pt-4 sm:px-6">
          <ul className="space-y-2.5">
            {rows.map((row) => (
              <li key={row.group} className="grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-3">
                <span className="truncate text-[13px] text-fg">{row.group}</span>
                <div className="relative h-2 rounded-full bg-raised">
                  <div
                    className="absolute inset-y-0 rounded-full bg-good/20"
                    style={{ left: pct(TARGET_MIN), width: pct(TARGET_MAX - TARGET_MIN) }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{ width: pct(row.setsPerWeek) }}
                  />
                </div>
                <span className="text-right font-mono text-[13px] tabular-nums text-fg">
                  {row.setsPerWeek.toFixed(row.setsPerWeek < 10 ? 1 : 0)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block h-2 w-4 rounded-full bg-good/20" />
            {TARGET_MIN}–{TARGET_MAX} sets per week, a common hypertrophy guideline. Groups are
            inferred from exercise names.
          </p>
        </div>
      )}
    </Card>
  );
};
