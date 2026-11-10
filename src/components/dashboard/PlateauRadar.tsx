import React, { useState } from 'react';
import { ArrowRight, CircleCheck, Eye, EyeOff } from 'lucide-react';
import { ExercisePlateauReport } from '../../types/workout';
import { Badge, Button, Card, CardHeader, EmptyState, cn } from '../ui/primitives';

interface PlateauRadarProps {
  plateauReports: ExercisePlateauReport[];
  onSelectExercise: (exerciseName: string) => void;
  onToggleIgnore: (exerciseName: string) => void;
}

const isStalled = (r: ExercisePlateauReport) =>
  r.status === 'plateaued' || r.status === 'regressing';

export const PlateauRadar: React.FC<PlateauRadarProps> = ({
  plateauReports,
  onSelectExercise,
  onToggleIgnore,
}) => {
  const [showDormant, setShowDormant] = useState(false);
  const [showIgnored, setShowIgnored] = useState(false);

  const activeAlerts = plateauReports.filter((r) => r.isActive && !r.isIgnored && isStalled(r));
  const ignoredAlerts = plateauReports.filter((r) => r.isIgnored && isStalled(r));
  const dormantAlerts = plateauReports.filter((r) => !r.isActive && !r.isIgnored && isStalled(r));

  const displayed = [
    ...activeAlerts,
    ...(showIgnored ? ignoredAlerts : []),
    ...(showDormant ? dormantAlerts : []),
  ];

  return (
    <Card>
      <CardHeader
        title="Plateau radar"
        description="Active exercises (last 90 days) that have stalled or are regressing"
        action={
          <>
            {ignoredAlerts.length > 0 && (
              <Button
                size="sm"
                variant={showIgnored ? 'secondary' : 'ghost'}
                onClick={() => setShowIgnored(!showIgnored)}
              >
                {showIgnored ? 'Hide ignored' : `${ignoredAlerts.length} ignored`}
              </Button>
            )}
            {dormantAlerts.length > 0 && (
              <Button
                size="sm"
                variant={showDormant ? 'secondary' : 'ghost'}
                onClick={() => setShowDormant(!showDormant)}
                title="Exercises not performed in the last 90 days"
              >
                {showDormant ? 'Hide dormant' : `${dormantAlerts.length} dormant`}
              </Button>
            )}
          </>
        }
      />

      {displayed.length === 0 ? (
        <EmptyState icon={<CircleCheck className="h-7 w-7 text-good" />} title="No active plateaus">
          Every exercise you have trained in the last 90 days is still progressing.
        </EmptyState>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {displayed.map((item) => {
            const isPlateau = item.status === 'plateaued';
            const subdued = item.isIgnored || !item.isActive;

            return (
              <li key={item.exerciseName} className={cn('px-5 py-4 sm:px-6', subdued && 'opacity-70')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <button
                    onClick={() => onSelectExercise(item.exerciseName)}
                    className="text-[15px] font-medium text-fg hover:underline"
                  >
                    {item.exerciseName}
                  </button>
                  <Badge tone={isPlateau ? 'warn' : 'bad'}>
                    {isPlateau
                      ? `Plateaued · ${item.stalledSessionsCount} sessions`
                      : 'Regressing'}
                  </Badge>
                  {item.isIgnored && <Badge>Ignored</Badge>}
                  {!item.isIgnored && !item.isActive && <Badge>Dormant</Badge>}
                </div>

                <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Top set</dt>
                    <dd className="font-mono tabular-nums text-fg">
                      {item.lastTopWeight} kg × {item.lastTopReps}
                    </dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted">e1RM</dt>
                    <dd className="font-mono tabular-nums text-fg">{item.currentE1RM} kg</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Last logged</dt>
                    <dd className="tabular-nums text-fg">
                      {item.daysSinceLastPerformed === 0
                        ? 'latest session'
                        : `${item.daysSinceLastPerformed}d earlier`}
                    </dd>
                  </div>
                </dl>

                <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted">
                  {item.recommendation}
                </p>

                <div className="mt-2.5 flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="-ml-2.5"
                    onClick={() => onSelectExercise(item.exerciseName)}
                  >
                    View progression
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleIgnore(item.exerciseName)}
                    title={
                      item.isIgnored
                        ? 'Bring this exercise back to the radar'
                        : 'Hide this exercise from plateau alerts'
                    }
                  >
                    {item.isIgnored ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Restore
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Ignore
                      </>
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
