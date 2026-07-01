import Link from 'next/link';
import { DotCluster } from '@/components/Geo';

// The ChoreWheel wordmark: a 2×2 dot cluster glyph + bold display type.
export function Brand({ href = '/', size = 'md' }: { href?: string; size?: 'md' | 'lg' }) {
  const text = size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl';
  const glyph = size === 'lg' ? 'h-11 w-11' : 'h-8 w-8';
  return (
    <Link href={href} className="group inline-flex items-center gap-3">
      <span
        className={`grid ${glyph} place-items-center rounded-xl border border-ink/12 bg-panel shadow-sm transition group-hover:-rotate-6`}
      >
        <DotCluster />
      </span>
      <span className={`font-display font-black tracking-tight ${text}`}>
        Chore<span className="text-brand">Wheel</span>
      </span>
    </Link>
  );
}
