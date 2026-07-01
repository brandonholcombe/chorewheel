import type { ChoreView } from '@/components/ChoreList';
import type { FreshnessStatus } from '@/lib/time';

// Pure render (no client JS) so it works identically in the Pi kiosk view.
const ORDER: FreshnessStatus[] = ['overdue', 'due', 'fresh', 'never'];
const COLOR: Record<FreshnessStatus, string> = {
  overdue: '#f04438',
  due: '#f79009',
  fresh: '#12b76a',
  never: '#a1a1aa',
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
    return <p className="text-sm font-medium text-ink/40">No chores to track yet.</p>;
  }

  return (
    <div>
      {/* Segmented status bar. */}
      <div className="flex h-5 w-full overflow-hidden rounded-full border border-ink/15 bg-paper">
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
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {counts.map(({ status, count }) => (
          <li
            key={status}
            className="flex items-center gap-2 rounded-lg border border-ink/12 bg-paper/60 px-2.5 py-1.5"
          >
            <span
              className="h-3 w-3 rounded-[4px]"
              style={{ backgroundColor: COLOR[status] }}
            />
            <span className="text-sm font-medium text-ink/70">{LABEL[status]}</span>
            <span className="ml-auto font-display text-lg font-bold tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
