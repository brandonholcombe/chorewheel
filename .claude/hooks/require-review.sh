#!/bin/bash
# PreToolUse hook: blocks source file edits when active tasks lack review reports.
# Enforces "review before implementation" — the review must exist BEFORE code changes.
#
# Logic:
#   1. Only gates production files (src/, k8s/, scripts/, config/)
#   2. If no active tasks exist, allow freely (ad-hoc work)
#   3. If active tasks exist, each must have a review report referencing it
#   4. If any active task is unreviewed, deny the edit
#
# Review reports must reference the task filename (e.g., "my-task.md")
# somewhere in their body to count as a review for that task.
#
# Directory conventions (override via env vars):
#   REVIEW_GATE_TASKS_DIR   — active task documents (default: Agents/TODO/Active)
#   REVIEW_GATE_REVIEWS_DIR — review reports       (default: Agents/Review-reports)

set -uo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path — allow (shouldn't happen for Edit/Write)
[ -z "$FILE_PATH" ] && exit 0

# Only gate production files — allow everything else
case "$FILE_PATH" in
    */src/*|*/k8s/*|*/scripts/*|*/config/*) ;;
    *) exit 0 ;;
esac

PROJ="${CLAUDE_PROJECT_DIR:-$(echo "$INPUT" | jq -r '.cwd')}"
ACTIVE_DIR="${REVIEW_GATE_TASKS_DIR:-$PROJ/Agents/TODO/Active}"
REVIEW_DIR="${REVIEW_GATE_REVIEWS_DIR:-$PROJ/Agents/Review-reports}"

# No active task directory — allow
[ ! -d "$ACTIVE_DIR" ] && exit 0

# Collect non-complete active tasks that lack a review report
unreviewed=()
shopt -s nullglob
for task in "$ACTIVE_DIR"/*.md; do
    # Skip completed tasks
    grep -qiE '^## Status:.*[Cc]omplete' "$task" 2>/dev/null && continue

    task_name=$(basename "$task")

    # Check if any review report references this task filename
    if [ -d "$REVIEW_DIR" ]; then
        found=false
        for review in "$REVIEW_DIR"/*.md; do
            if grep -q "$task_name" "$review" 2>/dev/null; then
                found=true
                break
            fi
        done
        $found && continue
    fi

    unreviewed+=("$task_name")
done
shopt -u nullglob

# All tasks reviewed (or no active tasks) — allow
[ ${#unreviewed[@]} -eq 0 ] && exit 0

# Block: unreviewed active tasks exist
tasks=$(printf '%s, ' "${unreviewed[@]}")
tasks=${tasks%, }

jq -n --arg reason "REVIEW GATE: Active task(s) without review reports: ${tasks}. Write a technical review in Agents/Review-reports/ (referencing the task filename) BEFORE editing source files." \
'{
    hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: $reason
    }
}'
exit 0
