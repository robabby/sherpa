---
status: seed
source-iteration: 1
spawned-from: agentic-workspace
created: 2026-03-12
priority: high
---

# Fleet Minimap UI

## Context

No product provides a persistent, always-visible overview of agent fleet activity. Every product uses full-page list views. RTS gaming UX (minimap, hotkeys, raid frames) offers a proven model for fleet management at a glance. The "fleet minimap" was independently identified as the missing primitive across multiple research vectors.

## Question

What are the concrete UX specs for a fleet minimap in Studio — a persistent, always-visible agent status overview in the sidebar or header? What data sources feed it, what interactions does it support, and how does it integrate with Studio's existing layout?

## Suggested Vectors

1. RTS minimap design patterns — StarCraft, Company of Heroes, Supreme Commander. What information density works at minimap scale?
2. System tray / menu bar status patterns — macOS menu bar items, PagerDuty status indicators, GitHub Desktop sync status. How do persistent status indicators work in desktop UX?
3. Data source inventory — What Studio already knows about running agents (worktrees, task files, session manifests, MCP connections) and what's missing
4. Compact visualization techniques — Spark lines, dot grids, traffic lights, favicon indicators. What renders meaningfully at 32x32px or a single sidebar row?

## Links

- [iteration-1/vector-2a-multi-agent-fleet-interfaces.md](../research/iteration-1/vector-2a-multi-agent-fleet-interfaces.md) — Fleet interface survey
- [iteration-1/vector-2b-rts-gaming-metaphors.md](../research/iteration-1/vector-2b-rts-gaming-metaphors.md) — RTS gaming UX patterns
- [iteration-1/vector-2f-progressive-disclosure-observability.md](../research/iteration-1/vector-2f-progressive-disclosure-observability.md) — Progressive disclosure model
