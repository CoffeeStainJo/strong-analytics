import { describe, it, expect } from 'vitest';
import { parseStrongCsv } from '../csvParser';
import { DEMO_STRONG_CSV } from '../demoData';
import { classifyMuscleGroup } from '../muscleGroups';
import { computeRecords, getExerciseHistory, nextPrTargets } from '../records';
import {
  averageMuscleSets,
  buildActivityGrid,
  buildWeeklyStats,
  calculateStreak,
  comparePeriods,
} from '../trends';

const HEADER =
  'Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE';

describe('classifyMuscleGroup', () => {
  it.each([
    ['Bench Press (Barbell)', 'Chest'],
    ['Incline Bench Press (Dumbbell)', 'Chest'],
    ['Chest Fly (Dumbbell)', 'Chest'],
    ['Overhead Press (Dumbbell)', 'Shoulders'],
    ['Lateral Raise (Cable)', 'Shoulders'],
    ['Reverse Fly (Machine)', 'Shoulders'],
    ['Triceps Pushdown', 'Triceps'],
    ['Bicep Curl (Dumbbell)', 'Biceps'],
    ['Deadlift (Barbell)', 'Back'],
    ['Pull Up', 'Back'],
    ['Barbell Row', 'Back'],
    ['Lat Pulldown (Cable)', 'Back'],
    ['Romanian Deadlift', 'Hamstrings & Glutes'],
    ['Lying Leg Curl (Machine)', 'Hamstrings & Glutes'],
    ['Squat (Barbell)', 'Quads'],
    ['Leg Extension (Machine)', 'Quads'],
    ['Standing Calf Raise', 'Calves'],
    ['Plank', 'Core'],
    ['Hanging Leg Raise', 'Core'],
    ['Sled Push', 'Other'],
  ])('%s -> %s', (name, group) => {
    expect(classifyMuscleGroup(name)).toBe(group);
  });
});

describe('computeRecords', () => {
  const sessions = parseStrongCsv(`${HEADER}
2026-08-01 10:00:00,A,1h,Bench Press (Barbell),W,60,10,0,0,,,
2026-08-01 10:00:00,A,1h,Bench Press (Barbell),1,100,5,0,0,,,
2026-08-08 10:00:00,B,1h,Bench Press (Barbell),1,100,5,0,0,,,
2026-08-15 10:00:00,C,1h,Bench Press (Barbell),1,105,5,0,0,,,
2026-08-15 10:00:00,C,1h,Bench Press (Barbell),2,90,10,0,0,,,
2026-08-15 10:00:00,C,1h,Pull Up,1,0,12,0,0,,,
`);
  const records = computeRecords(sessions);

  it('tracks the best e1RM and the set that produced it', () => {
    const bench = records.byExercise.get('Bench Press (Barbell)')!;
    expect(bench.bestE1RM).toMatchObject({ value: 122.5, weight: 105, reps: 5, dateStr: '2026-08-15' });
    expect(bench.heaviest).toMatchObject({ weight: 105, reps: 5 });
    expect(bench.sessionsCount).toBe(3);
  });

  it('treats the first session as a baseline and only counts later improvements', () => {
    const bench = records.byExercise.get('Bench Press (Barbell)')!;
    expect(bench.prCount).toBe(1);
    expect(records.events).toHaveLength(1);
    expect(records.events[0]).toMatchObject({
      exerciseName: 'Bench Press (Barbell)',
      dateStr: '2026-08-15',
      previousE1RM: 116.7,
      e1RM: 122.5,
    });
    expect(records.eventsBySession.get(sessions[2].id)).toHaveLength(1);
  });

  it('ignores warmups and builds rep maxes as "heaviest weight for at least N reps"', () => {
    const bench = records.byExercise.get('Bench Press (Barbell)')!;
    const byTarget = Object.fromEntries(bench.repMaxes.map((r) => [r.target, r.weight]));
    expect(byTarget[1]).toBe(105);
    expect(byTarget[5]).toBe(105);
    expect(byTarget[8]).toBe(90);
    expect(byTarget[10]).toBe(90);
    expect(byTarget[12]).toBeUndefined();
  });

  it('records most reps for unweighted exercises without an e1RM', () => {
    const pullUp = records.byExercise.get('Pull Up')!;
    expect(pullUp.bestE1RM).toBeNull();
    expect(pullUp.mostReps).toMatchObject({ reps: 12 });
  });

  it('flags PR sessions in exercise history', () => {
    const history = getExerciseHistory(sessions, 'Bench Press (Barbell)');
    expect(history.map((h) => h.isPR)).toEqual([false, false, true]);
  });
});

describe('nextPrTargets', () => {
  it('returns the fewest reps that beat the current best at each weight', () => {
    // Best e1RM 116.7 (100 x 5). At 100 kg you need 6 reps (120).
    const targets = nextPrTargets(116.7, 100);
    expect(targets[0]).toMatchObject({ weight: 100, reps: 6, e1RM: 120 });
    expect(targets[1].weight).toBe(102.5);
    expect(targets[1].reps).toBe(5);
    expect(targets.every((t) => t.e1RM > 116.7)).toBe(true);
  });

  it('returns nothing for unweighted exercises', () => {
    expect(nextPrTargets(0, 0)).toEqual([]);
  });
});

describe('trends', () => {
  const sessions = parseStrongCsv(`${HEADER}
2026-08-03 10:00:00,A,1h,Squat (Barbell),1,100,5,0,0,,,
2026-08-05 10:00:00,B,1h,Bench Press (Barbell),1,80,5,0,0,,,
2026-08-05 10:00:00,B,1h,Bench Press (Barbell),W,40,5,0,0,,,
2026-08-12 10:00:00,A,1h,Squat (Barbell),1,100,5,0,0,,,
2026-08-26 10:00:00,A,1h,Squat (Barbell),1,100,5,0,0,,,
2026-08-26 10:00:00,A,1h,Squat (Barbell),2,100,5,0,0,,,
`);
  const weekly = buildWeeklyStats(sessions);

  it('fills gap weeks and aggregates per Monday-start week', () => {
    expect(weekly.map((w) => w.key)).toEqual([
      '2026-08-03',
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
    ]);
    expect(weekly.map((w) => w.sessions)).toEqual([2, 1, 0, 1]);
    expect(weekly[0].tonnage).toBe(900);
    expect(weekly[0].sets).toBe(2);
    expect(weekly[0].muscleSets).toEqual({ Quads: 1, Chest: 1 });
  });

  it('calculates current and longest weekly streaks', () => {
    expect(calculateStreak(weekly)).toEqual({ currentWeeks: 1, longestWeeks: 2 });
  });

  it('compares the latest window with the one before it', () => {
    const cmp = comparePeriods(weekly, (w) => w.sessions, 2)!;
    expect(cmp.current).toBe(1);
    expect(cmp.previous).toBe(3);
    expect(cmp.deltaPct).toBeCloseTo(-66.67, 1);
    expect(comparePeriods(weekly, (w) => w.sessions, 4)).toBeNull();
  });

  it('averages muscle group sets over the window', () => {
    const avg = averageMuscleSets(weekly, 4);
    expect(avg[0]).toEqual({ group: 'Quads', setsPerWeek: 1 });
    expect(avg[1]).toEqual({ group: 'Chest', setsPerWeek: 0.25 });
  });

  it('builds an activity grid ending at the latest session week', () => {
    const grid = buildActivityGrid(sessions, 4);
    expect(grid).toHaveLength(4);
    expect(grid[0][0].dateStr).toBe('2026-08-03');
    expect(grid[0][0].level).toBeGreaterThan(0);
    expect(grid[3][2]).toMatchObject({ dateStr: '2026-08-26', sets: 2, level: 4 });
    expect(grid[3][3].inRange).toBe(false);
  });
});

describe('demo dataset', () => {
  it('produces records and weekly stats without gaps', () => {
    const sessions = parseStrongCsv(DEMO_STRONG_CSV);
    const records = computeRecords(sessions);
    const weekly = buildWeeklyStats(sessions);
    expect(records.events.length).toBeGreaterThan(5);
    expect(weekly).toHaveLength(7);
    expect(calculateStreak(weekly).currentWeeks).toBe(7);
  });
});
