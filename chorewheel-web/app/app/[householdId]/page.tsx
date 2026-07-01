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
import { UserBadge } from '@/components/UserBadge';

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
    cadenceMinutes: c.cadence_minutes,
    effortMinutes: c.effort_minutes,
    lastCompletedAt: c.last_completed_at,
    lastCompletedByName: c.last_completed_by_name,
    status: freshness(c.last_completed_at, c.cadence_minutes, now),
  }));

  const contributions = contributionStats(db(), householdId, 30);
  const members = listMembers(db(), householdId);
  const admin = canManageChores(ctx.role);

  return (
    <main className="relative mx-auto max-w-3xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wide text-ink/40 hover:text-ink"
        >
          ← households
        </Link>
        <UserBadge />
      </div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none">{household.name}</h1>
          <p className="mt-1.5 text-sm font-semibold text-ink/50">
            {members.length} member{members.length === 1 ? '' : 's'}
          </p>
        </div>
        <InviteCode code={household.join_code} />
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="geo-card p-5">
          <h2 className="eyebrow mb-3">Freshness</h2>
          <FreshnessChart chores={chores} />
        </div>
        <div className="geo-card p-5">
          <h2 className="eyebrow mb-3">Contributions · last 30 days</h2>
          <ContributionChart contributions={contributions} />
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Chores</h2>
          <span className="eyebrow">{chores.length} tracked</span>
        </div>
        <ChoreList chores={chores} canComplete canManage={admin} />
      </section>

      {admin && <AddChoreForm householdId={householdId} />}
    </main>
  );
}
