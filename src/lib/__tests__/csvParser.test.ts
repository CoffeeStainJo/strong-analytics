import { describe, it, expect } from 'vitest';
import { parseStrongCsv } from '../csvParser';

const SAMPLE_CSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2026-08-01 10:00:00,Push,1h 0m,Bench Press (Barbell),W,60,10,0,0,Warmup set,Great energy today,
2026-08-01 10:00:00,Push,1h 0m,Bench Press (Barbell),1,100,5,0,0,Top set,,9
2026-08-01 10:00:00,Push,1h 0m,Bench Press (Barbell),2,100,5,0,0,,,9
2026-08-01 10:00:00,Push,1h 0m,Bench Press (Barbell),Rest Timer,0,0,0,180,,,
2026-08-03 10:00:00,Pull,50m,Deadlift (Barbell),1,140,5,0,0,,,8
`;

describe('csvParser tests', () => {
  it('correctly parses Strong CSV rows into grouped WorkoutSession objects', () => {
    const sessions = parseStrongCsv(SAMPLE_CSV);

    expect(sessions.length).toBe(2);

    const pushSession = sessions[0];
    expect(pushSession.name).toBe('Push');
    expect(pushSession.dateStr).toBe('2026-08-01');
    expect(pushSession.durationSeconds).toBe(3600);
    expect(pushSession.notes).toBe('Great energy today');
    expect(pushSession.exercises.length).toBe(1);

    const bench = pushSession.exercises[0];
    expect(bench.name).toBe('Bench Press (Barbell)');
    expect(bench.sets.length).toBe(4); // W, 1, 2, Rest Timer

    // Check set types
    expect(bench.sets[0].type).toBe('warmup');
    expect(bench.sets[1].type).toBe('normal');
    expect(bench.sets[2].type).toBe('normal');
    expect(bench.sets[3].type).toBe('rest_timer');

    // Total working volume should exclude warmup and rest timer:
    // (100 * 5) + (100 * 5) = 1000 kg
    expect(bench.totalVolume).toBe(1000);
    expect(pushSession.totalVolume).toBe(1000);
    expect(bench.peakE1RM).toBe(116.7);
  });
});
