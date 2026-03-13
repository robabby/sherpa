---
status: in-progress
initiative: agent-infrastructure
created: 2026-03-06
updated: 2026-03-07
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/lib/studio/
  - packages/studio-core/src/app/app/studio/
  - .claude/rules/
  - .claude/skills/
  - docs/architecture/
dependencies:
  - agentic-workforce
  - studio-state-machine
spawned-from: null
---

# Agent Infrastructure

Build the runtime infrastructure for a heterogeneous AI agent fleet: model routing, local OSS model integration (LM Studio), inter-agent communication, and execution monitoring. This is the "how agents actually run" layer that sits beneath the role definitions (`agentic-workforce`) and the control surface (`studio-state-machine`).

## State Snapshot

Agents currently run as manual Claude Code sessions. The human copies a prompt from Studio, pastes it into a terminal, and the session executes. There's no programmatic dispatch, no model routing, no support for non-Claude models, and no way for agents to communicate with each other except through the filesystem (proposals, workstream logs).

The `agentic-workforce` initiative defines *what* agents should do (roles, context, permissions). This initiative defines *how* they execute.

Reference: `docs/resources/agentic-design-patterns/` — Patterns 10 (MCP), 15 (A2A), 16 (Resource-Aware Optimization).

## Proposed Changes

### Phase 1 — Model Routing (~2 sessions)

Use the `model-tier` field from agent role definitions to route tasks to appropriate models.

**Routing rules:**
- `high` → Claude Opus (complex reasoning, architecture, deep research)
- `medium` → Claude Sonnet (implementation, standard review, content generation)
- `low` → Local OSS model via LM Studio or Claude Haiku (formatting, simple queries, data extraction)

**Implementation:** Routing logic in prompt generation. When Studio generates a prompt for a role, it includes a model recommendation header. Initially advisory (human picks the model), later automated.

### Phase 2 — Local Model Integration (~3 sessions)

Connect LM Studio (or compatible local inference server) as an execution target for low/medium tier tasks.

**Requirements:**
- LM Studio HTTP API compatibility (OpenAI-compatible endpoint)
- Context package delivery (role definitions specify which files to load)
- Output format standardization (local models must produce outputs the filesystem convention can consume)
- Fallback to Claude when local model output quality is insufficient

### Phase 3 — Inter-Agent Coordination (~3 sessions)

Enable agents to hand off work to each other through structured protocols.

**Handoff mechanism:**
- Agent A completes a task and writes a handoff file (structured markdown with next-role, context, deliverables)
- Studio detects the handoff and surfaces it as "ready for [next role]"
- Human approves dispatch to next agent (HITL gate)
- Over time, low-risk handoffs can be automated (e.g., researcher → reviewer)

**Execution monitoring:**
- Studio workforce page shows active/recent agent sessions
- Session outcomes logged to workstream files (closed loop with `studio-state-machine` Phase 1 signals)

### Phase 4 — MCP Integration (~2 sessions)

Expose organization-specific computation primitives as MCP tools that agents can call during execution.

**Connection to existing work:** The `@sherpa/studio-mcp` package defines the MCP server design. This phase connects that server to the agent execution environment so agents can call domain primitives programmatically rather than reading source code.

## Rationale

The three-initiative stack:

```
studio-state-machine    → control surface (see what's happening)
agentic-workforce       → role system (define who does what)
agent-infrastructure    → runtime (make it actually execute)
```

This initiative is deliberately last. You need visibility (studio-state-machine) before you can define roles (agentic-workforce), and you need roles before you can build infrastructure to run them. Each layer validates the one below it.

Starting infrastructure before roles are defined risks building plumbing for the wrong abstractions. Starting roles before the control surface exists risks expanding agent autonomy without visibility. The ordering is load-bearing.

## Dependencies

- **`agentic-workforce`** (hard) — Role definitions with model-tier, context packages, and tool permissions must exist before routing can be built.
- **`studio-state-machine`** (hard) — Velocity signals and lifecycle intelligence must exist before execution monitoring can feed data into them.
- **`mcp-composable-surface`** (soft, Phase 4 only) — MCP server design informs how agents call primitives.

## Review Notes

- This initiative is the furthest out. Phases 1-2 of the other two initiatives should be complete before this one starts.
- Local model integration has real technical risk: output quality, context window limits, format compliance. Phase 2 should start with the simplest possible task (e.g., formatting, summarization) and expand scope only as quality is validated.
- Inter-agent coordination (Phase 3) is where the system becomes genuinely agentic rather than human-dispatched. This is the highest-risk phase and needs the most careful HITL design.
- MCP integration (Phase 4) connects to existing initiative work and may be re-scoped based on where `mcp-composable-surface` lands.
- **Effort:** 8-12 sessions total, but this estimate is soft — depends heavily on what the first two initiatives reveal.
