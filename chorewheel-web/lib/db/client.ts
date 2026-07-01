import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { env } from '@/lib/env';
import { runMigrations } from '@/lib/db/migrate';

// A single better-sqlite3 connection is reused across the process. Next.js can
// re-evaluate modules during dev (HMR), so we stash the handle on globalThis to
// avoid opening a new connection (and re-running migrations) on every reload.
type GlobalWithDb = typeof globalThis & { __chorewheelDb?: Database.Database };
const g = globalThis as GlobalWithDb;

function open(): Database.Database {
  const path = env().DATABASE_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const conn = new Database(path);
  conn.pragma('journal_mode = WAL');
  conn.pragma('foreign_keys = ON');
  conn.pragma('busy_timeout = 5000');
  runMigrations(conn);
  return conn;
}

export function db(): Database.Database {
  if (!g.__chorewheelDb) {
    g.__chorewheelDb = open();
  }
  return g.__chorewheelDb;
}
