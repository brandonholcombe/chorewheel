import type { ChoreView } from '@/components/ChoreList';
import type { FreshnessStatus } from '@/lib/time';

// Pure render (no client JS) so it works identically in the Pi kiosk view.
const ORDER: FreshnessStatus[] = ['overdue', 'due', 'fresh', 'never'];
const COLOR: Record<FreshnessStatus, string> = {
  overdue: '#dc2626',
  due: '#f59e0b',
  fresh: '#16a34a',
  never: '#a3a3a3',
};
const LABEL: Record<FreshnessStatus, string> = {
  overdue: 'Overdue',
  due: 'Due soon',
  fresh: 'Fresh',
  never: 'Never',
};

export function FreshnessChart({ chores }: { chores: ChoreView[] }) {
  const total = chores.length;
  const counts = ORDER.map((s) => ({
    status: s,
    count: chores.filter((c) => c.status === s).length,
  }));

  if (total === 0) {
    return <p className="text-sm text-neutral-400">No chores to track yet.</p>;
  }

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        {counts.map(
          ({ status, count }) =>
            count > 0 && (
              <div
                key={status}
                style={{ width: `${(count / total) * 100}%`, backgroundColor: COLOR[status] }}
                title={`${LABEL[status]}: ${count}`}
              />
            ),
        )}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {counts.map(({ status, count }) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLOR[status] }}
            />
            <span className="text-neutral-500">{LABEL[status]}</span>
            <span className="ml-auto font-medium tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
