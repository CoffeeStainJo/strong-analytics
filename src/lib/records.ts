import { WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';
import { calculateE1RM } from './metrics';

/** Rep counts for which we track the heaviest weight ever lifted. */
export const REP_TARGETS = [1, 2, 3, 5, 8, 10, 12, 15] as const;

export interface SetRecord {
  weight: number;
  reps: number;
  dateStr: string;
}

export interface ExerciseRecords {
  exerciseName: string;
  /** Best estimated 1RM and the set that produced it (null for unweighted exercises) */
  bestE1RM: (SetRecord & { value: number }) | null;
  /** Heaviest weight lifted for at least one rep */
  heaviest: SetRecord | null;
  /** Most reps completed in a single working set */
  mostReps: SetRecord | null;
  /** Highest single-session volume (weight × reps over working sets) */
  bestVolume: { value: number; dateStr: string } | null;
  /** Heaviest weight lifted for at least N reps, for each N in REP_TARGETS */
  repMaxes: (SetRecord & { target: number })[];
  /** Number of times the e1RM record was broken (the first session is a baseline, not a record) */
  prCount: number;
  sessionsCount: number;
  lastPerformedStr: string;
}

/** A session in which an exercise's all-time best e1RM was beaten. */
export interface RecordEvent {
  exerciseName: string;
  sessionId: string;
  sessionName: string;
  date: Date;
  dateStr: string;
  e1RM: number;
  previousE1RM: number;
  improvementPct: number;
  weight: number;
  reps: number;
}

export interface RecordsSummary {
  byExercise: Map<string, ExerciseRecords>;
  /** Chronological (oldest first) */
  events: RecordEvent[];
  eventsBySession: Map<string, RecordEvent[]>;
}

export function isWorkingSet(set: WorkoutSet): boolean {
  return set.type !== 'warmup' && set.type !== 'rest_timer';
}

export function computeRecords(sessions: WorkoutSession[]): RecordsSummary {
  const byExercise = new Map<string, ExerciseRecords>();
  const repMaxMaps = new Map<string, Map<number, SetRecord>>();
  const events: RecordEvent[] = [];
  const eventsBySession = new Map<string, RecordEvent[]>();

  const ordered = [...sessions].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  for (const session of ordered) {
    for (const ex of session.exercises) {
      let rec = byExercise.get(ex.name);
      if (!rec) {
        rec = {
          exerciseName: ex.name,
          bestE1RM: null,
          heaviest: null,
          mostReps: null,
          bestVolume: null,
          repMaxes: [],
          prCount: 0,
          sessionsCount: 0,
          lastPerformedStr: session.dateStr,
        };
        byExercise.set(ex.name, rec);
        repMaxMaps.set(ex.name, new Map());
      }
      const repMaxMap = repMaxMaps.get(ex.name)!;
      rec.sessionsCount += 1;
      rec.lastPerformedStr = session.dateStr;

      let peakSet: WorkoutSet | null = null;

      for (const set of ex.sets) {
        if (!isWorkingSet(set)) continue;
        const asRecord: SetRecord = {
          weight: set.weight,
          reps: set.reps,
          dateStr: session.dateStr,
        };

        if (set.e1RM > 0 && (!peakSet || set.e1RM > peakSet.e1RM)) {
          peakSet = set;
        }

        if (set.weight > 0 && set.reps > 0) {
          const h = rec.heaviest;
          if (!h || set.weight > h.weight || (set.weight === h.weight && set.reps > h.reps)) {
            rec.heaviest = asRecord;
          }
          for (const target of REP_TARGETS) {
            if (set.reps < target) break;
            const current = repMaxMap.get(target);
            if (!current || set.weight > current.weight) {
              repMaxMap.set(target, asRecord);
            }
          }
        }

        if (set.reps > 0) {
          const m = rec.mostReps;
          if (!m || set.reps > m.reps || (set.reps === m.reps && set.weight > m.weight)) {
            rec.mostReps = asRecord;
          }
        }
      }

      if (ex.totalVolume > 0 && (!rec.bestVolume || ex.totalVolume > rec.bestVolume.value)) {
        rec.bestVolume = { value: ex.totalVolume, dateStr: session.dateStr };
      }

      if (peakSet) {
        const previous = rec.bestE1RM;
        if (!previous || peakSet.e1RM > previous.value) {
          if (previous) {
            rec.prCount += 1;
            const event: RecordEvent = {
              exerciseName: ex.name,
              sessionId: session.id,
              sessionName: session.name,
              date: session.startTime,
              dateStr: session.dateStr,
              e1RM: peakSet.e1RM,
              previousE1RM: previous.value,
              improvementPct: ((peakSet.e1RM - previous.value) / previous.value) * 100,
              weight: peakSet.weight,
              reps: peakSet.reps,
            };
            events.push(event);
            const list = eventsBySession.get(session.id);
            if (list) list.push(event);
            else eventsBySession.set(session.id, [event]);
          }
          rec.bestE1RM = {
            value: peakSet.e1RM,
            weight: peakSet.weight,
            reps: peakSet.reps,
            dateStr: session.dateStr,
          };
        }
      }
    }
  }

  for (const [name, rec] of byExercise) {
    const map = repMaxMaps.get(name)!;
    rec.repMaxes = REP_TARGETS.filter((t) => map.has(t)).map((t) => ({
      target: t,
      ...map.get(t)!,
    }));
  }

  return { byExercise, events, eventsBySession };
}

export interface ExerciseSessionEntry {
  sessionId: string;
  sessionName: string;
  date: Date;
  dateStr: string;
  exercise: WorkoutExercise;
  /** True when this session beat the previous all-time best e1RM */
  isPR: boolean;
}

/** Chronological (oldest first) list of every session containing the exercise. */
export function getExerciseHistory(
  sessions: WorkoutSession[],
  exerciseName: string
): ExerciseSessionEntry[] {
  const entries: ExerciseSessionEntry[] = [];
  let best = 0;
  for (const session of sessions) {
    const exercise = session.exercises.find((e) => e.name === exerciseName);
    if (!exercise) continue;
    const isPR = best > 0 && exercise.peakE1RM > best;
    if (exercise.peakE1RM > best) best = exercise.peakE1RM;
    entries.push({
      sessionId: session.id,
      sessionName: session.name,
      date: session.startTime,
      dateStr: session.dateStr,
      exercise,
      isPR,
    });
  }
  return entries;
}

export interface PrTarget {
  weight: number;
  reps: number;
  e1RM: number;
}

/**
 * Smallest rep counts that would beat `bestE1RM` at the given weight and at
 * one and two increments above it. Options needing more than `maxReps` are skipped.
 */
export function nextPrTargets(
  bestE1RM: number,
  baseWeight: number,
  increment = 2.5,
  maxReps = 15
): PrTarget[] {
  if (bestE1RM <= 0 || baseWeight <= 0) return [];
  const targets: PrTarget[] = [];
  for (let step = 0; step < 3; step++) {
    const weight = baseWeight + step * increment;
    for (let reps = 1; reps <= maxReps; reps++) {
      const e1RM = calculateE1RM(weight, reps);
      if (e1RM > bestE1RM) {
        targets.push({ weight, reps, e1RM });
        break;
      }
    }
  }
  return targets;
}
