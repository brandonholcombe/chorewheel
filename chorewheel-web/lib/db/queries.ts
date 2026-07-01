import type { Database } from 'better-sqlite3';
import { id, generateJoinCode } from '@/lib/codes';
import { DEFAULT_CHORES } from '@/lib/default-chores';
import type { Role } from '@/lib/permissions';

export interface User {
  id: string;
  google_sub: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string;
}

export interface HouseholdMembership extends Household {
  role: Role;
}

export interface Member {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
}

export interface Chore {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  cadence_days: number | null;
  sort_order: number;
  archived: number;
  created_by: string | null;
  created_at: string;
}

export interface ChoreWithStatus extends Chore {
  last_completed_at: string | null;
  last_completed_by_id: string | null;
  last_completed_by_name: string | null;
}

export interface Contribution {
  user_id: string;
  name: string | null;
  email: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface GoogleIdentity {
  sub: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/** Insert-or-update a user keyed by Google subject id; returns the row. */
export function upsertUserByGoogle(conn: Database, identity: GoogleIdentity): User {
  const existing = conn
    .prepare('SELECT * FROM users WHERE google_sub = ?')
    .get(identity.sub) as User | undefined;

  if (existing) {
    conn
      .prepare('UPDATE users SET email = ?, name = ?, image = ? WHERE id = ?')
      .run(identity.email, identity.name ?? null, identity.image ?? null, existing.id);
    return { ...existing, email: identity.email, name: identity.name ?? null, image: identity.image ?? null };
  }

  const row: User = {
    id: id(),
    google_sub: identity.sub,
    email: identity.email,
    name: identity.name ?? null,
    image: identity.image ?? null,
    created_at: '',
  };
  conn
    .prepare(
      'INSERT INTO users (id, google_sub, email, name, image) VALUES (@id, @google_sub, @email, @name, @image)',
    )
    .run(row);
  return conn.prepare('SELECT * FROM users WHERE id = ?').get(row.id) as User;
}

export function getUserById(conn: Database, userId: string): User | undefined {
  return conn.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
}

// ---------------------------------------------------------------------------
// Households + memberships
// ---------------------------------------------------------------------------

/** Households the user belongs to, with their role, newest first. */
export function listHouseholdsForUser(conn: Database, userId: string): HouseholdMembership[] {
  return conn
    .prepare(
      `SELECT h.*, m.role AS role
         FROM households h
         JOIN memberships m ON m.household_id = h.id
        WHERE m.user_id = ?
        ORDER BY h.created_at DESC`,
    )
    .all(userId) as HouseholdMembership[];
}

export function getMembership(
  conn: Database,
  householdId: string,
  userId: string,
): { role: Role } | undefined {
  return conn
    .prepare('SELECT role FROM memberships WHERE household_id = ? AND user_id = ?')
    .get(householdId, userId) as { role: Role } | undefined;
}

export function getHousehold(conn: Database, householdId: string): Household | undefined {
  return conn.prepare('SELECT * FROM households WHERE id = ?').get(householdId) as
    | Household
    | undefined;
}

export function findHouseholdByJoinCode(conn: Database, code: string): Household | undefined {
  return conn.prepare('SELECT * FROM households WHERE join_code = ?').get(code) as
    | Household
    | undefined;
}

/**
 * Create a household and make the creator its admin, atomically. By default the
 * household is seeded with the starter chore list (DEFAULT_CHORES); pass
 * `{ seedDefaults: false }` to create an empty one.
 */
export function createHousehold(
  conn: Database,
  name: string,
  userId: string,
  opts: { seedDefaults?: boolean } = {},
): HouseholdMembership {
  const seedDefaults = opts.seedDefaults ?? true;
  const tx = conn.transaction(() => {
    // Retry on the (astronomically unlikely) join_code collision.
    let code = generateJoinCode();
    while (findHouseholdByJoinCode(conn, code)) code = generateJoinCode();

    const householdId = id();
    conn
      .prepare(
        'INSERT INTO households (id, name, join_code, created_by) VALUES (?, ?, ?, ?)',
      )
      .run(householdId, name, code, userId);
    conn
      .prepare(
        "INSERT INTO memberships (id, household_id, user_id, role) VALUES (?, ?, ?, 'admin')",
      )
      .run(id(), householdId, userId);

    if (seedDefaults) {
      for (const chore of DEFAULT_CHORES) {
        createChore(conn, {
          householdId,
          name: chore.name,
          cadenceDays: chore.cadenceDays,
          createdBy: userId,
        });
      }
    }
    return householdId;
  });
  const householdId = tx();
  return { ...(getHousehold(conn, householdId) as Household), role: 'admin' };
}

/** Add a user to a household as a member if not already in it. Returns role. */
export function joinHousehold(conn: Database, householdId: string, userId: string): Role {
  const existing = getMembership(conn, householdId, userId);
  if (existing) return existing.role;
  conn
    .prepare(
      "INSERT INTO memberships (id, household_id, user_id, role) VALUES (?, ?, ?, 'member')",
    )
    .run(id(), householdId, userId);
  return 'member';
}

export function listMembers(conn: Database, householdId: string): Member[] {
  return conn
    .prepare(
      `SELECT u.id, u.name, u.email, u.image, m.role AS role
         FROM memberships m
         JOIN users u ON u.id = m.user_id
        WHERE m.household_id = ?
        ORDER BY (m.role = 'admin') DESC, u.name`,
    )
    .all(householdId) as Member[];
}

// ---------------------------------------------------------------------------
// Chores + completions
// ---------------------------------------------------------------------------

export interface NewChore {
  householdId: string;
  name: string;
  description?: string | null;
  cadenceDays?: number | null;
  createdBy: string;
}

export function createChore(conn: Database, input: NewChore): Chore {
  const choreId = id();
  const nextOrder =
    (
      conn
        .prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM chores WHERE household_id = ?')
        .get(input.householdId) as { n: number }
    ).n;
  conn
    .prepare(
      `INSERT INTO chores (id, household_id, name, description, cadence_days, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      choreId,
      input.householdId,
      input.name,
      input.description ?? null,
      input.cadenceDays ?? null,
      nextOrder,
      input.createdBy,
    );
  return conn.prepare('SELECT * FROM chores WHERE id = ?').get(choreId) as Chore;
}

export function getChore(conn: Database, choreId: string): Chore | undefined {
  return conn.prepare('SELECT * FROM chores WHERE id = ?').get(choreId) as Chore | undefined;
}

export interface ChoreUpdate {
  name?: string;
  description?: string | null;
  cadenceDays?: number | null;
  archived?: boolean;
}

export function updateChore(conn: Database, choreId: string, patch: ChoreUpdate): void {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id: choreId };
  if (patch.name !== undefined) {
    sets.push('name = @name');
    params.name = patch.name;
  }
  if (patch.description !== undefined) {
    sets.push('description = @description');
    params.description = patch.description;
  }
  if (patch.cadenceDays !== undefined) {
    sets.push('cadence_days = @cadence_days');
    params.cadence_days = patch.cadenceDays;
  }
  if (patch.archived !== undefined) {
    sets.push('archived = @archived');
    params.archived = patch.archived ? 1 : 0;
  }
  if (sets.length === 0) return;
  conn.prepare(`UPDATE chores SET ${sets.join(', ')} WHERE id = @id`).run(params);
}

/** Active chores for a household, each with its most-recent completion. */
export function listChoresWithStatus(conn: Database, householdId: string): ChoreWithStatus[] {
  return conn
    .prepare(
      `SELECT c.*,
              lc.completed_at AS last_completed_at,
              lu.id          AS last_completed_by_id,
              lu.name        AS last_completed_by_name
         FROM chores c
         LEFT JOIN completions lc
                ON lc.id = (SELECT id FROM completions
                             WHERE chore_id = c.id
                             ORDER BY completed_at DESC, id DESC LIMIT 1)
         LEFT JOIN users lu ON lu.id = lc.user_id
        WHERE c.household_id = ? AND c.archived = 0
        ORDER BY c.sort_order, c.created_at`,
    )
    .all(householdId) as ChoreWithStatus[];
}

export function addCompletion(
  conn: Database,
  choreId: string,
  userId: string,
  note?: string | null,
): void {
  conn
    .prepare('INSERT INTO completions (id, chore_id, user_id, note) VALUES (?, ?, ?, ?)')
    .run(id(), choreId, userId, note ?? null);
}

/** Per-member completion counts within the last `sinceDays` days. */
export function contributionStats(
  conn: Database,
  householdId: string,
  sinceDays = 30,
): Contribution[] {
  return conn
    .prepare(
      `SELECT u.id AS user_id, u.name AS name, u.email AS email, COUNT(*) AS count
         FROM completions comp
         JOIN chores c ON c.id = comp.chore_id
         JOIN users u ON u.id = comp.user_id
        WHERE c.household_id = ?
          AND comp.completed_at >= datetime('now', ?)
        GROUP BY u.id
        ORDER BY count DESC, u.name`,
    )
    .all(householdId, `-${sinceDays} days`) as Contribution[];
}
