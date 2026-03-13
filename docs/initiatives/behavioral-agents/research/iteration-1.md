# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: Competing Agent Definition Formats
**Question:** What schema formats do major AI agent frameworks use, and how does Sherpa's behavioral format compare?
**Full report:** [iteration-1/vector-1-competing-agent-formats.md](iteration-1/vector-1-competing-agent-formats.md)

**Key discoveries:**
- No framework uses behavioral constraints as the primary organizational principle. Every framework (CrewAI, AutoGen, LangGraph, OpenAI Agents SDK, Claude Agent SDK, Swarm, Agency Swarm, Mastra) centers on a freeform `instructions`/`system_message` string. Whether it contains identity claims or behavioral constraints is entirely up to the author.
- CrewAI is the most identity-driven — `role`, `goal`, `backstory` are literally a persona trifecta. Polar opposite of Sherpa.
- OpenAI Agents SDK comes closest to Sherpa's operational fields — `input_guardrails`/`output_guardrails` parallel fail-triggers/quality-bar, `handoffs` parallel escalation. But these are runtime code, not declarative.
- Claude Agent SDK is the closest philosophical match — thin options + rich environment (CLAUDE.md, .claude/rules/, skills) mirrors Sherpa's compositional approach. But behavioral content in CLAUDE.md is unstructured.
- AutoGen has the only versioned serialization schema (JSON with `provider`, `component_type`, `version`).
- Emerging protocols (A2A, ACP, AGNTCY) focus on capability advertisement, not behavioral definition.

**Implications:**
- Sherpa's 5-field behavioral decomposition (`disposition`, `behavioral-constraints`, `quality-bar`, `fail-triggers`, `domain-scope`) is structurally unique across all surveyed frameworks
- The identity language ban with lint enforcement has no equivalent anywhere
- Sherpa should consider adding `output-schema` for structured output validation (a gap vs OpenAI)
- A2A AgentCard export is a future interoperability opportunity

### Vector 2: Cross-Industry Agent Taxonomy Design
**Question:** How should agent roles be categorized for a universal catalog?
**Full report:** [iteration-1/vector-2-taxonomy-design.md](iteration-1/vector-2-taxonomy-design.md)

**Key discoveries:**
- Every successful categorization system (consulting firms, ITIL, SOC, TBM, Google Cloud Agent Finder) uses the same pattern: flat primary dimension for navigation + multiple independent facets for filtering + search
- For 50–200 items, evidence strongly favors flat categories (9–12) with faceted filtering — no deeper hierarchy needed. ~68 items browsable without hierarchy (Hedden's research).
- TBM Council's extension model answers universal vs. industry-specific: ship a universal base catalog, allow organizations to add industry extensions using the same schema
- No open-source agent framework has solved taxonomy. Google Cloud Agent Finder (1,914 agents, 10 business functions) is the only large-scale example.
- Category should be metadata, not directory structure — `category:` in YAML, not `agents/engineering/frontend-developer.md`

**Implications:**
- Expand from 9 to 10 categories: add `marketing` (too universal for "specialized"), rename `specialized` → `governance` (planner/judge/coordinator meta-roles)
- Add facets: `tags` (free-form), `role-type` (planner/worker/reviewer/coordinator), `topology` (from Team Topologies)
- Flat file directory with category as metadata, not folder structure

### Vector 3: Agent Definition Validation & Tooling
**Question:** What approaches exist for validating agent definitions, and how should a behavioral linter work?
**Full report:** [iteration-1/vector-3-validation-tooling.md](iteration-1/vector-3-validation-tooling.md)

**Key discoveries:**
- **Joblint** (Vale port) already detects identity/role language in job postings — directly analogous to agent definitions. Detects "visionary" language, "dumb titles" (ninja, rockstar, guru), competitive language.
- Astro Content Collections is the canonical Zod + frontmatter validation pattern (gray-matter parse → z.object().parse())
- GitHub Docs has 44+ custom linting rules including 8+ frontmatter-specific rules — the most mature reference implementation
- agency-agents' lint-agents.sh is 88 lines of bash checking only field existence. No schema validation, no content analysis, no identity language detection.
- No agent framework validates for behavioral engineering principles. This is a green field.
- Concrete regex patterns for identity claims (ERROR), identity-adjacent (WARNING), and vague behavioral claims (WARNING) documented with sources

**Implications:**
- Recommended architecture: custom Bun script with gray-matter + Zod (3-layer: schema → content patterns → structure)
- Joblint's patterns are directly reusable as a starting point
- The linter itself is a product differentiator — "the first agent definition linter that enforces behavioral engineering"

### Vector 4: Open-Source Agent Catalog Landscape
**Question:** What agent catalogs exist, and is anyone else building a behavioral-first catalog?
**Full report:** [iteration-1/vector-4-competitive-landscape.md](iteration-1/vector-4-competitive-landscape.md)

**Key discoveries:**
- **Nobody is doing behavioral-engineering-first agent catalogs.** The term "behavioral engineering" applied to AI agent definitions does not appear in any repository, specification, or paper.
- Two dominant identity-first formats: agency-agents (29.9k stars, MIT) and SoulSpec (open standard defining "who your agent is")
- Agent Behavioral Contracts (ABC) paper (Feb 2026) formalizes behavioral specs with mathematical rigor — 88-100% hard constraint compliance. Potential collaborator, not competitor.
- The skills ecosystem is exploding (350K+) but **roles are underserved**. Skills define tasks; roles define posture.
- Cross-tool portability fueled agency-agents' growth. Sherpa should plan export targets.
- No existing format requires measurable quality criteria — `quality-bar` and `fail-triggers` are Sherpa's most concrete differentiators
- Claude Code community lacks a shared agent/role ecosystem — this is the gap Sherpa fills

**Implications:**
- First-mover advantage is real: "behavioral agents" as a category term doesn't exist yet
- A curated 40-agent catalog may be more compelling than migrating all 120
- Cross-tool export (CrewAI YAML, SoulSpec, Claude Code rules) should be planned from Phase 2
- The ABC paper's runtime enforcement could complement Sherpa's definitions

## Synthesis

### The Core Insight: Behavioral Decomposition Is Structurally Novel

Across 9 frameworks, 5 emerging protocols, and dozens of repositories, every agent definition in the industry puts behavioral content into a single freeform string. Sherpa's decomposition into 5 structured behavioral fields is genuinely new. This isn't a marginal improvement — it's a category distinction.

The implications cascade:
1. **Validation becomes possible.** You can lint `disposition` for identity language, verify `fail-triggers` are specific, and check `quality-bar` items are measurable. You can't lint a freeform `instructions` string for any of this.
2. **Composition becomes mechanical.** A Judge can read `fail-triggers` from a YAML field and evaluate against them. It can't reliably extract failure conditions from a 200-line system prompt.
3. **Portability becomes a transformation.** The decomposed fields can be reassembled into any format: CrewAI's `role`/`goal`/`backstory`, SoulSpec's SOUL.md, or a simple system prompt string. The reverse (decomposing a freeform string into structured fields) is an NLP problem.

### Three Strategic Decisions Crystallized

**1. Taxonomy: Flat + Faceted, not Hierarchical**
Every successful catalog system (consulting firms, ITIL, Google Cloud's 1,914 agents) uses flat primary categories with independent facets. The schema should use 10 categories with `role-type`, `tags`, and optional `topology` as orthogonal facets. Directory structure should be flat (`agents/<slug>.md`), not nested by category.

**2. The Linter Is Part of the Product**
No framework validates agent definitions for behavioral engineering. The linter — gray-matter + Zod + identity-language regex — is itself a product artifact. It should ship as a standalone tool that anyone can run against any agent definition format, not just Sherpa's. This is the distribution mechanism: "Run this against your CrewAI agents and see how many identity claims you have."

**3. Quality Over Quantity in the Catalog**
The competitive landscape shows that agency-agents' 120 agents vary 10x in quality. A curated catalog of 40-50 high-quality behavioral agents across 10 categories would be more compelling than migrating all 120. Tier 1 agents get careful migration; Tier 3 agents get evaluated for whether the role concept is worth a fresh behavioral definition.

### Contradictions

- **OpenAI's `output_guardrails` are runtime code, not declarative criteria.** Sherpa's `fail-triggers` are human-readable YAML strings. The question is whether declarative fail-triggers can be machine-evaluated without code — the answer depends on the Judge agent's capability, not the schema format.
- **agency-agents' 29.9k stars suggest identity-first formats are popular.** But popularity ≠ efficacy. The Zheng et al. evidence (EMNLP 2024) is clear: identity roles are "largely random." The market hasn't absorbed this research yet.

### Unexpected Connection: Joblint → Agent Lint

The Joblint Vale port detects identity/role language in job postings. Its pattern categories (visionary buzzwords, dumb titles, competitive language) are directly analogous to identity claims in agent definitions. This is a shortcut: rather than inventing regex patterns from scratch, Sherpa's linter can start from Joblint's proven rule set and adapt it for agent definitions.

## All Sources

### Agent Frameworks
- [CrewAI docs](https://docs.crewai.com/concepts/agents) — Identity-first agent format (role, goal, backstory)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) — Guardrails, handoffs, lifecycle hooks
- [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk) — Thin config + environment composition
- [AutoGen](https://microsoft.github.io/autogen/) — Versioned JSON serialization schema
- [Mastra](https://mastra.ai/docs/agents/overview) — Simple instructions + tools + model
- [A2A Protocol](https://google.github.io/A2A/) — Google's agent-to-agent protocol, capability advertisement
- [agency-agents](https://github.com/msitarzewski/agency-agents) — 112 identity-first agent definitions, MIT
- [SoulSpec](https://soulspec.org) — Open standard for agent identity definition

### Taxonomy & Organization
- [McKinsey Capabilities](https://www.mckinsey.com/capabilities) — Function x industry two-axis model
- [Google Cloud Agent Finder](https://cloud.google.com/products/agent-finder) — 1,914 agents, 10 business functions
- [TBM Council](https://www.tbmcouncil.org/) — Extension model for industry-specific overlays
- [Team Topologies](https://teamtopologies.com/) — Stream-aligned/platform/enabling/subsystem

### Validation Tooling
- [gray-matter](https://github.com/jonschlinkert/gray-matter) — YAML frontmatter parser
- [Zod](https://zod.dev/) — TypeScript-first schema validation
- [Vale](https://vale.sh/docs/) — Prose linting CLI with YAML rules
- [Joblint (Vale port)](https://github.com/errata-ai/Joblint) — Identity/role language detection in job postings
- [GitHub Docs linter](https://github.com/github/docs/tree/main/src/content-linter) — 44+ custom rules, frontmatter validation
- [agency-agents lint](https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh) — 88-line bash linter

### Research Evidence
- [Zheng et al. (EMNLP 2024)](https://arxiv.org/abs/2311.10054) — Identity roles are "largely random" across 162 roles
- [Anthropic Persona Selection](https://anthropic.com/research/persona-selection-model) — Unpredictable persona clouds from role assignments
- [Agent Behavioral Contracts](https://arxiv.org/abs/2502.xxxxx) — Runtime behavioral enforcement, 88-100% compliance
- [Anthropic Prompt Guide](https://platform.claude.com/docs) — Built entirely on behavioral instructions, not identity

## Proposals Generated

Updated understanding of the behavioral-agents initiative. Schema spec refinements documented below. No new proposal file needed — the existing `proposal.md` and `schema-spec.md` are correct in their approach and validated by this research. Specific schema amendments:

1. **Add `role-type` field** — `planner | worker | reviewer | coordinator` (from SAFe/Sherpa pipeline)
2. **Add `output-schema` optional field** — reference to a Zod/JSON schema for structured output validation
3. **Expand taxonomy to 10 categories** — add `marketing`, rename `specialized` → `governance`
4. **Flat directory structure** — `agents/<slug>.md`, not `agents/<category>/<slug>.md`
5. **Plan cross-tool export** — CrewAI YAML, SoulSpec, Claude Code rules as build-time transformations

## Open Questions for Next Iteration

1. **Should the linter be a standalone npm package?** If it ships independently, it becomes a distribution channel — "run behavioral-lint against your existing agents." What's the packaging and naming strategy?
2. **What's the minimum viable catalog?** The proposal says ~120 agents. Research suggests 40-50 high-quality agents across 10 categories may be more compelling. What's the right triage? Which Tier 2/3 agents get fresh definitions vs. migration vs. skip?
3. **How should Sherpa handle dynamic instructions?** OpenAI Agents SDK supports callable instructions that receive runtime context. Sherpa's static YAML is intentionally simple. Is there a need for a `dynamic-context` hook, or does `context-packages` plus rules loading handle this?
4. **What's the distribution strategy?** agency-agents grew via Reddit virality + cross-tool portability. Should Sherpa launch with a spec site (behavioral-agents.dev)? An npm package? A GitHub Action? All three?
5. **Should Agent Behavioral Contracts (ABC) be a collaboration target?** Their runtime enforcement (88-100% compliance) could complement Sherpa's definitions. Is this worth pursuing in iteration 2?
