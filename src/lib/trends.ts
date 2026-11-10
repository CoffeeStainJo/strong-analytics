import { addDays, format, startOfWeek } from 'date-fns';
import { WorkoutSession } from '../types/workout';
import { classifyMuscleGroup, MuscleGroup } from './muscleGroups';
import { isWorkingSet } from './records';

export interface WeeklyStat {
  /** Monday of the week (local time) */
  weekStart: Date;
  /** yyyy-MM-dd of the Monday */
  key: string;
  tonnage: number;
  sets: number;
  sessions: number;
  durationMinutes: number;
  muscleSets: Partial<Record<MuscleGroup, number>>;
}

const weekOf = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });
const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

/**
 * Aggregates sessions into consecutive calendar weeks (Monday start), from the
 * first logged week to the last. Weeks without sessions are included as zeros
 * so charts and streaks reflect gaps.
 */
export function buildWeeklyStats(sessions: WorkoutSession[]): WeeklyStat[] {
  if (sessions.length === 0) return [];

  const first = weekOf(sessions[0].startTime);
  const last = weekOf(sessions[sessions.length - 1].startTime);

  const weeks: WeeklyStat[] = [];
  const byKey = new Map<string, WeeklyStat>();
  for (let cursor = first; cursor.getTime() <= last.getTime(); cursor = addDays(cursor, 7)) {
    const stat: WeeklyStat = {
      weekStart: cursor,
      key: dayKey(cursor),
      tonnage: 0,
      sets: 0,
      sessions: 0,
      durationMinutes: 0,
      muscleSets: {},
    };
    weeks.push(stat);
    byKey.set(stat.key, stat);
  }

  for (const session of sessions) {
    const stat = byKey.get(dayKey(weekOf(session.startTime)));
    if (!stat) continue;
    stat.sessions += 1;
    stat.tonnage += session.totalVolume;
    stat.durationMinutes += session.durationSeconds / 60;
    for (const ex of session.exercises) {
      const workingSets = ex.sets.filter(isWorkingSet).length;
      if (workingSets === 0) continue;
      const group = classifyMuscleGroup(ex.name);
      stat.sets += workingSets;
      stat.muscleSets[group] = (stat.muscleSets[group] || 0) + workingSets;
    }
  }

  return weeks;
}

export interface TrainingStreak {
  /** Consecutive weeks with at least one session, ending at the latest logged week */
  currentWeeks: number;
  longestWeeks: number;
}

export function calculateStreak(weekly: WeeklyStat[]): TrainingStreak {
  let longest = 0;
  let run = 0;
  for (const week of weekly) {
    run = week.sessions > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  return { currentWeeks: run, longestWeeks: longest };
}

export interface PeriodComparison {
  current: number;
  previous: number;
  /** Percentage change, or null when the previous period is empty */
  deltaPct: number | null;
}

/**
 * Compares the sum of a metric over the latest `windowWeeks` weeks against the
 * window before it. Returns null when there is not enough history for both.
 */
export function comparePeriods(
  weekly: WeeklyStat[],
  metric: (week: WeeklyStat) => number,
  windowWeeks = 4
): PeriodComparison | null {
  if (weekly.length < windowWeeks * 2) return null;
  const sum = (slice: WeeklyStat[]) => slice.reduce((total, w) => total + metric(w), 0);
  const current = sum(weekly.slice(-windowWeeks));
  const previous = sum(weekly.slice(-windowWeeks * 2, -windowWeeks));
  return {
    current,
    previous,
    deltaPct: previous > 0 ? ((current - previous) / previous) * 100 : null,
  };
}

/** Average weekly working sets per muscle group over the latest `windowWeeks` weeks. */
export function averageMuscleSets(
  weekly: WeeklyStat[],
  windowWeeks: number
): { group: MuscleGroup; setsPerWeek: number }[] {
  const slice = weekly.slice(-windowWeeks);
  if (slice.length === 0) return [];
  const totals = new Map<MuscleGroup, number>();
  for (const week of slice) {
    for (const [group, sets] of Object.entries(week.muscleSets) as [MuscleGroup, number][]) {
      totals.set(group, (totals.get(group) || 0) + sets);
    }
  }
  return [...totals.entries()]
    .map(([group, total]) => ({ group, setsPerWeek: total / slice.length }))
    .sort((a, b) => b.setsPerWeek - a.setsPerWeek);
}

export interface ActivityDay {
  date: Date;
  dateStr: string;
  sets: number;
  tonnage: number;
  sessionNames: string[];
  /** 0 (rest) to 4 (highest set count in the window) */
  level: 0 | 1 | 2 | 3 | 4;
  /** False for days after the latest logged session */
  inRange: boolean;
}

/**
 * Day-by-day activity grid for the `weeks` calendar weeks ending at the latest
 * logged session. Each inner array is one week, Monday to Sunday.
 */
export function buildActivityGrid(sessions: WorkoutSession[], weeks = 26): ActivityDay[][] {
  if (sessions.length === 0) return [];

  const latest = sessions[sessions.length - 1].startTime;
  const latestKey = dayKey(latest);
  const lastWeek = weekOf(latest);
  const firstWeek = addDays(lastWeek, -(weeks - 1) * 7);

  const byDay = new Map<string, { sets: number; tonnage: number; names: string[] }>();
  for (const session of sessions) {
    const key = dayKey(session.startTime);
    const day = byDay.get(key) || { sets: 0, tonnage: 0, names: [] };
    day.sets += session.totalWorkingSets;
    day.tonnage += session.totalVolume;
    day.names.push(session.name);
    byDay.set(key, day);
  }

  const grid: ActivityDay[][] = [];
  let maxSets = 0;
  for (let w = 0; w < weeks; w++) {
    const week: ActivityDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(firstWeek, w * 7 + d);
      const dateStr = dayKey(date);
      const day = byDay.get(dateStr);
      if (day && day.sets > maxSets) maxSets = day.sets;
      week.push({
        date,
        dateStr,
        sets: day?.sets || 0,
        tonnage: day?.tonnage || 0,
        sessionNames: day?.names || [],
        level: 0,
        inRange: dateStr <= latestKey,
      });
    }
    grid.push(week);
  }

  for (const week of grid) {
    for (const day of week) {
      if (day.sessionNames.length === 0) continue;
      const ratio = maxSets > 0 ? day.sets / maxSets : 0;
      day.level = Math.max(1, Math.min(4, Math.ceil(ratio * 4))) as ActivityDay['level'];
    }
  }

  return grid;
}
