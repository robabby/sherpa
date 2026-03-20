# Iteration 1 — 2026-03-20

## Findings

### Vector 1: Dotfolder Schema Patterns
**Question:** What conventions do popular dotfolder configurations follow?
**Full report:** [iteration-1/vector-1-dotfolder-schema-patterns.md](iteration-1/vector-1-dotfolder-schema-patterns.md)

- Convention-based discovery (glob/scan) beats explicit registration across all tools studied
- The committed/ignored split is universal — config committed, cache/machine-data ignored
- `.claude/` is the best precedent for Sherpa: committed settings + gitignored local, glob-scoped rules, directory-per-skill
- Config lives at root (like `nx.json`, `turbo.json`), dotfolder holds data/state. This validates keeping `sherpa.config.ts` at root

**Implications:** `.sherpa/` should split into committed zones (rules, skills, agents) and ignored zones (db, cache). Convention-based discovery for collections. Formal schema for config validation.

### Vector 2: Multi-Workspace Federation
**Question:** How do dev tools handle multiple project roots in a single UI?
**Full report:** [iteration-1/vector-2-multi-workspace-federation.md](iteration-1/vector-2-multi-workspace-federation.md)

- Every tool uses layered config: global > workspace > project. Merge semantics vary but the pattern is universal
- Project discovery via marker files (not central manifest) is the standard
- Flat list with filters scales better than deep trees (Backstage, Nx Console, Vercel)
- Nx's project graph — auto-constructed from dependency analysis — is the most praised feature across tools
- Backstage is a cautionary tale: rigid data model, high maintenance, YAML drift, low adoption without active curation

**Implications:** Use `sherpa.config.ts` as project marker. Three-tier config hierarchy. Build a cross-project initiative graph from existing `dependencies`/`informs` fields. Avoid Backstage's rigidity.

### Vector 3: Config Inheritance Models
**Question:** How do tools handle "extend upstream, override locally"?
**Full report:** [iteration-1/vector-3-config-inheritance-models.md](iteration-1/vector-3-config-inheritance-models.md)

- ESLint's flat config (ordered array, last-wins) is the most developer-friendly model
- Tailwind's `theme` vs `theme.extend` split is the cleanest solution to "add vs replace"
- The #1 gotcha across all tools: array replacement vs concatenation semantics. Must be defined per-field upfront
- Directory-tree cascading (ESLint's old `.eslintrc`) is universally rejected — flat config was invented to escape it
- Identity-based dedup (Babel's plugin matching by slug/name) is the right model for convention rules

**Implications:** Use ordered array model for convention layers. Distinguish replace vs extend keys explicitly. Convention rules need stable slug identifiers for identity-based merging. Support "opt out of defaults" for from-scratch projects.

### Vector 4: Multi-Project Dashboard UX
**Question:** How do platforms present project-scoped vs. cross-project views?
**Full report:** [iteration-1/vector-4-multi-project-dashboard-ux.md](iteration-1/vector-4-multi-project-dashboard-ux.md)

- Vercel's "projects-as-filter" pattern: same sidebar nav, project selection narrows data scope. Lowest friction
- Linear's custom saved views are the cross-project power tool — user-constructed filters across teams/projects
- Linear's "My Issues" auto-aggregates personal work across all teams — zero config needed
- GitHub Projects V2 shows org-level boards can pull from multiple repos effectively
- Grafana's org-level isolation is the anti-pattern — hard switching, no cross-org views

**Implications:** Sidebar with project scope selector (Vercel pattern). "My Work" cross-project view (Linear pattern). Command palette for universal search. Project list as landing page.

## Synthesis

Four cross-cutting insights emerged from this iteration:

### 1. The Config-Data Split Is Already Right

The proposal's instinct to keep `sherpa.config.ts` at the project root while `.sherpa/` holds data and state is validated by every tool studied. Nx uses `nx.json` at root, `.nx/` for cache. Turbo uses `turbo.json` at root, `.turbo/` for cache. VS Code uses `settings.json` in a dotfolder, but that's the exception. The pattern: **config declares intent, dotfolder holds state**.

### 2. Convention Inheritance = npm + Ordered Overrides

The ESLint flat config evolution is the closest precedent. Conventions ship as npm packages (upstream defaults), loaded first in an ordered array. Per-project overrides come last and win. The Tailwind insight adds nuance: some fields should **replace** (e.g., `disposition`, `quality-bar`) while others should **extend/append** (e.g., additional rules, skills). This per-field strategy must be defined in the schema, not left implicit.

Convention rules need slug-based identity for merging — when the same rule appears upstream and locally, the local version replaces the upstream one (Babel's pattern).

### 3. Project-as-Filter, Not Project-as-Container

The strongest UX pattern across Vercel, Linear, and Backstage is treating project selection as a **filter on consistent navigation**, not a navigation to a different section. Studio's existing sidebar stays the same. Adding a project scope selector at the top of the sidebar narrows all views to that project. "All Projects" is the default/unfiltered state.

This also means agents span projects (Luna works across all three repos) while tasks belong to projects. Linear validates this: issues belong to teams, projects span teams.

### 4. The Initiative Graph Is the Differentiator

Sherpa already has `dependencies` and `informs` relationships in initiative frontmatter. Cross-project visualization of these relationships — showing which initiatives in sherpa inform or block work in wavepoint — would be the feature that no other tool in this space provides. Nx's project graph is the most praised feature in the monorepo ecosystem; Sherpa's initiative graph across federated projects would be the governance equivalent.

## Proposals Generated

The existing `multi-project-studio` proposal is validated and strengthened by this research. Key refinements:

- **Config at root, data in dotfolder** — confirmed as the right split
- **Convention inheritance model** — ESLint flat config + Tailwind extend semantics. Slug-based identity for rule merging
- **UI pattern** — Vercel sidebar scope filter + Linear custom views
- **Cross-project initiative graph** — added as a key differentiating feature

## Open Questions for Next Iteration

1. **What goes in `.sherpa/` vs stays in `docs/`?** The dotfolder research shows human-authored content and machine-generated data should have clear boundaries. Should initiatives (human-authored proposals) live in `.sherpa/initiatives/` or stay in `docs/initiatives/`? The directoturtle convention currently assumes `docs/`.

2. **How does `.sherpa/` coexist with `.claude/`?** Rules and skills currently live in `.claude/rules/` and `.claude/skills/`. Should `.sherpa/` absorb these (breaking Claude Code's auto-discovery), duplicate them (drift risk), or symlink them? The agent-context-portability initiative is already working on this from the other direction.

3. **MCP federation architecture.** Each project could have its own MCP server, or there could be a single aggregating MCP. The research didn't find a clear precedent for this — Backstage uses a single catalog API, but it's centralized. What's the right model for Sherpa's per-project MCP + unified view?

4. **Convention drift detection.** When upstream conventions change (new package version), how does Studio surface which projects are behind? Backstage's YAML drift is a known problem. A "convention health" view showing per-project version alignment would be valuable.

5. **URL structure for multi-project routes.** Path-based (`/projects/wavepoint/tasks`) vs state-based (`/tasks?project=wavepoint`). Vercel uses state-based filtering; GitHub uses path-based. Affects deep linking, shareability, and routing architecture.
