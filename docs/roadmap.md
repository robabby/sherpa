# Sherpa Roadmap

Last updated: 2026-06-17

> **Direction update (2026-06-17):** Studio has been refocused onto the **governance lifecycle** as its single core; the autonomous-agent **dispatch/execution layer was removed** (see `docs/initiatives/studio-governance-refocus/`). Roadmap items below concerning dispatch, the agentic workforce, or overnight execution (`dispatch-center`, `agentic-workforce`, `ai-sdk-dispatch`, `scheduled-dispatch`, agent instances, …) are **superseded** and retained only as historical context — see the portfolio triage in the refocus initiative. Execution is delegated to Claude Code / external tools; Studio is the pane of glass that governs it.

## Current Phase: Governance Refocus

Studio does one thing: the governance lifecycle (propose → shape → plan → integrate, with provenance). The autonomous-agent dispatch layer has been removed; the MCP server exposes governance + knowledge tools; the Sessions surface reflects real Claude Code logs. Near-term focus is making the governance loop legible and the provenance/drift surface useful.

## Recently Integrated

| Initiative | What |
|-----------|------|
| `dispatch-center` | 8-backend dispatch center UI with CLI/API badges, provider routing |
| `voice-and-tone` | Sherpa voice guidelines, content principles, product positioning docs |
| `parallel-workflow-governance` | Parallel initiative governance conventions |
| `studio-ux-patterns` | Edge-to-edge layouts, split-pane patterns, action bar conventions |

## In-Progress

| Initiative | Status | What |
|-----------|--------|------|
| `agentic-workforce` | in-progress | Planner/Worker/Judge pipeline, 13 role definitions complete |
| `sherpa-framework-extraction` | in-progress | Package extraction, config-as-code, convention sync (4 research iterations) |
| `agent-infrastructure` | in-progress | Model routing, local models, inter-agent coordination |
| `agent-framework-patterns` | in-progress | Behavioral engineering research evidence base |
| `ux-product-personas` | in-progress | Product persona definitions for Studio users |

## Approved — Ready to Start

### Framework & Governance

| Initiative | What | Depends On |
|-----------|------|-----------|
| `behavioral-agents` | Portable schema spec, 120-agent catalog migration, validation tooling | `agent-framework-patterns` |
| `mcp-coordination-layer` | 4-tool MCP server, SQLite state authority, hook enforcement | `sqlite-agentic-state` |
| `ai-sdk-dispatch` | Vercel AI SDK provider abstraction for API backends | `dispatch-center` |
| `agent-cards` | Governance artifact spec — "model cards" for behavioral agents, compliance bridging | `behavioral-agents` |

### Studio UI

| Initiative | What | Depends On |
|-----------|------|-----------|
| `studio-agent-missions` | Tasks page as full-viewport AI agent mission control | — |
| `studio-collaboration-platform` | Morning review UX, exception-first dashboard | `agentic-workforce` |
| `studio-state-machine` | Velocity/staleness derivation, lifecycle intelligence | — |
| `studio-process-playbook-ui` | Process skill pipeline visualization | `post-research-skill-suite` |
| `studio-dashboard-sidenav` | Dashboard layout and navigation redesign | — |
| `design-system` | Formalized design tokens, component patterns | — |

### Strategic Research (Evergreen)

| Initiative | What | Informs |
|-----------|------|---------|
| `consulting-disruption-signals` | Big Six transformation tracking, structural gap analysis | 5 downstream initiatives |
| `agentic-consulting-landscape` | Solo+agents market mapping, service design, pricing | `sherpa-website` |
| `agentic-workspace` | Future of workspace tools, PM category disruption, Agent OS positioning | Multiple framework initiatives |

### Sherpa Consulting (Business)

| Initiative | What | Depends On |
|-----------|------|-----------|
| `sherpa-website` | sherpa.solar public site — consulting, framework showcase, content hub | `sherpa-framework-extraction` |

## Pending — Needs Review

### Framework Infrastructure

| Initiative | What | Depends On |
|-----------|------|-----------|
| `agentic-organization-model` | Agent instance layer — persistent identity, stats, teams, lifecycle | `behavioral-agents`, `mcp-coordination-layer` |
| `sqlite-agentic-state` | SQLite storage for agentic state (sessions, dispatch, coordination) | `mcp-coordination-layer` |
| `distributed-agent-consistency` | Event sourcing, consistency models for multi-agent coordination | `sqlite-agentic-state` |
| `section-level-prose-sync` | Heading-granularity three-way merge for convention sync | — |
| `scheduled-dispatch` | Time-based recurring dispatch (overnight execution) | `dispatch-center` |
| `ai-gateway-dispatch` | Unified model gateway across providers | `ai-sdk-dispatch` |
| `ledger-governance-rbac` | Role-based access control for governance operations | `mcp-coordination-layer` |
| `github-initiative-linking` | Link GitHub PRs/issues to initiatives bidirectionally | — |

### Research & Experimental

| Initiative | What |
|-----------|------|
| `mmo-patterns-for-agents` | Game server patterns (authority, replication, LOD) applied to agent coordination |
| `harmonic-research-system` | Harmonic/resonance patterns for agent collaboration models |

## Upcoming — Not Yet Proposed

### Framework Capabilities

| Concept | What | Depends On |
|---------|------|-----------|
| Overnight dispatch | Recurring unattended execution, morning handoff | `mcp-coordination-layer`, `scheduled-dispatch` |
| Content governance | Editorial workflows, quality gates for prose | `studio-collaboration-platform`, `behavioral-agents` |
| External service integrations | MCP tools for CMS, YouTube, voice synthesis | `mcp-coordination-layer` |
| Compliance export | EU AI Act / ISO 42001 documentation from convention artifacts | `agent-cards`, `sherpa-framework-extraction` |

### Sherpa Consulting (Business)

| Concept | What | Depends On |
|---------|------|-----------|
| Blog content engine | First agentic workforce — research, writing, editorial review | `sherpa-website`, overnight dispatch, content governance |
| YouTube pipeline | Automated video production (script → voice → visuals → upload) | Blog content engine, external service integrations |
| AI literacy program | Workshop curriculum for organizations behind on AI adoption | Blog content engine (top of funnel) |

## Archived

| Initiative | Why |
|-----------|-----|
| `mcp-agent-delegation` | Superseded by `mcp-coordination-layer` approach |

## Sequencing

```
Phase 1 (now)     Framework extraction, behavioral agents, Studio UI, strategic research
Phase 2 (next)    Coordination layer, agent instances, overnight dispatch, agent cards
Phase 3           sherpa.solar website, compliance export, consulting launch
Phase 4           Content workforces, YouTube pipeline, AI literacy program
```

Each phase validates the framework for the next. Strategic research (consulting-disruption-signals, agentic-workspace) runs continuously across all phases, feeding intelligence into tactical decisions. The insurance urgency timeline (governance becoming a hard requirement by 2026-2027) compresses the Phase 2→3 transition.

## Housekeeping

- [ ] Rename `wavepoint/*` schema discriminators to `sherpa/*` across codebase
- [ ] Create `post-research-skill-suite/proposal.md` (activity.md exists, proposal missing)
- [ ] Automate roadmap sync with initiative system (currently manual)
