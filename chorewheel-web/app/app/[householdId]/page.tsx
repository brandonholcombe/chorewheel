import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import {
  contributionStats,
  getHousehold,
  listChoresWithStatus,
  listMembers,
} from '@/lib/db/queries';
import { canManageChores } from '@/lib/permissions';
import { requireMembership } from '@/lib/session';
import { freshness } from '@/lib/time';
import { ChoreList, type ChoreView } from '@/components/ChoreList';
import { FreshnessChart } from '@/components/FreshnessChart';
import { ContributionChart } from '@/components/ContributionChart';
import { AddChoreForm } from '@/components/AddChoreForm';
import { InviteCode } from '@/components/InviteCode';
import { SignOutButton } from '@/components/AuthButtons';

type Params = { params: Promise<{ householdId: string }> };

export default async function Dashboard({ params }: Params) {
  const { householdId } = await params;
  const ctx = await requireMembership(householdId);
  if (!ctx) redirect('/');

  const household = getHousehold(db(), householdId);
  if (!household) notFound();

  const now = Date.now();
  const chores: ChoreView[] = listChoresWithStatus(db(), householdId).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    cadenceDays: c.cadence_days,
    lastCompletedAt: c.last_completed_at,
    lastCompletedByName: c.last_completed_by_name,
    status: freshness(c.last_completed_at, c.cadence_days, now),
  }));

  const contributions = contributionStats(db(), householdId, 30);
  const members = listMembers(db(), householdId);
  const admin = canManageChores(ctx.role);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600">
            ← households
          </Link>
          <h1 className="text-2xl font-bold">{household.name}</h1>
          <p className="text-sm text-neutral-500">
            {members.length} member{members.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SignOutButton />
          <InviteCode code={household.join_code} />
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Freshness</h2>
          <FreshnessChart chores={chores} />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">
            Contributions · last 30 days
          </h2>
          <ContributionChart contributions={contributions} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-semibold">Chores</h2>
        <ChoreList chores={chores} canComplete />
      </section>

      {admin && <AddChoreForm householdId={householdId} />}
    </main>
  );
}
