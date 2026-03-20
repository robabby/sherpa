# Iteration 2 — 2026-03-20

## What We Already Knew

Iteration 1 validated the core architecture: config at root, data in dotfolder, ESLint flat config for inheritance, Vercel sidebar-filter for UX. Five design questions were identified for deeper investigation.

## Findings

### Vector 1: `.sherpa/` and `.claude/` Coexistence
**Question:** How should two dotfolders with overlapping concerns coexist?
**Full report:** [iteration-2/vector-1-dotfolder-coexistence.md](iteration-2/vector-1-dotfolder-coexistence.md)

- The `.editorconfig` model is the strongest precedent: a neutral bridge file for overlapping concerns between tool-specific directories
- Claude Code explicitly supports symlinks in `.claude/rules/` and `@import` in CLAUDE.md
- AGENTS.md standard (Linux Foundation AAIF, 25+ tools) is emerging but Claude Code doesn't read it natively yet
- Industry converging on "one source, fan out to tool-specific locations" pattern (block/ai-rules, agentlink)
- **Strategy E (dual ownership + `@import`)** is the right long-term model: `.claude/` owns Claude-specific behavior, `.sherpa/` owns portable framework conventions, `@import` bridges them

**Implications:** `.sherpa/rules/` and `.claude/rules/` coexist as separate concerns. Framework-portable rules live in `.sherpa/`. Claude Code loads them via `@import` in CLAUDE.md or symlinks.

### Vector 2: MCP Federation Patterns
**Question:** How should Studio aggregate across multiple per-project MCP servers?
**Full report:** [iteration-2/vector-2-mcp-federation-patterns.md](iteration-2/vector-2-mcp-federation-patterns.md)

- GraphQL Federation and API Gateways are overkill for filesystem-based governance data
- **Next.js Server Components as BFF** — Studio already runs Next.js. Server Components can fetch from multiple MCP backends and compose the view. No separate aggregation layer needed
- **Virtual MCP / "Remix Server" pattern** — cherry-pick tools from per-project MCP instances, namespace-prefix to avoid collisions (`sherpa__task_list`, `robabby__task_list`)
- `createStudioMcpServer()` already accepts `projectRoot` — instantiating multiple times is trivial
- Data isolation: SQLite per project (Silo at DB level, trivially operational since they're just files)

**Implications:** Two-layer approach. Layer 1: Next.js BFF for dashboard reads (Server Components aggregate at render time). Layer 2: Virtual MCP for agent tool access (namespace-prefixed tools from per-project instances). No new infrastructure.

### Vector 3: URL Routing for Multi-Project
**Question:** Path-based or state-based project scoping in URLs?
**Full report:** [iteration-2/vector-3-url-routing-multi-project.md](iteration-2/vector-3-url-routing-multi-project.md)

- **Every platform studied uses path segments for project scoping. None use query params.** Universal consensus.
- Vercel: `/{team}/{project}/deployments`. GitHub: `/{owner}/{repo}/issues`. Linear: `/{workspace}/team/{key}/active`
- Query params reserved for transient state (filters, view modes, pagination)
- Next.js App Router supports directly: `app/(studio)/projects/[project]/...`

**Implications:** Use `/projects/{slug}/...` for project-scoped routes. Cross-project routes at top level (`/`, `/projects`, `/activity`). Single-project installs redirect `/` to `/projects/{slug}/`.

### Vector 4: Governance vs Docs Boundaries
**Question:** What goes in `.sherpa/` vs stays in `docs/`?
**Full report:** [iteration-2/vector-4-governance-vs-docs-boundaries.md](iteration-2/vector-4-governance-vs-docs-boundaries.md)

- **Backstage provides the cleanest model:** structured data consumed by tools = dotfolder. Prose consumed by humans = docs
- Living documents (initiatives, tasks, activity) are governance data — tool-consumed, workflow-driven
- Reference documents (architecture, decisions, guidelines) are documentation — human-consumed, stable
- ADR community convention strongly places decisions in `docs/`. Proposals/RFCs (Rust, Kubernetes KEPs) separate from docs
- Dotfolders signal "tool-consumed, not human-consumed" — but `.sherpa/` content is committed (like `.github/`), not gitignored (like `.nx/`)

**Implications:** Initiatives, tasks, agent roles move to `.sherpa/`. Architecture, decisions, UX guidelines stay in `docs/`. Research travels with its initiative. `db/` subdirectory gitignored.

## Synthesis

Three design decisions crystallized in this iteration:

### 1. The Three-Directory Model

The project filesystem has three distinct concerns, each with its own directory:

| Directory | Purpose | Primary consumer | Git status |
|-----------|---------|-----------------|------------|
| `.sherpa/` | Governance data (initiatives, tasks, agents, research) | Studio, MCP, dispatch scripts | Committed (except `db/`) |
| `.claude/` | AI agent configuration (rules, skills, settings) | Claude Code | Committed (except local settings) |
| `docs/` | Reference documentation (architecture, decisions, guides) | Humans | Committed |

`.sherpa/` and `.claude/` coexist as separate concerns. Framework-portable conventions live in `.sherpa/rules/`. Claude Code loads them via `@import`. Agent-specific rules (with `paths:` glob scoping) stay in `.claude/rules/`.

### 2. No New Infrastructure for Federation

The MCP federation question has a surprisingly simple answer: **don't federate at the protocol level.** Studio's Next.js Server Components serve as the BFF, calling domain functions with different `projectRoot` values. For agent access, a virtual MCP server instantiates multiple `createStudioMcpServer()` with namespace-prefixed tools. SQLite stays per-project. No gateway, no proxy, no Redis.

### 3. Path-Based Project Routing Is Unanimous

Every multi-project platform uses path segments. The URL structure for Studio:

```
/projects/{slug}/process      # project-scoped
/projects/{slug}/research/... # project-scoped
/projects                     # all projects
/                            # default project or picker
```

Next.js App Router handles this natively with `[project]` dynamic segments. The current `(studio)` route group wraps the new structure.

## Design Decision: `sherpa.json` over `sherpa.config.ts`

Rob decided to migrate the config format from TypeScript to JSON:

- **Industry alignment:** `nx.json`, `turbo.json`, `vercel.json`, `tsconfig.json` — JSON is the dominant config format
- **Accessibility:** PMs, designers, and non-TS users are more comfortable with JSON
- **JSON Schema support:** IDE autocompletion without TypeScript knowledge
- **Programmatic generation:** Luna and `sherpa init` can generate/modify JSON trivially
- **No build step:** JSON is directly readable without compilation

`defineConfig()` can remain as an optional TypeScript wrapper for power users, but `sherpa.json` is the canonical format.

## Proposals Generated

The `multi-project-studio` proposal has been updated with:
- The Vercel model (Studio owns auth, projects own data)
- Research-validated design patterns for each major decision

Key refinements from this iteration to incorporate:
- Three-directory model (`.sherpa/` + `.claude/` + `docs/`)
- BFF + Virtual MCP (no new infrastructure)
- `/projects/{slug}/...` URL structure
- `sherpa.json` as canonical config format
- Governance data (initiatives, tasks) moves to `.sherpa/`

## Open Questions for Next Iteration

1. **Migration strategy.** The sherpa repo has 60+ initiatives in `docs/initiatives/` and 28+ tasks in `docs/tasks/`. What's the migration path to `.sherpa/`? Big bang or incremental? Does `PathsConfig` support aliasing during transition?

2. **`sherpa init` experience.** What does `sherpa init` produce in a new project? Minimal `.sherpa/` scaffold? `sherpa.json` with defaults? What about existing projects adopting Sherpa — does `sherpa init` detect and migrate?

3. **Convention inheritance in `sherpa.json`.** How does the `extends` field work in JSON? `"extends": "@sherpa/studio/defaults"` — what does the defaults package export? How are per-field replace/extend semantics declared?

4. **Cross-project initiative graph.** How should initiative `dependencies` and `informs` reference initiatives in other projects? Current format uses slugs (`dependencies: [slug]`). Cross-project needs namespacing (`dependencies: [project/slug]`)?

5. **Luna's workflow update.** Luna currently writes to `docs/tasks/` and `docs/initiatives/`. Her cron job prompts reference these paths. What needs to change in the cron jobs, task runner, and MCP server?
