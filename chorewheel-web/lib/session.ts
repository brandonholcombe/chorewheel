import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { getMembership, getUserById, type User } from '@/lib/db/queries';
import type { Role } from '@/lib/permissions';

/** The signed-in user row, or null if unauthenticated. */
export async function currentUser(): Promise<User | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return getUserById(db(), userId) ?? null;
}

export interface HouseholdContext {
  user: User;
  role: Role;
}

/**
 * Resolve the current user and assert membership in a household. Returns null
 * when unauthenticated or not a member — callers map that to redirect/403.
 */
export async function requireMembership(householdId: string): Promise<HouseholdContext | null> {
  const user = await currentUser();
  if (!user) return null;
  const membership = getMembership(db(), householdId, user.id);
  if (!membership) return null;
  return { user, role: membership.role };
}
