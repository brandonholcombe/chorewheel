# ChoreWheel

A household **chore monitoring system**. Members sign in with Google, join a
household by invite code, and see at a glance which chores are fresh, due, or
overdue — and who last did each one — alongside a per-member contribution chart.

Two surfaces share one backend:

- **Webapp** (`chorewheel-web/`) — the interactive app: sign in, manage chores
  (admins), mark them done. **Built — see [`chorewheel-web/README.md`](chorewheel-web/README.md).**
- **Raspberry Pi display** — a read-only fullscreen kiosk showing the same
  freshness + contribution view. _Not built yet._

Deploys to the kodloki.io Linode LKE cluster (`tow-c1`) at
`chorewheel.kodloki.io` (K8s manifests / ArgoCD wiring to follow).

## Repo layout

```
chorewheel-web/   Next.js 15 + Auth.js (Google) + SQLite webapp
symbols/          Symbolic-alignment manifest + lock (project truth)
docs/             Architecture / deployment docs referenced by symbols
Agents/           Review-gate task docs + review reports
scripts/align.py  Alignment tooling
```

## Project state & alignment

Project truth lives in `symbols/manifest.json`; run `python3 scripts/align.py
status` for the current state. This repo was scaffolded from the **baseline**
symbolic-alignment template (mechanics preserved in
[`docs/symbolic-alignment.md`](docs/symbolic-alignment.md)), which also enforces
a review-before-implementation gate — see [`CLAUDE.md`](CLAUDE.md).
