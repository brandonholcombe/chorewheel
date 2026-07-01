// Small geometric accents for the brand mark and headings. The page-wide
// backdrop now lives in the animated CSS layer (.bg-animated in globals.css),
// so these are just the little inline shapes.

export function Triangle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <polygon points="50,6 94,94 6,94" />
    </svg>
  );
}

// A little 2×2 cluster of dots — echoes the wordmark glyph.
export function DotCluster({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-1 ${className}`} aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
      <span className="h-2.5 w-2.5 rounded-full bg-coral" />
      <span className="h-2.5 w-2.5 rounded-full bg-sun" />
      <span className="h-2.5 w-2.5 rounded-full bg-sky" />
    </div>
  );
}
