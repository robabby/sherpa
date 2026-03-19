# Audit Output: audit-convention-coverage

**Task:** Audit .claude/rules coverage across all convention files  
**Executed by:** Luna (OpenClaw) — nightly task runner  
**Date:** 2026-03-19  

---

## Summary

This audit evaluates whether the eight convention rules in `.claude/rules/` have correct, complete, and non-overlapping `globs:` frontmatter — ensuring conventions load for the right file contexts and don't silently miss the code they govern.

---

## Files Audited

```
.claude/rules/
├── behavioral-engineering.md   globs: docs/agents/**, scripts/dispatch*, scripts/*worker*, scripts/auto-judge*, .claude/skills/**, docs/tasks/**
├── claude-md-standards.md      globs: **/CLAUDE.md
├── content-quality.md          globs: docs/templates/**   (alwaysApply: false)
├── directoturtle-convention.md globs: docs/**             (alwaysApply: false)
├── effort-estimation.md        globs: docs/plans/**, docs/initiatives/**, docs/roadmap.md, apps/*/docs/plans/**, apps/*/docs/roadmap.md
├── initiative-convention.md    globs: docs/initiatives/**
├── provenance-convention.md    globs: docs/architecture/**, docs/decisions/**, docs/changelog.md
└── worktree-conventions.md     globs: .worktrees/**       (alwaysApply: true)
```

---

## Coverage Analysis

### 1. `behavioral-engineering.md`
**Governs:** Agent role definitions, dispatch scripts, skills, task files.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `docs/agents/**` | ✅ Covers role definitions | — |
| `scripts/dispatch*` | ✅ Covers dispatch.sh, dispatch-queue.sh | — |
| `scripts/*worker*` | ✅ Covers worker.sh | — |
| `scripts/auto-judge*` | ✅ Covers auto-judge.sh | — |
| `.claude/skills/**` | ✅ Covers skill definitions | — |
| `docs/tasks/**` | ✅ Covers task board files | — |

**Gap identified:** `scripts/backends/**` — backend scripts (claude.sh, opencode.sh, etc.) are dispatch infrastructure and involve behavioral constraints about how agents are invoked. Not currently covered by any convention rule.

**Gap identified:** `packages/studio-mcp/src/**` — the MCP server orchestrates dispatch and task lifecycle. Behavioral engineering concepts apply when modifying tool definitions.

**Verdict:** ✅ Good coverage for primary artifacts. Minor gap in backend scripts and MCP layer.

---

### 2. `claude-md-standards.md`
**Governs:** CLAUDE.md authoring.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `**/CLAUDE.md` | ✅ Universal glob | — |

**Verdict:** ✅ Complete. Glob pattern is correct — catches any CLAUDE.md at any depth.

---

### 3. `content-quality.md`
**Governs:** Editorial quality for content production.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `docs/templates/**` | ⚠️ Narrow scope | Only loads for template files |

**Gap identified:** Content-quality gates apply to any published content artifact — research reports, initiative proposals, activity logs — not just docs/templates/. The `globs` scope is far narrower than the rule's intended coverage.

**Recommendation:** Consider broadening to `docs/initiatives/**/research/**` and `docs/initiatives/**/activity.md`, or set `alwaysApply: false` with a note that this rule is checked manually via the Judge rather than auto-loaded. The current narrow glob means most content produced by agents never sees this gate automatically.

**Verdict:** ⚠️ Under-scoped glob. Rule is useful but rarely auto-loaded for the content it actually governs.

---

### 4. `directoturtle-convention.md`
**Governs:** Recursive directory structure for all docs.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `docs/**` | ✅ Covers all docs | — |

**Gap identified:** The directoturtle convention also applies to `apps/*/docs/` directories (mentioned in the rule body) but is not globbed for those paths.

**Verdict:** ✅ Covers the main docs tree. Minor: `apps/*/docs/**` not globbed.

---

### 5. `effort-estimation.md`
**Governs:** Session-based effort estimates in plans and roadmaps.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `docs/plans/**` | ✅ | — |
| `docs/initiatives/**` | ✅ | — |
| `docs/roadmap.md` | ✅ | — |
| `apps/*/docs/plans/**` | ✅ | — |
| `apps/*/docs/roadmap.md` | ✅ | — |

**Verdict:** ✅ Complete and well-scoped. Covers all locations where effort estimates appear.

---

### 6. `initiative-convention.md`
**Governs:** Initiative lifecycle, directoturtle structure, proposals, activity logs.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `docs/initiatives/**` | ✅ Covers all initiative files | — |

**Gap identified:** `docs/tasks/**` — task files are tightly coupled to the initiative system (every task references an initiative slug), but the initiative convention doesn't auto-load when editing task files. The `behavioral-engineering.md` rule loads for tasks but doesn't cover initiative lifecycle concepts.

**Verdict:** ✅ Core coverage correct. Possible cross-load gap with task files.

---

### 7. `provenance-convention.md`
**Governs:** Provenance metadata for maintained documentation.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `docs/architecture/**` | ✅ | — |
| `docs/decisions/**` | ✅ | — |
| `docs/changelog.md` | ✅ | — |

**Gap identified:** `docs/ux/**` — UX guidelines (voice-and-tone, personas, etc.) are maintained documentation that should carry provenance metadata, but they're not in the glob scope. The rule body explicitly mentions this is for "all maintained documentation."

**Verdict:** ✅ Core scope correct. `docs/ux/**` is a plausible oversight given the rule's stated intent.

---

### 8. `worktree-conventions.md`
**Governs:** Git worktree naming and lifecycle.

| Pattern | Coverage | Issue |
|---------|----------|-------|
| `.worktrees/**` | ⚠️ Only files inside worktrees | — |
| `alwaysApply: true` | ✅ Loads for every context | Overrides the narrow glob |

**Note:** The `alwaysApply: true` flag makes the glob irrelevant — this rule loads for every single file in every context. This means the 275-token rule is always in context, which may not be necessary for non-git tasks.

**Verdict:** ✅ Functionally complete due to `alwaysApply: true`. Consider whether `alwaysApply` is necessary or if a broader set of globs would be more efficient.

---

## Cross-Cutting Gaps

| Gap | Affected Area | Recommended Fix |
|-----|--------------|----------------|
| `scripts/backends/**` not covered by any rule | Backend dispatch modules | Add to `behavioral-engineering.md` globs |
| `docs/ux/**` not covered by `provenance-convention.md` | UX documentation | Add `docs/ux/**` to provenance glob |
| `content-quality.md` glob too narrow | Research, proposals, activity logs | Broaden to `docs/initiatives/**/research/**` or document as Judge-manual |
| `apps/*/docs/**` not covered by `directoturtle-convention.md` | App-level docs directories | Add `apps/*/docs/**` to glob |
| `docs/tasks/**` not covered by `initiative-convention.md` | Task-initiative relationship | Add `docs/tasks/**` or cross-reference in behavioral-engineering |

---

## Summary Table

| Rule File | Glob Accuracy | Completeness | Overlap Issues |
|-----------|--------------|--------------|----------------|
| `behavioral-engineering.md` | ✅ Good | ⚠️ Missing backends/ | None |
| `claude-md-standards.md` | ✅ Perfect | ✅ Complete | None |
| `content-quality.md` | ⚠️ Too narrow | ⚠️ Under-scoped | None |
| `directoturtle-convention.md` | ✅ Good | ⚠️ Missing apps/*/docs | None |
| `effort-estimation.md` | ✅ Good | ✅ Complete | None |
| `initiative-convention.md` | ✅ Good | ⚠️ Missing tasks/ cross-ref | None |
| `provenance-convention.md` | ✅ Good | ⚠️ Missing docs/ux | None |
| `worktree-conventions.md` | ✅ (via alwaysApply) | ✅ Complete | alwaysApply may be overkill |

---

## Verdict

**3 rules need attention.** No rule has incorrect glob patterns, but three have narrower-than-intended coverage. No overlapping rules (each governs a distinct domain). Highest priority fix: `content-quality.md` glob scope and `behavioral-engineering.md` missing backend script coverage.
