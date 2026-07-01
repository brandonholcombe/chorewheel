'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { relativeTime, formatCadence, formatEffort, type FreshnessStatus } from '@/lib/time';
import {
  CadenceInput,
  EffortInput,
  cadenceToMinutes,
  useChoreForm,
} from '@/components/ChoreFields';

export interface ChoreView {
  id: string;
  name: string;
  description: string | null;
  cadenceMinutes: number | null;
  effortMinutes: number;
  lastCompletedAt: string | null;
  lastCompletedByName: string | null;
  status: FreshnessStatus;
}

const SWATCH: Record<FreshnessStatus, string> = {
  fresh: 'bg-fresh',
  due: 'bg-due',
  overdue: 'bg-overdue',
  never: 'bg-ink/20',
};

const LABEL: Record<FreshnessStatus, string> = {
  fresh: 'Fresh',
  due: 'Due soon',
  overdue: 'Overdue',
  never: 'Never done',
};

export function ChoreList({
  chores,
  canComplete,
  canManage = false,
}: {
  chores: ChoreView[];
  canComplete: boolean;
  canManage?: boolean;
}) {
  if (chores.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/25 p-8 text-center text-sm font-medium text-ink/50">
        No chores yet.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {chores.map((chore) => (
        <ChoreRow
          key={chore.id}
          chore={chore}
          canComplete={canComplete}
          canManage={canManage}
        />
      ))}
    </ul>
  );
}

function ChoreRow({
  chore,
  canComplete,
  canManage,
}: {
  chore: ChoreView;
  canComplete: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  async function complete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/chores/${chore.id}/complete`, { method: 'POST' });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li>
        <EditChoreForm chore={chore} onClose={() => setEditing(false)} />
      </li>
    );
  }

  const cadence = formatCadence(chore.cadenceMinutes);
  const meta = [
    chore.lastCompletedAt
      ? `${relativeTime(chore.lastCompletedAt)}${
          chore.lastCompletedByName ? ` · ${chore.lastCompletedByName}` : ''
        }`
      : 'not done yet',
    cadence,
    formatEffort(chore.effortMinutes),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-ink/15 bg-panel/80 px-3 py-2.5 backdrop-blur-sm transition hover:border-ink/40">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${SWATCH[chore.status]}`}
        title={LABEL[chore.status]}
        aria-label={LABEL[chore.status]}
      >
        {chore.status === 'overdue' && <span className="font-display font-bold text-white">!</span>}
        {chore.status === 'fresh' && <span className="font-bold text-white">✓</span>}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold">{chore.name}</p>
        <p className="truncate text-xs font-medium text-ink/50">{meta}</p>
      </div>
      {canManage && (
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit chore"
          title="Edit"
          className="shrink-0 rounded-lg border border-transparent px-2 py-1.5 text-ink/40 transition hover:border-ink/30 hover:text-ink"
        >
          <PencilIcon />
        </button>
      )}
      {canComplete && (
        <button onClick={complete} disabled={busy} className="btn-geo shrink-0 px-4 py-2 text-sm">
          {busy ? '…' : 'Done'}
        </button>
      )}
    </li>
  );
}

function EditChoreForm({ chore, onClose }: { chore: ChoreView; onClose: () => void }) {
  const router = useRouter();
  const { name, setName, cadence, setCadence, effort, setEffort } = useChoreForm({
    name: chore.name,
    cadenceMinutes: chore.cadenceMinutes,
    effortMinutes: chore.effortMinutes,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/chores/${chore.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          cadenceMinutes: cadenceToMinutes(cadence),
          effortMinutes: effort ? Number(effort) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Could not save');
        return;
      }
      onClose();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!confirm(`Archive "${chore.name}"? It stops showing but its history is kept.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/chores/${chore.id}`, { method: 'DELETE' });
      if (res.ok) {
        onClose();
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="geo-card animate-pop-in space-y-3 p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={120}
        autoFocus
        className="input-geo"
      />
      <div className="flex flex-wrap items-end gap-3">
        <CadenceInput state={cadence} onChange={setCadence} />
        <EffortInput minutes={effort} onChange={setEffort} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={busy || !name.trim()} className="btn-geo text-sm">
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-ink/50 hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={archive}
          disabled={busy}
          className="ml-auto text-sm font-semibold text-overdue/80 hover:text-overdue"
        >
          Archive
        </button>
      </div>
      {error && <p className="text-sm font-semibold text-overdue">{error}</p>}
    </form>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
