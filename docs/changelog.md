---
doc-type: changelog
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
last-verified: 2026-03-16
source-initiatives:
  - parallel-workflow-governance
  - dispatch-center
  - voice-and-tone
  - studio-ux-patterns
  - studio-agent-missions
  - agent-narrative-streaming
---

> **AI-generated** 2026-03-16 · Awaiting human review

# Changelog

Reverse-chronological record of integrated initiatives and their system impact.

## 2026-03-16 — Agent Narrative Streaming

Fills the black box between `dispatch_spawned` and `status_changed`. A sidecar script (`agent-log-streamer.sh`) tails backend output during dispatch, strips ANSI codes, batches lines, and emits `agent_output` events into the NDJSON event stream. New Log tab in the mission detail pane renders the full agent narrative as a terminal-style feed. Timeline collapses agent output into compact activity indicators.

**Initiative:** [agent-narrative-streaming](initiatives/agent-narrative-streaming/proposal.md)
**Pillar:** Execution Pipeline, Studio Application
**Key changes:**
- `scripts/agent-log-streamer.sh` sidecar for tailing backend output into NDJSON events
- Claude backend switched to `--output-format stream-json` for incremental output
- `agent_output` event type added to NDJSON schema (lines, batch, byteOffset)
- `MissionLogViewer` terminal-style component with auto-scroll and 1000-line cap
- Log tab added to mission detail pane (between Report and Verdict)
- Timeline collapses consecutive `agent_output` events into activity indicators
- Tested across Claude and Codex backends

## 2026-03-16 — Self-Documenting System

Introduced the self-documenting system: directoturtle convention elevated to first-class system-wide pattern, provenance metadata tracking authorship and review state on all maintained docs, `/integrate` skill for post-initiative documentation, `/doc-bootstrap` skill for history crawl and scaffolding.

**Initiative:** [self-documenting-system](initiatives/self-documenting-system/proposal.md)
**Pillar:** Executable Conventions, Governance Engine
**Key changes:**
- Directoturtle convention rule (`.claude/rules/directoturtle-convention.md`)
- Provenance convention rule (`.claude/rules/provenance-convention.md`)
- `/integrate` skill for post-initiative documentation updates
- `/doc-bootstrap` skill for documentation surface generation
- Architecture documentation surface (`docs/architecture/`) with seven pillar docs
- Cross-cutting decision records (`docs/decisions/`)

## 2026-03-14 — Studio Agent Missions

Reimagined the tasks page as a mission control interface. Split-pane layout with scrollable task list and full detail view showing agent metadata (provider, model, duration, tokens, cost) and structured event timeline. Edge-to-edge viewport layout matching dispatch and process pages.

**Initiative:** [studio-agent-missions](initiatives/studio-agent-missions/proposal.md)
**Pillar:** Studio Application
**Key changes:**
- Split-pane mission control layout replacing table-based task board
- Task cards with agent mission metadata
- Agent metadata header (provider, model, duration, token usage, cost estimate)
- Event timeline from NDJSON agent logs
- 14 tasks executed via subagent-driven development, 2,142 lines of code

## 2026-03-13 — Studio UX Patterns

Established five cross-cutting interaction patterns for the Studio app: command palette (Cmd+K global search), skeleton loading (loading.tsx with show-delay), functional empty states (actionable guidance), browser tab status (favicon + title updates), and URL-persisted filter state (search params across all pages).

**Initiative:** [studio-ux-patterns](initiatives/studio-ux-patterns/proposal.md)
**Pillar:** Studio Application
**Key changes:**
- Command palette component with Cmd+K activation
- Loading skeleton pattern with delayed reveal
- EmptyState component with actionable guidance
- `usePageStatus` hook for browser tab status
- URL filter state persistence via search params

## 2026-03-11 — Voice and Tone

Comprehensive content standards for Sherpa: 3 business personas, 6 product personas, messaging framework (Dunford positioning + Raskin narrative + JTBD), agent voice guidelines mapping behavioral constraints to voice constraints, accessibility and inclusion standards, component content patterns for 8 UI component types.

**Initiative:** [voice-and-tone](initiatives/voice-and-tone/proposal.md)
**Pillar:** Executable Conventions
**Key changes:**
- `docs/ux/personas.md` — 3 business personas
- `docs/ux/product-personas.md` — 6 product personas
- `docs/ux/messaging-framework.md` — Dunford + Raskin + JTBD
- `docs/ux/agent-voice.md` — behavioral constraints → voice constraints
- `docs/ux/accessibility-and-inclusion.md` — accessible content standards
- `docs/ux/component-content.md` — content patterns for 8 component types
- `.claude/rules/content-quality.md` — 8-criterion quality scorecard

## 2026-03-09 — Dispatch Center

The complete Planner/Worker/Judge execution pipeline: five CLI backends (claude, opencode, codex, gemini, lm-studio), three dispatch modes (interactive, supervised, overnight), task-type routing via `sherpa.config.ts`, Studio dispatch UI with three-panel layout, MCP server task tools, and budget allocation strategy.

**Initiative:** [dispatch-center](initiatives/dispatch-center/proposal.md)
**Pillar:** Execution Pipeline, Studio Application
**Key changes:**
- `scripts/dispatch.sh`, `worker.sh`, `auto-judge.sh`, `dispatch-queue.sh`, `task-board.sh`
- `scripts/backends/` — 5 backend modules
- `apps/studio/src/app/dispatch/` — three-panel dispatch UI
- `packages/studio-core/src/dispatch.ts` — dispatch domain logic
- `packages/studio-core/src/tasks.ts` — task data model
- 52 files, 6,500+ lines across 5 sessions

## 2026-02-28 — Parallel Workflow Governance

Codified the three-layer coordination model for multi-agent work: worktree isolation conventions, initiative lifecycle with directoturtle directory structure, proposal-based shared artifact changes, and integration review for batch conflict resolution. The governance foundation that enables concurrent agent work.

**Initiative:** [parallel-workflow-governance](initiatives/parallel-workflow-governance/proposal.md)
**Pillar:** Governance Engine, Executable Conventions
**Key changes:**
- `.claude/rules/initiative-convention.md` — directoturtle structure, proposal format, seeds
- `.claude/rules/worktree-conventions.md` — isolation model, naming, lifecycle
- Three-layer coordination model: MCP (state) → Hooks (enforcement) → CLAUDE.md (guidance)
- Integration review workflow for batch proposal processing
