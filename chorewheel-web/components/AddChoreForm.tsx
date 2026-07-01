'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CadenceInput,
  EffortInput,
  cadenceToMinutes,
  useChoreForm,
} from '@/components/ChoreFields';

export function AddChoreForm({ householdId }: { householdId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { name, setName, cadence, setCadence, effort, setEffort } = useChoreForm({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          householdId,
          name: name.trim(),
          cadenceMinutes: cadenceToMinutes(cadence),
          effortMinutes: effort ? Number(effort) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Could not add chore');
        return;
      }
      setName('');
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-ink/25 px-4 py-3 text-sm font-semibold text-ink/55 transition hover:border-ink/50 hover:text-ink"
      >
        + Add a chore
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="geo-card animate-pop-in space-y-3 p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Chore name"
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
          Add chore
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-ink/50 hover:text-ink"
        >
          Cancel
        </button>
        {error && <span className="text-sm font-semibold text-overdue">{error}</span>}
      </div>
    </form>
  );
}
