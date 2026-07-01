// Standalone migration runner: `pnpm migrate`.
// Only needs DATABASE_PATH (not the full app env), so it can run in CI / an
// init container before the web process boots.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from '../lib/db/migrate';

const path = process.env.DATABASE_PATH ?? './data/chorewheel.sqlite';
mkdirSync(dirname(path), { recursive: true });

const conn = new Database(path);
conn.pragma('journal_mode = WAL');
conn.pragma('foreign_keys = ON');
runMigrations(conn);
conn.close();

console.log(`✓ migrations applied to ${path}`);
