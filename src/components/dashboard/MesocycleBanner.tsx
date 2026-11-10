import React from 'react';
import { Pencil } from 'lucide-react';
import { MesocycleReport } from '../../types/workout';
import { Badge, Card, cn } from '../ui/primitives';

interface MesocycleBannerProps {
  mesocycle: MesocycleReport;
  onOpenSettings?: () => void;
}

export const MesocycleBanner: React.FC<MesocycleBannerProps> = ({
  mesocycle,
  onOpenSettings,
}) => {
  const { currentWeek, totalWeeks, isDeloadDue } = mesocycle;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const isOverdue = currentWeek > totalWeeks;

  return (
    <Card className={cn('overflow-hidden', isDeloadDue && 'border-warn/40')}>
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Mesocycle</span>
            {isDeloadDue ? (
              <Badge tone="warn">Deload due</Badge>
            ) : (
              <Badge tone="good">Building</Badge>
            )}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">
            Week {Math.min(currentWeek, totalWeeks)}
            <span className="text-faint"> of {totalWeeks}</span>
            {isOverdue && (
              <span className="ml-2 align-middle text-sm font-medium text-warn">
                +{currentWeek - totalWeeks} overdue
              </span>
            )}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            {mesocycle.triggerReason}
          </p>
        </div>

        <div className="flex items-end gap-6 md:flex-col md:items-end md:justify-between md:text-right">
          <div>
            <div className="eyebrow">Next deload</div>
            <div
              className={cn(
                'mt-1 text-2xl font-semibold tabular-nums tracking-tight',
                isDeloadDue ? 'text-warn' : 'text-fg'
              )}
            >
              {isDeloadDue ? (
                'Now'
              ) : (
                <>
                  {mesocycle.daysRemaining}
                  <span className="ml-1 text-sm font-normal text-muted">
                    {mesocycle.daysRemaining === 1 ? 'day' : 'days'}
                  </span>
                </>
              )}
            </div>
          </div>
          {mesocycle.lastDeloadWeekStr && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="group flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-fg"
              title="Change last deload week"
            >
              <span>Last deload: {mesocycle.lastDeloadWeekStr}</span>
              <Pencil className="h-3 w-3 text-faint group-hover:text-fg" />
            </button>
          )}
        </div>
      </div>

      {/* Week stepper */}
      <div className="px-5 sm:px-6">
        <ol className="flex gap-1.5" aria-label={`Week ${currentWeek} of ${totalWeeks}`}>
          {weeks.map((week) => {
            const isCompleted = week < currentWeek;
            const isCurrent = week === Math.min(currentWeek, totalWeeks);
            const isDeloadWeek = week === totalWeeks;
            return (
              <li key={week} className="min-w-0 flex-1">
                <div
                  className={cn(
                    'h-1.5 rounded-full',
                    isCurrent
                      ? isDeloadDue
                        ? 'bg-warn'
                        : 'bg-accent'
                      : isCompleted
                      ? 'bg-accent/35'
                      : 'bg-raised'
                  )}
                />
                <div
                  className={cn(
                    'mt-1.5 truncate text-[11px]',
                    isCurrent ? 'font-medium text-fg' : 'text-faint'
                  )}
                >
                  {isDeloadWeek ? 'Deload' : `W${week}`}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 border-t border-line bg-raised/40 px-5 py-3.5 sm:px-6">
        <p className="text-[13px] leading-relaxed text-fg">
          <span className="mr-2 font-medium text-muted">Suggested</span>
          {mesocycle.suggestedAction}
        </p>
      </div>
    </Card>
  );
};
