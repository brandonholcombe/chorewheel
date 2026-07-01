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
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-1 font-semibold">Create a household</h2>
        <p className="mb-4 text-sm text-neutral-500">You&apos;ll be its admin.</p>
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
            className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            Create
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-1 font-semibold">Join with a code</h2>
        <p className="mb-4 text-sm text-neutral-500">Ask a member for the invite code.</p>
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
            className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            Join
          </button>
        </form>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
