import { differenceInDays, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import {
  ExercisePlateauReport,
  MesocycleReport,
  UserSettings,
  WorkoutSession,
} from '../types/workout';

export function calculateMesocycleStatus(
  sessions: WorkoutSession[],
  plateauReports: ExercisePlateauReport[],
  settings?: UserSettings
): MesocycleReport {
  const totalWeeks = settings?.mesocycleWeeks || 6;
  const plateauedCount = plateauReports.filter(
    (r) => r.isActive && !r.isIgnored && (r.status === 'plateaued' || r.status === 'regressing')
  ).length;

  if (sessions.length === 0) {
    const now = new Date();
    return {
      currentWeek: 1,
      totalWeeks,
      isDeloadDue: false,
      startDate: now,
      daysIntoMesocycle: 0,
      daysRemaining: totalWeeks * 7,
      triggerReason: 'No workout sessions loaded yet.',
      plateauedCount: 0,
      volumeTrend: 'stable',
      suggestedAction: 'Import your Strong CSV or load demo data to begin tracking.',
    };
  }

  // Determine anchor date and last deload week
  let anchorDate: Date;
  let deloadMonday: Date | null = null;

  if (settings?.lastDeloadDate) {
    const d = new Date(settings.lastDeloadDate);
    deloadMonday = startOfWeek(d, { weekStartsOn: 1 });
    // New training block starts the Monday immediately following the deload week
    anchorDate = addDays(deloadMonday, 7);
  } else if (settings?.mesocycleAnchorDate) {
    anchorDate = new Date(settings.mesocycleAnchorDate);
    deloadMonday = addDays(anchorDate, -7);
  } else {
    // Check if any workouts are labeled or noted as 'deload'
    const deloadSessions = sessions.filter(
      (s) =>
        s.name.toLowerCase().includes('deload') ||
        (s.notes && s.notes.toLowerCase().includes('deload'))
    );

    if (deloadSessions.length > 0) {
      const latestDeload = deloadSessions[deloadSessions.length - 1];
      deloadMonday = startOfWeek(latestDeload.startTime, { weekStartsOn: 1 });
      anchorDate = addDays(deloadMonday, 7);
    } else {
      // Determine automatically from workout history span
      const latestSession = sessions[sessions.length - 1];
      const latestDate = latestSession.startTime;
      const earliestSession = sessions[0];
      const spanDays = differenceInDays(latestDate, earliestSession.startTime);

      if (spanDays <= totalWeeks * 7) {
        anchorDate = earliestSession.startTime;
      } else {
        const cycleDays = totalWeeks * 7;
        const modDays = spanDays % cycleDays;
        anchorDate = new Date(latestDate.getTime() - modDays * 24 * 60 * 60 * 1000);
      }
      deloadMonday = addDays(anchorDate, -7);
    }
  }

  const latestSessionDate = sessions[sessions.length - 1].startTime;
  const daysDiff = Math.max(0, differenceInDays(latestSessionDate, anchorDate));
  const currentWeek = Math.min(totalWeeks + 2, Math.floor(daysDiff / 7) + 1);
  const totalDays = totalWeeks * 7;
  const daysRemaining = Math.max(0, totalDays - daysDiff);

  // Formatted date strings
  let lastDeloadWeekStr = '';
  if (deloadMonday) {
    const deloadSunday = endOfWeek(deloadMonday, { weekStartsOn: 1 });
    lastDeloadWeekStr = `${format(deloadMonday, 'MMM d')} – ${format(deloadSunday, 'MMM d, yyyy')}`;
  }

  const nextDeloadDate = addDays(anchorDate, (totalWeeks - 1) * 7);
  const nextDeloadDateStr = format(nextDeloadDate, 'MMM d, yyyy');

  // Check triggers
  const isTimeTrigger = currentWeek >= totalWeeks;
  const isMultiPlateauTrigger = plateauedCount >= 2;
  const isDeloadDue = isTimeTrigger || isMultiPlateauTrigger;

  let triggerReason = '';
  let suggestedAction = '';

  if (isTimeTrigger && isMultiPlateauTrigger) {
    triggerReason = `Week ${currentWeek} of ${totalWeeks} reached AND ${plateauedCount} active lifts are stalled. Fatigue accumulation is high.`;
    suggestedAction = `Immediate 1-week deload: Reduce volume by 50% and keep 2-3 reps in reserve on all compound lifts.`;
  } else if (isTimeTrigger) {
    triggerReason = `Scheduled 6-week block completed (Week ${currentWeek}/${totalWeeks}). Systemic recovery window recommended.`;
    suggestedAction = `Schedule a 1-week deload: maintain intensity (weight) but cut working sets in half to dissipate systemic fatigue.`;
  } else if (isMultiPlateauTrigger) {
    triggerReason = `High plateau density: ${plateauedCount} active exercises are stalling simultaneously before Week ${totalWeeks}.`;
    suggestedAction = `Fatigue is outpacing recovery. Consider pulling your deload forward to this week or reducing accessory volume.`;
  } else {
    triggerReason = `Progressive overload phase (Week ${currentWeek} of ${totalWeeks}). Adaptations progressing as intended.`;
    suggestedAction = `Continue progressive overload. Maintain caloric surplus and sleep hygiene. Next deload scheduled for week of ${nextDeloadDateStr} (${daysRemaining} days).`;
  }

  return {
    currentWeek,
    totalWeeks,
    isDeloadDue,
    startDate: anchorDate,
    daysIntoMesocycle: daysDiff,
    daysRemaining,
    triggerReason,
    plateauedCount,
    volumeTrend: isDeloadDue ? 'spiking' : 'increasing',
    suggestedAction,
    lastDeloadWeekStr,
    nextDeloadDateStr,
  };
}
