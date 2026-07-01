import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { listHouseholdsForUser } from '@/lib/db/queries';
import { currentUser } from '@/lib/session';
import { SignInButton, SignOutButton } from '@/components/AuthButtons';

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-8 px-6 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">🧹 ChoreWheel</h1>
          <p className="mt-3 text-lg text-neutral-500">
            See every household chore, who did it, and how long it&apos;s been.
          </p>
        </div>
        <SignInButton callbackUrl="/" />
      </main>
    );
  }

  const households = listHouseholdsForUser(db(), user.id);
  if (households.length === 0) redirect('/onboarding');

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your households</h1>
        <SignOutButton />
      </header>

      <ul className="space-y-3">
        {households.map((h) => (
          <li key={h.id}>
            <Link
              href={`/app/${h.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="font-medium">{h.name}</span>
              <span className="text-xs uppercase tracking-wide text-neutral-400">{h.role}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <Link href="/onboarding" className="text-sm text-neutral-500 underline hover:text-neutral-800">
          Create or join another household
        </Link>
      </div>
    </main>
  );
}
