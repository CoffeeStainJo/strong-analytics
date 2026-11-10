import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatKg } from '../../lib/metrics';
import { PeriodComparison, TrainingStreak } from '../../lib/trends';
import { Card, cn } from '../ui/primitives';

interface StatCardGridProps {
  totalSessions: number;
  stalledLiftsCount: number;
  plateauThreshold: number;
  totalTonnageKg: number;
  weeklyFrequency: number;
  streak: TrainingStreak;
  /** Tonnage over the last 4 weeks vs the 4 weeks before (null without enough history) */
  tonnageComparison: PeriodComparison | null;
  /** Fallback tonnage figure when there is no comparison */
  recentTonnageKg: number;
}

const Delta: React.FC<{ pct: number | null }> = ({ pct }) => {
  if (pct === null) return null;
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium tabular-nums',
        up ? 'text-good' : 'text-bad'
      )}
      title="Compared with the 4 weeks before"
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
};

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  totalSessions,
  stalledLiftsCount,
  plateauThreshold,
  totalTonnageKg,
  weeklyFrequency,
  streak,
  tonnageComparison,
  recentTonnageKg,
}) => {
  const cards: {
    label: string;
    value: React.ReactNode;
    unit?: string;
    extra?: React.ReactNode;
    sub: string;
    valueClass?: string;
  }[] = [
    {
      label: 'Sessions',
      value: totalSessions.toLocaleString('en-US'),
      sub: `${weeklyFrequency.toFixed(1)} per week on average`,
    },
    {
      label: 'Volume, last 4 weeks',
      value: formatKg(tonnageComparison ? tonnageComparison.current : recentTonnageKg).replace(
        ' kg',
        ''
      ),
      unit: 'kg',
      extra: tonnageComparison && <Delta pct={tonnageComparison.deltaPct} />,
      sub: `${formatKg(totalTonnageKg)} all time`,
    },
    {
      label: 'Training streak',
      value: streak.currentWeeks,
      unit: streak.currentWeeks === 1 ? 'week' : 'weeks',
      sub:
        streak.longestWeeks > streak.currentWeeks
          ? `Longest: ${streak.longestWeeks} weeks`
          : 'Your longest streak yet',
    },
    {
      label: 'Active plateaus',
      value: stalledLiftsCount,
      valueClass: stalledLiftsCount > 0 ? 'text-warn' : 'text-good',
      sub:
        stalledLiftsCount > 0
          ? `Flat or down over ${plateauThreshold} sessions`
          : 'All active exercises progressing',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4 sm:p-5">
          <div className="eyebrow">{card.label}</div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
            <span
              className={cn(
                'text-2xl font-semibold tabular-nums tracking-tight sm:text-[28px]',
                card.valueClass || 'text-fg'
              )}
            >
              {card.value}
            </span>
            {card.unit && <span className="text-sm text-muted">{card.unit}</span>}
            {card.extra}
          </div>
          <p className="mt-1 text-xs text-muted">{card.sub}</p>
        </Card>
      ))}
    </div>
  );
};
