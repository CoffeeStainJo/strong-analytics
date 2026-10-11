import { describe, it, expect } from 'vitest';
import {
  calculateE1RM,
  parseDurationToSeconds,
  classifySetType,
  formatDuration,
} from '../metrics';

describe('metrics utility tests', () => {
  it('calculates Epley e1RM accurately', () => {
    // 1 rep should equal weight
    expect(calculateE1RM(100, 1)).toBe(100);

    // 100kg x 5 reps = 100 * (1 + 5/30) = 116.666... -> 116.7
    expect(calculateE1RM(100, 5)).toBe(116.7);

    // 140kg x 6 reps = 140 * (1 + 6/30) = 140 * 1.2 = 168
    expect(calculateE1RM(140, 6)).toBe(168);

    // Zero or negative handling
    expect(calculateE1RM(0, 10)).toBe(0);
    expect(calculateE1RM(100, 0)).toBe(0);
    expect(calculateE1RM(-5, 5)).toBe(0);
  });

  it('parses duration strings accurately into total seconds', () => {
    expect(parseDurationToSeconds('1h 7m')).toBe(4020);
    expect(parseDurationToSeconds('45m')).toBe(2700);
    expect(parseDurationToSeconds('1h')).toBe(3600);
    expect(parseDurationToSeconds('30s')).toBe(30);
    expect(parseDurationToSeconds('')).toBe(0);
  });

  it('classifies raw Set Order into standard SetType', () => {
    expect(classifySetType('1')).toBe('normal');
    expect(classifySetType('2')).toBe('normal');
    expect(classifySetType('W')).toBe('warmup');
    expect(classifySetType('w')).toBe('warmup');
    expect(classifySetType('D')).toBe('dropset');
    expect(classifySetType('F')).toBe('failure');
    expect(classifySetType('Rest Timer')).toBe('rest_timer');
    expect(classifySetType('REST')).toBe('rest_timer');
  });

  it('formats duration nicely', () => {
    expect(formatDuration(4020)).toBe('1h 7m');
    expect(formatDuration(2700)).toBe('45m');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(0)).toBe('0m');
  });
});
