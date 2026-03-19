# Audit Output: audit-claude-md-token-budget

**Task:** Check CLAUDE.md files against 4000-token budget guideline  
**Executed by:** Luna (OpenClaw) — nightly task runner  
**Date:** 2026-03-19  

---

## Summary

The 4,000-token budget guideline (from `.claude/rules/claude-md-standards.md`) states: *"Any task should load no more than ~4,000 tokens of CLAUDE.md context (root + app + convention + module + rules)."*

The audit covers all CLAUDE.md files found in the repo.

---

## Files Found

```
find /home/node/.openclaw/workspace/sherpa -name "CLAUDE.md"
```

Only **one CLAUDE.md** was found:

| File | Lines | Est. Tokens (×1.3) | Status |
|------|-------|---------------------|--------|
| `/home/node/.openclaw/workspace/sherpa/CLAUDE.md` | 92 | ~400 | ✅ Well within budget |

---

## Budget Analysis

The root `CLAUDE.md` is 92 lines and approximately 400 tokens. This is far below the 4,000-token budget ceiling.

The `claude-md-standards.md` rule defines the ideal range as **30–100 lines** with a **200-line hard max**. The root CLAUDE.md sits at 92 lines — at the top of the ideal range but compliant.

**Total CLAUDE.md token load across all files: ~400 tokens.**  
**Budget remaining: ~3,600 tokens** — available for conventions loaded via `.claude/rules/` globs.

### Convention Files (loaded via glob rules)

These `.claude/rules/` files are loaded contextually and contribute to the effective token budget depending on which files are active:

| Rule File | Lines | Est. Tokens | Glob Scope |
|-----------|-------|-------------|------------|
| `behavioral-engineering.md` | ~60 | ~280 | `docs/agents/**`, `scripts/dispatch*`, `docs/tasks/**` |
| `claude-md-standards.md` | ~55 | ~250 | `**/CLAUDE.md` |
| `content-quality.md` | ~45 | ~200 | `docs/templates/**` |
| `directoturtle-convention.md` | ~80 | ~360 | `docs/**` |
| `effort-estimation.md` | ~50 | ~230 | `docs/plans/**`, `docs/initiatives/**`, `docs/roadmap.md` |
| `initiative-convention.md` | ~130 | ~590 | `docs/initiatives/**` |
| `provenance-convention.md` | ~80 | ~370 | `docs/architecture/**`, `docs/decisions/**` |
| `worktree-conventions.md` | ~60 | ~275 | `.worktrees/**` (alwaysApply: true) |

**Worst-case stack** (e.g., working in `docs/initiatives/` with `docs/architecture/` context):  
Root CLAUDE.md (~400) + behavioral-engineering (~280) + initiative-convention (~590) + worktree-conventions (~275) + directoturtle (~360) + effort-estimation (~230) = **~2,135 tokens**. Well within budget.

**Absolute worst case** (all rules active simultaneously):  
~400 + 2,555 = ~2,955 tokens. Still under 4,000.

---

## Findings

### ✅ Budget Compliant — No Action Required

The repo has only one CLAUDE.md (the root), which is 92 lines / ~400 tokens. Even with all convention rules loaded simultaneously, the total CLAUDE.md context budget stays under 3,000 tokens — well within the 4,000-token guideline.

### Observations

1. **Healthy baseline.** With only one CLAUDE.md in the repo (no app-level or module-level files yet), there is abundant headroom for growth into apps/ and packages/.

2. **Convention rules are the main budget consumers.** The eight `.claude/rules/` files collectively represent ~2,555 tokens if all loaded simultaneously. The worst-case realistic stack is ~2,135 tokens.

3. **`worktree-conventions.md` is `alwaysApply: true`.** This adds ~275 tokens to every task context. Given the file's utility for agents working on branches and worktrees, this cost is justified — but worth noting when calculating per-task budgets.

4. **`initiative-convention.md` is the heaviest rule** at ~590 tokens (130 lines). As the repo grows, if module-level CLAUDE.md files are added under `docs/initiatives/`, this rule could push some stacks closer to the 4,000-token limit. Monitor when packages/ and apps/ gain their own CLAUDE.md files.

5. **No CLAUDE.md files in packages/ or apps/.** The monorepo has packages (`studio-core`, `studio-ui`, `studio-mcp`, `studio`) and an app (`apps/studio`) but none have their own CLAUDE.md yet. When added, each will consume ~100–300 tokens from the budget.

---

## Recommendations

| Priority | Recommendation |
|----------|---------------|
| ✅ None urgent | Budget is healthy — all files within spec |
| 🔮 Future watch | Add monitoring when packages/ CLAUDE.md files are created — they'll consume 100–300 tokens each from the per-task budget |
| 📝 Consider | `initiative-convention.md` at 130 lines is approaching the 200-line hard max. Review for pruning opportunities if it grows further |
| 📝 Consider | When packages gain CLAUDE.md files, ensure the sum of root + app + module + active rules stays under 4,000 tokens per task |

---

## Verdict

**PASS.** The repo is well within the 4,000-token CLAUDE.md budget guideline. No remediation needed. Budget audit should be re-run when `apps/studio/CLAUDE.md` or any `packages/*/CLAUDE.md` files are created.
