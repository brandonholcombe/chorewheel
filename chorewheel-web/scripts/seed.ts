// Dev seed: `pnpm seed`. Creates a demo household with a couple of users,
// chores, and completions so the dashboard has something to show locally.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from '../lib/db/migrate';
import {
  addCompletion,
  createHousehold,
  joinHousehold,
  listChoresWithStatus,
  upsertUserByGoogle,
} from '../lib/db/queries';

const path = process.env.DATABASE_PATH ?? './data/chorewheel.sqlite';
mkdirSync(dirname(path), { recursive: true });
const conn = new Database(path);
conn.pragma('foreign_keys = ON');
runMigrations(conn);

const bron = upsertUserByGoogle(conn, { sub: 'seed-bron', email: 'bron@example.com', name: 'Bron' });
const sam = upsertUserByGoogle(conn, { sub: 'seed-sam', email: 'sam@example.com', name: 'Sam' });

// createHousehold seeds the default starter chores automatically.
const household = createHousehold(conn, 'Demo House', bron.id);
joinHousehold(conn, household.id, sam.id);

// Add a few completions against the seeded defaults so the dashboard has data.
const chores = listChoresWithStatus(conn, household.id);
const byName = (name: string) => chores.find((c) => c.name === name);
const trash = byName('Take out trash');
const dishes = byName('Dishes');
const plants = byName('Water plants');
if (trash) addCompletion(conn, trash.id, bron.id);
if (dishes) addCompletion(conn, dishes.id, sam.id);
if (plants) addCompletion(conn, plants.id, sam.id);

conn.close();
console.log(`✓ seeded demo data into ${path}`);
console.log(`  household join code: ${household.join_code}`);
