'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OnboardingForms() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(url: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      router.push(`/app/${data.household.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="geo-card p-6">
        <h2 className="mb-1 font-display text-lg font-black">Create a household</h2>
        <p className="mb-4 text-sm font-medium text-ink/50">
          You&apos;ll be its admin — it starts with a few default chores.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) submit('/api/households', { name: name.trim() });
          }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="The Holcombes"
            maxLength={80}
            className="input-geo flex-1"
          />
          <button type="submit" disabled={busy || !name.trim()} className="btn-geo">
            Create
          </button>
        </form>
      </section>

      <section className="geo-card p-6">
        <h2 className="mb-1 font-display text-lg font-black">Join with a code</h2>
        <p className="mb-4 text-sm font-medium text-ink/50">Ask a member for the invite code.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) submit('/api/households/join', { code: code.trim() });
          }}
          className="flex gap-2"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="K7Q-M4PX"
            maxLength={32}
            className="input-geo flex-1 font-mono uppercase tracking-widest"
          />
          <button type="submit" disabled={busy || !code.trim()} className="btn-geo">
            Join
          </button>
        </form>
      </section>

      {error && <p className="text-sm font-bold text-overdue">{error}</p>}
    </div>
  );
}
