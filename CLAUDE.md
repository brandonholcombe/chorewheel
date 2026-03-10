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

## Project-Specific Instructions

<!-- Add your project-specific Claude Code instructions below this line -->
