export type FreshnessStatus = 'fresh' | 'due' | 'overdue' | 'never';

const MIN_MS = 60 * 1000;

/** Parse a SQLite `datetime('now')` UTC string into epoch ms. */
export function parseSqliteUtc(ts: string | null | undefined): number | null {
  if (!ts) return null;
  // Stored as 'YYYY-MM-DD HH:MM:SS' in UTC; append Z so Date treats it as UTC.
  const ms = Date.parse(ts.replace(' ', 'T') + 'Z');
  return Number.isNaN(ms) ? null : ms;
}

/** Minutes elapsed since `ts` (UTC) relative to `now`. */
export function minutesSince(ts: string | null | undefined, now = Date.now()): number | null {
  const ms = parseSqliteUtc(ts);
  if (ms == null) return null;
  return Math.max(0, (now - ms) / MIN_MS);
}

/**
 * Status for a chore given its last completion and expected cadence (minutes).
 *  - never:   no completion recorded
 *  - fresh:   completed within the cadence window
 *  - due:     past cadence but within a grace window (<= 1.5× cadence)
 *  - overdue: well past cadence
 * Chores with no cadence are always 'fresh' once completed (untimed tracking).
 */
export function freshness(
  lastCompletedAt: string | null | undefined,
  cadenceMinutes: number | null | undefined,
  now = Date.now(),
): FreshnessStatus {
  const elapsed = minutesSince(lastCompletedAt, now);
  if (elapsed == null) return 'never';
  if (!cadenceMinutes || cadenceMinutes <= 0) return 'fresh';
  if (elapsed <= cadenceMinutes) return 'fresh';
  if (elapsed <= cadenceMinutes * 1.5) return 'due';
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

/**
 * Render a cadence (minutes) as a friendly schedule label:
 *   720 → "2× a day", 1440 → "daily", 4320 → "every 3 days", 60 → "hourly".
 */
export function formatCadence(cadenceMinutes: number | null | undefined): string | null {
  if (!cadenceMinutes || cadenceMinutes <= 0) return null;
  const m = cadenceMinutes;
  if (m < 60) return `every ${m}m`;
  if (m < 1440) {
    // Sub-daily: "N× a day" only for small, evenly-dividing N (reads clearly);
    // otherwise express in hours.
    const perDay = 1440 / m;
    if (Number.isInteger(perDay) && perDay >= 2 && perDay <= 8) return `${perDay}× a day`;
    const h = m / 60;
    return `every ${Number.isInteger(h) ? h : h.toFixed(1)}h`;
  }
  if (m === 1440) return 'daily';
  const d = m / 1440;
  if (Number.isInteger(d)) return d === 7 ? 'weekly' : `every ${d} days`;
  return `every ${(d).toFixed(1)} days`;
}

/** Short estimate label for effort minutes, e.g. "~15 min". */
export function formatEffort(effortMinutes: number | null | undefined): string {
  const e = effortMinutes ?? 0;
  if (e >= 60) {
    const h = e / 60;
    return `~${Number.isInteger(h) ? h : h.toFixed(1)} hr`;
  }
  return `~${e} min`;
}
