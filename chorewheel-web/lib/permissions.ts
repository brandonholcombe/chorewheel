export type Role = 'admin' | 'member';

export function isAdmin(role: Role | null | undefined): boolean {
  return role === 'admin';
}

/** Only admins may create, edit, archive, or reorder chores. */
export function canManageChores(role: Role | null | undefined): boolean {
  return isAdmin(role);
}

/** Any member of a household may mark a chore complete. */
export function canCompleteChores(role: Role | null | undefined): boolean {
  return role === 'admin' || role === 'member';
}
