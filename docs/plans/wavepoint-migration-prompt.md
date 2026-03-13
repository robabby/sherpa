# WavePoint → Sherpa Migration Prompt

Use this prompt when migrating initiatives, conventions, or docs from WavePoint (`../wavepoint/`) into the Sherpa codebase. Run from the Sherpa repo root.

---

## Prompt

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** <PATH_RELATIVE_TO_WAVEPOINT_ROOT>
**Mode:** <MIGRATE | RECONCILE>

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. WavePoint is the first customer. The two codebases share conventions (initiative system, behavioral agents, rules, skills) but Sherpa's versions are now authoritative. Sherpa's existing docs are at docs/ in this repo. WavePoint's source is at ../wavepoint/.

### Instructions by mode

**If MIGRATE:**
1. Read the full WavePoint artifact (directory or file) at ../wavepoint/<path>
2. Read Sherpa's corresponding location (e.g., docs/initiatives/ for initiatives, docs/agents/ for roles)
3. Adapt the content for Sherpa:
   - Replace WavePoint-specific paths (src/lib/studio/, apps/web/, etc.) with Sherpa equivalents (packages/studio-core/, apps/studio/, etc.)
   - Remove references to astrology domain, WavePoint apps, or WavePoint-specific infrastructure
   - Update frontmatter targets/dependencies to reference Sherpa paths
   - Preserve all research, rationale, and decisions — these are valuable regardless of origin
   - If the initiative references WavePoint conventions (.claude/rules/, skills), check whether Sherpa already has its own version and reference that instead
4. Create the artifact in Sherpa's docs structure
5. Report what was migrated and flag anything that needs my attention (ambiguous domain boundaries, stale references, missing dependencies)

**If RECONCILE:**
1. Read the WavePoint artifact at ../wavepoint/<path>
2. Read the corresponding Sherpa artifact(s) that cover the same ground
3. Compare them and report:
   - What Sherpa already covers that WavePoint duplicates (skip these)
   - What WavePoint has that Sherpa is missing (propose additions)
   - Where they conflict (show both versions, recommend which to keep)
   - Whether the WavePoint version has research or decisions that should be captured somewhere in Sherpa even if the initiative itself doesn't move
4. Propose specific edits to Sherpa docs (don't just describe — show the changes)
5. Note what can be archived in WavePoint after reconciliation

### Quality checks
- Never import WavePoint astrology domain concepts into Sherpa
- Preserve the behavioral engineering principle — no identity claims in agent definitions
- Keep Sherpa's directoturtle convention (proposal.md with YAML frontmatter, optional research/, plan.md, activity.md)
- Flag any WavePoint artifact that references code not yet extracted to Sherpa packages
- If an initiative's plan references tasks, check if those tasks exist in WavePoint and whether they should be recreated in Sherpa's task board
```

---

## Migration Manifest

Run in this order. Check off as you go.

### MIGRATE (move entirely)

- [ ] `docs/initiatives/behavioral-agents/` — Agent schema spec + catalog migration plan. Founding Sherpa initiative.
- [ ] `docs/initiatives/agent-framework-patterns/` — Research audit of agency-agents + paperclip frameworks.
- [ ] `docs/initiatives/agent-infrastructure/` — Runtime: model routing, local models, inter-agent coordination.
- [ ] `docs/initiatives/studio-collaboration-platform/` — What Studio should be. 6 research questions.
- [ ] `docs/initiatives/studio-state-machine/` — State mirror → state machine evolution.
- [ ] `docs/initiatives/mcp-agent-delegation/` — Declined but research is reference material.
- [ ] `docs/agents/README.md` + `docs/agents/patterns.md` — Agent catalog conventions.
- [ ] `docs/agents/roles/judge.md` — Judge role (framework, not domain).
- [ ] `docs/agents/roles/architect.md` — Generic.
- [ ] `docs/agents/roles/engineer.md` — Generic.
- [ ] `docs/agents/roles/code-reviewer.md` — Generic.
- [ ] `docs/agents/roles/product-manager.md` — Generic.
- [ ] `docs/agents/roles/product-owner.md` — Generic.
- [ ] `docs/agents/roles/research-lead.md` — Generic.
- [ ] `docs/agents/roles/technical-writer.md` — Generic.
- [ ] `docs/agents/roles/ux-researcher.md` — Generic.
- [ ] `docs/agents/roles/designer.md` — Generic (check for WavePoint-specific content).
- [ ] `docs/agents/roles/marketer.md` — Generic (check for WavePoint-specific content).
- [ ] `docs/tasks/README.md` — Task board convention.
- [ ] `docs/reports/README.md` — Operational reports convention.

### RECONCILE (compare + merge)

- [ ] `docs/initiatives/parallel-workflow-governance/` — Already implemented in both repos. Compare governance conventions.
- [ ] `docs/initiatives/agentic-workforce/` — Split: generic Planner/Worker/Judge pipeline → Sherpa. WavePoint-specific role wiring stays.
- [ ] `docs/initiatives/sherpa-framework-extraction/` — Active extraction tracker. Sherpa may want its own progress tracking.
- [ ] `.claude/rules/behavioral-engineering.md` — Compare WavePoint vs Sherpa versions for drift.
- [ ] `.claude/rules/initiative-convention.md` — Compare for drift.
- [ ] `.claude/rules/worktree-conventions.md` — Compare for drift.
- [ ] `.claude/rules/claude-md-standards.md` — Compare for drift.
- [ ] `.claude/rules/effort-estimation.md` — Compare for drift.

### STAYS IN WAVEPOINT (do not migrate)

- `docs/agents/roles/astrologer.md` — Domain-specific.
- `docs/agents/roles/astrocartographer.md` — Domain-specific.
- `docs/initiatives/mcp-composable-surface/` — WavePoint astrology MCP tools.
- All content/astrology/cosmology initiatives.
