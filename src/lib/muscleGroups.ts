/**
 * Heuristic mapping from Strong exercise names to a primary muscle group.
 * Strong exports do not include muscle data, so we classify by keyword.
 * Rules are evaluated in order; the first match wins, so more specific
 * patterns (e.g. "romanian deadlift") must come before generic ones ("deadlift").
 */
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings & Glutes',
  'Calves',
  'Core',
  'Other',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

const RULES: [RegExp, MuscleGroup][] = [
  // Core
  [/\b(plank|crunch|sit[- ]?up|ab wheel|leg raise|knee raise|russian twist|hollow|pallof|woodchop|cable twist|dead bug|v[- ]?up|toes to bar)\b/, 'Core'],
  [/\babs?\b|oblique/, 'Core'],

  // Calves
  [/calf|calves/, 'Calves'],

  // Hamstrings & glutes (before generic deadlift / curl / extension rules)
  [/romanian|\brdl\b|stiff[- ]leg|good morning|hip thrust|glute|leg curl|hamstring|nordic|kickback \(.*(cable|machine)|pull through|back extension|hyperextension|hip abduct/, 'Hamstrings & Glutes'],

  // Quads
  [/squat|leg press|leg extension|lunge|step[- ]?up|split squat|hack|sissy|pistol|wall sit|hip adduct/, 'Quads'],

  // Shoulders (before generic press / fly / raise rules)
  [/overhead press|shoulder press|military press|arnold|push press|\bohp\b|lateral raise|front raise|rear delt|reverse fly|face pull|upright row|\bdelt|shoulder|handstand|landmine press/, 'Shoulders'],

  // Triceps
  [/tricep|skull ?crusher|pushdown|push[- ]down|close[- ]grip bench|bench dip|jm press|french press/, 'Triceps'],

  // Biceps / forearms (after leg curl)
  [/bicep|curl|chin[- ]?up/, 'Biceps'],

  // Chest
  [/bench|chest|\bfly\b|flye|push[- ]?up|pec\b|pec deck|crossover|\bdip\b|floor press/, 'Chest'],

  // Back
  [/row|pull[- ]?up|pull ?down|pulldown|\blat\b|deadlift|shrug|pullover|rack pull|muscle[- ]?up|t[- ]bar/, 'Back'],
];

const cache = new Map<string, MuscleGroup>();

export function classifyMuscleGroup(exerciseName: string): MuscleGroup {
  const cached = cache.get(exerciseName);
  if (cached) return cached;

  const normalized = exerciseName.toLowerCase();
  let group: MuscleGroup = 'Other';
  for (const [pattern, candidate] of RULES) {
    if (pattern.test(normalized)) {
      group = candidate;
      break;
    }
  }
  cache.set(exerciseName, group);
  return group;
}
