# Symbolic Alignment

This project uses **symbolic alignment** to maintain verifiable project state. Instead of relying on prose that drifts out of date, project truth is encoded as typed symbols with property edges (interlocks) that form a hash tree. Agents traverse semantics; machines verify hashes.

## Where Truth Lives

- **`symbols/manifest.json`** — Declarative symbol definitions. Read the `description` and `properties` fields to understand current project state. If a symbol lists `docs`, read those files for full context.
- **`symbols/manifest.lock`** — Generated hash tree. The `means` field on each symbol is a human-readable summary. The `status` field tells you if alignment holds. Do not reason about hex strings.

## How to Check Alignment

```bash
python scripts/align.py status    # Full human-readable report
python scripts/align.py check     # Machine check (exit 0=ok, 1=broken, 2=stale)
```

Run `status` if you are unsure whether your context is current.

## When Alignment Breaks

If `align.py check` reports broken interlocks or missing docs:

1. **Stop.** Do not proceed with stale context.
2. Read the status output to understand what changed.
3. Either fix the root cause (update properties, restore docs) or flag the issue.
4. Run `python scripts/align.py lock` after fixing to regenerate the lock.

## Updating Symbols

When you change project state that a symbol tracks:

1. Update the relevant properties in `symbols/manifest.json`
2. Update any interlocked symbols that reference changed properties
3. Run `python scripts/align.py lock` to regenerate the hash tree
4. Commit both `manifest.json` and `manifest.lock` together

---

## Review Gate

A PreToolUse hook (`.claude/hooks/require-review.sh`) enforces **review before implementation**. When active task documents exist in `Agents/TODO/Active/`, source file edits (`src/`, `k8s/`, `scripts/`, `config/`) are blocked until a corresponding review report exists in `Agents/Review-reports/`.

### Workflow

1. Create a task document in `Agents/TODO/Active/` with `## Author: <your-name>` and `## Status: Not Started`
2. Draft your implementation plan
3. A **different agent** writes a review report in `Agents/Review-reports/` with `## Reviewer: <their-name>`, referencing the task filename
4. Implement (hook now allows source file edits)
5. Mark the task `## Status: Complete` when done

### Independent Review Rule

**Agents cannot review their own work.** The `## Author:` field in the task must differ from the `## Reviewer:` field in the review report. If they match, the review gate will deny the edit as a self-review. Both fields are required.

### Conventions

- Task documents must include `## Author: <agent-name>`
- Review reports must include `## Reviewer: <agent-name>` and reference the task filename (e.g., `my-task.md`) in their body
- Author and Reviewer must be different agents
- Tasks with `## Status: Complete` (case-insensitive) are skipped by the gate
- Ad-hoc work without task documents is not gated
- Non-source files (Agents/, docs/, .claude/) are always allowed

---

## Project-Specific Instructions

<!-- Add your project-specific Claude Code instructions below this line -->

**ChoreWheel** is a household chore monitoring system: a Next.js webapp
(`chorewheel-web/`) and a planned Raspberry Pi kiosk display, sharing one
SQLite-backed backend. Members sign in with Google, join a household by invite
code, and view chore freshness + per-member contributions.

### Stack & conventions (webapp)

- Next.js 15 App Router, React 19, Auth.js v5 (`next-auth`) with the **Google**
  OIDC provider (JWT sessions), better-sqlite3, Tailwind, Zod, Vitest. pnpm.
- Mirrors the proven **eloup** layout: `lib/{env,auth,permissions,session}.ts`,
  `lib/db/{client,migrate,queries}` + `lib/db/migrations/*.sql` (file-based,
  applied in lexical order, recorded in `_migrations`).
- Env is validated centrally in `lib/env.ts`; never read `process.env` directly
  elsewhere. All DB access goes through `lib/db/queries.ts` (prepared statements).
- Access model: open Google sign-in, but all data is scoped by **household
  membership**. Admins manage chores; any member can mark a chore done. Enforced
  in `lib/permissions.ts` + checked in every API route via `requireMembership`.

### Deploy target

Linode LKE cluster `tow-c1`, host `chorewheel.kodloki.io`, image prefix
`bholcombe/chorewheel-web`, SQLite on a `linode-block-storage-retain` PVC. K8s
manifests / ArgoCD wiring still to be added (follow the eloup `K8s/` + `argocd/`
pattern). DNS A-record → `172.232.176.47`.

### Remotes

`github` (canonical) and `gitea` (haxley mirror) — both point at `chorewheel`.
