---
appetite: open-ended (quality-bounded — correctness over effort)
shaped: 2026-06-17
---

# Shape: Refocus Studio on the Governance Lifecycle

## 1. Appetite

**Open-ended, quality-bounded.** Rob: *"open-ended. We want to do this right, so we have infinite budget to get it right."* So this shape does **not** set a session ceiling, and we do **not** cut scope to fit a clock.

The discipline that a time-box normally provides is moved to the **No-Gos and Kill Criteria** below. Without a clock, the only failure mode is *sprawl* — the refactor quietly expanding into an app rewrite, a provenance-platform, or a docs cleanup. The no-gos are therefore the real appetite: they say where "doing it right" ends and "doing something else" begins. Read them as the budget.

Rough shape of the work (orientation, not a ceiling): the large majority is **deletion**; one genuine build (git-aware drift); the rest is repointing and reframing.

## 2. Evidence & Success

**Evidence** (owner/builder judgment — no external customer data, stated honestly):
- **Primary:** Rob's direct observation this session — Studio "grew quickly, proliferating into multiple lenses … has become unwieldy. It needs to do one thing well." Product sprawl observed by its owner.
- **Maintenance burden:** the dispatch surface is large (9 backends, 6 scripts, the authority lease subsystem), and `agentic-workforce` shows ~3mo stale in the app.
- **Market:** the agentic-execution layer is commoditizing fast (Claude Code, OpenClaw, etc.); a provenance-aware governance engine is the less-crowded, more defensible position. Aligns with the platform invariant *conventions are the product*.

**Success metrics** (observable after shipping):
1. `pnpm check` is green with **zero** dispatch/task/authority/Linear code remaining (a grep for `dispatch|task_|authority|linear` in `packages/*/src` and `apps/studio/src` returns only incidental hits).
2. Nav shows exactly **GOVERN / AUTHOR / OBSERVE**; the `tasks`, `dispatch`, `workforce`, `workflow` routes are gone.
3. For a provenance-stamped doc whose `source-initiatives`' `targets:` received commits since its `last-verified`, the Process/Docs view renders **"Possibly stale"**; clicking **Mark as Reviewed** clears it.
4. The **Sessions** tab shows real Claude Code sessions sourced from `~/.claude/projects/…` (at minimum, the live session appears).
5. `CLAUDE.md` no longer contains Pillar 3 / the Dispatch section / the 9-backends list; the README headline is governance, not agentic dispatch.

**Personas:** `engineer` (operates the lifecycle through Claude Code; maintains the framework) and `product-manager` (governs the portfolio). Not designer-led.

## 3. Shaped Solution (fat-marker)

Studio becomes the **governance engine** for human+AI initiatives, organized in three layers that map 1:1 to the nav:

- **GOVERN** — the Process view (initiative lifecycle: propose→shape→plan→integrate, portfolio, status), with **provenance as its visible spine**.
- **AUTHOR** — the substrate initiatives evolve: Conventions, Skills, Playbooks, Docs, Research, and a thin read-only **Roles** listing (the kept behavioral role definitions, stripped of dispatch framing).
- **OBSERVE** — the sensors and API that keep governance honest: Sessions (real Claude Code logs), Activity, MCP (slimmed to the governance API).

**Operating model — pane of glass.** The lifecycle is driven *through Claude Code* (existing skills + governance MCP tools). Studio reads, visualizes, verifies, and surfaces drift. The **only** write Studio owns is **mark-verified** — and it already exists (`docs/actions.ts` + the `onMarkReviewed` button in `provenance-header.tsx`).

**The one real build — git-aware drift.** Today `computeState()` derives provenance state from frontmatter dates only. Make the `stale` state fire from git: for each provenance-stamped doc, resolve its `source-initiatives` → each initiative's `targets:` (code paths) → `git log -- <paths> --since=<last-verified>`; if commits exist, the doc is "Possibly stale." Reuse the `git log -- <path>` pattern already in `velocity.ts`. Surface the count in the banner per the convention. Compute **on-demand at render** (the maintained set is ~14 docs; accuracy matters; git access already happens server-side).

**Everything else is subtraction or repointing:** remove the dispatch routes/panels/tools/scripts/exports; repoint Sessions to `~/.claude/projects`; slim the MCP tab to the governance tool list; merge Workflow into Playbooks; reframe `CLAUDE.md`/README; triage the agentic portfolio.

**Sequencing (decided):** (1) excise dispatch to a green `pnpm check`; (2) repoint Sessions + slim MCP; (3) build git-aware drift + make provenance the Process spine; (4) reframe identity + nav reorg + Workflow→Playbooks merge; (5) portfolio triage. Excision-first yields a coherent, simpler app early and de-risks the rest.

## 4. Rabbit Holes

1. **Drift sensor over-engineering.** *Danger:* building a general doc↔code dependency graph, a new `source-paths` frontmatter field, caching layers, or a background job. *Avoid:* derive related paths from existing `source-initiatives → targets:`; compute on-demand for the ~14 maintained docs; ship the simplest `git log` that turns the existing `stale` state on. Defer caching until proven slow (Kill Criterion 2).
2. **Sessions log parser.** *Danger:* `~/.claude/projects/…` is an undocumented, evolving JSONL format; a strict parser could become a tar pit, and reading it couples Studio to a host-local path. *Avoid:* parse defensively (best-effort, tolerate missing fields), show what's available, and treat absence gracefully. The current Sessions UI already expects a fixed shape — map into it; don't redesign it.
3. **Workflow→Playbooks merge.** *Danger:* porting the React Flow DAG canvas into Playbooks "to preserve it." *Avoid:* drop the interactive canvas. Playbooks already renders play sequences; if a flow picture earns its place, it's a small static diagram, not an interactive graph (see Decision Record).
4. **`studio-core` export-removal cascade.** *Danger:* removing the `dispatch/tasks/task-events/linear-*` exports breaks consumers in unexpected places; chasing every typecheck error can balloon. *Avoid:* excision-first as its own pass to green `pnpm check`; let the compiler enumerate the blast radius rather than hunting by hand.
5. **Identity-reframe scope creep.** *Danger:* "reframe `CLAUDE.md`" becomes rewriting all of `docs/`. *Avoid:* touch only `CLAUDE.md`, `README.md`, and `docs/roadmap.md`. Other docs drift naturally and are caught by the drift sensor — that's the point.
6. **Roles view over-design.** *Danger:* rebuilding the Workforce catalog (tiers, health, active-task counts) under a new name. *Avoid:* a thin read-only list reusing the role frontmatter parser, dispatch fields dropped. Placement (own entry vs. a Conventions sub-section) is a `/design` call, not a build decision.
7. **Provenance backfill.** *Danger:* stamping provenance frontmatter across all of `docs/` to "make drift useful." *Avoid:* the opt-in convention stands; 14 docs is the live set. Broadening adoption is separate, ongoing curation — not this initiative.

## 5. No-Gos

Out of scope, period — not "later," but **not in this initiative**:

- **No Linear bridge.** The initiative↔PM-tool integration is a v2 seed.
- **No Studio cockpit.** The lifecycle is driven through Claude Code; the *only* Studio write is mark-verified. No approve/transition/integrate buttons.
- **No knowledge-engine changes.** The embeddings/search backend is untouched.
- **No Process-view IA redesign.** Make provenance the spine; do not re-architect the initiative/workstream/tree information architecture.
- **No new provenance frontmatter fields.** Drift reuses `source-initiatives → targets:`.
- **No mass docs rewrite.** Identity reframe is limited to `CLAUDE.md`, `README.md`, `docs/roadmap.md`.
- **No reopening locked decisions** (governance-core, pane-of-glass, the keep/cut list, Linear-out, single-initiative, supersessions).

## 6. Kill Criteria

Checkpoints that grant permission to stop and reshape — not predictions:

1. **Dispatch isn't cleanly separable.** If excision (step 1) reveals that the Process/governance code *does* depend on dispatch in a way that can't be severed without rewriting initiative-ops/lifecycle, stop and reshape — the "clean separability" premise was wrong.
2. **Drift can't reuse existing data.** If `source-initiatives → targets:` turns out too sparse/inaccurate to drive drift (e.g., most maintained docs have empty `source-initiatives`), stop before inventing a new mapping system; reshape the provenance scope instead.
3. **Sessions can't be sourced reliably.** If reading `~/.claude/projects` requires a brittle parser that breaks across Claude Code versions, stop and reduce Sessions to a documented-shape stub rather than shipping a fragile parser.
4. **Excision destabilizes the knowledge engine.** If removing dispatch/MCP tools breaks the knowledge/search subsystem (shared coupling we didn't find), stop and reassess the cut boundary.

## Open scope questions — resolved

1. **Role definitions home →** thin read-only **Roles** listing under AUTHOR, dispatch framing removed; exact placement deferred to `/design`.
2. **Workflow→Playbooks depth →** drop the DAG canvas; Playbooks is the canonical process-flow view (Decision Record).
3. **Drift "related code" →** derived from `source-initiatives → targets:`, computed on-demand (Decision Record).
4. **Sequencing →** excise-first to green typecheck, then repoint, then drift, then reframe, then triage.

> Status note: the proposal is formally `pending`; Rob approved the direction in-session. Run the normal approval path when ready — this shape doesn't flip status.
