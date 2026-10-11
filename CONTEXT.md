# Strong Workout Explorer

A client-side web application for importing, analyzing, and visualizing workout history exported from the Strong app.

## Language

**Workout Session**:
A single logged workout occurrence characterized by a start date/time, a routine title, duration, notes, and a sequence of exercises.
_Avoid_: Workout, routine log, gym day

**Workout Exercise**:
An individual exercise or movement performed within a workout session, containing an ordered list of sets.
_Avoid_: Movement, activity

**Workout Set**:
A discrete physical effort or rest interval within an exercise, recording metrics like weight, reps, duration, distance, RPE, or set type.
_Avoid_: Set rep, effort

**Set Type**:
The classification of a set indicating its role or intensity: normal, warmup, dropset, failure, or rest timer.
_Avoid_: Category, set kind

**Estimated 1RM (e1RM)**:
The theoretical maximum weight that could be lifted for a single repetition, calculated from a set's weight and reps (via the Epley formula: `weight * (1 + reps / 30)`).
_Avoid_: Max, top rep

**Plateau**:
A performance stall where an exercise's progression (top set weight or peak e1RM) ceases to increase over consecutive sessions despite training effort.
_Avoid_: Wall, stall, slump

**Deload**:
A temporary, deliberate reduction in training volume and intensity designed to clear accumulated fatigue and restore adaptive capacity.
_Avoid_: Rest week, off-week

**Mesocycle**:
A structured training block (typically lasting 4 to 6 weeks) consisting of progressive overload weeks followed by a scheduled deload.
_Avoid_: Program cycle, block period

**Active Exercise**:
An exercise performed at least once within the recent training window (default: last 90 days relative to the user's latest logged workout).
_Avoid_: Current lift, recent exercise

**Dormant Exercise**:
A historical exercise not performed within the active window (last 90 days). Excluded from the active Plateau & Intervention Radar.
_Avoid_: Inactive exercise, old exercise, retired exercise

**Last Deload Week**:
The calendar week during which the athlete's most recent planned volume/intensity reduction occurred. Serves as the anchor date from which the active mesocycle block is calculated.
_Avoid_: Anchor date, reset point

**Ignored Exercise**:
An exercise deliberately hidden by the athlete from active plateau alerts and default deep dive lists (e.g., when replaced by an equipment variation or not tracked for progression).
_Avoid_: Muted lift, blacklisted exercise





