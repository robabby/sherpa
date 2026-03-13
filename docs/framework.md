# Sherpa: The Framework

## 1. Behavioral Agent System

- Agent role definitions with behavioral constraints (disposition, fail-triggers, quality-bar) — not identity claims
- **Research-validated**: Zheng et al. (EMNLP 2024, 162 roles) showed identity-role effects are "largely random." SkillsBench (2026) showed compact behavioral definitions outperform comprehensive ones by 21.7pp. Anthropic's own research showed role assignments activate unpredictable persona clouds beyond what was specified
- **Structurally novel**: No framework in the industry decomposes behavioral content into typed, measurable fields. Every competitor uses freeform `instructions` strings. Sherpa's schema (disposition, domain-scope, quality-bar, fail-triggers, behavioral-constraints) is a first-mover contribution
- Model-tier routing (which roles need Opus, which can run on local models)
- The schema spec for portable agent definitions, with validation tooling (Zod schemas, identity-language linting, three severity levels)
- Base catalog of 25+ behavioral agents across 10 categories — every new Sherpa instantiation starts with batteries included

## 2. Governance Engine

- Initiative lifecycle — the proposal → plan → activity → integration state machine. This is the core governance loop that no other tool does.
- Directoturtle — the recursive directory convention (initiatives contain sub-initiatives, same structure all the way down)
- Integration review — batch conflict resolution when multiple initiatives target the same artifact
- The "never edit shared artifacts directly" rule — proposals as the unit of change

## 3. Execution Pipeline

- Planner/Worker/Judge — the three-role dispatch model
- Task board (docs/tasks/) — dispatchable work items with YAML frontmatter contracts
- Multi-backend dispatch — Claude for code tasks, local models for content/research tasks
- The MCP server — task CRUD + dispatch as tools that any AI agent can call
- Implicit authority via dispatch — Workers receive authority over task targets automatically when dispatched, never touching the authority API directly. Explicit authority tools are reserved for Planners orchestrating shared artifacts.

## 4. Studio Application (the UI)

- shadcn/ui theme (white-label via CSS variables + registry)
- Governance visualization — initiative trees, task boards, velocity tracking, hub stats
- Process node graphs — visualizing agentic workflows
- Morning review UX — reviewing overnight autonomous work

## 5. Executable Conventions

- Skills — copy/paste slash commands (/rr, /plan-tasks, /morning, /integration-review, /prune, /curate). The research protocol, planning protocol, etc.
- Rules (.claude/rules/) — behavioral guardrails that auto-load based on file globs
- CLAUDE.md templates — the recursive "how to work here" documentation pattern
- Hooks — shell commands triggered by agent tool calls

## 6. Config-as-Code (sherpa.config.ts)

- defineConfig() + createStudio() + withSherpa() — the three-function API
- Vocabulary customization (rename "initiatives" to "projects")
- Theme presets via shadcn registry
- Plugin system for extending catalogs, roles, lifecycle stages
- Path configuration (where governance artifacts live on disk)

## 7. Convention Sync CLI

- sherpa init — scaffold a new project with conventions, routes, config
- sherpa sync — section-level three-way merge to update prose conventions from upstream without clobbering local changes
- Manifest tracking for provenance (which version of each convention was installed)
- **Solved architecture**: Three-way merge at heading granularity (not line granularity) with stored baseline. Validated by Weave (100% clean merge rate vs git's 48% on structured documents). Remark ecosystem for parsing, node-diff3 for merge engine. OT/CRDT evaluated and rejected — overengineered for periodic two-peer CLI sync.

---

## How the Pillars Compose: Three-Layer Coordination

The governance engine, execution pipeline, and executable conventions aren't independent at runtime — they form a coordinated stack. This architecture emerged from the convergence of MMO server research (20+ years of multi-agent coordination patterns), MCP coordination layer design, and Claude Code native capabilities analysis.

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **MCP Server** | SQLite WAL, single-process Streamable HTTP | State authority — all mutations flow through here |
| **Claude Code Hooks** | PreToolUse shell checks | Enforcement — deterministic, non-LLM, cannot be bypassed |
| **CLAUDE.md + Rules** | Behavioral conventions | Guidance — rules live where agents already look |

Each layer uses the mechanism best suited to its purpose. The MCP server doesn't need to encode policy (that's CLAUDE.md). CLAUDE.md doesn't need to enforce compliance (that's hooks). Hooks don't need to maintain state (that's the MCP server). Three separate control surfaces, not a monolith.

The coordination model borrows directly from game server architecture: single-writer authority per component (from SpatialOS), prevention → detection → compensation conflict strategy (from GGPO/Valve/Figma), and bounded authority transfer with monotonic fencing tokens (from Improbable/Kleppmann). SQLite indexed reads clock at 3-7μs on M1 — no application cache needed, no external database, no distributed consensus. Strong consistency per-component, eventual consistency cross-agent.

---

## The Three Entities

```
@sherpa/studio          — The framework (npm packages)
                           "Rails for agentic workflows"

Sherpa (sherpa.solar)    — The consulting company (Rob's business)
                           Uses the framework to run client engagements
                           "We built the tool we use"

WavePoint               — First customer / origin codebase
                           Astrology platform that dogfooded everything
```

---

## What Makes This Different

The governance layer is vacant. Skills distribution is converging (351K+ Agent Skills, AAIF standard). Filesystem-as-governance is emerging (AGENTS.md in 60K+ repos). IDEs are replacing PM tools. But behavioral governance — structured agent definitions, lifecycle state machines, proposals as unit of change, integration review — has no standard, no project, no working group. Sherpa occupies that gap. Products die; conventions endure.
