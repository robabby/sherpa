---
started: 2026-03-11
worktree: null
---

# Behavioral Agents — Activity Log

## 2026-03-11 — Iteration 1: Landscape Validation

- Dispatched 4 parallel research vectors: competing agent formats (9 frameworks + 5 protocols), cross-industry taxonomy design, validation tooling landscape, competitive catalog landscape
- **Key finding:** Sherpa's behavioral decomposition is structurally novel — no framework in the industry structures behavioral content into typed fields. Everyone uses freeform `instructions` strings.
- **Taxonomy decision:** Flat categories (10) + faceted filtering. Add `marketing` category, rename `specialized` → `governance`. Flat directory structure (`agents/<slug>.md`), not nested by category.
- **Validation tooling:** Recommended gray-matter + Zod + identity-language regex (3-layer linter). Joblint Vale port is a shortcut for identity pattern detection.
- **Competitive landscape:** "Behavioral agents" as a term doesn't exist anywhere. First-mover advantage confirmed. agency-agents (29.9k stars) is identity-first; SoulSpec defines "who your agent is." Neither validates behavioral content.
- Schema refinements identified: add `role-type` facet, add optional `output-schema`, expand taxonomy, plan cross-tool export
- All 4 vector reports saved to `research/iteration-1/`

## 2026-03-11 — Phase 1 execution: Schema finalization + validation tooling

- Reviewed schema-spec.md against all 13 Sherpa roles — mapped every frontmatter field and body pattern
- Built Zod validator at `scripts/validate-agent.ts` (bun, three severity levels, JSON + human output)
- Tested against Sherpa roles, documented gaps
- Refined schema-spec.md with migration notes and validation precision fixes
- Produced standalone example agents at `deliverables/examples/`

## 2026-03-12 — Implementation: Base Catalog + Studio Integration

- Built `behavioralAgentFrontmatterSchema` in `packages/studio-core/src/schemas.ts` with 20 vitest tests — supports both `name:` and legacy `role:` fields, 10-category taxonomy + 2 legacy aliases
- Expanded `AGENT_ROLE_CATEGORIES` from 5 to 12 (added product, research, quality, marketing, security, data, governance)
- Created validation CLI at `scripts/validate-agent.ts` (Bun + gray-matter + Zod + identity language regex, --json/--strict/--verbose flags)
- Scaffolded `agents/` directory with `taxonomy.yaml` and `README.md`
- Migrated all 11 WavePoint roles from `docs/agents/roles/` → `agents/` (role:→name:, stripped context-packages/rules, remapped categories)
- Wrote 14 net-new agents: risk-assessor, frontend-developer, backend-developer, full-stack-implementer, data-engineer, infrastructure-engineer, security-auditor, performance-analyst, test-engineer, accessibility-auditor, release-engineer, compliance-reviewer, project-coordinator, integration-reviewer
- **Final catalog: 25 behavioral agents across 10 categories, 0 validation errors**
- Updated Studio `getAgentRoles()` to read from both `agents/` (base catalog) and `docs/agents/roles/` (org-specific), with behavioral fields (disposition, domainScope, behavioralConstraints, qualityBar, failTriggers, tags) surfaced in the AgentRole interface
- All tests pass (20/20), typecheck clean across all packages, production build succeeds
