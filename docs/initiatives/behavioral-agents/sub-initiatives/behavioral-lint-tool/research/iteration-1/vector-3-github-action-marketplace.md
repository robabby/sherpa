# GitHub Action Marketplace Strategy Research

Research vector: What makes a successful GitHub Action on the marketplace? Adoption patterns, naming, README structure, marketplace ranking, and how linting Actions get discovered and adopted.

**Date:** 2026-03-11
**Context:** behavioral-lint as the first agent definition linter. GitHub Action is a key distribution channel.

---

## 1. Top Linting Actions — Landscape & Metrics

### The Major Players

| Action | Stars | Forks | Used By | Type | Key Trait |
|--------|-------|-------|---------|------|-----------|
| [super-linter/super-linter](https://github.com/super-linter/super-linter) | 10.3k | 1.1k | ~395 (Codecov crawl) | Docker | Originally GitHub-owned, meta-linter |
| [reviewdog/reviewdog](https://github.com/reviewdog/reviewdog) | 9.1k | — | — | Go binary | Universal lint adapter, not a linter itself |
| [rhysd/actionlint](https://github.com/rhysd/actionlint) | 3.7k | 204 | 937 dependents | Go binary | Lints GitHub Actions workflow files themselves |
| [oxsecurity/megalinter](https://github.com/oxsecurity/megalinter) | 2.4k | 290 | 5,494 | Docker | 69 languages, SARIF output, auto-fix |
| [wearerequired/lint-action](https://github.com/marketplace/actions/lint-action) | 603 | — | — | Composite | 20+ linters, inline annotations + auto-fix |
| [trunk-io/trunk-action](https://github.com/trunk-io/trunk-action) | 236 | — | — | Composite | Hermetic execution, 50+ linters, commercial model |
| [errata-ai/vale-action](https://github.com/errata-ai/vale-action) | 234 | 54 | — | Docker | Prose linting, reviewdog integration |
| [DavidAnson/markdownlint-cli2-action](https://github.com/DavidAnson/markdownlint-cli2-action) | 162 | 22 | — | JavaScript | True one-liner setup |

**Key finding from Codecov analysis:** Super-Linter ranked #1 by stars (5,500 at time of study) but only had 395 actual uses in workflows — "indicating high visibility without widespread adoption." Stars and actual usage are very different metrics. ([Source](https://about.codecov.io/blog/discovering-the-most-popular-and-most-used-github-actions/))

**Another finding:** 9 of the top 10 most-used actions overall were created by GitHub itself (checkout, setup-node, setup-python, cache, etc). Third-party actions face a discovery disadvantage. ([Source](https://about.codecov.io/blog/discovering-the-most-popular-and-most-used-github-actions/))

### What the Winners Do Right

- **Super-linter**: Zero-config start (`uses: super-linter/super-linter@v8.5.0` + GITHUB_TOKEN). Massive language coverage. Status badge template in README.
- **MegaLinter**: `npx mega-linter-runner --install` scaffolds config. Docker pulls badge (5.5M). Comparison section vs super-linter.
- **actionlint**: Multi-channel distribution (CLI, Action, Homebrew, Go install, Docker, VS Code extension, WebAssembly playground). 937 dependents proves real adoption.
- **markdownlint-cli2-action**: Simplest possible setup — `uses: DavidAnson/markdownlint-cli2-action@v22` with zero inputs required. JavaScript implementation = fast startup.
- **trunk-action**: `uses: trunk-io/trunk-action@v1` — one line. Free for individuals/OSS. Commercial upgrade path.

---

## 2. README Structure of Popular Actions

### Common Sections (ranked by frequency across top actions)

1. **Title + one-line description** — What it does, in one sentence
2. **Badges** — Build status, version, stars, Docker pulls, "used by" count
3. **Quick Start / Usage** — Minimal YAML snippet (the most important section)
4. **Inputs** — Table format with name, description, required/optional, default
5. **Outputs** — What the action returns (often "None" for linting actions)
6. **Examples** — Multiple workflow configurations for different scenarios
7. **Configuration** — How to customize behavior
8. **Supported tools/languages** — What the action lints
9. **How results are reported** — Annotations, comments, check runs
10. **Contributing** — How to contribute
11. **License** — MIT is standard

### Patterns That Convert Browsers to Users

- **The 3-line YAML snippet at the top.** Every successful action leads with a copy-pasteable minimal example. markdownlint-cli2-action is the gold standard — its entire quick start is one `uses:` line.
- **Badges as social proof.** MegaLinter shows: GitHub release, Docker pulls (5.5M), npm downloads, stars, build status, coverage, "used by" count. This is the most badge-heavy README in the space.
- **Comparison tables.** MegaLinter includes "MegaLinter vs Super-Linter" directly in README. This captures users actively comparing.
- **Screenshot/visual of output.** actionlint shows annotated error output with code snippets and error categories. Seeing what the output looks like answers "will this be useful to me?"

### README Generator Tool

[github-action-readme-generator](https://github.com/bitflight-devops/github-action-readme-generator) auto-generates inputs, outputs, usage, and badges from action.yml using markdown comment delimiters. Worth using to keep docs in sync.

---

## 3. Marketplace Ranking Factors

### How GitHub Ranks Search Results

GitHub has never published its marketplace ranking algorithm. Community analysis reveals:

- **Repository name and About section** rank highest for keyword matching ([Source](https://www.markepear.dev/blog/github-search-engine-optimization))
- **Topics** use exact match (not fuzzy). Single-word topics work better than hyphenated phrases. 20 topic limit per repo. ([Source](https://www.markepear.dev/blog/github-search-engine-optimization))
- **Stars, forks, watchers** "definitely play an important role" but are secondary to keyword optimization in About/Topics ([Source](https://www.markepear.dev/blog/github-search-engine-optimization))
- **Usage threshold**: Actions need to be used in at least ~50 projects to appear in "popular" marketplace filters ([Source](https://gist.github.com/6220119/68647f0e54f064d39a58dfb0dbe0f907))
- **Marketplace categories**: Primary + optional secondary category. "Code quality" and "Code review" are the relevant categories for linting. ([Source](https://github.com/marketplace?category=code-quality&type=actions))

### About Section Optimization

"The About section should start with the main keyword and be concise, ideally between 5 to 15 words." GitHub evaluates "the percentage of search terms in all words from the About" to prevent keyword stuffing. ([Source](https://www.markepear.dev/blog/github-search-engine-optimization))

### Marketplace Scale

- ~20,000+ actions in the marketplace ([Source](https://github.blog/news-insights/company-news/github-marketplace-welcomes-its-10000th-action/))
- Growing ~41% annually, especially CI tools
- 65% of new CI actions duplicate existing tools within 6 months — significant discovery problem ([Source](https://coinlaw.io/github-statistics/))
- 150M+ users engage with marketplace apps and actions

### Verified Creator Badge

- Reserved for GitHub partner organizations. "Currently, there is no way to request verification." ([Source](https://github.com/orgs/community/discussions/25265))
- Publisher verification (different from verified creator) requires: domain verification, confirmed email, org-wide 2FA ([Source](https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/about-marketplace-badges))
- The academic survey found developers "prefer Actions with verified creators and more stars when choosing between similar Actions" ([Source](https://arxiv.org/abs/2303.04084))

---

## 4. Action Naming Conventions

### Observed Patterns

| Pattern | Examples | Notes |
|---------|----------|-------|
| `org/tool-action` | `errata-ai/vale-action`, `trunk-io/trunk-action` | Most common for dedicated tool actions |
| `org/action-tool` | `reviewdog/action-eslint`, `reviewdog/action-flake8` | reviewdog's convention for its ecosystem |
| `org/tool` | `super-linter/super-linter`, `oxsecurity/megalinter` | When the org IS the tool |
| `author/tool-cli-action` | `DavidAnson/markdownlint-cli2-action` | When wrapping a specific CLI |
| `org/tool` (generic) | `rhysd/actionlint` | Personal account + tool name |

### What Works Best

- **Include the tool name in the repo name.** Users search by tool name.
- **`-action` suffix is optional but common.** Helps distinguish the Action repo from the tool's main repo.
- **Org name matters for trust.** `eslint/github-action` carries more weight than `random-person/eslint-action`. Multiple competing eslint actions exist because ESLint's official one wasn't dominant.
- **Unique, searchable name is critical.** The marketplace enforces unique names. The `name:` field in action.yml is what shows up in marketplace search — it doesn't have to match the repo name.

### Naming Rules (from GitHub docs)

- Name must be unique across all marketplace actions
- Cannot match an existing user/org name (unless you own it)
- Cannot match a marketplace category name
- Cannot match a reserved GitHub feature name

([Source](https://docs.github.com/actions/creating-actions/publishing-actions-in-github-marketplace))

---

## 5. Action Implementation Patterns

### Three Types Compared

| Type | Speed | OS Support | Isolation | Best For |
|------|-------|-----------|-----------|----------|
| **JavaScript** | Fastest (no container boot) | All (Linux, macOS, Windows) | None (runs on runner) | API integrations, lightweight tools |
| **Docker** | Slowest (container build/pull) | Linux only | Full (containerized) | Complex dependencies, specific environments |
| **Composite** | Medium (delegates to steps) | All | None | Orchestrating existing tools |

([Source](https://docs.github.com/en/actions/creating-actions/about-custom-actions))

**For a linter like behavioral-lint:**
- **JavaScript is the best choice.** Cross-platform, fastest startup, pure Node.js with no binary dependencies. This matches how markdownlint-cli2-action works (100% JavaScript).
- Docker adds 10-30s of overhead for container pull/build. For a linter that should run in seconds, this is significant.
- Composite is viable if wrapping an existing CLI tool, but adds orchestration complexity.

### How Linting Actions Report Results

**Four reporting mechanisms, ranked by developer experience:**

1. **Inline PR annotations** (best UX) — Errors appear directly on changed lines in the "Files changed" tab
   - Via GitHub's Checks API or problem matchers
   - **Hard limit: 10 warnings + 10 errors per step, 50 per job, 50 per run** ([Source](https://github.com/orgs/community/discussions/26680))
   - Workaround: Call Checks API directly via `actions/github-script` — one user generated ~1000 annotations this way
   - Problem matchers work even for fork PRs (unlike Checks API) ([Source](https://github.com/marketplace/actions/problem-matcher-wrapper-linter-errors-as-annotations-even-for-fork-prs))

2. **PR review comments** (high UX) — Comments posted as a code review via reviewdog
   - Uses `reporter: github-pr-review` in reviewdog
   - Appears as a review thread, not just annotations
   - Better for detailed explanations of lint violations

3. **Job Summary** (good for overview) — Markdown content in `$GITHUB_STEP_SUMMARY`
   - Introduced May 2022. Supports GitHub Flavored Markdown, tables, code blocks, Mermaid diagrams ([Source](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/))
   - No annotation limits — can show full lint report
   - Best for aggregate overview when annotation limits are hit

4. **SARIF upload** (best for security tools) — Appears in Security tab, inline on PRs
   - Via `github/codeql-action/upload-sarif`
   - Tracked over time in repository Security tab
   - Overkill for style linting, appropriate for security/compliance linting

5. **Exit code only** (minimal) — Action passes or fails, user reads logs
   - markdownlint-cli2-action uses this approach (outputs: "None")
   - Lowest friction to implement but worst developer experience

**Best practice for a new linting action:** Combine #1 (annotations for individual errors, respecting limits) + #3 (job summary for full report when there are many issues). reviewdog integration (#2) is a bonus.

---

## 6. Adoption Patterns

### Academic Survey Findings (n=90)

From "Developers' Perception of GitHub Actions" ([Saroar & Nayebi, EASE 2023](https://arxiv.org/abs/2303.04084)):

- Developers prefer actions with **verified creators and more stars** when choosing between similar actions
- Users **switch to alternatives** when facing "bugs or a lack of documentation"
- **60.87% of developers** find composing YAML files "challenging and error-prone"
- When debugging, developers "mainly check Q&A forums" rather than official docs
- Some deliberately avoid Actions due to "complexity, security risk, or when benefits aren't worth the cost/effort"
- Publishing advantages: easily discoverable (27.27%), attracting contributions (27.27%), becoming reusable (25%)

### Discovery Channels

1. **GitHub Marketplace search** — Primary channel, but browsing is broken (one researcher couldn't find a specific action after browsing 50 pages)
2. **GitHub search** (searching workflow files) — How Codecov's analysis worked. Developers search `uses: <action>` in `.github/workflows/`
3. **Google/web search** — Blog posts, DEV.to articles, Medium posts drive discovery
4. **Word of mouth / social** — Reddit, Twitter/X, Slack communities
5. **Ecosystem tools** — Being included in super-linter, MegaLinter, trunk, or similar meta-linters drives adoption
6. **IDE/editor integrations** — actionlint's VS Code extension drives CLI adoption which drives Action adoption

### Adoption Curve Indicators

- GitHub Actions usage: 11.5B minutes in 2025 (up 35% YoY), 71M jobs/day ([Source](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/))
- Daily workflows: 5M+ (up from 4M in 2024)
- **Stars ≠ usage.** Super-Linter: 10.3k stars, ~395 actual uses. actionlint: 3.7k stars, 937 dependents. Stars reflect awareness; usage reflects value.

### What Drives Real Adoption (vs. Stars)

Based on patterns observed across all studied actions:

1. **Zero-config quick start** — Can you go from "never heard of it" to "running in CI" in under 2 minutes?
2. **Immediate visible value** — Does the first run show something useful, or just pass silently?
3. **Documentation quality** — The #1 reason developers switch away from an action is bad docs
4. **Problem solved is clear** — "lint your prose" (vale), "lint your Actions workflows" (actionlint) vs. "lint everything" (super-linter, which is mostly aspirational)
5. **Being included in curated lists** — awesome-actions, blog "top N" roundups, conference talks

---

## 7. Problem Reporting Deep Dive

### Annotation Limits Are Real

The 10+10+50 annotation limit is the biggest UX constraint for linting actions:
- 10 warning annotations per step
- 10 error annotations per step
- 50 total per job
- 50 total per run

This means a linter finding 100+ issues will only show a random subset. ([Source](https://github.com/orgs/community/discussions/26680))

### How Top Actions Handle This

| Action | Primary Report | Overflow Strategy |
|--------|---------------|-------------------|
| super-linter | Annotations | Job summary, log files, PR comment (optional) |
| MegaLinter | SARIF + annotations | Full report in job summary, auto-fix PRs |
| actionlint | CLI output + annotations | Problem matchers for annotation |
| trunk-action | Inline annotations | Artifact upload for fork PRs |
| vale-action | reviewdog PR review comments | Bypasses annotation limits via review API |
| lint-action | Check annotations | Auto-fix commits back to branch |

### reviewdog as Universal Adapter

reviewdog (9.1k stars) is the most battle-tested approach for lint result reporting:
- Parses any linter output via errorformat patterns or structured formats (SARIF, rdjson, checkstyle)
- Three reporter modes: `github-pr-check` (default), `github-pr-review` (inline review comments), `github-check`
- Filters findings to only changed lines in the PR diff — critical for not polluting PRs with pre-existing issues
- Has 50+ ready-made action wrappers for specific linters

([Source](https://github.com/reviewdog/reviewdog))

### Recommended Reporting Strategy for behavioral-lint

1. **Primary:** Inline annotations via problem matchers (works with fork PRs, no API token complexity)
2. **Overflow:** Job summary with full markdown report (tables of all violations, grouped by severity)
3. **Optional premium:** reviewdog integration for PR review comments with explanations
4. **Future:** SARIF output for teams that want Security tab tracking

---

## 8. Minimal Viable Action — One-Liner Examples

### The Gold Standard: One `uses:` Line

```yaml
# markdownlint-cli2-action — truly zero-config
- uses: DavidAnson/markdownlint-cli2-action@v22

# trunk-action — one line + permissions
- uses: trunk-io/trunk-action@v1

# actionlint — one line
- uses: rhysd/actionlint-action@v1
```

### The Common Pattern: uses + with

```yaml
# vale-action — specify reporter
- uses: errata-ai/vale-action@v2.1.1

# lint-action — enable specific linters
- uses: wearerequired/lint-action@v2
  with:
    eslint: true
    prettier: true

# super-linter — needs token
- uses: super-linter/super-linter@v8.5.0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### What "Minimal" Means for behavioral-lint

Target configuration:
```yaml
# Dream: true zero-config
- uses: sherpa-ai/behavioral-lint-action@v1

# Realistic MVP: point at definitions directory
- uses: sherpa-ai/behavioral-lint-action@v1
  with:
    path: agents/
```

The action should auto-discover `.behavioral.yml` or `.agent.yml` files. Zero-config with sensible defaults, optional `path` input for non-standard layouts.

---

## 9. action.yml Requirements

### Required Fields

```yaml
name: 'Behavioral Lint'           # Unique across marketplace
description: 'Validate agent definitions against behavioral engineering standards'
branding:
  icon: 'shield'                  # Feather icon (v4.28.0)
  color: 'purple'                 # white|black|yellow|blue|green|orange|red|purple|gray-dark
inputs:
  path:
    description: 'Path to agent definitions'
    required: false
    default: '.'
runs:
  using: 'node20'                 # or 'composite', 'docker'
  main: 'dist/index.js'
```

### Branding

- Icon must be from [Feather Icons v4.28.0](https://feathericons.com/)
- 9 color choices: white, black, yellow, blue, green, orange, red, purple, gray-dark
- [Branding cheat sheet](https://haya14busa.github.io/github-action-brandings/) shows visual combinations
- Both icon and color are required for marketplace listing

([Source](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions))

### Publishing Checklist

1. Repository must be public
2. Single action.yml at root (no other actions in repo)
3. Accept GitHub Marketplace Developer Agreement
4. Choose primary + optional secondary category
5. Create a GitHub Release with "Publish to Marketplace" checked
6. Two-factor authentication required to publish

([Source](https://docs.github.com/actions/creating-actions/publishing-actions-in-github-marketplace))

---

## Implications for behavioral-lint GitHub Action Strategy

### Naming

- **Org**: `sherpa-ai` (or `behavioral-lint` as a dedicated org)
- **Repo**: `behavioral-lint-action` or `behavioral-lint` (shorter, but risks confusion with the npm package)
- **Marketplace name**: "Behavioral Lint" — clean, searchable, no collision risk
- **About section**: "Validate AI agent definitions against behavioral engineering standards" (start with main keyword "validate", 10 words)

### Topics (max 20, exact match)

Priority topics: `linter`, `github-action`, `agent`, `ai-agent`, `yaml`, `validation`, `behavioral`, `ci`, `code-quality`, `devops`

### Implementation

- **JavaScript action** (node20). Fastest, cross-platform, simplest to maintain.
- Ship as compiled `dist/index.js` via `@vercel/ncc` or `esbuild`.
- The npm package (`behavioral-lint`) is the core; the Action is a thin wrapper.

### Reporting

- Annotations via problem matchers (primary — works with forks)
- Job summary with full markdown report (overflow + overview)
- Exit code for pass/fail gating
- Future: reviewdog integration, SARIF output

### README Structure

1. One-sentence description + badges (build, npm version, marketplace)
2. 3-line YAML quick start
3. Screenshot of annotations on a PR
4. Inputs table
5. Examples (basic, custom path, strict mode)
6. What it checks (rules reference)
7. Configuration (.behaviorallintrc or similar)
8. Contributing + License

### Launch Channels

1. **Marketplace listing** with optimized About + Topics
2. **Blog post** on DEV.to / Medium (how-to + why behavioral engineering matters)
3. **Reddit** r/github, r/devops, r/artificial (with genuine problem framing)
4. **Include in awesome-actions** PR
5. **reviewdog ecosystem** — contribute a `reviewdog/action-behavioral-lint` wrapper
6. **Integration with meta-linters** — get included in MegaLinter/super-linter plugin system

### Competitive Moat

The search for `"behavioral-lint" OR "agent definition linter" OR "agent yaml linting"` returned **zero results**. There is no existing GitHub Action for linting AI agent definitions. This is true greenfield — the category doesn't exist yet.

This means:
- No SEO competition for the core keywords
- First to claim the marketplace category name
- Risk: users won't search for something they don't know exists yet
- Mitigation: position as "eslint for agent definitions" — borrow established mental model

---

## Open Questions

1. **Should the Action auto-fix?** lint-action and MegaLinter both offer auto-fix (commit corrections back to branch). Should behavioral-lint suggest fixes via PR comments?
2. **Schema discovery**: How does the Action find agent definition files? By extension (`.behavioral.yml`)? By directory convention (`agents/`)? By config file?
3. **Severity levels**: Should violations block the PR (error) or just warn? Configurable threshold?
4. **reviewdog from day one?** Adding reviewdog support is low-effort and gives inline PR review comments for free. But it adds a dependency.
5. **Verified creator badge**: Requires GitHub partner relationship. Not achievable at launch. Focus on stars + usage instead.
6. **Category creation**: "Agent quality" or "AI governance" aren't marketplace categories yet. Use "Code quality" + "Code review" initially.
7. **Fork PR handling**: Problem matchers work for fork PRs. Checks API doesn't. If using annotations via Checks API, need the artifact-upload workaround pattern that trunk-action uses.

---

## Sources

### Repositories
- [super-linter/super-linter](https://github.com/super-linter/super-linter) — 10.3k star meta-linter, originally GitHub-owned
- [oxsecurity/megalinter](https://github.com/oxsecurity/megalinter) — 2.4k star meta-linter, 69 languages, OX Security
- [errata-ai/vale-action](https://github.com/errata-ai/vale-action) — 234 star prose linter action, reviewdog integration
- [DavidAnson/markdownlint-cli2-action](https://github.com/DavidAnson/markdownlint-cli2-action) — 162 star markdown linter, JavaScript, zero-config
- [reviewdog/reviewdog](https://github.com/reviewdog/reviewdog) — 9.1k star universal lint review adapter
- [rhysd/actionlint](https://github.com/rhysd/actionlint) — 3.7k star GitHub Actions workflow linter
- [trunk-io/trunk-action](https://github.com/trunk-io/trunk-action) — 236 star meta-linter with commercial model
- [wearerequired/lint-action](https://github.com/marketplace/actions/lint-action) — 603 star multi-linter with auto-fix
- [ataylorme/eslint-annotate-action](https://github.com/ataylorme/eslint-annotate-action) — ESLint annotation action, 111 stars
- [eslint/github-action](https://github.com/eslint/github-action) — Official ESLint GitHub Action
- [reviewdog/action-eslint](https://github.com/reviewdog/action-eslint) — ESLint via reviewdog
- [liskin/gh-problem-matcher-wrap](https://github.com/marketplace/actions/problem-matcher-wrapper-linter-errors-as-annotations-even-for-fork-prs) — Problem matcher wrapper for fork PRs
- [bitflight-devops/github-action-readme-generator](https://github.com/bitflight-devops/github-action-readme-generator) — Auto-generates Action README from action.yml
- [haya14busa/github-action-brandings](https://haya14busa.github.io/github-action-brandings/) — Branding icon/color cheat sheet
- [ibiqlik/action-yamllint](https://github.com/ibiqlik/action-yamllint) — YAML lint action
- [mpalmer/action-validator](https://github.com/mpalmer/action-validator) — GitHub Action/Workflow YAML validator

### GitHub Docs
- [About Custom Actions](https://docs.github.com/en/actions/creating-actions/about-custom-actions) — JS vs Docker vs Composite comparison
- [Publishing Actions in GitHub Marketplace](https://docs.github.com/actions/creating-actions/publishing-actions-in-github-marketplace) — Requirements, naming rules, publishing process
- [Metadata Syntax for GitHub Actions](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions) — action.yml reference
- [Uploading a SARIF file to GitHub](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github) — SARIF integration
- [About Marketplace Badges](https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/about-marketplace-badges) — Verified creator vs publisher verification
- [SARIF Support for Code Scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning) — SARIF format details

### Blog Posts & Articles
- [Codecov: Discovering the Most Popular and Most Used GitHub Actions](https://about.codecov.io/blog/discovering-the-most-popular-and-most-used-github-actions/) — Methodology: crawled 4,000 projects, ranked by GitHub Search usage
- [Supercharging GitHub Actions with Job Summaries](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/) — Job summary feature (May 2022)
- [Let's Talk About GitHub Actions](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/) — 11.5B minutes, 71M jobs/day (2025)
- [GitHub Marketplace Welcomes 10,000th Action](https://github.blog/news-insights/company-news/github-marketplace-welcomes-its-10000th-action/) — Marketplace scale milestone
- [GitHub Search Engine Optimization](https://www.markepear.dev/blog/github-search-engine-optimization) — Ranking factors: name, about, topics, engagement metrics
- [Ultimate Guide to GitHub SEO for 2025](https://dev.to/infrasity-learning/the-ultimate-guide-to-github-seo-for-2025-38kl) — About section, README, topics optimization
- [Unleashing GitHub Actions: Docker, JS, Composite](https://medium.com/develeap/unleashing-the-power-of-github-actions-docker-javascript-and-composite-64593b78844) — Implementation type comparison
- [How to Visualize ESLint Errors on GitHub](https://dev.to/jnybgr/how-to-visualize-eslint-errors-on-github-3f8p) — Annotation setup walkthrough
- [Automated Code Review with reviewdog](https://medium.com/@haya14busa/automated-code-review-on-github-actions-with-reviewdog-for-any-languages-tools-20285e04448e) — reviewdog architecture and integration
- [How to Set Up Linting Pipeline in GitHub Actions](https://oneuptime.com/blog/post/2025-12-20-linting-pipeline-github-actions/view) — Linting pipeline patterns
- [Reviewdog Filter Settings with GitHub Actions](https://lornajane.net/posts/2024/reviewdog-filter-settings-with-github-actions) — Practical reviewdog configuration
- [A Deep Dive into Custom GitHub Actions](https://www.neovasolutions.com/2024/03/07/a-deep-dive-into-custom-github-actions/) — Implementation patterns comparison
- [Composite GitHub Actions](https://wallis.dev/blog/composite-github-actions) — Composite action patterns
- [How to Use GitHub Super Linter](https://www.freecodecamp.org/news/github-super-linter/) — Super-linter setup guide
- [GitHub Project Visibility and SEO](https://www.codemotion.com/magazine/dev-life/github-project/) — Repository optimization
- [GitHub Statistics 2026](https://sqmagazine.co.uk/github-statistics/) — Platform-wide stats including 41% CI growth, 65% action duplication rate
- [GitHub Statistics 2026 (CoinLaw)](https://coinlaw.io/github-statistics/) — 150M marketplace users

### Academic
- [Developers' Perception of GitHub Actions: A Survey Analysis (Saroar & Nayebi, EASE 2023)](https://arxiv.org/abs/2303.04084) — Survey of 90 developers: prefer verified + starred actions, switch on bad docs, 60.87% find YAML challenging
- [Empirical Study on Adoption and Effectiveness of CI/CD Tools in GitHub Actions Workflows](https://www.researchgate.net/publication/390280536_Empirical_Study_on_the_Adoption_and_Effectiveness_of_CICD_Tools_in_GitHub_Actions_Workflows) — CI/CD tool adoption patterns

### Community Discussions
- [Annotation Limitation (Discussion #26680)](https://github.com/orgs/community/discussions/26680) — 10+10+50 annotation limits, workarounds via Checks API
- [How to Become Verified Creator (Discussion #25265)](https://github.com/orgs/community/discussions/25265) — Requires GitHub partner relationship, no self-serve path
- [Feature Parity: Composite vs JS/Docker (Issue #2515)](https://github.com/actions/runner/issues/2515) — Composite action limitations
- [GitHub Actions Ranking Gist](https://gist.github.com/6220119/68647f0e54f064d39a58dfb0dbe0f907) — Community-compiled action popularity ranking
- [Automate Code Reviews with GitHub Actions (Discussion #178963)](https://github.com/orgs/community/discussions/178963) — Code review automation patterns

### Tools & Marketplace Pages
- [GitHub Marketplace — Code Quality Category](https://github.com/marketplace?category=code-quality&type=actions) — Category listing
- [GitHub Marketplace — Actions](https://github.com/marketplace?type=actions) — Full marketplace
- [Feather Icons](https://feathericons.com/) — Source for action branding icons
- [actionlint Marketplace Page](https://github.com/marketplace/actions/actionlint) — Marketplace listing example
- [Super-Linter Marketplace Page](https://github.com/marketplace/actions/super-linter) — Marketplace listing example
- [MegaLinter Marketplace Page](https://github.com/marketplace/actions/megalinter) — Marketplace listing example

---

## Raw Links (flat list)

```
https://github.com/super-linter/super-linter
https://github.com/marketplace/actions/super-linter
https://github.com/github/super-linter
https://github.com/oxsecurity/megalinter
https://github.com/marketplace/actions/megalinter
https://megalinter.io/latest/install-github/
https://github.com/errata-ai/vale-action
https://github.com/DavidAnson/markdownlint-cli2-action
https://github.com/reviewdog/reviewdog
https://github.com/rhysd/actionlint
https://github.com/trunk-io/trunk-action
https://github.com/marketplace/actions/lint-action
https://github.com/ataylorme/eslint-annotate-action
https://github.com/eslint/github-action
https://github.com/reviewdog/action-eslint
https://github.com/reviewdog/action-flake8
https://github.com/reviewdog/action-actionlint
https://github.com/marketplace/actions/problem-matcher-wrapper-linter-errors-as-annotations-even-for-fork-prs
https://github.com/bitflight-devops/github-action-readme-generator
https://haya14busa.github.io/github-action-brandings/
https://github.com/ibiqlik/action-yamllint
https://github.com/frenck/action-yamllint
https://github.com/mpalmer/action-validator
https://github.com/cschleiden/actions-linter
https://github.com/xt0rted/eslint-action
https://github.com/rkusa/eslint-action
https://github.com/jnwng/eslint-action
https://github.com/BretFisher/super-linter-workflow
https://github.com/nicklegan/repository-naming-convention-action
https://github.com/ctrf-io/github-test-reporter
https://github.com/advanced-security/python-lint-code-scanning-action
https://github.com/actions/setup-node
https://github.com/actions/runner/issues/2515
https://github.com/orgs/community/discussions/26680
https://github.com/orgs/community/discussions/25265
https://github.com/orgs/community/discussions/178963
https://github.com/orgs/community/discussions/25623
https://github.com/orgs/community/discussions/186797
https://github.com/orgs/community/discussions/39547
https://github.com/orgs/community/discussions/182186
https://github.com/marketplace?type=actions
https://github.com/marketplace?category=code-quality&type=actions
https://github.com/marketplace?category=code-quality
https://github.com/marketplace/actions/actionlint
https://github.com/marketplace/actions/eslint-annotate
https://github.com/marketplace/actions/eslint-annotate-from-report-json
https://github.com/marketplace/actions/eslint-annotations
https://github.com/marketplace/actions/yaml-lint
https://github.com/marketplace/actions/action-yaml-linter
https://github.com/marketplace/actions/python-code-quality-and-lint
https://github.com/marketplace/actions/python-quality-and-format-checker
https://github.com/marketplace/actions/github-actions-workflow-linter
https://github.com/marketplace/actions/readme-template
https://github.com/marketplace/actions/github-action-s-readme-generator
https://github.com/marketplace/actions/code-review-github-action
https://github.com/marketplace/actions/github-rank-action
https://github.com/marketplace/actions/markdown-seo-check
https://docs.github.com/en/actions/creating-actions/about-custom-actions
https://docs.github.com/actions/creating-actions/publishing-actions-in-github-marketplace
https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions
https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github
https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning
https://docs.github.com/en/code-security/code-scanning/troubleshooting-sarif-uploads
https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/about-marketplace-badges
https://docs.github.com/en/apps/github-marketplace/github-marketplace-overview/applying-for-publisher-verification-for-your-organization
https://docs.github.com/en/enterprise-cloud@latest/actions/creating-actions/publishing-actions-in-github-marketplace
https://docs.github.com/en/enterprise-cloud@latest/apps/publishing-apps-to-github-marketplace/github-marketplace-overview/about-marketplace-badges
https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
https://docs.github.com/en/actions/get-started/quickstart
https://docs.github.com/en/actions
https://about.codecov.io/blog/discovering-the-most-popular-and-most-used-github-actions/
https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/
https://github.blog/news-insights/product-news/lets-talk-about-github-actions/
https://github.blog/news-insights/company-news/github-marketplace-welcomes-its-10000th-action/
https://github.blog/enterprise-software/ci-cd/build-ci-cd-pipeline-github-actions-four-steps/
https://github.blog/changelog/2025-11-06-new-releases-for-github-actions-november-2025/
https://github.blog/changelog/2024-12-05-notice-of-upcoming-releases-and-breaking-changes-for-github-actions/
https://github.blog/changelog/2026-02-05-github-actions-early-february-2026-updates/
https://resources.github.com/actions/2026-pricing-changes-for-github-actions/
https://resources.github.com/devops/tools/automation/actions/
https://resources.github.com/learn/pathways/automation/essentials/building-a-workflow-with-github-actions/
https://resources.github.com/enterprise-content-roundup/november/
https://github.com/features/actions
https://www.markepear.dev/blog/github-search-engine-optimization
https://dev.to/infrasity-learning/the-ultimate-guide-to-github-seo-for-2025-38kl
https://medium.com/develeap/unleashing-the-power-of-github-actions-docker-javascript-and-composite-64593b78844
https://dev.to/jnybgr/how-to-visualize-eslint-errors-on-github-3f8p
https://medium.com/@haya14busa/automated-code-review-on-github-actions-with-reviewdog-for-any-languages-tools-20285e04448e
https://oneuptime.com/blog/post/2025-12-20-linting-pipeline-github-actions/view
https://oneuptime.com/blog/post/2026-02-21-how-to-set-up-ansible-lint-in-github-actions/view
https://lornajane.net/posts/2024/reviewdog-filter-settings-with-github-actions
https://www.neovasolutions.com/2024/03/07/a-deep-dive-into-custom-github-actions/
https://wallis.dev/blog/composite-github-actions
https://www.freecodecamp.org/news/github-super-linter/
https://www.codemotion.com/magazine/dev-life/github-project/
https://sqmagazine.co.uk/github-statistics/
https://coinlaw.io/github-statistics/
https://electroiq.com/stats/github-statistics/
https://www.restack.io/p/github-actions-knowledge-naming-conventions-cat-ai
https://www.datree.io/resources/github-actions-best-practices
https://www.ssw.com.au/rules/workflow-naming-scheme
https://www.hatica.io/blog/best-practices-for-github-readme/
https://www.freecodecamp.org/news/how-to-structure-your-readme-file/
https://medium.com/@fulton_shaun/readme-rules-structure-style-and-pro-tips-faea5eb5d252
https://www.tilburgsciencehub.com/topics/collaborate-share/share-your-work/content-creation/readme-best-practices/
https://coding-boot-camp.github.io/full-stack/github/professional-readme-guide/
https://medium.com/ci-cd-devops/try-github-super-linter-with-github-action-16fafee15577
https://medium.com/@ramesh.19.dvg/github-super-linter-one-linter-to-rule-them-all-8473c621e64c
https://carldesouza.com/using-super-linter-in-a-github-repo-to-improve-your-code-quality/
https://medium.com/kpmg-uk-engineering/create-your-own-action-in-github-action-marketplace-145acd2276b0
https://dev.to/balastrong/publish-a-github-action-in-the-marketplace-7f0
https://medium.com/@artem_lajko/create-and-publish-github-action-7f2ca810bcc8
https://notiz.dev/blog/build-and-publish-your-first-github-action/
https://patelsandeep88.medium.com/how-to-publish-your-custom-github-action-to-the-marketplace-bf53e805c36d
https://hackernoon.com/building-and-publishing-your-own-custom-github-action-in-marketplace
https://medium.com/snapp-mobile/uploading-sarif-reports-to-github-91a8001e6794
https://codepathfinder.dev/blog/github-summary-pull-request-comments-integration
https://blog.svarun.dev/creating-and-working-with-actionyml
https://dev.to/hkhelil/github-actions-composite-vs-reusable-workflows-4bih
https://graphite.com/guides/enhancing-code-quality-github
https://medium.com/swlh/enhancing-code-quality-with-github-actions-67561c6f7063
https://dev.to/therealmrmumba/top-20-rising-github-projects-with-the-most-stars-in-2025-3idf
https://dev.to/n3wt0n/the-easiest-way-to-lint-any-code-github-super-linter-deep-dive-53eo
https://attuneops.io/github-actions-tutorial/
https://www.freecodecamp.org/news/learn-to-use-github-actions-step-by-step-guide/
https://cicube.io/workflow-hub/github-action-setup-node/
https://deepdocs.dev/git-action-ci-cd/
https://gcore.com/learning/github-actions-how-to-improve-your-ci-cd-workflow/
https://ubos.tech/news/github-actions-announces-2026-pricing-changes-and-new-cloud-platform-charges/
https://www.getorchestra.io/guides/auto-linting-for-github-actions-and-yml-validation
https://tips.desilva.se/posts/simple-yaml-linter-validator-workflow-for-github-actions
https://ehewen.com/en/blog/reviewdog/
https://deepwiki.com/reviewdog/reviewdog/6.1-github-actions
https://best.openssf.org/SCM-BestPractices/github/actions/all_github_actions_are_allowed.html
https://engineering.salesforce.com/github-actions-security-best-practices-b8f9df5c75f5/
https://johnnyreilly.com/bicep-lint-azure-pipelines-github-actions
https://microsoft.github.io/code-with-engineering-playbook/code-reviews/recipes/markdown/
https://docs.readme.com/main/docs/github-actions-docs-example
https://rhysd.github.io/actionlint/
https://notes.kodekloud.com/docs/GitHub-Actions-Certification/Custom-Actions/Metadata-syntax-for-GitHub-Actions/page
https://stackbay.org/modules/chapter/learn-github-actions/publishing-actions-in-github-marketplace
https://arxiv.org/abs/2303.04084
https://arxiv.org/pdf/2303.04084
https://dl.acm.org/doi/10.1145/3593434.3593475
https://www.researchgate.net/publication/390280536_Empirical_Study_on_the_Adoption_and_Effectiveness_of_CICD_Tools_in_GitHub_Actions_Workflows
https://www.semanticscholar.org/paper/Developers%E2%80%99-Perception-of-GitHub-Actions:-A-Survey-Saroar-Nayebi/006c04918646be661bb3a55d31249a7b1a3aa0de
https://conf.researchr.org/details/ease-2023/ease-2023-research/14/Developers-Perception-of-GitHub-Actions-A-Survey-Analysis
https://dl.acm.org/doi/10.1016/j.infsof.2024.107522
https://gist.github.com/6220119/68647f0e54f064d39a58dfb0dbe0f907
https://github.com/rajbos/actions-marketplace
https://feathericons.com/
https://tryapis.com/github/api/code-scanning-upload-sarif/
```
