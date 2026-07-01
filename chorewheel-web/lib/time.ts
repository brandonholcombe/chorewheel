export type FreshnessStatus = 'fresh' | 'due' | 'overdue' | 'never';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse a SQLite `datetime('now')` UTC string into epoch ms. */
export function parseSqliteUtc(ts: string | null | undefined): number | null {
  if (!ts) return null;
  // Stored as 'YYYY-MM-DD HH:MM:SS' in UTC; append Z so Date treats it as UTC.
  const ms = Date.parse(ts.replace(' ', 'T') + 'Z');
  return Number.isNaN(ms) ? null : ms;
}

/** Whole days elapsed since `ts` (UTC) relative to `now`. */
export function daysSince(ts: string | null | undefined, now = Date.now()): number | null {
  const ms = parseSqliteUtc(ts);
  if (ms == null) return null;
  return Math.max(0, (now - ms) / DAY_MS);
}

/**
 * Status for a chore given its last completion and expected cadence.
 *  - never:   no completion recorded
 *  - fresh:   completed within the cadence window
 *  - due:     past the cadence but within a grace window (<= cadence + grace)
 *  - overdue: well past the cadence
 * Chores with no cadence are always 'fresh' once completed (untimed tracking).
 */
export function freshness(
  lastCompletedAt: string | null | undefined,
  cadenceDays: number | null | undefined,
  now = Date.now(),
): FreshnessStatus {
  const elapsed = daysSince(lastCompletedAt, now);
  if (elapsed == null) return 'never';
  if (!cadenceDays || cadenceDays <= 0) return 'fresh';
  if (elapsed <= cadenceDays) return 'fresh';
  if (elapsed <= cadenceDays * 1.5) return 'due';
  return 'overdue';
}

/** Human-friendly "2d ago" / "4h ago" / "just now". */
export function relativeTime(ts: string | null | undefined, now = Date.now()): string {
  const ms = parseSqliteUtc(ts);
  if (ms == null) return 'never';
  const diff = Math.max(0, now - ms);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
