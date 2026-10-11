import React from 'react';
import { Dumbbell, AlertTriangle, Layers, Activity } from 'lucide-react';
import { formatKg } from '../../lib/metrics';

interface StatCardGridProps {
  totalSessions: number;
  stalledLiftsCount: number;
  totalTonnageKg: number;
  weeklyFrequency: number;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  totalSessions,
  stalledLiftsCount,
  totalTonnageKg,
  weeklyFrequency,
}) => {
  const cards = [
    {
      title: 'TOTAL SESSIONS',
      value: totalSessions.toString(),
      unit: 'LOGGED',
      subtext: 'Historical Strong workouts',
      icon: Dumbbell,
      color: 'text-cyan-400',
      border: 'border-white/10',
      glow: 'shadow-sm',
    },
    {
      title: 'ACTIVE PLATEAUS',
      value: stalledLiftsCount.toString(),
      unit: stalledLiftsCount === 1 ? 'LIFT' : 'LIFTS',
      subtext:
        stalledLiftsCount > 0
          ? 'Stalled for 3+ consecutive sessions'
          : 'All tracked lifts progressing',
      icon: AlertTriangle,
      color: stalledLiftsCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      border: stalledLiftsCount > 0 ? 'border-amber-500/40' : 'border-white/10',
      glow: stalledLiftsCount > 0 ? 'shadow-glow-gold' : 'shadow-sm',
    },
    {
      title: 'TOTAL TONNAGE',
      value: formatKg(totalTonnageKg).replace(' kg', ''),
      unit: 'KG LIFTED',
      subtext: 'Accumulated working volume',
      icon: Layers,
      color: 'text-emerald-400',
      border: 'border-white/10',
      glow: 'shadow-sm',
    },
    {
      title: 'WORKOUT FREQUENCY',
      value: weeklyFrequency.toFixed(1),
      unit: 'SESSIONS / WK',
      subtext: 'Rolling training consistency',
      icon: Activity,
      color: 'text-teal-400',
      border: 'border-white/10',
      glow: 'shadow-sm',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel rounded-2xl p-5 border ${card.border} ${card.glow} transition-all hover:bg-brand-surface`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold tracking-wider uppercase mb-2">
              <span>{card.title}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-3xl font-extrabold font-heading ${card.color}`}>
                {card.value}
              </span>
              <span className="text-xs font-bold text-slate-400 tracking-wider">
                {card.unit}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
