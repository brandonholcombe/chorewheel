import type { Contribution } from '@/lib/db/queries';

// Horizontal bar chart of per-member completion counts. Pure render so the Pi
// kiosk view renders it server-side with no client JS.
export function ContributionChart({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) {
    return <p className="text-sm text-neutral-400">No completions in the last 30 days.</p>;
  }
  const max = Math.max(...contributions.map((c) => c.count), 1);

  return (
    <ul className="space-y-2">
      {contributions.map((c) => (
        <li key={c.user_id} className="text-sm">
          <div className="mb-0.5 flex justify-between">
            <span className="truncate text-neutral-600 dark:text-neutral-300">
              {c.name ?? c.email}
            </span>
            <span className="ml-2 font-medium tabular-nums">{c.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-neutral-800 dark:bg-neutral-200"
              style={{ width: `${(c.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
