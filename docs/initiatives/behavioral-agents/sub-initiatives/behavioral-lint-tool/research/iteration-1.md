# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: CLI Tool Packaging Patterns
**Question:** How do successful CLI linting tools package and distribute?
**Full report:** [iteration-1/vector-1-cli-packaging-patterns.md](iteration-1/vector-1-cli-packaging-patterns.md)

**Key discoveries:**
- Pure-JS linters (ESLint, Prettier, markdownlint-cli2) all ship as single npm packages with a `bin` field. Binary distribution (Biome/Sentry pattern) only needed for compiled languages.
- `behavioral-lint` is available on npm. `agentlint` is taken (security scanner, different focus). `@sherpa/*` scoped names all available.
- Zero-config is the gold standard (Biome proved this). cosmiconfig is the standard discovery library if config is ever needed.
- No plugin system needed for v1 — the rule set is small and domain-specific.
- Nascent ecosystem: `agentlint` (security), `cclint` (Claude Code structure), `aigent` (Agent Skills). None validate **behavioral quality**.

**Implications:**
- Single npm package `behavioral-lint` with `bin` field. No binary distribution, no config for v1, no plugins.
- Distinct from competitors: behavioral quality is the unique position.

### Vector 2: Multi-Format Linting
**Question:** Can the same behavioral rules apply across CrewAI, SoulSpec, agency-agents, Claude Code rules, Cursor, and freeform system prompts?
**Full report:** [iteration-1/vector-2-multi-format-linting.md](iteration-1/vector-2-multi-format-linting.md)

**Key discoveries:**
- **Yes.** Every format has exactly one prose field where behavioral content lives (CrewAI: `backstory`, OpenAI: `instructions`, SoulSpec: `SOUL.md`). The adapter pattern (proven by ESLint/Vale/markdownlint) solves this: format-specific adapters extract lintable text regions, shared rule engine runs identical checks.
- SoulSpec is structurally opposed to behavioral engineering — its tagline is "defines who your agent is." Linter supports it but with adjusted severity (INFO instead of ERROR).
- agency-agents' `convert.sh` already classifies persona vs operations by header keywords — this same classification can drive lint severity.
- Claude Code rules are the most behavioral-friendly format surveyed.
- **No existing tool validates behavioral content in agent definitions.** Zero competition.

**Implications:**
- 7 format adapters (Sherpa, CrewAI, SoulSpec, agency-agents, Claude rules, Cursor, plain text)
- 3 severity profiles: `strict`, `behavioral` (default), `report`
- Implementation priority: Sherpa > text > agency-agents > CrewAI > Claude Code > Cursor > SoulSpec

### Vector 3: GitHub Action Marketplace
**Question:** What makes a successful GitHub Action? How should behavioral-lint launch?
**Full report:** [iteration-1/vector-3-github-action-marketplace.md](iteration-1/vector-3-github-action-marketplace.md)

**Key discoveries:**
- **Zero competition.** Search for "behavioral-lint", "agent definition linter", "agent yaml linting" returned nothing. Category doesn't exist.
- **Stars != usage.** Super-linter: 10.3k stars, ~395 actual uses. actionlint: 3.7k stars, 937 dependents. Documentation quality drives adoption more than visibility.
- **JavaScript action is the right choice.** Cross-platform, fastest startup (no Docker container boot). Matches markdownlint-cli2-action.
- **Annotation limits are real.** Hard cap: 10 warnings + 10 errors per step, 50 per run. Solution: problem matchers for annotations + `$GITHUB_STEP_SUMMARY` for full report.
- **Marketplace ranking is keyword-driven.** About section should start with main keyword, 5-15 words. Topics use exact match, 20 max.
- Academic finding (n=90): developers prefer verified creators + more stars, switch away due to bugs and poor documentation.

**Implications:**
- JavaScript action (node20), problem matchers + job summary for reporting
- About: "Validate AI agent definitions against behavioral engineering standards"
- Launch channels: marketplace, DEV.to post, Reddit, awesome-actions PR, reviewdog wrapper

### Vector 4: Joblint Deep Dive
**Question:** How do Joblint's pattern rules map to agent definition anti-patterns?
**Full report:** [iteration-1/vector-4-joblint-deep-dive.md](iteration-1/vector-4-joblint-deep-dive.md)

**Key discoveries:**
- **Joblint has 19 rules with 131 trigger patterns** across 3 severity levels. Vale port preserves all 17 categories as YAML files.
- **DumbTitles is the single strongest analog.** guru/ninja/rockstar → wizard/oracle/mastermind/genius. Direct cross-domain transfer.
- **6 Joblint categories map to agent definitions** (DumbTitles, Visionary, Competitive, Bro, Starter, Reassure). 5 do NOT apply (Gendered, Profanity, LegacyTech, DevEnv, Acronyms). 3 map with adaptation.
- **Joblint does NOT cover the core agent anti-patterns.** Identity claims, experience claims, memory claims, personality assertions, and capability overclaiming have no job posting equivalent. These require 6 new rule categories.
- **write-good's e-prime module is structurally critical.** All "to be" verbs are the grammatical backbone of identity claims. But e-prime alone over-fires — must combine with subject+predicate analysis.
- **write-good's weasel words apply directly.** "Very", "quite", "fairly" weaken behavioral constraints identically to how they weaken prose.
- **alex's condescending words** (`obviously`, `clearly`, `basically`, `just`) are relevant — in agent definitions, they may cause the model to skip the check.

**Implications:**
- 10 rule files across 3 severity tiers: 4 ERROR, 4 WARNING, 2 INFO
- 4-dimension scoring (identity, specificity, credibility, scope) adapted from Joblint's 5 dimensions
- "You are" needs contextual handling: + trait/role = ERROR, + tool/assistant + scope = OK

## Synthesis

### The Core Insight: Implementation-Ready Specification

This iteration converged on a complete, actionable specification across all four vectors. Every question from the seed file has a concrete answer:

**Packaging:** Single npm package `behavioral-lint` with `bin` field. Pure TypeScript (gray-matter + Zod + regex). Zero-config. No plugins.

**Multi-format:** Adapter pattern — 7 format-specific adapters extract lintable text, shared rule engine runs identical behavioral checks. Three severity profiles (strict/behavioral/report) handle formats with different identity expectations.

**GitHub Action:** JavaScript action (node20), zero-config, problem matchers + job summary. Zero competition in the space.

**Rules:** 10 categories across 3 tiers, sourced from Joblint (6 adapted categories), write-good (weasel words, e-prime), alex (condescending words), and 6 new agent-specific categories. 4-dimension scoring for quantitative assessment.

### The Single Most Important Finding

**The "You are" edge case is the hardest design decision.** Anthropic's own prompt engineering guide recommends "You are a helpful coding assistant specializing in Python" — which is domain-scoping, not identity claiming. But "You are an expert senior developer with 15 years of experience" IS an identity claim. The rule needs contextual analysis:

- `"You are" + <trait/role/identity>` → ERROR
- `"You are" + <tool/assistant> + <domain scope>` → OK
- `"You are" + <adjective> + "and" + <adjective>` → WARNING (personality assertion)

This can't be solved with simple regex. It needs a pattern that checks what follows "You are" — whether it's an identity marker (expert, senior, skilled) or a functional descriptor (assistant, tool, agent).

### Cross-Vector Patterns

1. **Zero competition is confirmed across all vectors.** npm: no behavioral quality linter. GitHub Marketplace: no agent definition linting action. Prose linting: no tool validates behavioral content. The category "behavioral agents" doesn't exist as a term anywhere.

2. **The adapter pattern is universal.** ESLint (parser plugins), Vale (format scopes), markdownlint (frontMatterLines), agency-agents' convert.sh (section classification). Multi-format linting is a solved architectural problem.

3. **Joblint + 6 new categories = complete rule set.** Joblint provides the pattern-detection foundation. The 6 new agent-specific categories (identity claims, experience claims, memory claims, personality assertions, capability overclaiming, anthropomorphism) fill the domain gap.

### Contradictions

- **SoulSpec explicitly defines "who your agent is."** A behavioral linter running against SoulSpec will flag most content by design. This isn't a bug — it surfaces the philosophical difference — but it means the tool needs a "report" mode that shows density without treating everything as errors.
- **Anthropic recommends "You are..."** while behavioral engineering rejects it. The resolution is contextual: domain-scoping ("You are a coding assistant") is fine; identity-claiming ("You are an expert") is not. The line is in what follows the construction.

## All Sources

### CLI Packaging & npm
- [ESLint package.json](https://github.com/eslint/eslint/blob/main/package.json) — bin, main, exports fields
- [Biome Manual Installation](https://biomejs.dev/guides/manual-installation/) — Platform-specific npm distribution
- [Sentry: Publishing Binaries on npm](https://sentry.engineering/blog/publishing-binaries-on-npm) — Definitive binary npm guide
- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) — Config file discovery standard
- [agentlint npm](https://www.npmjs.com/package/agentlint) — Security scanner for agent configs (competitor)
- [cclint GitHub](https://github.com/carlrannaberg/cclint) — Claude Code project linter (competitor)
- [aigent GitHub](https://github.com/wkusnierczyk/aigent) — Agent Skills toolchain (competitor)
- [Factory.ai: Using Linters to Direct Agents](https://factory.ai/news/using-linters-to-direct-agents) — Linter-driven agent dev
- [GitHub Blog: agents.md lessons](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) — 2,500 repo analysis

### Multi-Format
- [CrewAI agents](https://docs.crewai.com/concepts/agents) — role/goal/backstory format
- [SoulSpec](https://soulspec.org) — SOUL.md / IDENTITY.md spec
- [agency-agents](https://github.com/msitarzewski/agency-agents) — 112+ identity-first definitions
- [agency-agents convert.sh](https://github.com/msitarzewski/agency-agents/blob/main/scripts/convert.sh) — 7-format converter
- [Claude Code memory docs](https://code.claude.com/docs/en/memory) — .claude/rules/ format
- [Cursor rules docs](https://cursor.com/docs/context/rules) — .mdc format
- [Vale scoping](https://vale.sh/docs/topics/scoping) — Format-agnostic rule scoping
- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files) — Multi-format routing
- [markdownlint custom rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md) — frontMatterLines API

### GitHub Action Marketplace
- [Codecov: Most Popular Actions](https://about.codecov.io/blog/discovering-the-most-popular-and-most-used-github-actions/) — Stars != usage analysis
- [Saroar & Nayebi (EASE 2023)](https://arxiv.org/abs/2303.04084) — Developer perception survey (n=90)
- [GitHub SEO](https://www.markepear.dev/blog/github-search-engine-optimization) — Marketplace ranking factors
- [markdownlint-cli2-action](https://github.com/DavidAnson/markdownlint-cli2-action) — Gold standard zero-config action
- [reviewdog](https://github.com/reviewdog/reviewdog) — Universal lint review adapter
- [Annotation limits (Discussion #26680)](https://github.com/orgs/community/discussions/26680) — 10+10+50 hard caps

### Pattern Rules (Joblint + Extensions)
- [Original joblint rules.js](https://raw.githubusercontent.com/rowanmanning/joblint/master/lib/rules.js) — 19 rules, 131 patterns
- [Joblint Vale port](https://github.com/errata-ai/Joblint) — 17 YAML rule files
- [write-good](https://github.com/btford/write-good) — Weasel words, passive voice, e-prime
- [weasel-words source](https://unpkg.com/weasel-words@0.1.1/weasel.js) — 26 imprecise qualifiers
- [e-prime source](https://unpkg.com/e-prime@0.10.4/e-prime.js) — 27 "to be" verb forms
- [alex](https://github.com/get-alex/alex) — Inclusive language linter
- [retext-equality rules](https://raw.githubusercontent.com/retextjs/retext-equality/main/rules.md) — 440+ rules including condescending words
- [Zheng et al. (EMNLP 2024)](https://arxiv.org/abs/2311.10054) — Identity roles "largely random"

## Proposals Generated

Created `proposal.md` for the behavioral-lint-tool sub-initiative with:
- Package architecture (single npm package + GitHub Action)
- Multi-format adapter system (7 formats)
- 10 rule categories across 3 severity tiers
- 4-dimension scoring model
- Phased implementation plan (3 sessions)

## Open Questions for Next Iteration

1. **How should "You are" be handled contextually?** The hardest rule to implement. `"You are" + trait/role` = ERROR vs `"You are" + tool + scope` = OK. Needs NLP beyond simple regex — or a curated exception list.
2. **Should behavioral-lint also publish as a Vale style package?** Immediate access to Vale's ecosystem (GitHub Action, pre-commit). Trade-off: Vale can't validate YAML frontmatter schemas. Could be a complementary distribution channel.
3. **What's the scoring model?** 4-dimension counters (identity/specificity/credibility/scope) enable "80% behavioral, 20% identity" reporting. Is a single 0-100 score better? Or multi-dimensional?
4. **Should the linter suggest behavioral rewrites?** "You are an expert in security" → "Focus on security vulnerabilities. Flag any function that handles user input without validation." Templates for common patterns or LLM-assisted for custom?
5. **Token list governance:** Joblint's lists are frozen (2013). Agent anti-patterns will evolve. Externalize as JSON/YAML for community contribution, or inline for simplicity?
