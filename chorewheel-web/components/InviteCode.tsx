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
      className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-sun/70 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
    >
      <span className="text-[10px] font-black uppercase tracking-normal opacity-60">invite</span>
      {copied ? 'copied!' : code}
    </button>
  );
}
