/**
 * Represents the raw flat row structure directly parsed from `strong_workouts_with_notes_and_rest.csv`.
 * Matches CSV column naming conventions exactly.
 */
export interface RawStrongWorkoutRow {
  /** Timestamp when the workout started (e.g. "2023-07-25 10:16:25") */
  "Date": string;

  /** Title or routine label (e.g. "A", "Morning Workout") */
  "Workout Name": string;

  /** Human-readable elapsed duration (e.g. "1h 7m", "23m") */
  "Duration": string;

  /** Standardized movement name (e.g. "Squat (Barbell)", "Chest Fly (Dumbbell)") */
  "Exercise Name": string;

  /** Set indicator: 1-indexed number ("1", "2"), warm-up ("W"), drop set ("D"), failure ("F"), or "Rest Timer" */
  "Set Order": string;

  /** Weight lifted in kg. Defaults to 0 for bodyweight/timed sets */
  "Weight": number | string;

  /** Repetitions completed. Often 0 for timed sets or rest timers */
  "Reps": number | string;

  /** Distance in meters/yards for cardio exercises (typically 0 in this dataset) */
  "Distance": number | string;

  /** Duration in seconds (e.g. rest timer or timed hold) */
  "Seconds": number | string;

  /** Set-level or exercise-level notes and cues */
  "Notes": string | null;

  /** Session-level notes; can span multiple lines */
  "Workout Notes": string | null;

  /** Rate of Perceived Exertion (1.0 to 10.0 scale) */
  "RPE": number | string | null;
}

/**
 * Valid set types derived from the 'Set Order' column.
 */
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure' | 'rest_timer';

/**
 * Normalized representation of an individual workout set.
 */
export interface WorkoutSet {
  /** Sequential set index within the exercise (1-based), null if rest timer */
  order: number | null;

  /** Type classification of the set */
  type: SetType;

  /** Raw identifier as recorded in CSV ('1', '2', 'W', 'D', 'F', 'Rest Timer') */
  rawOrder: string;

  /** Weight lifted in recorded units (kg) */
  weight: number;

  /** Repetitions completed */
  reps: number;

  /** Distance covered in meters/yards */
  distance: number;

  /** Time duration in seconds (rest interval or hold duration) */
  seconds: number;

  /** Rate of perceived exertion (1-10 scale), if specified */
  rpe?: number | null;

  /** Specific cue or note attached to this set */
  notes?: string | null;

  /** Calculated Epley Estimated 1RM for this set (if weight and reps > 0) */
  e1RM: number;
}

/**
 * An exercise performed during a workout session, grouping its sets.
 */
export interface WorkoutExercise {
  /** Name of the exercise performed */
  name: string;

  /** Ordered collection of sets performed for this exercise */
  sets: WorkoutSet[];

  /** Exercise-level summary metrics */
  totalVolume: number; // sum of (weight * reps) for working sets
  totalReps: number;

  /** Peak estimated 1RM achieved during this session */
  peakE1RM: number;

  /** Top set weight lifted */
  topWeight: number;

  /** Top set reps at top weight */
  topReps: number;
}

/**
 * Normalized domain model for an entire workout session.
 * Grouped by `Date` and `Workout Name`.
 */
export interface WorkoutSession {
  /** Unique composite identifier (typically `${date}_${name}`) */
  id: string;

  /** Start timestamp */
  startTime: Date;

  /** Formatted date string (YYYY-MM-DD) */
  dateStr: string;

  /** Name or routine label of the workout */
  name: string;

  /** Duration string formatted as reported (e.g. "1h 7m") */
  rawDuration: string;

  /** Total workout duration in seconds */
  durationSeconds: number;

  /** High-level notes for the session */
  notes?: string | null;

  /** Exercises performed in sequential order */
  exercises: WorkoutExercise[];

  /** Total session volume in kg */
  totalVolume: number;

  /** Total sets excluding rest timers */
  totalWorkingSets: number;
}

/**
 * Plateau classification and training status for an exercise.
 */
export type PlateauStatus = 'progressing' | 'plateaued' | 'regressing' | 'new';

export interface ExercisePlateauReport {
  exerciseName: string;
  status: PlateauStatus;
  stalledSessionsCount: number;
  recentSessionsCount: number;
  currentE1RM: number;
  peakHistoricalE1RM: number;
  lastSessionDate: Date;
  lastTopWeight: number;
  lastTopReps: number;
  recommendation: string;
  /** Whether this exercise was performed in the active window (last 90 days) */
  isActive: boolean;
  /** Number of days since this exercise was performed relative to latest session */
  daysSinceLastPerformed: number;
  /** Whether the user has explicitly chosen to ignore/mute this exercise */
  isIgnored: boolean;
  historySummary: {
    date: string;
    e1RM: number;
    weight: number;
    reps: number;
  }[];
}

/**
 * Mesocycle tracking and deload alert status.
 */
export interface MesocycleReport {
  currentWeek: number;
  totalWeeks: number; // default: 6
  isDeloadDue: boolean;
  startDate: Date;
  daysIntoMesocycle: number;
  daysRemaining: number;
  triggerReason: string;
  plateauedCount: number;
  volumeTrend: 'increasing' | 'stable' | 'spiking' | 'declining';
  suggestedAction: string;
  lastDeloadWeekStr?: string;
  nextDeloadDateStr?: string;
}

/**
 * Global user preferences stored in IndexedDB.
 */
export interface UserSettings {
  bodyweightKg?: number;
  plateauThresholdSessions: number; // default: 3
  mesocycleWeeks: number; // default: 6
  /** Explicit date of the last deload week (e.g. "2026-09-07" to "2026-09-13") */
  lastDeloadDate?: string;
  mesocycleAnchorDate?: string; // Legacy/alias for block start date
  /** Names of exercises hidden/ignored by the user */
  ignoredExercises?: string[];
}


