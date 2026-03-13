---
status: in-progress
initiative: sherpa-framework-extraction
created: 2026-03-10
updated: 2026-03-12
iteration: 4
type: research-synthesis
risk: structural
targets:
  - packages/studio-core/
  - packages/studio-ui/
  - apps/studio/
  - packages/studio-mcp/
  - .claude/rules/
  - .claude/skills/
  - docs/agents/roles/
spawned-from: studio-collaboration-platform
---

# Sherpa Framework Extraction

## Summary

Extract Studio's domain-agnostic governance, task management, and agentic workflow infrastructure into `@sherpa/studio` — a white-label framework for Human+AI collaborative workflows. Sherpa (AI & Digital Transformation consulting) becomes the first consumer; WavePoint becomes the first customer. The framework embodies the Bezos mandate applied one level up: the same workflow system powering our work is designed for external developers and organizations to use.

## State Snapshot

**What exists (extracted into Sherpa monorepo):**
- `packages/studio-core/` — governance metadata scanning, initiative lifecycle, task board, velocity scoring. Clean DAG with zero circular dependencies. Only runtime deps: `zod` + `gray-matter`.
- `packages/studio-ui/` — 91 presentational components, domain-agnostic. shadcn/ui based.
- `packages/studio-mcp/` — MCP server for task CRUD + dispatch. Domain-agnostic.
- `.claude/rules/` — convention files, 6 framework-level (initiative convention, effort estimation, worktrees, behavioral engineering, claude-md standards).
- `.claude/skills/` — 3 framework-level skills (rr, integration-review, plan-tasks).
- `docs/agents/roles/` — 13 roles, 10 framework-level archetypes (architect, engineer, judge, etc.).

**The three-entity model:**
- **`@sherpa/studio`** — the framework (the "Rails")
- **Sherpa** — AI consulting business, first consumer of the framework
- **WavePoint** — astrology platform, first customer of the framework

**Key convention:** Behavioral engineering — agent roles are defined through behavioral constraints, not identity claims. Research-validated and codified in `.claude/rules/behavioral-engineering.md`.

## Research (4 Iterations)

**Iteration 1:** Three-channel distribution architecture established:

| Channel | What | Mechanism | Update Story |
|---------|------|-----------|-------------|
| **Code packages** | UI components, lib modules, MCP server | npm packages (`@sherpa/studio-*`) | Standard semver, Changesets |
| **Executable conventions** | Skills, hooks, MCP server configs | Claude Code plugin marketplace | Plugin auto-updates |
| **Prose conventions** | Rules, CLAUDE.md templates, roles, task schemas | Scaffold CLI + sync CLI | Three-way merge / diff-and-prompt |

**Package architecture:**
```
@sherpa/studio-core     — lib modules (governance, tasks, lifecycle, velocity)
@sherpa/studio-ui       — React components (shadcn-based, CSS variable themed)
@sherpa/studio-mcp      — task MCP server (standalone, npm/npx)
@sherpa/studio-cli      — scaffold + sync CLI (sherpa init, sherpa sync)
@sherpa/studio          — meta-package re-exporting core + ui
```

**Architectural model:** Payload CMS (framework-inside-your-app, config-as-code via `sherpa.config.ts`, curried plugin pattern for extensions).

**Iteration 2:** Convention sync CLI design, config entrypoint (`defineConfig()`), extraction dependency graph (5-phase DAG), publishing workflow.

**Iteration 3:** `createStudio(config)` API (13 nested namespaces), catalog registration (config-based, Payload model), environment portability (strip `import "server-only"`), standalone testing strategy, Claude Code plugin distribution.

**Iteration 4:** Sync API decision (ship sync v1), UI extraction (Plate's model — npm for logic, registry for UI), convention sync ecosystem still vacant, monorepo gotchas (sub-path exports, Changesets linked mode).

See `research/README.md` for full details.

## Dependencies

- `studio-collaboration-platform` — parent initiative, Studio design direction
- `agentic-workforce` — role definitions, planner/worker/judge pipeline
- `behavioral-agents` — behavioral agent schema spec

## Review Notes

- **Timing risk**: Premature extraction could lock in wrong boundaries. Mitigated by JIT internal packages (change boundaries freely before npm graduation).
- **The meta-recursive test**: The extraction initiative itself was planned and executed using the task dispatch system, validating the framework's generality.
