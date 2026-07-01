# Symbolic Alignment Template

A framework for maintaining verifiable project state through declarative symbols. Instead of prose that rots over time, project truth is encoded as **typed symbols** with **property interlocks** that form a Merkle-like hash tree.

**Agents traverse semantics. Machines verify hashes.**

## What is Symbolic Alignment?

Traditional project documentation drifts. A decision made in week 1 gets buried in a doc nobody updates, and by week 8 an AI agent (or a human) is working from stale context.

Symbolic alignment fixes this by:

1. **Declaring truth as symbols** — each symbol has typed properties representing desired state
2. **Linking symbols with interlocks** — property edges that enforce consistency across symbols
3. **Hashing everything into a lock file** — a Merkle-like tree that CI and hooks can verify instantly
4. **Giving agents semantic handles** — the `description` and `means` fields let AI agents understand state without parsing hex

## Quick Start

1. **Use this template** — fork or clone this repository

2. **Customize `symbols/manifest.json`** — define your project's symbols, properties, and interlocks

3. **Create your docs** — add referenced documentation to `docs/`

4. **Generate the lock**:
   ```bash
   python scripts/align.py lock
   ```

5. **Commit both files** — `manifest.json` and `manifest.lock` travel together

Or start fresh with defaults:
```bash
python scripts/align.py init
```

## Defining Symbols

Each symbol in `manifest.json` has:

```json
{
  "symbol_name": {
    "description": "Human/agent-readable context about this symbol",
    "docs": ["docs/relevant-doc.md"],
    "properties": {
      "key": "value"
    },
    "interlocks": {}
  }
}
```

- **`description`** — Semantic context. Agents read this to understand what the symbol represents.
- **`docs`** — File paths this symbol governs. These get hashed into the lock.
- **`properties`** — Typed key-value pairs representing desired state. These are what interlocks check.

## Defining Interlocks

Interlocks are directed edges between symbol properties. They enforce that two symbols agree on shared state.

```json
{
  "deployment": {
    "properties": {
      "expects_provider": "akamai"
    },
    "interlocks": {
      "architecture.provider": "expects_provider"
    }
  }
}
```

This reads: **"deployment.expects_provider must equal architecture.provider."**

If someone changes `architecture.provider` to `"aws"` but forgets to update `deployment.expects_provider`, the alignment check will catch it.

## Using with Claude Code

The template includes:

- **`CLAUDE.md`** — Agent instructions that point to `manifest.json` as the source of truth
- **`.claude/settings.json`** — A `PreToolUse` hook that runs `align.py check --quiet` before any file edit, warning agents if alignment is broken

The hook is non-blocking by default (`|| true`). To make it blocking, remove the `|| true` from the hook command.

## CI Integration

The included GitHub Actions workflow (`.github/workflows/alignment-check.yml`) runs on every push and PR to `main`:

- Executes `python scripts/align.py check`
- Fails the workflow if interlocks are broken or docs are missing
- Posts a status report as a job summary on failure

## Commands Reference

| Command | Description |
|---|---|
| `align.py init` | Create starter `manifest.json`, placeholder docs, and initial `manifest.lock` |
| `align.py init --force` | Overwrite existing manifest |
| `align.py lock` | Regenerate `manifest.lock` from current `manifest.json` and docs |
| `align.py check` | Verify alignment. Exit 0 = aligned, 1 = broken, 2 = stale |
| `align.py check --quiet` | One-line output to stderr (for hooks/CI) |
| `align.py status` | Human-readable report with color-coded output |

## Requirements

- Python 3.9+ (stdlib only — no dependencies)
