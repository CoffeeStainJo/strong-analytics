import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ExercisePlateauReport } from '../../types/workout';
import { classifyMuscleGroup } from '../../lib/muscleGroups';
import { ExerciseRecords } from '../../lib/records';
import { Badge, Button, Card, StatusBadge, cn } from '../ui/primitives';

interface ExerciseMetricsProps {
  report: ExercisePlateauReport;
  records?: ExerciseRecords;
  bodyweightKg?: number;
  onToggleIgnore?: (exerciseName: string) => void;
}

const Metric: React.FC<{
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: React.ReactNode;
}> = ({ label, value, unit, sub }) => (
  <div className="bg-surface p-4 sm:p-5">
    <div className="eyebrow">{label}</div>
    <div className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-fg sm:text-2xl">
      {value}
      {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
    </div>
    {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
  </div>
);

export const ExerciseMetrics: React.FC<ExerciseMetricsProps> = ({
  report,
  records,
  bodyweightKg,
  onToggleIgnore,
}) => {
  const hasE1RM = report.peakHistoricalE1RM > 0;
  const pctOfPeak = hasE1RM
    ? Math.round((report.currentE1RM / report.peakHistoricalE1RM) * 100)
    : null;
  const relative =
    bodyweightKg && report.currentE1RM > 0 ? report.currentE1RM / bodyweightKg : null;
  const tone =
    report.isIgnored || !report.isActive
      ? null
      : report.status === 'plateaued'
      ? 'warn'
      : report.status === 'regressing'
      ? 'bad'
      : null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge report={report} />
            <Badge>{classifyMuscleGroup(report.exerciseName)}</Badge>
            {!report.isActive && (
              <span className="text-xs text-muted">
                Last logged {report.daysSinceLastPerformed} days before your latest session
              </span>
            )}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
            {report.exerciseName}
          </h2>
        </div>
        {onToggleIgnore && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onToggleIgnore(report.exerciseName)}
            title={
              report.isIgnored
                ? 'Include this exercise in plateau alerts again'
                : 'Hide this exercise from plateau alerts'
            }
          >
            {report.isIgnored ? (
              <>
                <Eye className="h-3.5 w-3.5" /> Stop ignoring
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Ignore
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
        <Metric
          label="Current e1RM"
          value={hasE1RM ? report.currentE1RM : '–'}
          unit={hasE1RM ? 'kg' : undefined}
          sub={
            relative
              ? `${relative.toFixed(2)}× bodyweight`
              : pctOfPeak !== null
              ? `${pctOfPeak}% of all-time best`
              : 'Unweighted exercise'
          }
        />
        <Metric
          label="All-time best e1RM"
          value={hasE1RM ? report.peakHistoricalE1RM : '–'}
          unit={hasE1RM ? 'kg' : undefined}
          sub={
            records?.bestE1RM
              ? `${records.bestE1RM.weight} kg × ${records.bestE1RM.reps} on ${records.bestE1RM.dateStr}`
              : undefined
          }
        />
        <Metric
          label="Last top set"
          value={
            <>
              {report.lastTopWeight > 0 ? report.lastTopWeight : 'BW'}
              <span className="mx-1 text-base font-normal text-faint">×</span>
              {report.lastTopReps}
            </>
          }
          sub={report.lastTopWeight > 0 ? 'kg × reps' : 'bodyweight × reps'}
        />
        <Metric
          label="Sessions"
          value={report.historySummary.length}
          sub={
            records && records.prCount > 0
              ? `${records.prCount} ${records.prCount === 1 ? 'record' : 'records'} set`
              : 'Times performed'
          }
        />
      </div>

      <p
        className={cn(
          'px-5 py-3.5 text-[13px] leading-relaxed sm:px-6',
          tone === 'warn' && 'bg-warn/5',
          tone === 'bad' && 'bg-bad/5'
        )}
      >
        <span className="mr-2 font-medium text-muted">Suggested</span>
        <span className="text-fg">{report.recommendation}</span>
      </p>
    </Card>
  );
};
