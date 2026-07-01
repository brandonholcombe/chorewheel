'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { relativeTime, type FreshnessStatus } from '@/lib/time';

export interface ChoreView {
  id: string;
  name: string;
  description: string | null;
  cadenceDays: number | null;
  lastCompletedAt: string | null;
  lastCompletedByName: string | null;
  status: FreshnessStatus;
}

const DOT: Record<FreshnessStatus, string> = {
  fresh: 'bg-fresh',
  due: 'bg-due',
  overdue: 'bg-overdue',
  never: 'bg-neutral-300 dark:bg-neutral-600',
};

const LABEL: Record<FreshnessStatus, string> = {
  fresh: 'Fresh',
  due: 'Due soon',
  overdue: 'Overdue',
  never: 'Never done',
};

export function ChoreList({ chores, canComplete }: { chores: ChoreView[]; canComplete: boolean }) {
  if (chores.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
        No chores yet.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {chores.map((chore) => (
        <ChoreRow key={chore.id} chore={chore} canComplete={canComplete} />
      ))}
    </ul>
  );
}

function ChoreRow({ chore, canComplete }: { chore: ChoreView; canComplete: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function complete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/chores/${chore.id}/complete`, { method: 'POST' });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[chore.status]}`}
        title={LABEL[chore.status]}
        aria-label={LABEL[chore.status]}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{chore.name}</p>
        <p className="truncate text-xs text-neutral-500">
          {chore.lastCompletedAt
            ? `${relativeTime(chore.lastCompletedAt)}${
                chore.lastCompletedByName ? ` · ${chore.lastCompletedByName}` : ''
              }`
            : 'not done yet'}
          {chore.cadenceDays ? ` · every ${chore.cadenceDays}d` : ''}
        </p>
      </div>
      {canComplete && (
        <button
          onClick={complete}
          disabled={busy}
          className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {busy ? '…' : 'Done'}
        </button>
      )}
    </li>
  );
}
