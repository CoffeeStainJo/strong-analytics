import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { addDays, format } from 'date-fns';
import { formatKg } from '../../lib/metrics';
import { WeeklyStat } from '../../lib/trends';
import { Card, CardHeader, ChartTooltip, Segmented, chartColors } from '../ui/primitives';

interface VolumeChartProps {
  weekly: WeeklyStat[];
}

type Metric = 'tonnage' | 'sets' | 'sessions';
type Range = '12' | '26' | '52' | 'all';

const metricLabels: Record<Metric, string> = {
  tonnage: 'Tonnage',
  sets: 'Sets',
  sessions: 'Sessions',
};

const formatCompact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : `${value}`;

export const VolumeChart: React.FC<VolumeChartProps> = ({ weekly }) => {
  const [metric, setMetric] = useState<Metric>('tonnage');
  const [range, setRange] = useState<Range>('26');

  const rangeOptions = useMemo(() => {
    const options: { value: Range; label: string }[] = [];
    if (weekly.length > 12) options.push({ value: '12', label: '12w' });
    if (weekly.length > 26) options.push({ value: '26', label: '6m' });
    if (weekly.length > 52) options.push({ value: '52', label: '1y' });
    if (options.length > 0) options.push({ value: 'all', label: 'All' });
    return options;
  }, [weekly.length]);

  const data = useMemo(() => {
    const slice = range === 'all' ? weekly : weekly.slice(-Number(range));
    return slice.map((w) => ({
      ...w,
      label: format(w.weekStart, 'MMM d'),
      value: Math.round(w[metric]),
    }));
  }, [weekly, range, metric]);

  if (weekly.length === 0) return null;

  const average = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const formatValue = (value: number) =>
    metric === 'tonnage' ? formatKg(value) : `${value} ${metric}`;

  return (
    <Card>
      <CardHeader
        title="Weekly training load"
        description={
          <>
            Averaging{' '}
            <span className="font-medium tabular-nums text-fg">
              {formatValue(Math.round(average))}
            </span>{' '}
            per week over {data.length} {data.length === 1 ? 'week' : 'weeks'}
          </>
        }
        action={
          <>
            <Segmented
              aria-label="Metric"
              value={metric}
              onChange={setMetric}
              options={(Object.keys(metricLabels) as Metric[]).map((m) => ({
                value: m,
                label: metricLabels[m],
              }))}
            />
            {rangeOptions.length > 0 && (
              <Segmented
                aria-label="Time range"
                value={rangeOptions.some((o) => o.value === range) ? range : 'all'}
                onChange={setRange}
                options={rangeOptions}
              />
            )}
          </>
        }
      />

      <div className="h-64 w-full px-2 pb-4 pt-4 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={chartColors.line} />
            <XAxis
              dataKey="label"
              stroke={chartColors.faint}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickMargin={8}
            />
            <YAxis
              stroke={chartColors.faint}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={formatCompact}
              width={44}
            />
            <Tooltip
              cursor={{ fill: chartColors.raised }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const week = payload[0].payload as (typeof data)[number];
                return (
                  <ChartTooltip
                    title={`${format(week.weekStart, 'MMM d')} – ${format(
                      addDays(week.weekStart, 6),
                      'MMM d, yyyy'
                    )}`}
                  >
                    <div className="font-medium text-fg">{formatKg(Math.round(week.tonnage))}</div>
                    <div className="text-muted">
                      {week.sets} sets · {week.sessions}{' '}
                      {week.sessions === 1 ? 'session' : 'sessions'}
                    </div>
                  </ChartTooltip>
                );
              }}
            />
            <Bar
              dataKey="value"
              fill={chartColors.accent}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
