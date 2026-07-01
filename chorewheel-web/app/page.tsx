import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { listHouseholdsForUser } from '@/lib/db/queries';
import { currentUser } from '@/lib/session';
import { SignInButton } from '@/components/AuthButtons';
import { Brand } from '@/components/Brand';
import { Triangle } from '@/components/Geo';
import { UserBadge } from '@/components/UserBadge';

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="animate-pop-in">
          <div className="mb-8 flex justify-center">
            <Brand size="lg" />
          </div>
          <h1 className="mx-auto max-w-xl font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Every chore.
            <br />
            <span className="text-brand">Who did it.</span> How long it&apos;s been.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg font-medium text-ink/60">
            A bold, at-a-glance board for your household&apos;s chores — fresh, due, or overdue.
          </p>
          <div className="mt-9 flex justify-center">
            <SignInButton callbackUrl="/" />
          </div>
        </div>
      </main>
    );
  }

  const households = listHouseholdsForUser(db(), user.id);
  if (households.length === 0) redirect('/onboarding');

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <Brand />
        <UserBadge />
      </header>

      <div className="mb-5 flex items-center gap-3">
        <Triangle className="h-5 w-5 text-brand" />
        <h1 className="font-display text-2xl font-black">Your households</h1>
      </div>

      <ul className="space-y-3">
        {households.map((h, i) => (
          <li key={h.id} className="animate-pop-in" style={{ animationDelay: `${i * 60}ms` }}>
            <Link
              href={`/app/${h.id}`}
              className="geo-card flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md"
            >
              <span className="font-display text-lg font-semibold">{h.name}</span>
              <span className="rounded-lg border border-ink/15 bg-sun/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                {h.role}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href="/onboarding"
          className="inline-block rounded-xl border-2 border-dashed border-ink/40 px-4 py-2 text-sm font-bold text-ink/60 transition hover:border-ink hover:text-ink"
        >
          + Create or join another household
        </Link>
      </div>
    </main>
  );
}
