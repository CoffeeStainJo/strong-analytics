import { SetType } from '../types/workout';

/**
 * Parses human-readable durations like "1h 7m", "45m", "1h", or "35s" into total seconds.
 */
export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 0;

  const hoursMatch = durationStr.match(/(\d+)\s*h/i);
  const minutesMatch = durationStr.match(/(\d+)\s*m/i);
  const secondsMatch = durationStr.match(/(\d+)\s*s/i);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Classifies raw 'Set Order' into standard `SetType`.
 */
export function classifySetType(rawSetOrder: string): SetType {
  if (!rawSetOrder) return 'normal';
  const normalized = rawSetOrder.trim().toUpperCase();
  if (normalized === 'W') return 'warmup';
  if (normalized === 'D') return 'dropset';
  if (normalized === 'F') return 'failure';
  if (normalized === 'REST TIMER' || normalized.includes('REST')) return 'rest_timer';
  return 'normal';
}

/**
 * Calculates Estimated 1RM (e1RM) using the standard Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 * If reps is 1, e1RM equals weight.
 * If weight or reps <= 0, returns 0.
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight * 10) / 10;
  // Standard Epley formula rounded to 1 decimal place
  const e1rm = weight * (1 + reps / 30);
  return Math.round(e1rm * 10) / 10;
}

/**
 * Formats seconds into clean human string (e.g. 3720 -> "1h 2m")
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Formats a weight number in kg with thousand separators (e.g. 12500 -> "12,500 kg")
 */
export function formatKg(weight: number, decimals: number = 0): string {
  if (isNaN(weight)) return '0 kg';
  return `${weight.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} kg`;
}
