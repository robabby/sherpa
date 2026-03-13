# Sherpa Roadmap

Last updated: 2026-03-12

## Current Phase: Framework Extraction + First Workforces

The `@sherpa/studio-*` packages have been extracted from WavePoint into this monorepo. Studio runs against Sherpa's own governance data. The next phase is building the framework capabilities needed to support real agentic workforces, then building those workforces.

## In-Flight Initiatives

| Initiative | Status | What |
|-----------|--------|------|
| `behavioral-agents` | approved (Phase 2 complete) | Schema spec, 26-agent base catalog, validation tooling |
| `agentic-workforce` | in-progress | Planner/Worker/Judge pipeline, role definitions |
| `studio-collaboration-platform` | in-progress | Morning review UX, exception-first dashboard |
| `studio-state-machine` | in-progress | Velocity/staleness derivation, lifecycle intelligence |
| `sherpa-framework-extraction` | in-progress | Package extraction, config-as-code, convention sync |
| `distributed-agent-consistency` | in-progress | Event sourcing, consistency models |

## Pending Approval

| Initiative | What | Blocks |
|-----------|------|--------|
| `mcp-coordination-layer` | 4-tool MCP server, SQLite state, hook enforcement | Overnight dispatch, content workforces |
| `section-level-prose-sync` | Heading-granularity three-way merge for convention sync | Convention Sync CLI |
| `doi-model-for-agents` | Context scoping via unified DOI formula, LOD tiers | Agent context management |
| `game-authority-as-mcp-protocol` | Six-state authority machine, fencing tokens | Coordination layer implementation |
| `agent-infrastructure` | Model routing, local models, inter-agent coordination | Multi-backend dispatch |

## Upcoming: New Initiatives

### Framework Capabilities

| Initiative | What | Depends On |
|-----------|------|-----------|
| `overnight-dispatch` | Recurring unattended execution — scheduling, session lifecycle, failure recovery, morning handoff protocol | `mcp-coordination-layer`, `agentic-workforce` |
| `content-governance` | Editorial workflows, quality gates for prose content, publishing lifecycle — extends governance engine to non-code artifacts | `studio-collaboration-platform`, `behavioral-agents` |
| `external-service-integrations` | MCP tools for external APIs (CMS, YouTube, voice synthesis) — auth, rate limiting, content upload patterns | `mcp-coordination-layer` |

### Sherpa Consulting (Business)

| Initiative | What | Depends On |
|-----------|------|-----------|
| `sherpa-website` | sherpa.solar public site — landing page, consulting offerings, blog section | `sherpa-framework-extraction` |
| `blog-content-engine` | First agentic workforce — blog research, writing, editorial review, overnight cycle | `sherpa-website`, `overnight-dispatch`, `content-governance` |
| `headless-youtube-pipeline` | Second workforce — automated video production (script → voice → visuals → edit → upload) | `blog-content-engine`, `external-service-integrations` |
| `ai-literacy-program` | Consulting curriculum for organizations behind on AI adoption — workshops, presentations, engagement design | `blog-content-engine` (top of funnel) |

## Housekeeping

- [ ] Create `docs/architecture/platform-strategy.md` — strategic context document referenced by /rr orient step
- [ ] Rename `wavepoint/*` schema discriminators to `sherpa/*` across codebase (23 files)
- [ ] Keep this roadmap in sync with initiative system — currently manual, needs automation or a governance pattern

## Sequencing

```
Phase 1 (now)     Framework extraction, behavioral agents, Studio UI
Phase 2 (next)    Coordination layer, overnight dispatch, content governance
Phase 3           sherpa.solar website, blog content workforce
Phase 4           YouTube pipeline, AI literacy consulting program
```

Each phase validates the framework for the next. Content workforces are the first real consumers of overnight dispatch, morning review, and editorial governance. Lessons from Phase 3 inform the more complex Phase 4 workforces.
