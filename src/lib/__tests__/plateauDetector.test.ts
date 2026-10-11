import { describe, it, expect } from 'vitest';
import { parseStrongCsv } from '../csvParser';
import { analyzeExercisePlateaus } from '../plateauDetector';

const PLATEAU_CSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2026-08-01 10:00:00,Push 1,1h,Bench Press (Barbell),1,100,5,0,0,,,9
2026-08-08 10:00:00,Push 2,1h,Bench Press (Barbell),1,100,5,0,0,,,9.5
2026-08-15 10:00:00,Push 3,1h,Bench Press (Barbell),1,100,5,0,0,,,10
2026-08-01 10:00:00,Push 1,1h,Squat (Barbell),1,120,5,0,0,,,8
2026-08-08 10:00:00,Push 2,1h,Squat (Barbell),1,125,5,0,0,,,8
2026-08-15 10:00:00,Push 3,1h,Squat (Barbell),1,130,5,0,0,,,8
`;

describe('plateauDetector tests', () => {
  it('detects a plateau when e1RM remains flat across 3 consecutive sessions', () => {
    const sessions = parseStrongCsv(PLATEAU_CSV);
    const reports = analyzeExercisePlateaus(sessions, { thresholdSessions: 3 });

    const benchReport = reports.find((r) => r.exerciseName === 'Bench Press (Barbell)');
    expect(benchReport).toBeDefined();
    expect(benchReport!.status).toBe('plateaued');
    expect(benchReport!.stalledSessionsCount).toBe(3);
    expect(benchReport!.lastTopWeight).toBe(100);
    expect(benchReport!.lastTopReps).toBe(5);

    const squatReport = reports.find((r) => r.exerciseName === 'Squat (Barbell)');
    expect(squatReport).toBeDefined();
    expect(squatReport!.status).toBe('progressing');
    expect(squatReport!.stalledSessionsCount).toBe(0);
    expect(benchReport!.isActive).toBe(true);
  });

  it('marks exercises not performed in >90 days as dormant', () => {
    const DORMANT_CSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2025-01-01 10:00:00,Old Workout 1,1h,Old Overhead Press,1,40,5,0,0,,,
2025-01-08 10:00:00,Old Workout 2,1h,Old Overhead Press,1,40,5,0,0,,,
2025-01-15 10:00:00,Old Workout 3,1h,Old Overhead Press,1,40,5,0,0,,,
2026-08-01 10:00:00,Recent Workout,1h,Squat (Barbell),1,120,5,0,0,,,
`;
    const sessions = parseStrongCsv(DORMANT_CSV);
    const reports = analyzeExercisePlateaus(sessions, { thresholdSessions: 3, activeWindowDays: 90 });

    const oldExercise = reports.find((r) => r.exerciseName === 'Old Overhead Press');
    expect(oldExercise).toBeDefined();
    expect(oldExercise!.isActive).toBe(false);
    expect(oldExercise!.daysSinceLastPerformed).toBeGreaterThan(90);

    const recentExercise = reports.find((r) => r.exerciseName === 'Squat (Barbell)');
    expect(recentExercise).toBeDefined();
    expect(recentExercise!.isActive).toBe(true);
    expect(recentExercise!.daysSinceLastPerformed).toBe(0);
  });

  it('marks exercises in ignoredExercises list as isIgnored = true', () => {
    const sessions = parseStrongCsv(PLATEAU_CSV);
    const reports = analyzeExercisePlateaus(sessions, {
      thresholdSessions: 3,
      ignoredExercises: ['Bench Press (Barbell)'],
    });

    const benchReport = reports.find((r) => r.exerciseName === 'Bench Press (Barbell)');
    expect(benchReport).toBeDefined();
    expect(benchReport!.isIgnored).toBe(true);

    const squatReport = reports.find((r) => r.exerciseName === 'Squat (Barbell)');
    expect(squatReport).toBeDefined();
    expect(squatReport!.isIgnored).toBe(false);
  });
});


