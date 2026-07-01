# chorewheel-web

The ChoreWheel webapp — a household chore monitor. Members sign in with Google,
join a household by invite code, and see every chore's **freshness** (how long
since it was last done, color-coded by overdue) plus a **per-member
contribution** summary. Household admins manage the chore list.

The same dashboard is intended to drive a Raspberry Pi kiosk display (read-only
fullscreen view) — that piece is not built yet.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Auth.js v5** (`next-auth`) with the **Google** OIDC provider, JWT sessions
- **better-sqlite3** — single-file SQLite, WAL mode, file-based migrations
- **Tailwind CSS**, **Zod**, **Vitest**

## Data model

```
users ──< memberships >── households ──< chores ──< completions
          (role: admin/member)         (cadence_days)   (who, when)
```

Freshness is derived from a chore's `cadence_days` and its latest completion
(`lib/time.ts`): `fresh` within cadence, `due` up to 1.5× cadence, `overdue`
beyond, `never` if not yet done.

## Local development

```bash
cp .env.example .env        # fill in Google OAuth creds + a session secret
pnpm install
pnpm migrate                # apply migrations (or let the app do it on boot)
pnpm seed                   # optional: demo household + chores (prints a join code)
pnpm dev                    # http://localhost:3000
```

### Google OAuth setup

Create an OAuth client at <https://console.cloud.google.com/apis/credentials>
and add the redirect URIs:

- `http://localhost:3000/api/auth/callback/google` (local)
- `https://chorewheel.kodloki.io/api/auth/callback/google` (prod)

Put the client id/secret in `.env` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`,
and a 32+ char `APP_SESSION_SECRET` (`openssl rand -base64 32`).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm migrate` | Apply SQL migrations (needs only `DATABASE_PATH`) |
| `pnpm seed` | Seed demo data |

## Layout

```
app/                     App Router pages + API routes
  page.tsx               landing / household chooser
  onboarding/            create or join a household
  app/[householdId]/     the dashboard (charts + chore list)
  api/                   auth, households, chores, completions
components/               UI (charts, chore list, forms)
lib/                     env, auth, permissions, time, db (client/migrate/queries)
lib/db/migrations/       *.sql, applied in lexical order
scripts/                 standalone migrate + seed
tests/                   vitest
```
