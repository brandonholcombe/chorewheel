'use client';

import { useState } from 'react';

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the code is still shown.
    }
  }

  return (
    <button
      onClick={copy}
      title="Copy invite code"
      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-sm tracking-widest text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    >
      {copied ? 'copied!' : code}
    </button>
  );
}
