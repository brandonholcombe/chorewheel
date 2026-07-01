-- ChoreWheel initial schema.
-- All ids are app-generated UUID strings. Timestamps are ISO-8601 UTC
-- ('YYYY-MM-DD HH:MM:SS') stored as TEXT via datetime('now').

CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  google_sub  TEXT NOT NULL UNIQUE,   -- Google's stable subject id ("sub")
  email       TEXT NOT NULL,
  name        TEXT,
  image       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE households (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  join_code   TEXT NOT NULL UNIQUE,   -- short human-shareable invite code
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE memberships (
  id            TEXT PRIMARY KEY,
  household_id  TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (household_id, user_id)
);

CREATE INDEX idx_memberships_user ON memberships (user_id);
CREATE INDEX idx_memberships_household ON memberships (household_id);

CREATE TABLE chores (
  id            TEXT PRIMARY KEY,
  household_id  TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  -- Expected recadence in days. Drives the freshness/overdue calculation.
  -- NULL means "no schedule" (tracked but never flagged overdue).
  cadence_days  INTEGER,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  archived      INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_chores_household ON chores (household_id, archived);

CREATE TABLE completions (
  id            TEXT PRIMARY KEY,
  chore_id      TEXT NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at  TEXT NOT NULL DEFAULT (datetime('now')),
  note          TEXT
);

CREATE INDEX idx_completions_chore ON completions (chore_id, completed_at);
CREATE INDEX idx_completions_user ON completions (user_id, completed_at);
