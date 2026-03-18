---
status: pending
initiative: agent-context-portability
created: 2026-03-18
updated: 2026-03-18
type: process-change
risk: additive
targets:
  - .claude/rules/
  - .claude/skills/
  - docs/initiatives/
  - scripts/
dependencies: []
informs:
  - dispatch-center
  - scheduled-dispatch
spawned-from: null
---

# Agent Context Portability

## Summary

Sherpa's governance layer — rules, conventions, and skills — is currently only accessible to Claude Code via automatic `.claude/` directory loading. All other agent backends (OpenClaw, future agents) operate without this context, creating inconsistent output quality and behavioral drift. This initiative makes the governance layer portable across all agent backends.

## State Snapshot

The `.claude/` directory contains:
- **8 rules files** auto-loaded by Claude Code via glob patterns (`behavioral-engineering.md`, `directoturtle-convention.md`, `initiative-convention.md`, `worktree-conventions.md`, `effort-estimation.md`, `claude-md-standards.md`, `content-quality.md`, `provenance-convention.md`)
- **14 skills** (slash commands: `/rr`, `/plan-tasks`, `/integration-review`, `/design`, `/memo`, `/new-agent`, `/premortem`, `/radar`, `/retro`, `/shape`, `/spike`, `/stake`, `/stress-test`, `/ui-review`)
- **settings.json** with glob-based auto-load configuration

OpenClaw agents (and any future non-Claude-Code backend) receive none of this automatically. The `CLAUDE.md` files scattered through the repo are also Claude Code-specific and not loaded by other agents.

There is no current mechanism for governance portability across backends.

## Proposed Changes

### 1. AGENTS.md Symlink Convention

For every `CLAUDE.md` in the repository, create a symlink `AGENTS.md → CLAUDE.md`. This gives any agent that loads `AGENTS.md` files (OpenClaw, future runtimes) the same navigational context Claude Code gets.

Add a `sherpa sync --agents-md` command to `studio-cli` that creates and maintains these symlinks across the repo. The sync runs automatically as part of the existing 15-minute git sync cron on the VPS.

### 2. Governance Context File

Create `docs/agents/context/sherpa-governance.md` — a single assembled file that concatenates the essential, backend-agnostic rules from `.claude/rules/`. This file is:
- Readable by any agent as a single load
- Injected into task prompts by the dispatch system
- Maintained by a generator script that pulls from the source rules files

Content: `behavioral-engineering.md`, `directoturtle-convention.md`, `initiative-convention.md`, `effort-estimation.md`, `content-quality.md`, `provenance-convention.md`. Excludes Claude Code-specific sections (slash command references, `.claude/` path references).

### 3. OpenClaw Skills Translation

Translate the highest-value `.claude/skills/` into OpenClaw-compatible skills at `/home/node/.openclaw/skills/`. Priority order:

1. **`rr` (Recursive Research)** — the discovery engine; high value for autonomous overnight work
2. **`plan-tasks`** — breaks approved initiatives into dispatchable tasks
3. **`integration-review`** — batch review of pending proposals
4. **`premortem`** — risk assessment before implementation

Lower priority (design-heavy, require human interaction): `design`, `ui-review`, `radar`, `shape`, `stake`, `retro`, `memo`, `new-agent`, `spike`, `stress-test`.

### 4. Task Prompt Injection

Update the nightly task runner cron prompt and all dispatch tooling to automatically inject `sherpa-governance.md` at the start of every agent task. This ensures behavioral consistency without requiring each agent to manually discover the rules.

## Rationale

- **Behavioral consistency**: Without the governance layer, OpenClaw produces output that is structurally correct but doesn't follow Sherpa conventions — wrong file structure, missing frontmatter, non-compliant initiative format, etc.
- **Scalability**: As more agent backends are added, manually injecting context into each becomes unsustainable. A portable governance layer solves this once.
- **AGENTS.md as a standard**: The `AGENTS.md` convention is emerging (Anthropic, OpenAI, and Google are all converging on agent context files). Sherpa can lead this pattern by treating `CLAUDE.md` and `AGENTS.md` as two surfaces of the same governance document.
- **OpenClaw as first-class backend**: With OpenClaw now the default dispatch backend, this is critical infrastructure, not a nice-to-have.

## Dependencies

None — fully additive. All changes live in new files or symlinks. Existing `.claude/` structure is untouched.

## Review Notes

- The symlink approach means `CLAUDE.md` and `AGENTS.md` are identical files — any Claude Code-specific content (slash command references like `/rr`) will appear in the agent context but is harmless. If content divergence becomes a problem, graduate to a generator script.
- The `sherpa-governance.md` assembled file introduces a maintenance concern: it must stay in sync with source rules. Mitigate with a generator script and a CI check.
- OpenClaw skill translation requires understanding each skill's protocol in depth. Start with `rr` as it has the highest overnight autonomy value.
- This initiative itself was proposed by Luna (OpenClaw) — the first initiative authored by a non-Claude-Code agent. The provenance is intentional and worth noting.
