import { describe, expect, it } from 'vitest';
import { freshness, daysSince, relativeTime } from '../lib/time';

// Fixed "now" so the relative math is deterministic.
const NOW = Date.parse('2026-06-03T12:00:00Z');
const ago = (days: number) => {
  const d = new Date(NOW - days * 86400000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

describe('freshness', () => {
  it('is "never" with no completion', () => {
    expect(freshness(null, 3, NOW)).toBe('never');
  });

  it('is "fresh" within the cadence window', () => {
    expect(freshness(ago(1), 3, NOW)).toBe('fresh');
    expect(freshness(ago(3), 3, NOW)).toBe('fresh');
  });

  it('is "due" just past cadence, "overdue" well past', () => {
    expect(freshness(ago(4), 3, NOW)).toBe('due'); // within 1.5x
    expect(freshness(ago(9), 3, NOW)).toBe('overdue'); // > 1.5x
  });

  it('treats no cadence as always fresh once done', () => {
    expect(freshness(ago(100), null, NOW)).toBe('fresh');
  });
});

describe('daysSince', () => {
  it('returns whole-ish elapsed days', () => {
    expect(daysSince(ago(2), NOW)).toBeCloseTo(2, 5);
    expect(daysSince(null, NOW)).toBeNull();
  });
});

describe('relativeTime', () => {
  it('formats common ranges', () => {
    expect(relativeTime(ago(0), NOW)).toMatch(/just now|m ago|h ago/);
    expect(relativeTime(ago(2), NOW)).toBe('2d ago');
    expect(relativeTime(null, NOW)).toBe('never');
  });
});
