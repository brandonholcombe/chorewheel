import { describe, expect, it } from 'vitest';
import { freshness, minutesSince, relativeTime, formatCadence, formatEffort } from '../lib/time';

// Fixed "now" so the relative math is deterministic.
const NOW = Date.parse('2026-06-03T12:00:00Z');
const agoMin = (mins: number) => {
  const d = new Date(NOW - mins * 60000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};
const DAY = 1440;

describe('freshness', () => {
  it('is "never" with no completion', () => {
    expect(freshness(null, 3 * DAY, NOW)).toBe('never');
  });

  it('is "fresh" within the cadence window', () => {
    expect(freshness(agoMin(1 * DAY), 3 * DAY, NOW)).toBe('fresh');
    expect(freshness(agoMin(3 * DAY), 3 * DAY, NOW)).toBe('fresh');
  });

  it('is "due" just past cadence, "overdue" well past', () => {
    expect(freshness(agoMin(4 * DAY), 3 * DAY, NOW)).toBe('due'); // within 1.5x
    expect(freshness(agoMin(9 * DAY), 3 * DAY, NOW)).toBe('overdue'); // > 1.5x
  });

  it('handles sub-daily cadence (feed the dog, every 12h)', () => {
    expect(freshness(agoMin(360), 720, NOW)).toBe('fresh'); // 6h ago
    expect(freshness(agoMin(800), 720, NOW)).toBe('due'); // just past 12h
    expect(freshness(agoMin(1200), 720, NOW)).toBe('overdue'); // > 18h
  });

  it('treats no cadence as always fresh once done', () => {
    expect(freshness(agoMin(100 * DAY), null, NOW)).toBe('fresh');
  });
});

describe('minutesSince', () => {
  it('returns elapsed minutes', () => {
    expect(minutesSince(agoMin(90), NOW)).toBeCloseTo(90, 3);
    expect(minutesSince(null, NOW)).toBeNull();
  });
});

describe('relativeTime', () => {
  it('formats common ranges', () => {
    expect(relativeTime(agoMin(0), NOW)).toMatch(/just now|m ago/);
    expect(relativeTime(agoMin(2 * DAY), NOW)).toBe('2d ago');
    expect(relativeTime(null, NOW)).toBe('never');
  });
});

describe('formatCadence', () => {
  it('formats sub-daily and multi-day cadences', () => {
    expect(formatCadence(720)).toBe('2× a day');
    expect(formatCadence(360)).toBe('4× a day');
    expect(formatCadence(1440)).toBe('daily');
    expect(formatCadence(3 * DAY)).toBe('every 3 days');
    expect(formatCadence(7 * DAY)).toBe('weekly');
    expect(formatCadence(90)).toBe('every 1.5h');
    expect(formatCadence(null)).toBeNull();
  });
});

describe('formatEffort', () => {
  it('formats minutes and hours', () => {
    expect(formatEffort(15)).toBe('~15 min');
    expect(formatEffort(60)).toBe('~1 hr');
  });
});
