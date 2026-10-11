import { describe, it, expect } from 'vitest';
import { parseStrongCsv } from '../csvParser';
import { analyzeExercisePlateaus } from '../plateauDetector';
import { calculateMesocycleStatus } from '../mesocycle';

const SIX_WEEK_CSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2026-08-01 10:00:00,Workout,1h,Squat (Barbell),1,100,5,0,0,,,
2026-08-08 10:00:00,Workout,1h,Squat (Barbell),1,105,5,0,0,,,
2026-08-15 10:00:00,Workout,1h,Squat (Barbell),1,110,5,0,0,,,
2026-08-22 10:00:00,Workout,1h,Squat (Barbell),1,115,5,0,0,,,
2026-08-29 10:00:00,Workout,1h,Squat (Barbell),1,120,5,0,0,,,
2026-09-12 10:00:00,Workout,1h,Squat (Barbell),1,125,5,0,0,,,
`;

describe('mesocycle tests', () => {
  it('triggers deload due flag when reaching week 6 or higher', () => {
    const sessions = parseStrongCsv(SIX_WEEK_CSV);
    const plateauReports = analyzeExercisePlateaus(sessions);
    const mesocycle = calculateMesocycleStatus(sessions, plateauReports, {
      mesocycleWeeks: 6,
      plateauThresholdSessions: 3,
    });

    expect(mesocycle.currentWeek).toBeGreaterThanOrEqual(6);
    expect(mesocycle.isDeloadDue).toBe(true);
  });

  it('correctly calculates current week from user specified lastDeloadDate', () => {
    const WORKOUT_CSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2026-09-27 10:00:00,Push,1h,Bench Press (Barbell),1,100,5,0,0,,,
`;
    const sessions = parseStrongCsv(WORKOUT_CSV);
    const plateauReports = analyzeExercisePlateaus(sessions);
    // User specifies either 2026-09-07 or 2026-09-13
    const mesocycle = calculateMesocycleStatus(sessions, plateauReports, {
      mesocycleWeeks: 6,
      plateauThresholdSessions: 3,
      lastDeloadDate: '2026-09-07',
    });

    // Deload week was Sep 7 to Sep 13.
    // New block started Sep 14.
    // Workout is on Sep 27 (day 13 of block).
    // Math.floor(13 / 7) + 1 = Week 2 of 6!
    expect(mesocycle.currentWeek).toBe(2);
    expect(mesocycle.isDeloadDue).toBe(false);
    expect(mesocycle.lastDeloadWeekStr).toContain('Sep 7');
    expect(mesocycle.lastDeloadWeekStr).toContain('Sep 13');
  });
});

