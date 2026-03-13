# Vector 9: Convention Distribution Architecture

**Question:** How should conventions (behavioral rules, governance patterns, CLAUDE.md templates) be packaged, distributed, and maintained across projects?
**Agent dispatched:** 2026-03-12

## Findings

### Convention/Config Distribution in Adjacent Ecosystems

- **ESLint shareable configs** are the canonical model for "convention-as-npm-package." `eslint-config-airbnb` has **4M+ weekly downloads** and **148K stars**. The model uses naming conventions, npm distribution, `extends` keyword, and peer dependencies. But it only works when the consuming tool has an `extends` mechanism — Claude Code's `.claude/rules/` are flat markdown loaded by glob, with no inheritance. ([ESLint shareable configs](https://eslint.org/docs/latest/extend/shareable-configs), [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb))

- **shadcn registry model is the most relevant pattern.** Instead of installing a dependency, the CLI **copies source files into your project**, giving consumers full ownership. Version tracking, changelogs, and compatibility are managed at the registry level, not the package level. This is exactly how `.claude/rules/` files need to work. ([shadcn registry docs](https://ui.shadcn.com/docs/registry), [registry.directory](https://registry.directory/))

- **Copier is the gold standard for convention lifecycle management.** Three-way merge updates, Git-tag versioning, `.copier-answers.yml` tracking, migration hooks. The only tool handling the full lifecycle: initial copy, tracked ownership, update with conflict resolution. ([Copier updating docs](https://copier.readthedocs.io/en/stable/updating/))

- **create-t3-app represents "scaffold-once" distribution** — opinionated scaffolding that produces files you own. No ongoing sync. This is the anti-pattern for conventions which need ongoing sync. ([create-t3-app](https://create.t3.gg/))

### AGENTS.md Generation

- **agents-md-generator** exists as a Claude Code skill (SkillsMP, Smithery, Playbooks). Scans project files to infer agent roles, entry points, dependencies. Detects instruction files for 10+ tools.

- **GitHub's analysis of 2,500+ AGENTS.md files** identified five critical success patterns: early command placement, code examples over prose, explicit boundaries, stack specificity, six core coverage areas. Recommends a **three-tier boundary system**: always do, ask first, never do. ([GitHub blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/))

- **Microsoft APM compiles `apm.yml` to AGENTS.md + CLAUDE.md.** Most ambitious generation approach — declare dependencies once, compile to tool-specific formats. Still early (442 stars). ([Microsoft APM](https://github.com/microsoft/apm))

### Convention Marketplace Models

- **No convention marketplace exists.** Skills marketplaces are abundant (SkillsMP 25K+, Vercel 83K+, Claude Code 55+ plugins). Nobody builds a marketplace for behavioral rules/conventions.

- Closest things:
  - **cursor.directory** — community rules directory, browsable but not versioned
  - **continuedev/awesome-rules** — GitHub repo collecting rules with YAML frontmatter and a `rules` CLI for publishing/installing. Registry is nascent. ([awesome-rules](https://github.com/continuedev/awesome-rules))
  - **Qodo Rules System** (Feb 2026) — enterprise SaaS that auto-discovers rules from code patterns, maintains rule health, enforces in PR review. First "continuous learning" governance system. 11% precision boost. ([Qodo 2.1](https://www.globenewswire.com/news-release/2026/02/17/3239368/0/en/Qodo-2-1-Introduces-First-Continuous-Learning-Rules-System-for-Enterprise-AI-Code-Review.html))

- Six convention distribution tools discovered, none with three-way merge:

  | Tool | Stars | Approach | Distribution |
  |------|-------|----------|-------------|
  | Ruler | 2.5K | Concatenation from `.ruler/` | Local |
  | block/ai-rules | — | Single source, 11 agent outputs | Local |
  | ai-rulez | — | YAML manifest, 18 generators, remote includes | Git repos |
  | centralized-rules | — | Progressive disclosure, 74.4% token savings | curl install |
  | AI Rules Sync | 17 | Symlinks | Local |
  | Microsoft APM | 442 | apm.yml + compile to AGENTS.md/CLAUDE.md | Git repos |

- **Cisco proposes standardized AI coding agent rule format** via aicodingrules.org. YAML metadata + Markdown guidance, hierarchical precedence (org > user > project). No implementations yet. ([aicodingrules.org](https://aicodingrules.org/))

### Security Model for Distributed Conventions

- **npm uses Sigstore for keyless provenance.** `--provenance` flag generates attestations uploaded to Rekor transparency log. Certificates bind to CI/CD identity. ([npm + Sigstore](https://blog.sigstore.dev/npm-provenance-ga/))

- **Homebrew uses tap identity as trust root.** SLSA Build L2-compatible attestations. ([OpenSSF Homebrew proposal](https://repos.openssf.org/proposals/build-provenance-and-code-signing-for-homebrew.html))

- **Claude Code plugins have basic trust but no cryptographic verification.** "Anthropic Verified" badge means additional review. No content hashing, signatures, or provenance chain. CVE-2025-59536 (CVSS 8.7) allowed arbitrary shell execution via untrusted repos.

- Convention files are lower-risk than code but still security-relevant. A malicious `.claude/rules/` file could instruct agents to exfiltrate secrets or bypass review. Content hashing + Git-based provenance is the minimum viable security model.

### CLAUDE.md and .claude/ Directory Ecosystem

- **Claude Code's four-scope hierarchy:** user (`~/.claude/`), project (`.claude/`), local (`.claude/settings.local.json`), managed (enterprise IT). Rules in `.claude/rules/` support glob-based path scoping via YAML frontmatter.

- **Sharing rules across projects today uses symlinks** — fragile, breaks on different machines, doesn't version independently.

- **Claude Code plugins cannot distribute `.claude/rules/` files.** Issue #14200 (28+ thumbs-up, no Anthropic response since Dec 2025). Plugin system supports 7 component types but not rules. ([GitHub issue #14200](https://github.com/anthropics/claude-code/issues/14200))

- **Enterprise managed settings** enable centralized rule enforcement via Group Policy/Intune. Cannot be overridden by users. But not for project-level conventions.

- **The Codified Context paper (arXiv 2602.20478):** 108K-line project, 283 sessions. Three-tier architecture: hot memory (660 lines, always loaded), 19 specialized agents (9,300 lines), 34 cold-memory specs (16,250 lines). Context infrastructure = 24.2% of codebase. **Staleness is the primary failure mode.** Built a drift detector parsing git commits against subsystem-file mappings. Maintenance: 1-2 hours/week.

- **ETH Zurich (arXiv 2602.11988):** Verbose context files hurt agent performance by 3% and increase costs by 20%. Only non-inferable behavioral constraints help.

### Bidirectional Convention Sync

- **Copier's three-way merge manages three states:** old template version, user modifications, new template version. `.copier-answers.yml` tracks template commit hash + user answers. Conflicts produce inline markers or `.rej` files. Migration hooks run between versions.

- **`node-diff3` (v3.2.0)** is the JS implementation of three-way merge. ESM + CJS, browser-compatible. This is the library `sherpa sync` should use.

- **Bidirectional sync is a non-goal.** Conventions flow one-way: framework → consumer. Local modifications stay local. If a downstream modification is valuable, it's proposed as a PR upstream — manual, intentional, reviewed.

- **Git subtree is a poor fit** for frequently-changing convention files (invisible state, confusing rebases).

### Convention Versioning and Compatibility

- **SemVer applies to conventions with behavioral API.** Breaking change = convention update that changes agent behavior unexpectedly. Minor = new constraint added. Patch = clarification.

- **Agent versioning is a recognized challenge.** Agents are behavioral contracts — if any linked version changes (prompt, tools, RAG, model), behavior changes. Convention versions must be tracked as part of the agent's version contract.

- **Drift detection is the best mitigation for staleness.** Parse git commits against subsystem-file mappings, inject warnings when source changes without corresponding spec updates. Could be `sherpa sync`'s killer feature.

## Sources

### Convention Distribution
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs) — Official docs
- [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) — 4M+ weekly downloads
- [shadcn registry docs](https://ui.shadcn.com/docs/registry) — Registry introduction
- [registry.directory](https://registry.directory/) — Community registry explorer
- [create-t3-app](https://create.t3.gg/) — Scaffold-once distribution
- [Copier updating docs](https://copier.readthedocs.io/en/stable/updating/) — Three-way merge
- [tsconfig/bases](https://github.com/tsconfig/bases) — Shared TypeScript configs

### AGENTS.md
- [AGENTS.md standard](https://agents.md/) — Official specification
- [GitHub: lessons from 2,500 repos](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) — Best practices
- [Microsoft APM](https://github.com/microsoft/apm) — Agent Package Manager
- [agents-md-generator (Smithery)](https://smithery.ai/skills/julianromli/agents-md-generator) — Auto-generation

### Marketplace and Distribution Tools
- [cursor.directory](https://cursor.directory/) — Community rules directory
- [continuedev/awesome-rules](https://github.com/continuedev/awesome-rules) — Rules collection
- [aicodingrules.org](https://aicodingrules.org/) — Cisco rule format proposal
- [Ruler](https://github.com/intellectronica/ruler) — Multi-agent concatenation
- [block/ai-rules](https://github.com/block/ai-rules) — Block's multi-agent rules
- [ai-rulez](https://github.com/Goldziher/ai-rulez) — Universal config manager
- [centralized-rules](https://github.com/PaulDuvall/centralized-rules) — Progressive disclosure
- [Microsoft APM](https://github.com/microsoft/apm) — Agent Package Manager

### Security
- [npm + Sigstore](https://blog.sigstore.dev/npm-provenance-ga/) — Keyless signing
- [OpenSSF Homebrew proposal](https://repos.openssf.org/proposals/build-provenance-and-code-signing-for-homebrew.html) — Tap trust model
- [Claude Code security](https://code.claude.com/docs/en/security) — Plugin security
- [GitHub issue #14200](https://github.com/anthropics/claude-code/issues/14200) — Rules in plugins request

### Convention Infrastructure Research
- [arXiv 2602.20478: Codified Context](https://arxiv.org/html/2602.20478v1) — Three-tier convention infrastructure
- [arXiv 2602.11988: ETH Zurich](https://arxiv.org/abs/2602.11988) — Verbose context performance impact
- [Qodo 2.1](https://www.globenewswire.com/news-release/2026/02/17/3239368/0/en/Qodo-2-1-Introduces-First-Continuous-Learning-Rules-System-for-Enterprise-AI-Code-Review.html) — Continuous learning rules

### Convention Sync
- [node-diff3](https://www.npmjs.com/package/node-diff3) — JS three-way merge
- [Copier comparisons](https://copier.readthedocs.io/en/stable/comparisons/) — vs Cookiecutter, Yeoman
- [cruft](https://cruft.github.io/cruft/) — Cookiecutter lifecycle management

### Ecosystem
- [Claude Code rules](https://claudelog.com/faqs/what-are-claude-rules/) — Rules directory
- [Enterprise configuration](https://support.claude.com/en/articles/12622667-enterprise-configuration) — Managed settings
- [GitHub Copilot custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot) — Org-level instructions
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference) — Plugin schema

## Raw Links

- https://eslint.org/docs/latest/extend/shareable-configs
- https://www.npmjs.com/package/eslint-config-airbnb
- https://ui.shadcn.com/docs/registry
- https://ui.shadcn.com/docs/registry/getting-started
- https://registry.directory/
- https://create.t3.gg/
- https://copier.readthedocs.io/en/stable/updating/
- https://copier.readthedocs.io/en/stable/comparisons/
- https://deepwiki.com/copier-org/copier/3.4-updating-projects
- https://github.com/tsconfig/bases
- https://agents.md/
- https://github.com/agentsmd/agents.md
- https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- https://github.com/microsoft/apm
- https://smithery.ai/skills/julianromli/agents-md-generator
- https://cursor.directory/
- https://github.com/continuedev/awesome-rules
- https://github.com/continuedev/rules
- https://docs.continue.dev/customize/deep-dives/rules
- https://amplified.dev
- https://aicodingrules.org/
- https://github.com/intellectronica/ruler
- https://github.com/block/ai-rules
- https://github.com/Goldziher/ai-rulez
- https://github.com/PaulDuvall/centralized-rules
- https://www.globenewswire.com/news-release/2026/02/17/3239368/0/en/Qodo-2-1-Introduces-First-Continuous-Learning-Rules-System-for-Enterprise-AI-Code-Review.html
- https://venturebeat.com/orchestration/qodo-2-1-solves-your-coding-agents-amnesia-problem-giving-them-an-11
- https://blog.sigstore.dev/npm-provenance-ga/
- https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/
- https://repos.openssf.org/proposals/build-provenance-and-code-signing-for-homebrew.html
- https://code.claude.com/docs/en/security
- https://github.com/anthropics/claude-code/issues/14200
- https://claudelog.com/faqs/what-are-claude-rules/
- https://support.claude.com/en/articles/12622667-enterprise-configuration
- https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
- https://code.claude.com/docs/en/plugins-reference
- https://arxiv.org/html/2602.20478v1
- https://arxiv.org/abs/2602.11988
- https://www.npmjs.com/package/node-diff3
- https://github.com/bhousel/node-diff3
- https://cruft.github.io/cruft/
- https://semver.org/
- https://www.cio.com/article/4056453/why-versioning-ai-agents-is-the-cios-next-big-challenge.html
- https://dev.to/bobur/ai-agents-behavior-versioning-and-evaluation-in-practice-5b6g
- https://www.paulmduvall.com/sharing-ai-development-rules-across-your-organization/
- https://medium.com/@binu_thayamkery/claude-code-on-a-team-whats-shared-what-s-private-and-how-not-to-step-on-each-other-11ebcea8d01c
- https://forum.cursor.com/t/cursor-2-6-team-marketplaces-for-plugins/153484
- https://cursor.com/marketplace

## Implications

1. **Distribution model is shadcn registry + Copier lifecycle.** Copy source files (ownership), track provenance in `sherpa.manifest.json`, three-way merge updates via `node-diff3`.

2. **Generate AGENTS.md as compilation target.** `.claude/rules/` + behavioral definitions are authoritative source; AGENTS.md is cross-tool output. Microsoft APM's `apm compile` pattern validates this.

3. **No convention marketplace exists — this is Sherpa's opening.** Skills marketplaces are commodity. Convention marketplaces are vacant. Sherpa could be the first convention registry with full lifecycle.

4. **L4 Governance remains unoccupied.** L1 Standards (mature), L2 Distribution (mature), L3 Synchronization (commodity), L4 Governance (evolution + provenance + merge) = still vacant.

5. **Security can start simple.** Content hashing (SHA-256) in manifest, Git commit SHA as provenance. Sigstore can wait.

6. **`*.local.md` override pattern solves sync conflicts.** Framework-owned files synced from upstream; `*.local.md` files consumer-owned, never overwritten.

7. **Convention quality > quantity.** ETH Zurich: verbose context hurts by 3%, costs +20%. Progressive disclosure (74.4% token savings) is a quality standard.

## Open Questions

1. Should `sherpa sync` adopt Microsoft APM's `apm.yml` as its manifest format?
2. Should conventions be versioned individually or as a set?
3. How does `*.local.md` interact with Claude Code's glob frontmatter ordering?
4. Should Sherpa contribute to Cisco's aicodingrules.org standard?
5. Is Qodo's continuous learning approach a threat or complement?
6. What's the minimum convention file count that justifies `sherpa sync`?
