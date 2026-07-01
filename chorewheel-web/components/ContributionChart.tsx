import type { Contribution } from '@/lib/db/queries';

// Per-member contribution, ranked by effort points (summed effort_minutes),
// with completion count shown as a secondary metric. Pure render so the Pi
// kiosk view renders it server-side with no client JS.
const BARS = ['bg-brand', 'bg-coral', 'bg-sun', 'bg-sky', 'bg-fresh'];

export function ContributionChart({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) {
    return <p className="text-sm font-medium text-ink/40">No completions in the last 30 days.</p>;
  }
  const max = Math.max(...contributions.map((c) => c.points), 1);

  return (
    <ul className="space-y-3">
      {contributions.map((c, i) => (
        <li key={c.user_id}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="truncate font-semibold text-ink/80">{c.name ?? c.email}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-display font-bold tabular-nums">{c.points}</span>
              <span className="text-xs font-medium text-ink/45">pts · {c.count} done</span>
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full border border-ink/15 bg-paper">
            <div
              className={`h-full rounded-full ${BARS[i % BARS.length]}`}
              style={{ width: `${Math.max((c.points / max) * 100, 5)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
