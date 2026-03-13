---
status: seed
source-iteration: 1
spawned-from: agent-infrastructure
created: 2026-03-06
priority: high
---

# Session Manifests

## Context

Research iteration 1 identified that Claude Code already produces complete session data as JSONL transcripts, and the hooks system provides `SessionStart`/`SessionEnd` lifecycle events. The session manifest — a structured JSON summary written by a `SessionEnd` hook — is the key new primitive connecting studio-state-machine (velocity signals), agentic-workforce (role tracking), and agent-infrastructure (execution monitoring).

## Question

What is the concrete schema, storage location, and hook implementation for session manifests? How does the manifest integrate with Studio's filesystem-reading pattern, and how should it handle edge cases (crash without `SessionEnd`, cross-worktree visibility, stale manifests)?

## Suggested Vectors

1. **Schema design:** Define the `wavepoint/session@1` JSON schema. What fields are required vs. optional? How does the schema accommodate future role and model-tier fields from agentic-workforce?
2. **Hook implementation:** Write and test the `SessionEnd` hook script. Parse JSONL for token totals, extract git commits since session start, determine initiative from branch name. What's the error handling for missing/corrupt JSONL?
3. **Storage and visibility:** Should manifests be committed (visible across worktrees, part of history) or local (no git noise)? Could a symlinked directory give both? How does Studio discover manifests?
4. **ccusage baseline:** Can `ccusage session --json` provide an immediate read-only view before custom hooks exist? What's in its output schema?

## Links

- [Claude Code Session Format](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [ccusage](https://ccusage.com/)
- [agent-of-empires](https://github.com/njbrake/agent-of-empires)
