/**
 * Pre-bundled realistic Strong workout CSV data representing 8 weeks of workouts:
 * - Push / Pull / Legs rotation
 * - Consistent progressive overload across Squat and Pull-ups
 * - A genuine 3-session plateau on Bench Press (Barbell) at 100kg
 * - A scheduled deload week in Week 7 with reduced volume and intensity
 */
export const DEMO_STRONG_CSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2026-08-03 08:30:00,Push Day,1h 5m,Bench Press (Barbell),W,60,10,0,0,Warmup set,,
2026-08-03 08:30:00,Push Day,1h 5m,Bench Press (Barbell),1,90,6,0,0,Felt crisp,,8
2026-08-03 08:30:00,Push Day,1h 5m,Bench Press (Barbell),2,90,6,0,0,,,8.5
2026-08-03 08:30:00,Push Day,1h 5m,Bench Press (Barbell),3,90,5,0,0,,,9
2026-08-03 08:30:00,Push Day,1h 5m,Overhead Press (Dumbbell),1,24,10,0,0,,,8
2026-08-03 08:30:00,Push Day,1h 5m,Overhead Press (Dumbbell),2,24,9,0,0,,,8.5
2026-08-03 08:30:00,Push Day,1h 5m,Triceps Pushdown,1,30,12,0,0,,,7.5
2026-08-03 08:30:00,Push Day,1h 5m,Triceps Pushdown,D,20,15,0,0,Drop set,,9
2026-08-05 08:15:00,Pull Day,1h 10m,Deadlift (Barbell),W,100,5,0,0,,,
2026-08-05 08:15:00,Pull Day,1h 10m,Deadlift (Barbell),1,140,5,0,0,,,8
2026-08-05 08:15:00,Pull Day,1h 10m,Deadlift (Barbell),2,140,5,0,0,,,8.5
2026-08-05 08:15:00,Pull Day,1h 10m,Pull Up,1,0,10,0,0,Bodyweight clean reps,,8
2026-08-05 08:15:00,Pull Day,1h 10m,Pull Up,2,0,8,0,0,,,9
2026-08-05 08:15:00,Pull Day,1h 10m,Barbell Row,1,70,10,0,0,,,7.5
2026-08-05 08:15:00,Pull Day,1h 10m,Barbell Row,2,70,10,0,0,,,8
2026-08-07 08:00:00,Leg Day,1h 15m,Squat (Barbell),W,70,8,0,0,,,
2026-08-07 08:00:00,Leg Day,1h 15m,Squat (Barbell),1,120,6,0,0,,,8
2026-08-07 08:00:00,Leg Day,1h 15m,Squat (Barbell),2,120,6,0,0,,,8
2026-08-07 08:00:00,Leg Day,1h 15m,Romanian Deadlift,1,100,10,0,0,,,7.5
2026-08-07 08:00:00,Leg Day,1h 15m,Romanian Deadlift,2,100,10,0,0,,,8
2026-08-10 08:30:00,Push Day,1h 8m,Bench Press (Barbell),W,60,10,0,0,,,
2026-08-10 08:30:00,Push Day,1h 8m,Bench Press (Barbell),1,95,5,0,0,,,8.5
2026-08-10 08:30:00,Push Day,1h 8m,Bench Press (Barbell),2,95,5,0,0,,,9
2026-08-10 08:30:00,Push Day,1h 8m,Overhead Press (Dumbbell),1,26,9,0,0,,,8.5
2026-08-10 08:30:00,Push Day,1h 8m,Triceps Pushdown,1,32.5,12,0,0,,,8
2026-08-12 08:15:00,Pull Day,1h 12m,Deadlift (Barbell),1,145,5,0,0,,,8.5
2026-08-12 08:15:00,Pull Day,1h 12m,Deadlift (Barbell),2,145,5,0,0,,,9
2026-08-12 08:15:00,Pull Day,1h 12m,Pull Up,1,5,8,0,0,+5kg weighted belt,,8.5
2026-08-12 08:15:00,Pull Day,1h 12m,Barbell Row,1,72.5,10,0,0,,,8
2026-08-14 08:00:00,Leg Day,1h 18m,Squat (Barbell),1,125,6,0,0,,,8
2026-08-14 08:00:00,Leg Day,1h 18m,Squat (Barbell),2,125,5,0,0,,,8.5
2026-08-14 08:00:00,Leg Day,1h 18m,Romanian Deadlift,1,105,10,0,0,,,8
2026-08-17 08:30:00,Push Day,1h 10m,Bench Press (Barbell),W,70,8,0,0,,,
2026-08-17 08:30:00,Push Day,1h 10m,Bench Press (Barbell),1,100,5,0,0,Hit 100kg benchmark!,,9
2026-08-17 08:30:00,Push Day,1h 10m,Bench Press (Barbell),2,100,4,0,0,,,9.5
2026-08-17 08:30:00,Push Day,1h 10m,Overhead Press (Dumbbell),1,26,10,0,0,,,8.5
2026-08-17 08:30:00,Push Day,1h 10m,Triceps Pushdown,1,35,10,0,0,,,8.5
2026-08-19 08:15:00,Pull Day,1h 15m,Deadlift (Barbell),1,150,5,0,0,,,8.5
2026-08-19 08:15:00,Pull Day,1h 15m,Pull Up,1,5,9,0,0,,,9
2026-08-19 08:15:00,Pull Day,1h 15m,Barbell Row,1,75,9,0,0,,,8.5
2026-08-21 08:00:00,Leg Day,1h 20m,Squat (Barbell),1,130,5,0,0,,,8.5
2026-08-21 08:00:00,Leg Day,1h 20m,Romanian Deadlift,1,110,8,0,0,,,8.5
2026-08-24 08:30:00,Push Day,1h 12m,Bench Press (Barbell),W,70,8,0,0,,,
2026-08-24 08:30:00,Push Day,1h 12m,Bench Press (Barbell),1,100,5,0,0,Stuck at 5 reps,,9.5
2026-08-24 08:30:00,Push Day,1h 12m,Bench Press (Barbell),2,100,4,0,0,,,10
2026-08-24 08:30:00,Push Day,1h 12m,Overhead Press (Dumbbell),1,28,8,0,0,,,9
2026-08-24 08:30:00,Push Day,1h 12m,Triceps Pushdown,1,35,10,0,0,,,9
2026-08-26 08:15:00,Pull Day,1h 10m,Deadlift (Barbell),1,152.5,5,0,0,,,9
2026-08-26 08:15:00,Pull Day,1h 10m,Pull Up,1,7.5,7,0,0,,,9
2026-08-26 08:15:00,Pull Day,1h 10m,Barbell Row,1,77.5,8,0,0,,,8.5
2026-08-28 08:00:00,Leg Day,1h 20m,Squat (Barbell),1,132.5,5,0,0,,,9
2026-08-28 08:00:00,Leg Day,1h 20m,Romanian Deadlift,1,112.5,8,0,0,,,8.5
2026-08-31 08:30:00,Push Day,1h 14m,Bench Press (Barbell),W,70,8,0,0,,,
2026-08-31 08:30:00,Push Day,1h 14m,Bench Press (Barbell),1,100,4,0,0,Failed 5th rep. Stalled 3rd session.,,10
2026-08-31 08:30:00,Push Day,1h 14m,Bench Press (Barbell),2,100,3,0,0,,,10
2026-08-31 08:30:00,Push Day,1h 14m,Overhead Press (Dumbbell),1,28,7,0,0,,,9.5
2026-08-31 08:30:00,Push Day,1h 14m,Triceps Pushdown,1,35,9,0,0,,,9.5
2026-09-02 08:15:00,Pull Day,1h 12m,Deadlift (Barbell),1,155,4,0,0,Fatigue mounting,,9.5
2026-09-02 08:15:00,Pull Day,1h 12m,Pull Up,1,7.5,6,0,0,,,9.5
2026-09-02 08:15:00,Pull Day,1h 12m,Barbell Row,1,77.5,7,0,0,,,9
2026-09-04 08:00:00,Leg Day,1h 20m,Squat (Barbell),1,135,4,0,0,,,9.5
2026-09-04 08:00:00,Leg Day,1h 20m,Romanian Deadlift,1,115,6,0,0,,,9
2026-09-07 08:30:00,Push Day (Deload),42m,Bench Press (Barbell),1,70,6,0,0,Deload 50% volume,,6
2026-09-07 08:30:00,Push Day (Deload),42m,Bench Press (Barbell),2,70,6,0,0,,,6
2026-09-07 08:30:00,Push Day (Deload),42m,Overhead Press (Dumbbell),1,18,10,0,0,,,6
2026-09-09 08:15:00,Pull Day (Deload),40m,Deadlift (Barbell),1,110,5,0,0,Light technique work,,6
2026-09-09 08:15:00,Pull Day (Deload),40m,Pull Up,1,0,6,0,0,Bodyweight easy,,6
2026-09-11 08:00:00,Leg Day (Deload),45m,Squat (Barbell),1,95,5,0,0,,,6
2026-09-11 08:00:00,Leg Day (Deload),45m,Squat (Barbell),2,95,5,0,0,,,6
2026-09-14 08:30:00,Push Day (New Block),1h 5m,Bench Press (Barbell),W,70,8,0,0,,,
2026-09-14 08:30:00,Push Day (New Block),1h 5m,Bench Press (Barbell),1,92.5,8,0,0,New 8-rep hypertrophy scheme post-deload!,,8
2026-09-14 08:30:00,Push Day (New Block),1h 5m,Bench Press (Barbell),2,92.5,8,0,0,,,8.5
2026-09-14 08:30:00,Push Day (New Block),1h 5m,Overhead Press (Dumbbell),1,26,10,0,0,,,8
2026-09-16 08:15:00,Pull Day,1h 10m,Deadlift (Barbell),1,155,5,0,0,Refreshed and strong,,8.5
2026-09-16 08:15:00,Pull Day,1h 10m,Pull Up,1,10,6,0,0,+10kg weighted belt PR!,,8.5
2026-09-18 08:00:00,Leg Day,1h 15m,Squat (Barbell),1,135,5,0,0,,,8.5
2026-09-18 08:00:00,Leg Day,1h 15m,Romanian Deadlift,1,115,8,0,0,,,8
`;
