-- Sub-daily scheduling + effort scoring.
--
-- cadence_minutes replaces cadence_days so chores can recur more than once a
-- day (e.g. "feed the dog" every 12h = 720). effort_minutes is the estimated
-- time a chore takes; contribution rankings sum it across completions.
-- Requires SQLite 3.35+ for DROP COLUMN (better-sqlite3 11 bundles 3.45+).

ALTER TABLE chores ADD COLUMN cadence_minutes INTEGER;
ALTER TABLE chores ADD COLUMN effort_minutes INTEGER NOT NULL DEFAULT 5;

UPDATE chores SET cadence_minutes = cadence_days * 1440 WHERE cadence_days IS NOT NULL;

ALTER TABLE chores DROP COLUMN cadence_days;
