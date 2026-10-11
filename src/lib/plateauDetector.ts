import { differenceInDays } from 'date-fns';
import { ExercisePlateauReport, PlateauStatus, WorkoutSession } from '../types/workout';

export interface PlateauDetectionOptions {
  thresholdSessions?: number; // default: 3
  activeWindowDays?: number; // default: 90 days (3 months)
  ignoredExercises?: string[];
}

export function analyzeExercisePlateaus(
  sessions: WorkoutSession[],
  options: PlateauDetectionOptions = {}
): ExercisePlateauReport[] {
  const threshold = options.thresholdSessions || 3;
  const activeWindowDays = options.activeWindowDays ?? 90;
  const ignoredSet = new Set(options.ignoredExercises || []);

  const latestWorkoutDate =
    sessions.length > 0 ? sessions[sessions.length - 1].startTime : new Date();

  // Map of exerciseName -> list of session occurrences (chronological)
  const historyByExercise = new Map<
    string,
    {
      date: Date;
      dateStr: string;
      peakE1RM: number;
      topWeight: number;
      topReps: number;
      totalVolume: number;
    }[]
  >();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (!historyByExercise.has(ex.name)) {
        historyByExercise.set(ex.name, []);
      }
      historyByExercise.get(ex.name)!.push({
        date: session.startTime,
        dateStr: session.dateStr,
        peakE1RM: ex.peakE1RM,
        topWeight: ex.topWeight,
        topReps: ex.topReps,
        totalVolume: ex.totalVolume,
      });
    }
  }

  const reports: ExercisePlateauReport[] = [];

  for (const [exerciseName, history] of historyByExercise.entries()) {
    // Sort chronological
    history.sort((a, b) => a.date.getTime() - b.date.getTime());

    const totalOccurrences = history.length;
    const latest = history[totalOccurrences - 1];
    const isIgnored = ignoredSet.has(exerciseName);

    const daysSinceLastPerformed = Math.max(
      0,
      differenceInDays(latestWorkoutDate, latest.date)
    );
    const isActive = daysSinceLastPerformed <= activeWindowDays;

    let peakHistoricalE1RM = 0;
    for (const item of history) {
      if (item.peakE1RM > peakHistoricalE1RM) {
        peakHistoricalE1RM = item.peakE1RM;
      }
    }

    if (totalOccurrences < 2) {
      reports.push({
        exerciseName,
        status: 'new',
        stalledSessionsCount: 0,
        recentSessionsCount: totalOccurrences,
        currentE1RM: latest.peakE1RM,
        peakHistoricalE1RM,
        lastSessionDate: latest.date,
        lastTopWeight: latest.topWeight,
        lastTopReps: latest.topReps,
        isActive,
        daysSinceLastPerformed,
        isIgnored,
        recommendation: isActive
          ? 'Baseline established. Need at least 2-3 sessions to detect progression or plateaus.'
          : `Dormant lift (last logged ${daysSinceLastPerformed} days ago). Establish a new baseline when returning to this movement.`,
        historySummary: history.map((h) => ({
          date: h.dateStr,
          e1RM: h.peakE1RM,
          weight: h.topWeight,
          reps: h.topReps,
        })),
      });
      continue;
    }

    // Inspect the recent window
    const windowSlice = history.slice(-threshold);
    const windowLen = windowSlice.length;

    let status: PlateauStatus = 'progressing';
    let stalledSessionsCount = 0;
    let recommendation = '';

    const firstInWindow = windowSlice[0];
    const lastInWindow = windowSlice[windowLen - 1];

    // Check delta over the window
    const baseE1RM = firstInWindow.peakE1RM;
    const currentE1RM = lastInWindow.peakE1RM;
    const diff = currentE1RM - baseE1RM;
    const deltaPercent = baseE1RM > 0 ? (diff / baseE1RM) * 100 : 0;

    // Check session-to-session progression in the window
    let flatCount = 0;
    for (let i = 1; i < windowLen; i++) {
      const prev = windowSlice[i - 1].peakE1RM;
      const curr = windowSlice[i].peakE1RM;
      // Stagnant if difference is <= 0.5kg or <= 0.5%
      if (Math.abs(curr - prev) <= Math.max(0.5, prev * 0.005)) {
        flatCount++;
      }
    }

    if (windowLen >= threshold && (flatCount >= threshold - 1 || Math.abs(deltaPercent) < 1.0)) {
      status = 'plateaued';
      stalledSessionsCount = windowLen;
      const suggested10PercentDeload = Math.round(latest.topWeight * 0.9 * 2) / 2;
      recommendation = `Stalled at ${latest.topWeight} kg across ${windowLen} sessions. Suggested action: 1) Drop top weight to ~${suggested10PercentDeload} kg and rebuild with +1 rep/session, 2) Switch rep bracket (e.g. from 5 reps to 8-10 reps), or 3) Introduce a variation movement for 3 weeks.`;
    } else if (deltaPercent < -3.0) {
      status = 'regressing';
      stalledSessionsCount = windowLen;
      recommendation = `Performance has decreased by ${Math.abs(deltaPercent).toFixed(1)}%. High local fatigue indicator. Reduce working sets or take a scheduled deload for this muscle group.`;
    } else {
      status = 'progressing';
      stalledSessionsCount = 0;
      recommendation = `Progressing smoothly (+${deltaPercent.toFixed(1)}% over recent sessions). Progressive overload is on track.`;
    }

    if (!isActive) {
      recommendation = `Archived / Dormant: Not performed in the last ${daysSinceLastPerformed} days. ${recommendation}`;
    }

    reports.push({
      exerciseName,
      status,
      stalledSessionsCount,
      recentSessionsCount: windowLen,
      currentE1RM,
      peakHistoricalE1RM,
      lastSessionDate: latest.date,
      lastTopWeight: latest.topWeight,
      lastTopReps: latest.topReps,
      isActive,
      daysSinceLastPerformed,
      isIgnored,
      recommendation,
      historySummary: history.map((h) => ({
        date: h.dateStr,
        e1RM: h.peakE1RM,
        weight: h.topWeight,
        reps: h.topReps,
      })),
    });
  }

  // Sort: non-ignored active first, then plateaued, regressing, progressing, new
  const statusWeight: Record<PlateauStatus, number> = {
    plateaued: 0,
    regressing: 1,
    progressing: 2,
    new: 3,
  };

  reports.sort((a, b) => {
    if (a.isIgnored !== b.isIgnored) {
      return a.isIgnored ? 1 : -1;
    }
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    return statusWeight[a.status] - statusWeight[b.status];
  });

  return reports;
}
