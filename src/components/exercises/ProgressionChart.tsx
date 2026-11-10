import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { formatKg } from '../../lib/metrics';
import { ExerciseSessionEntry } from '../../lib/records';
import { Card, CardHeader, ChartTooltip, Segmented, chartColors } from '../ui/primitives';

interface ProgressionChartProps {
  /** Chronological history of the exercise (oldest first) */
  history: ExerciseSessionEntry[];
}

type Metric = 'strength' | 'volume';
type Range = '3' | '12' | 'all';

interface Point {
  label: string;
  date: Date;
  e1RM: number | null;
  topWeight: number;
  topReps: number;
  volume: number;
  isPR: boolean;
}

const PrDot = (props: { cx?: number; cy?: number; payload?: Point }) => {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return payload.isPR ? (
    <circle cx={cx} cy={cy} r={4.5} fill={chartColors.good} stroke={chartColors.surface} strokeWidth={2} />
  ) : (
    <circle cx={cx} cy={cy} r={3} fill={chartColors.accent} stroke={chartColors.surface} strokeWidth={1.5} />
  );
};

export const ProgressionChart: React.FC<ProgressionChartProps> = ({ history }) => {
  const [metric, setMetric] = useState<Metric>('strength');
  const [range, setRange] = useState<Range>('all');

  const hasStrength = history.some((h) => h.exercise.peakE1RM > 0);
  const activeMetric: Metric = hasStrength ? metric : 'volume';

  const spanMonths =
    history.length > 1
      ? (history[history.length - 1].date.getTime() - history[0].date.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
      : 0;

  const data: Point[] = useMemo(() => {
    if (history.length === 0) return [];
    const latest = history[history.length - 1].date;
    const cutoff = range === 'all' ? null : subMonths(latest, Number(range));
    const sameYear =
      history[0].date.getFullYear() === latest.getFullYear() || range !== 'all';
    return history
      .filter((h) => !cutoff || h.date >= cutoff)
      .map((h) => ({
        label: format(h.date, sameYear ? 'MMM d' : 'MMM yy'),
        date: h.date,
        e1RM: h.exercise.peakE1RM > 0 ? h.exercise.peakE1RM : null,
        topWeight: h.exercise.topWeight,
        topReps: h.exercise.topReps,
        volume: h.exercise.totalVolume > 0 ? h.exercise.totalVolume : h.exercise.totalReps,
        isPR: h.isPR,
      }));
  }, [history, range]);

  if (history.length === 0) return null;

  const volumeIsReps = history.every((h) => h.exercise.totalVolume === 0);

  const axisProps = {
    stroke: chartColors.faint,
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  } as const;

  return (
    <Card>
      <CardHeader
        title="Progression"
        description={
          activeMetric === 'strength'
            ? 'Estimated 1RM and top set weight per session'
            : volumeIsReps
            ? 'Total reps per session'
            : 'Working volume (weight × reps) per session'
        }
        action={
          <>
            {hasStrength && (
              <Segmented
                aria-label="Metric"
                value={metric}
                onChange={setMetric}
                options={[
                  { value: 'strength', label: 'Strength' },
                  { value: 'volume', label: 'Volume' },
                ]}
              />
            )}
            {spanMonths > 3 && (
              <Segmented
                aria-label="Time range"
                value={range}
                onChange={setRange}
                options={[
                  { value: '3', label: '3m' },
                  ...(spanMonths > 12 ? [{ value: '12' as Range, label: '1y' }] : []),
                  { value: 'all', label: 'All' },
                ]}
              />
            )}
          </>
        }
      />

      {activeMetric === 'strength' && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pt-3 text-xs text-muted sm:px-6">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-accent" /> Estimated 1RM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-faint" /> Top set weight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-good" /> New record
          </span>
        </div>
      )}

      <div className="h-72 w-full px-2 pb-4 pt-3 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'strength' ? (
            <LineChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={chartColors.line} />
              <XAxis dataKey="label" {...axisProps} minTickGap={28} tickMargin={8} />
              <YAxis {...axisProps} width={44} domain={['auto', 'auto']} />
              <Tooltip
                cursor={{ stroke: chartColors.line }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Point;
                  return (
                    <ChartTooltip title={format(p.date, 'EEE, MMM d, yyyy')}>
                      <div className="font-medium text-fg">
                        e1RM {p.e1RM ?? '–'} kg
                        {p.isPR && <span className="ml-1.5 text-good">New record</span>}
                      </div>
                      <div className="text-muted">
                        Top set {p.topWeight} kg × {p.topReps}
                      </div>
                    </ChartTooltip>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="topWeight"
                stroke={chartColors.faint}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="e1RM"
                stroke={chartColors.accent}
                strokeWidth={2}
                connectNulls
                dot={data.length > 60 ? false : <PrDot />}
                activeDot={{ r: 5, fill: chartColors.accent, stroke: chartColors.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={chartColors.line} />
              <XAxis dataKey="label" {...axisProps} minTickGap={28} tickMargin={8} />
              <YAxis {...axisProps} width={44} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: chartColors.raised }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Point;
                  return (
                    <ChartTooltip title={format(p.date, 'EEE, MMM d, yyyy')}>
                      <div className="font-medium text-fg">
                        {volumeIsReps ? `${p.volume} reps` : formatKg(p.volume)}
                      </div>
                    </ChartTooltip>
                  );
                }}
              />
              <Bar
                dataKey="volume"
                fill={chartColors.accent}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                isAnimationActive={false}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
