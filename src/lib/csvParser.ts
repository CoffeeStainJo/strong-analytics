import Papa from 'papaparse';
import {
  RawStrongWorkoutRow,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from '../types/workout';
import {
  calculateE1RM,
  classifySetType,
  parseDurationToSeconds,
} from './metrics';

function parseNumber(val: number | string | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = val.toString().trim().replace(/,/g, '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseStrongCsv(csvContent: string): WorkoutSession[] {
  const result = Papa.parse<RawStrongWorkoutRow>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false, // Parse strings so we can robustly clean numbers & dates
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  const rows = result.data.filter(
    (row) => row.Date && row['Workout Name'] && row['Exercise Name']
  );

  // Group rows by session key: `${Date}_${Workout Name}`
  const sessionMap = new Map<string, {
    dateStr: string;
    workoutName: string;
    durationStr: string;
    workoutNotes: string | null;
    rows: RawStrongWorkoutRow[];
  }>();

  for (const row of rows) {
    const key = `${row.Date.trim()}_${row['Workout Name'].trim()}`;
    if (!sessionMap.has(key)) {
      sessionMap.set(key, {
        dateStr: row.Date.trim(),
        workoutName: row['Workout Name'].trim(),
        durationStr: row.Duration ? row.Duration.trim() : '0m',
        workoutNotes: row['Workout Notes'] || null,
        rows: [],
      });
    }
    sessionMap.get(key)!.rows.push(row);
  }

  const sessions: WorkoutSession[] = [];

  for (const [key, sessionData] of sessionMap.entries()) {
    const startTime = new Date(sessionData.dateStr.replace(' ', 'T'));
    const durationSeconds = parseDurationToSeconds(sessionData.durationStr);

    // Group exercises within this session preserving order
    const exerciseMap = new Map<string, WorkoutSet[]>();

    for (const row of sessionData.rows) {
      const exerciseName = row['Exercise Name'].trim();
      const rawOrder = (row['Set Order'] || '').toString().trim();
      const setType = classifySetType(rawOrder);
      const weight = parseNumber(row.Weight);
      const reps = parseNumber(row.Reps);
      const distance = parseNumber(row.Distance);
      const seconds = parseNumber(row.Seconds);
      const rpe = row.RPE ? parseNumber(row.RPE) : null;
      const notes = row.Notes ? row.Notes.trim() : null;

      const orderNumber = parseInt(rawOrder, 10);
      const order = isNaN(orderNumber) ? null : orderNumber;
      const e1RM = calculateE1RM(weight, reps);

      const set: WorkoutSet = {
        order,
        type: setType,
        rawOrder,
        weight,
        reps,
        distance,
        seconds,
        rpe,
        notes,
        e1RM,
      };

      if (!exerciseMap.has(exerciseName)) {
        exerciseMap.set(exerciseName, []);
      }
      exerciseMap.get(exerciseName)!.push(set);
    }

    const exercises: WorkoutExercise[] = [];
    let sessionTotalVolume = 0;
    let sessionWorkingSets = 0;

    for (const [exerciseName, sets] of exerciseMap.entries()) {
      let totalVolume = 0;
      let totalReps = 0;
      let peakE1RM = 0;
      let topWeight = 0;
      let topReps = 0;

      for (const set of sets) {
        if (set.type !== 'rest_timer') {
          // Warmups are excluded from volume tonnage calculation to match Strong standards
          if (set.type !== 'warmup') {
            const setVol = set.weight * set.reps;
            totalVolume += setVol;
            totalReps += set.reps;
            sessionTotalVolume += setVol;
            sessionWorkingSets += 1;

            if (set.e1RM > peakE1RM) {
              peakE1RM = set.e1RM;
            }
            if (set.weight > topWeight || (set.weight === topWeight && set.reps > topReps)) {
              topWeight = set.weight;
              topReps = set.reps;
            }
          }
        }
      }

      exercises.push({
        name: exerciseName,
        sets,
        totalVolume,
        totalReps,
        peakE1RM,
        topWeight,
        topReps,
      });
    }

    sessions.push({
      id: key,
      startTime: isNaN(startTime.getTime()) ? new Date() : startTime,
      dateStr: sessionData.dateStr.split(' ')[0],
      name: sessionData.workoutName,
      rawDuration: sessionData.durationStr,
      durationSeconds,
      notes: sessionData.workoutNotes,
      exercises,
      totalVolume: Math.round(sessionTotalVolume),
      totalWorkingSets: sessionWorkingSets,
    });
  }

  // Sort sessions chronologically (oldest to newest)
  sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return sessions;
}
