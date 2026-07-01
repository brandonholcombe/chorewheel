import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Database } from 'better-sqlite3';

const MIGRATIONS_DIR = join(process.cwd(), 'lib', 'db', 'migrations');

/**
 * Applies every `*.sql` file in lib/db/migrations in lexical order, recording
 * each by filename in the `_migrations` table so it runs at most once. Each
 * migration file is executed in its own transaction.
 */
export function runMigrations(conn: Database): void {
  conn.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name TEXT PRIMARY KEY,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     );`,
  );

  const applied = new Set<string>(
    conn
      .prepare('SELECT name FROM _migrations')
      .all()
      .map((r) => (r as { name: string }).name),
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const record = conn.prepare('INSERT INTO _migrations (name) VALUES (?)');

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const tx = conn.transaction(() => {
      conn.exec(sql);
      record.run(file);
    });
    tx();
  }
}
