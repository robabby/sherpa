# Research Iteration 4: Distribution & Launch Strategy

**Date:** 2026-03-11
**Vectors:** Launch precedents (7 tools), Reddit as channel, spec site strategy, npm distribution, GitHub virality, developer content marketing, category creation
**Status:** Complete
**Addresses:** Open question #4 (Distribution strategy)

---

## 1. How Similar Tools/Standards Launched

### conventional-commits (8.6k stars, conventionalcommits.org)

- **Created:** April 2016 on GitHub, spec site built on Hugo + Netlify
- **Blueprint:** Used semver.org's site structure as explicit blueprint
- **Adoption driver:** Not the spec itself but the *enforcement toolchain* (commitlint, 18.4k stars) and the *automation payoff* (semantic-release, auto-versioning, auto-changelogs)
- **HN reception:** 157 points, 95 comments. Polarized: "solving a problem nobody needs" vs. "low friction release consistency." Abbreviation "feat" was widely criticized
- **Key pattern:** Spec alone = moderate. Spec + enforcer + automation = flywheel. Conventional commits grew because commitlint + husky + semantic-release made the ROI tangible in 5 minutes
- **Contributors:** 194. Multi-language translations (30+) broadened reach
- Sources: [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/), [GitHub repo](https://github.com/conventional-commits/conventionalcommits.org), [HN thread](https://news.ycombinator.com/item?id=21125669), [commitlint](https://github.com/conventional-changelog/commitlint)

### ESLint (43M+ weekly downloads)

- **Created:** June 2013 by Nicholas Zakas. Prototype built over "a couple of weekends" using Esprima + estraverse + escope
- **Problem:** JSHint couldn't do plugins. Zakas emailed the maintainer; plugin support "had stalled"
- **Critical decision:** Pluggable architecture from day one. README stated ESLint worked "better for what I'm doing" -- explicitly *no competitive messaging*
- **Growth:** 600 monthly downloads to 1.5M in 2.5 years. Near-doubling (89K to 161K/mo) after Dan Abramov's influential post
- **Marketing budget:** Two blog posts and Twitter mentions. Total. Grassroots advocates created all content, talks, and videos
- **What won:** ES6/JSX support via pluggable parsers (41% used babel-eslint, 45% used eslint-plugin-react). Community extensibility + tailwind timing
- Sources: [Inception blog post](https://humanwhocodes.com/blog/2018/02/the-inception-of-eslint/), [Reflections on success](https://humanwhocodes.com/blog/2016/02/reflections-on-eslints-success/), [Wikipedia](https://en.wikipedia.org/wiki/ESLint)

### Prettier (83% dev adoption by 2021)

- **Created:** Dec 2016, open-sourced early 2017 by James Long + Christopher Chedeau (Vjeux) at Facebook
- **The blog post that launched it:** "[A Prettier JavaScript Formatter](https://archive.jlongster.com/A-Prettier-Formatter)" by James Long -- "kick started its growth." A single, technically deep blog post
- **HN reception:** Prettier 1.0 got 270 points, 76 comments. Positive, technically curious. Brad Fitzpatrick (Go creator) debated configurability. Antirez (Redis) debated whether formatters diminish hand-crafted code "rhythm"
- **Adoption strategy:** Opinionated by default (only 8 options vs. ESLint's 260+), format-on-save as the killer feature, social proof from React/Jest/Cloudflare adoption
- **Internal rollout:** `@format` annotation for opt-in. 50% of Facebook codebase in 6 months. Only one production issue across the entire conversion
- **Community insight:** "Code formatting is largely a social problem and you aren't going to win unless it comes from somebody already deep inside the community who people trust" -- Christopher Chedeau
- **Funding:** OpenCollective, $200k lifetime donations. Maintenance costs ~$36k/year
- Sources: [Birth of Prettier](https://blog.vjeux.com/2025/javascript/birth-of-prettier.html), [Launch post](https://archive.jlongster.com/A-Prettier-Formatter), [HN Prettier 1.0](https://news.ycombinator.com/item?id=14108718), [case study](https://humphd.github.io/pretty-effective/)

### Vale (prose linter, vale.sh)

- **Distribution:** Single Go binary. `brew install vale` or download from releases. Zero npm/pip dependency
- **Adoption hook:** "Your style, our editor." Organizations (GitLab, Homebrew, Spotify, CockroachDB) adopted because no language runtime required
- **Key pattern:** Extensible style packages. Organizations write their own rules, share them. The tool is generic; the content is org-specific
- **Relevance to behavioral-agents:** Vale's "style packages" model is directly analogous to "behavioral agent catalog" -- generic tool + org-specific content
- Sources: [vale.sh](https://vale.sh), [GitHub](https://github.com/errata-ai/vale), [Contentsquare blog](https://engineering.contentsquare.com/2023/using-vale-to-help-engineers-become-better-writers/)

### Biome (Rome successor)

- **Created:** August 2023 as community fork after Rome Tools Inc. laid off all employees
- **Try-it story:** `npx @biomejs/biome format --write` -- zero config, immediate value. Also `npx @biomejs/biome init` for config scaffold
- **Speed messaging:** "Fastest linting and formatting toolchain in web development" (Rust-based). Feedback in 100-200ms even on large files
- **Migration strategy:** Planned migration guides from ESLint + Prettier. Recognized "moving small projects is easy, moving big code bases is challenging"
- Sources: [Announcing Biome](https://biomejs.dev/blog/announcing-biome/), [Getting started](https://biomejs.dev/guides/getting-started/), [Roadmap 2024](https://biomejs.dev/blog/roadmap-2024/)

### commitlint (18.4k stars)

- **Created:** February 2016. The enforcement arm of conventional-commits
- **Pattern:** Convention (spec) + Enforcement (commitlint) + Automation (semantic-release) + Hooks (husky) = complete pipeline. Each tool is independently useful but together form a self-reinforcing adoption flywheel
- **CI integration:** Works locally via husky git hooks AND in CI as server-side enforcement
- Source: [commitlint](https://github.com/conventional-changelog/commitlint), [conventionalcommit/commitlint](https://github.com/conventionalcommit/commitlint)

### agency-agents (30.7k stars, competitor)

- **Created:** October 13, 2025. 30,720 stars, 4,811 forks as of March 11, 2026
- **The Reddit origin:** Born from a Reddit thread. 50+ Redditors requested it within the first 12 hours
- **Growth curve (from SourcePulse analytics):**
  - Slow start: Oct 2025 through early Feb 2026
  - **Explosion:** ~25,865 stars in 30 days (Feb 10 - Mar 11, 2026)
  - **7-day spike:** 21,367 stars = 390.62% increase in one week (March 4-11, 2026)
- **Viral amplification:** Greg Isenberg tweet ("10k+ stars in under 7 days") + LinkedIn post. Medium article "61 Agents. 10K Stars in 7 Days." Multiple forks and derivative repos
- **Cross-tool strategy:** Ships conversion + install scripts for Claude Code, Cursor, Copilot, Aider, Windsurf, Gemini CLI, OpenCode. `./scripts/convert.sh` + `./scripts/install.sh --tool cursor`
- **What made it viral:**
  1. **Relatable framing:** "AI agency" with org-chart structure. Non-technical people understand "hire a frontend developer agent"
  2. **Quantity signaling:** "112 specialized agents" as headline metric
  3. **Zero friction:** Browse markdown files on GitHub, copy to clipboard
  4. **Cross-tool portability:** Works everywhere, not vendor-locked
  5. **Personality-forward:** "Frontend wizards," "reality checkers," "whimsy injectors" -- memorable, shareable names
- **Vulnerability:** Identity-prompt-based. Research shows this approach is unreliable (Zheng et al. EMNLP 2024, Anthropic Persona Selection Model 2026). Behavioral-agents is the evidence-based alternative
- Sources: [GitHub repo](https://github.com/msitarzewski/agency-agents/), [Greg Isenberg tweet](https://x.com/gregisenberg/status/2030680849486668229), [SourcePulse](https://www.sourcepulse.org/projects/16866012), [LinkedIn](https://www.linkedin.com/posts/gisenberg_i-found-a-github-repo-that-lets-you-spin-activity-7436773518337269760-SABV)

---

## 2. Reddit as Launch Channel

### What Makes Reddit Posts Succeed

**Pre-launch (4-6 weeks):**
- Build 20-30 genuine contributions across 5-10 target subreddits before posting anything promotional
- Share building journey without pitching: "I'm building a tool to solve X. What features would you want?"
- Account must have 100+ karma, visible post history. Moderators check

**Post formula:**
- Title leads with **problem or story**, not product name. "I spent 6 months studying why identity prompts fail" > "Launching behavioral-agents v1"
- Structure: hook (2-3 sentences) -> background -> what you built -> what you learned -> CTA for feedback
- "The best Reddit launches don't look like launches. They feel like a founder sharing their journey"

**Timing:** Tuesday-Thursday, 9-11 AM EST. Respond to every comment in first 2 hours

**Traffic numbers (realistic):**
- r/SaaS posts: 500-2K views
- Viral r/startups posts: 5-20K views
- Click-through: 2-5%, free tier signups: 2-10% of visitors
- Single well-received r/SaaS or r/startups post can drive 5,000-20,000 visitors in 24 hours

### Target Subreddits for Behavioral Agents

**Primary (agent/AI-coding focused):**
- **r/ClaudeCode** -- 4,200+ weekly contributors. Where agency-agents grew. Most aligned audience
- **r/ClaudeAI** -- Claude users, broader. Where agency-agents was born
- **r/CursorAI** / **r/Cursor** -- Cursor users, agent rules are a hot topic

**Secondary (developer tooling):**
- **r/ChatGPTCoding** -- "geared towards any sort of AI-coding discussion, not ChatGPT specific"
- **r/LocalLLaMA** -- Local model users, interested in agent definitions
- **r/LLMDevs** -- LLM developer community
- **r/AI_Agents** -- Agent-focused community
- **r/vibecoding** -- Emerging AI coding community

**Tertiary (broader reach):**
- **r/SideProject** (205K) -- built for showcasing creations
- **r/SaaS** (264K) -- explicitly welcomes product shares in Weekly Feedback Thread

### The agency-agents Reddit Playbook (What to Copy)

agency-agents grew because:
1. Reddit thread surfaced genuine demand (50+ requests in 12 hours)
2. Cross-tool portability removed objections ("works with my tool")
3. Quantity was the viral hook ("112 agents")
4. Personality names were shareable ("whimsy injector" is memorable)

**The behavioral-agents counter-narrative:** "Your agent prompts are built on a technique that research shows doesn't work. Here's what does." This is genuinely novel and contrarian -- exactly what Reddit rewards.

Sources: [Reddit launch strategy guide](https://www.reddit-radar-marketing.com/blog/reddit-product-launch-strategy), [AI agents Reddit survey](https://www.aitooldiscovery.com/guides/best-ai-agents-reddit)

---

## 3. Spec Site Strategy

### Precedent Analysis

| Site | Stack | Content | Stars (repo) |
|------|-------|---------|-------------|
| [conventionalcommits.org](https://conventionalcommits.org) | Hugo + Netlify, 30+ languages | Spec, examples, FAQ, "Why use it" | 8.6k |
| [semver.org](https://semver.org) | GitHub Pages, daily publish via GH Actions | Spec, FAQ, multi-language | 3.8k+ |
| [agents.md](https://agents.md) | Static site | Spec, tool list, adoption guide | 60k+ projects |
| [vale.sh](https://vale.sh) | Static site | Install, config, style packages | ~4.7k |

### Recommended Site Structure for behavioral-agents.dev

**Sections (modeled on conventionalcommits.org + AGENTS.md):**
1. **Hero:** "Agent definitions that work. Backed by research." + one-liner + `npx behavioral-lint check agents/`
2. **The Problem:** Identity prompts are unreliable (cite Zheng et al., Anthropic PSM). 30-second pitch
3. **The Spec:** Full schema reference (adapted from schema-spec.md)
4. **Examples:** Minimal, standard, and full (quality-gate) agent definitions
5. **Migration Guide:** "From identity prompts to behavioral agents" (adapted from schema-spec.md migration section)
6. **Tools:** behavioral-lint CLI, VS Code extension (planned), GitHub Action (planned)
7. **Catalog:** Browse the base catalog, filter by category/tags
8. **FAQ:** "How is this different from agency-agents?" "Why not just AGENTS.md?" "Does this work with Cursor/Copilot?"
9. **Research:** Links to Zheng et al., Anthropic PSM, TDAD paper

**Build recommendations:**
- Static site (Astro or Hugo) on Netlify or Vercel
- Open source the site repo (conventional-commits pattern)
- Spec versioned (v1.0.0) with changelog
- Multi-language support can come later but plan the directory structure now

### Domain Options

- `behavioral-agents.dev` -- most descriptive, matches npm package name
- `behavioralagents.dev` -- no hyphen variant
- `behavioral.sh` -- short, developer-friendly (Vale uses vale.sh)

**Recommendation:** `behavioral-agents.dev` with redirect from `behavioralagents.dev`. The hyphenated form matches the npm package name and the kebab-case convention in the agent file format.

---

## 4. npm Package as Distribution

### The "Try It in 30 Seconds" Story

The gold standard is a one-line npx command that produces immediate value with zero config:

```bash
# The dream command — validate any agent file instantly
npx behavioral-lint check agents/

# Or validate a single file
npx behavioral-lint check my-agent.md
```

**Precedents for zero-config CLI:**
- Biome: `npx @biomejs/biome format --write` (immediate formatting, zero config)
- markdownlint-cli2: `npx markdownlint-cli2 "**/*.md"` (immediate linting, sensible defaults)
- commitlint: `npx commitlint --from HEAD~1` (check last commit)
- Vale: `brew install vale && vale .` (Go binary, no npm -- but zero config with sensible defaults)

**behavioral-lint positioning:**
```
npx behavioral-lint check agents/          # Lint all agents
npx behavioral-lint init                   # Scaffold a new agent
npx behavioral-lint migrate identity.md    # Convert identity prompt → behavioral agent
npx behavioral-lint catalog                # Browse the base catalog
```

**Critical features for adoption:**
1. **Zero config works.** Default rules catch identity language, missing dispositions, untestable constraints
2. **Config optional.** `.behavioral-lint.yaml` for custom taxonomy, severity overrides
3. **JSON output.** `--json` flag for CI integration
4. **Strict mode.** `--strict` promotes warnings to errors (for CI gates)
5. **Migrate command.** The single biggest adoption driver -- converts agency-agents format to behavioral format. Instant value for existing users

### The Existing Linter Landscape (Competitive Intelligence)

**agents-lint** (4 stars, created Feb 27, 2026):
- Validates AGENTS.md files for stale paths, dead scripts, outdated patterns
- Different scope: validates project context files, not agent definitions
- Not a competitor; complementary

**agnix** (91 stars, created Jan 30, 2026):
- 230 rules across Claude Code, Codex, Cursor, Copilot
- Validates CLAUDE.md, SKILL.md, hooks, MCP configs
- Broad scope. Does not validate agent behavioral contracts
- Potential integration partner (they validate the file, we validate the content)

**Neither tool validates agent definition *quality* (behavioral constraints, disposition testing, fail-trigger specificity).** This is the behavioral-lint differentiator.

### npm Package Architecture

```
@sherpa/behavioral-lint        # The CLI + core rules
@sherpa/behavioral-schema      # Zod schemas, types, parser (for integrations)
@sherpa/behavioral-catalog     # Base agent catalog (the 20 agents)
```

Three packages because consumers have different needs:
- **CLI users** want behavioral-lint (includes schema + catalog)
- **Integration authors** (VS Code extension, GitHub Action) want just the schema
- **Organizations** want the catalog as a starting point to customize

---

## 5. GitHub as Distribution

### What Makes an Agent Definition Repo Go Viral

**From agency-agents' success pattern:**
1. **Quantity in the headline.** "112 specialized agents" was the viral hook. behavioral-agents should lead with "20 research-backed behavioral agents" -- smaller number but qualified with authority
2. **Beautiful README.** "Success on GitHub can be entirely attributed to designing READMEs beautifully." Use badges, table of contents, category tables, code examples
3. **Zero-friction try-it.** The README's first code block should be `npx behavioral-lint check agents/`
4. **Cross-tool compatibility.** agency-agents ships install scripts for 7+ tools. behavioral-agents should match or exceed
5. **Social proof badges.** npm downloads, CI status, "validated by" badge with org logos

**Recommended README structure:**
```
# behavioral-agents

> Agent definitions that work. Backed by research, not vibes.

[badges: npm version, downloads, CI, license]

## The Problem
[3 sentences on why identity prompts fail, with paper citations]

## Quick Start
[npx behavioral-lint check agents/]

## The Catalog
[Table of 20 agents with category, disposition, model-tier]

## Schema Reference
[Link to spec site]

## Why Behavioral?
[Comparison table: identity prompts vs. behavioral constraints]

## Compatibility
[Works with: Claude Code, Cursor, Copilot, Aider, Windsurf, Gemini CLI]

## Migration from agency-agents
[npx behavioral-lint migrate <agency-agents-file.md>]

## Contributing
## License (MIT)
```

**Key badges:**
- npm version + downloads (shields.io)
- CI passing (GitHub Actions)
- "behavioral-agents v1.0" compliance badge (like conventional-commits badge)
- "Backed by research" badge linking to papers

### GitHub Star Growth Strategy

From the research on how repos grow:
- First 1,000 stars in ~6 months is typical, then 10,000 in the next 4 months as growth compounds
- Stars follow usage, not the reverse. Focus on users
- Post regular blog posts about the problem space
- Participate in developer conferences and online communities
- Private Discord for top contributors becomes testing ground and feedback loop

Sources: [How to grow to 10K stars](https://markaicode.com/grow-github-repository-stars/), [HackerNoon playbook](https://hackernoon.com/the-ultimate-playbook-for-getting-more-github-stars), [How to get thousands of stars](https://blog.cwrichardkim.com/how-to-get-hundreds-of-stars-on-your-github-project-345b065e20a2)

---

## 6. Developer Content Marketing

### Channel Strategy

| Channel | Content Type | Timing | Expected Impact |
|---------|-------------|--------|-----------------|
| **Reddit** (r/ClaudeCode, r/ClaudeAI) | "Why your agent prompts don't work" journey post | Week 1 launch | Primary growth driver (agency-agents proved this channel) |
| **Hacker News** (Show HN) | Technical deep-dive, link to GitHub | Week 1-2 | Secondary but high-quality. HN crowd overindexes on open-source, privacy-first, research-backed |
| **DEV.to** | Tutorial: "Migrate your agency-agents to behavioral format" | Week 2-3 | SEO + syndication. Reaches different audience than Reddit/HN |
| **X/Twitter** | Thread: "Why identity prompts fail" + paper citations | Week 1-2 | Influencer amplification potential (Greg Isenberg amplified agency-agents) |
| **YouTube** | 2-minute demo: `npx behavioral-lint check` + migrate command | Week 2-4 | Longtail discovery. 60-90 sec is ideal length |
| **Blog (spec site)** | "The research behind behavioral agents" | Week 0 (pre-launch) | Authority signal. Link target for all other channels |

### Content Pieces (Priority Ordered)

1. **"Your Agent Prompts Are Built on a Lie"** (blog post, spec site) -- The contrarian hook. Cite Zheng et al. ("identity role effects are largely random across 162 roles"), Anthropic's Persona Selection Model (persona drift, unpredictable activation). Position behavioral-agents as the evidence-based alternative
2. **"From Identity to Behavior: A Migration Guide"** (DEV.to + blog) -- Practical tutorial converting an agency-agents file to behavioral format. Shows the migrate CLI command
3. **"I analyzed 112 agent definitions and found they all make the same mistake"** (Reddit post, r/ClaudeCode) -- Journey-style post analyzing agency-agents' identity prompts, showing how they activate "persona clouds." Links to the tool
4. **Show HN: behavioral-lint -- Lint your AI agent definitions for identity language and untestable constraints** (HN) -- Technical, modest, links to GitHub. Follow HN conventions: no superlatives, talk as fellow builders, respond to every comment
5. **Migration tool demo video** (YouTube, 60-90 sec) -- Terminal recording: install, check an agency-agents file (shows warnings), migrate, check again (passes). Visual proof of value

### HN-Specific Strategy

From [dev tool HN launch guide](https://www.markepear.dev/blog/dev-tool-hacker-news-launch):
- Write in your own voice, not corporate. "Imagine having a drink with a friend you used to work with"
- Avoid superlatives. "Behavioral agent definitions for AI coding assistants" > "The most advanced agent framework"
- Link to GitHub repo prominently (signals it's real and runnable)
- Provide free access with minimal barriers
- Frame CTA around feedback: "What behavioral constraints would you add?"
- Respond to every comment with technical depth. The HN audience is genuinely curious
- Open-source + privacy-first = HN catnip

Sources: [HN launch guide](https://www.markepear.dev/blog/dev-tool-hacker-news-launch), [HN launch tips](https://dev.to/dfarrell/how-to-crush-your-hacker-news-launch-10jk), [PostHog content strategy](https://posthog.com/blog/running-content-at-posthog)

---

## 7. Category Creation Analysis

### "Behavioral Agents" as a New Category

**The category term "behavioral agents" does not currently exist in the developer tooling ecosystem.** There is:
- "AI agents" (generic)
- "Agent definitions" (format-neutral)
- "Agent skills" (capability-focused)
- "Agent rules" (configuration-focused)
- "Agent personas" (identity-focused -- what we're replacing)

"Behavioral agents" would be the first term specifically for **research-backed, behavioral-constraint-based agent definitions.** This is a genuine category creation opportunity.

### Category Creation Framework (from HBR + LaunchNotes research)

**Key insight from HBR:** Category creation is about *education*, not competition. "Most of the education is not about your product. Instead, educate your prospective customers that it's possible to solve the problem."

**The three-part flywheel:**
1. Radical product innovation -- behavioral schema + lint tool + base catalog
2. Business model innovation -- free + open source, with commercial catalog extensions (consulting?)
3. Data about future demand -- migration tool collects data on which identity patterns fail most

**Timeline expectation:** "It can take the average person up to 20 times of seeing something before they truly internalize it." Plan 12+ months of consistent messaging.

**Category naming rules:**
- 3 words maximum (we have 2: "behavioral agents")
- Use customer language (developers say "agent" not "persona")
- Customer repeating the name unprompted = success signal

### The Competitive Landscape (Ecosystem Map)

| Project | Stars | Created | What It Does | Relationship to behavioral-agents |
|---------|-------|---------|-------------|----------------------------------|
| [agency-agents](https://github.com/msitarzewski/agency-agents/) | 30.7k | Oct 2025 | Identity-prompt agent personas | Direct competitor (identity vs. behavioral approach) |
| [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | 38.4k | Sep 2024 | Cursor rule collections | Different scope (IDE rules, not agent definitions) |
| [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 10.9k | Oct 2025 | Agent skill collections for 14+ tools | Complementary (skills vs. role definitions) |
| [agent-rules](https://github.com/steipete/agent-rules) | 5.6k | Jun 2025 | Rules/knowledge for Claude Code + Cursor | Complementary (project rules, not agent roles) |
| [AGENTS.md](https://agents.md/) | 60k+ projects | Aug 2025 | Project context for coding agents (Linux Foundation/AAIF) | Different layer (project context vs. agent behavior). AGENTS.md is infrastructure; behavioral-agents are the content that runs on it |
| [agnix](https://github.com/agent-sh/agnix) | 91 | Jan 2026 | Lint CLAUDE.md, AGENTS.md, SKILL.md, hooks, MCP | Complementary linter (file-level validation vs. content-level behavioral analysis) |
| [agents-lint](https://github.com/giacomo/agents-lint) | 4 | Feb 2026 | Lint AGENTS.md for stale paths | Complementary (staleness detection vs. behavioral quality) |

**Key gap in the ecosystem:** Nobody validates agent definition *quality*. Existing linters validate file structure, path existence, syntax. behavioral-lint validates whether the content follows behavioral engineering principles. This is an unoccupied niche.

### The AGENTS.md Factor

AGENTS.md (60k+ projects, now under Linux Foundation/AAIF stewardship) is the emerging standard for project-level AI agent context. It defines *what the project needs* (build steps, conventions, security rules). behavioral-agents defines *how the agent behaves* (disposition, constraints, fail triggers).

**These are complementary layers, not competing standards.** AGENTS.md says "here's the project context." A behavioral agent file says "here's how this specific role operates within that context."

**Strategic positioning:** behavioral-agents should reference AGENTS.md compatibility explicitly. "Your AGENTS.md defines the project. Your behavioral agents define the team."

### The TDAD Collaboration Opportunity

[Test-Driven AI Agent Definition (TDAD)](https://arxiv.org/abs/2603.08806) (March 9, 2026) takes behavioral specifications and compiles them into executable test suites. Their input is "a product spec in YAML format with tools, policies, and decision tree" -- structurally similar to behavioral-agent frontmatter.

**Potential integration:** behavioral-agent definitions as TDAD input specs. The behavioral schema provides the *what*; TDAD provides the *verification*. This would make behavioral-agents the first agent definition format with automated behavioral testing.

### Anthropic's Research as Tailwind

Two Anthropic publications directly support the behavioral-agents thesis:

1. **[Persona Selection Model](https://alignment.anthropic.com/2026/psm/)** (Feb 2026): "Through experiments involving 275 distinct roleplaying personas, researchers discovered that each persona corresponds to unique neural activation patterns within the model." Identity prompts activate unpredictable persona clouds. This is the scientific foundation for "why identity prompts don't work"

2. **[Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)**: Recommends "the right altitude" -- "specific enough to guide behavior effectively, yet flexible enough to provide strong heuristics." This is exactly what behavioral disposition + constraints achieve. Warns against "over-specificity" (hardcoding complex brittle logic) -- validates our "minimal by default" philosophy

These are citable authority sources. Every content piece should reference them.

---

## 8. Synthesis: The Launch Plan

### Phase 1: Foundation (Pre-launch, 1-2 sessions)

| Artifact | Purpose |
|----------|---------|
| behavioral-agents GitHub repo | Base catalog (20 agents) + schema + README |
| behavioral-lint npm package | `npx behavioral-lint check`, `init`, `migrate` |
| behavioral-agents.dev | Spec site with hero, spec, examples, research |
| Blog post: "Your Agent Prompts Are Built on a Lie" | Pre-launch authority piece on spec site |

### Phase 2: Launch (Week 1)

| Day | Channel | Content |
|-----|---------|---------|
| Tue | Reddit (r/ClaudeCode) | Journey post: "I analyzed 112 agent definitions and found they all make the same mistake" |
| Tue | X/Twitter | Thread: "Why identity prompts fail" + paper citations |
| Wed | Hacker News | Show HN: behavioral-lint |
| Thu | Reddit (r/ClaudeAI, r/CursorAI) | Cross-posts with subreddit-specific framing |

### Phase 3: Sustain (Weeks 2-8)

| Week | Content |
|------|---------|
| 2 | DEV.to tutorial: "Migrate your agency-agents to behavioral format" |
| 3 | YouTube demo video (60-90 sec) |
| 4 | Second Reddit post: showcase a specific agent (Code Reviewer) with before/after |
| 5-6 | Blog series: "Behavioral agent patterns" (one per week) |
| 7-8 | First community contributions, catalog expansion announcements |

### The Adoption Flywheel (Modeled on conventional-commits)

```
Spec (behavioral-agents.dev)
  --> defines the standard
    --> Enforcer (behavioral-lint)
      --> makes compliance frictionless
        --> Catalog (base agents)
          --> provides immediate value
            --> Migration tool (npx behavioral-lint migrate)
              --> lowers switching cost from agency-agents
                --> Community contributions
                  --> more agents, more orgs, more proof
                    --> back to Spec (adoption validates the standard)
```

**The conventional-commits lesson:** The spec alone got moderate traction (8.6k stars). The enforcement tool (commitlint, 18.4k stars) drove real adoption. The automation payoff (semantic-release) made it self-sustaining. For behavioral-agents: the **migrate** command is the semantic-release equivalent -- it's the payoff that makes adoption self-sustaining.

---

## Key Discoveries

- **agency-agents grew almost entirely in March 2026:** 25,865 of its 30,720 stars came in the last 30 days. The 7-day spike (21,367 stars, 390% increase) was driven by Greg Isenberg's tweet + Medium articles. The window for a counter-narrative ("identity prompts don't work, here's what does") is open RIGHT NOW
- **The "convention + enforcer" pattern is the proven adoption flywheel.** Spec alone = moderate. Spec + lint tool + automation = self-sustaining. Every successful standard (conventional-commits, ESLint, Prettier) followed this pattern
- **behavioral-agents occupies an empty niche in the ecosystem.** AGENTS.md does project context. agency-agents does identity personas. awesome-cursorrules does IDE rules. Nobody does research-backed behavioral agent definitions with automated quality validation
- **The migrate command is the killer feature.** Not the catalog, not the lint rules. The ability to `npx behavioral-lint migrate agency-agent.md` and instantly convert an identity prompt to a behavioral definition is the 30-second value proposition
- **Reddit is THE channel for agent tools.** agency-agents was born on Reddit, amplified by influencers. HN is secondary but reaches a higher-quality (more opinionated, more technical) audience. Both are needed
- **AGENTS.md under AAIF/Linux Foundation is the infrastructure layer.** behavioral-agents should position as content that runs ON the infrastructure, not competing with it. "Your AGENTS.md defines the project. Your behavioral agents define the team."
- **Anthropic's own research (PSM + context engineering) is the strongest authority source.** Every piece of content should cite these. They validate the entire premise
- **TDAD (March 2026 paper) enables automated behavioral testing.** If behavioral-agent definitions can be compiled into TDAD test suites, this is the first agent format with verifiable behavioral contracts

---

## Sources (Full URLs)

### Launch Precedents
- [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/)
- [Conventional Commits GitHub repo](https://github.com/conventional-commits/conventionalcommits.org)
- [Conventional Commits HN thread (157 pts, 95 comments)](https://news.ycombinator.com/item?id=21125669)
- [commitlint GitHub](https://github.com/conventional-changelog/commitlint)
- [ESLint inception (Zakas blog)](https://humanwhocodes.com/blog/2018/02/the-inception-of-eslint/)
- [ESLint reflections on success (Zakas blog)](https://humanwhocodes.com/blog/2016/02/reflections-on-eslints-success/)
- [ESLint Wikipedia](https://en.wikipedia.org/wiki/ESLint)
- [Birth of Prettier (Vjeux blog)](https://blog.vjeux.com/2025/javascript/birth-of-prettier.html)
- [A Prettier JavaScript Formatter (James Long blog -- the launch post)](https://archive.jlongster.com/A-Prettier-Formatter)
- [Prettier 1.0 (James Long blog)](https://archive.jlongster.com/prettier-1.0)
- [Prettier 1.0 HN thread (270 pts, 76 comments)](https://news.ycombinator.com/item?id=14108718)
- [Prettier case study (humphd.github.io)](https://humphd.github.io/pretty-effective/)
- [Vale.sh](https://vale.sh)
- [Vale GitHub](https://github.com/errata-ai/vale)
- [Biome announcement](https://biomejs.dev/blog/announcing-biome/)
- [Biome getting started](https://biomejs.dev/guides/getting-started/)
- [Biome roadmap 2024](https://biomejs.dev/blog/roadmap-2024/)

### agency-agents (Competitor)
- [agency-agents GitHub](https://github.com/msitarzewski/agency-agents/)
- [agency-agents SourcePulse analytics](https://www.sourcepulse.org/projects/16866012)
- [Greg Isenberg tweet (10k stars in 7 days)](https://x.com/gregisenberg/status/2030680849486668229)
- [Greg Isenberg LinkedIn post](https://www.linkedin.com/posts/gisenberg_i-found-a-github-repo-that-lets-you-spin-activity-7436773518337269760-SABV)
- [Medium: "61 Agents. 10K Stars in 7 Days."](https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d)
- [YUV.AI review](https://yuv.ai/blog/agency-agents)

### Ecosystem
- [awesome-cursorrules (38.4k stars)](https://github.com/PatrickJS/awesome-cursorrules)
- [awesome-agent-skills (10.9k stars)](https://github.com/VoltAgent/awesome-agent-skills)
- [agent-rules (5.6k stars)](https://github.com/steipete/agent-rules)
- [AGENTS.md spec site](https://agents.md/)
- [AAIF (Linux Foundation)](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [agnix (agent file linter)](https://github.com/agent-sh/agnix)
- [agents-lint (AGENTS.md linter)](https://github.com/giacomo/agents-lint)
- [agent-skill-creator (cross-tool skills)](https://github.com/FrancyJGLisboa/agent-skill-creator)
- [rule-porter (cross-tool rule converter)](https://dev.to/nedcodes/rule-porter-convert-cursor-rules-to-claudemd-agentsmd-and-copilot-4hjc)
- [skillport (cross-tool skill sync)](https://github.com/gotalab/skillport)

### Research & Authority
- [Zheng et al. (EMNLP 2024) -- personas don't improve LLM performance](https://aclanthology.org/2024.findings-emnlp.888.pdf)
- [Anthropic Persona Selection Model (Feb 2026)](https://alignment.anthropic.com/2026/psm/)
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [TDAD: Test-Driven AI Agent Definition (Mar 2026)](https://arxiv.org/abs/2603.08806)
- [Agent Behavioral Contracts (ABC)](https://arxiv.org/html/2602.22302)
- [Anthropic on persona drift + activation capping](https://x.com/AnthropicAI/status/2013356803015233735)

### Launch Strategy Guides
- [How to launch a dev tool on HN](https://www.markepear.dev/blog/dev-tool-hacker-news-launch)
- [How to crush your HN launch](https://dev.to/dfarrell/how-to-crush-your-hacker-news-launch-10jk)
- [Reddit product launch strategy (2025 playbook)](https://www.reddit-radar-marketing.com/blog/reddit-product-launch-strategy)
- [HBR: First Mover vs. Category Creator](https://hbr.org/2019/11/the-difference-between-a-first-mover-and-a-category-creator)
- [LaunchNotes: How to create and launch a new software category](https://www.launchnotes.com/blog/how-to-create-and-launch-a-new-software-category-the-ultimate-guide)
- [PostHog content strategy](https://posthog.com/blog/running-content-at-posthog)
- [How to grow to 10K GitHub stars](https://markaicode.com/grow-github-repository-stars/)
- [HackerNoon: Ultimate playbook for GitHub stars](https://hackernoon.com/the-ultimate-playbook-for-getting-more-github-stars)
- [Dev tool marketing guide](https://www.devmarketingguide.com/)
- [Draft.dev: developer content strategies](https://draft.dev/learn/developer-content-strategies-that-work-and-scale)

### Badge & README Design
- [README badges best practices](https://daily.dev/blog/readme-badges-github-best-practices)
- [CMU badges study (empirical)](https://cmustrudel.github.io/papers/icse18badges.pdf)
- [DEV.to badges collection](https://dev.to/envoy1084/150-badges-for-github-pnk)

---

## Raw Links (Every URL Encountered)

```
https://www.conventionalcommits.org/en/v1.0.0/
https://github.com/conventional-commits/conventionalcommits.org
https://news.ycombinator.com/item?id=21125669
https://github.com/conventional-changelog/commitlint
https://github.com/conventionalcommit/commitlint
https://en.wikipedia.org/wiki/Conventional_Commits_Specification
https://humanwhocodes.com/blog/2018/02/the-inception-of-eslint/
https://humanwhocodes.com/blog/2016/02/reflections-on-eslints-success/
https://en.wikipedia.org/wiki/ESLint
https://blog.vjeux.com/2025/javascript/birth-of-prettier.html
https://archive.jlongster.com/A-Prettier-Formatter
https://archive.jlongster.com/prettier-1.0
https://news.ycombinator.com/item?id=14108718
https://humphd.github.io/pretty-effective/
https://vale.sh
https://github.com/errata-ai/vale
https://biomejs.dev/blog/announcing-biome/
https://biomejs.dev/guides/getting-started/
https://biomejs.dev/blog/roadmap-2024/
https://github.com/msitarzewski/agency-agents/
https://www.sourcepulse.org/projects/16866012
https://x.com/gregisenberg/status/2030680849486668229
https://www.linkedin.com/posts/gisenberg_i-found-a-github-repo-that-lets-you-spin-activity-7436773518337269760-SABV
https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d
https://yuv.ai/blog/agency-agents
https://github.com/PatrickJS/awesome-cursorrules
https://github.com/VoltAgent/awesome-agent-skills
https://github.com/steipete/agent-rules
https://agents.md/
https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
https://openai.com/index/agentic-ai-foundation/
https://aaif.io/
https://github.com/agent-sh/agnix
https://github.com/giacomo/agents-lint
https://github.com/FrancyJGLisboa/agent-skill-creator
https://github.com/gotalab/skillport
https://github.com/fALECX/shareskills
https://dev.to/nedcodes/rule-porter-convert-cursor-rules-to-claudemd-agentsmd-and-copilot-4hjc
https://aclanthology.org/2024.findings-emnlp.888.pdf
https://alignment.anthropic.com/2026/psm/
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
https://arxiv.org/abs/2603.08806
https://arxiv.org/html/2603.08806
https://arxiv.org/html/2602.22302
https://x.com/AnthropicAI/status/2013356803015233735
https://x.com/AnthropicAI/status/2026062454405415369
https://www.markepear.dev/blog/dev-tool-hacker-news-launch
https://dev.to/dfarrell/how-to-crush-your-hacker-news-launch-10jk
https://www.reddit-radar-marketing.com/blog/reddit-product-launch-strategy
https://hbr.org/2019/11/the-difference-between-a-first-mover-and-a-category-creator
https://www.launchnotes.com/blog/how-to-create-and-launch-a-new-software-category-the-ultimate-guide
https://posthog.com/blog/running-content-at-posthog
https://markaicode.com/grow-github-repository-stars/
https://hackernoon.com/the-ultimate-playbook-for-getting-more-github-stars
https://blog.cwrichardkim.com/how-to-get-hundreds-of-stars-on-your-github-project-345b065e20a2
https://www.devmarketingguide.com/
https://draft.dev/learn/developer-content-strategies-that-work-and-scale
https://daily.dev/blog/readme-badges-github-best-practices
https://cmustrudel.github.io/papers/icse18badges.pdf
https://dev.to/envoy1084/150-badges-for-github-pnk
https://github.com/semver/semver.org
https://engineering.contentsquare.com/2023/using-vale-to-help-engineers-become-better-writers/
https://blog.logrocket.com/biome-adoption-guide/
https://www.aitooldiscovery.com/guides/best-ai-agents-reddit
https://www.geeky-gadgets.com/emotional-prompts-model-drift/
https://www.eweek.com/news/ai-personality-crisis/
https://www.anthropic.com/research/persona-selection-model
https://medium.com/@baristaGeek/lessons-launching-a-developer-tool-on-hacker-news-vs-product-hunt-and-other-channels-27be8784338b
https://github.com/minimaxir/hacker-news-undocumented
https://news.ycombinator.com/yli.html
https://news.ycombinator.com/item?id=29919223
https://news.ycombinator.com/item?id=29924976
https://news.ycombinator.com/item?id=45420887
https://news.ycombinator.com/item?id=45482198
https://github.com/DavidAnson/markdownlint
https://www.npmjs.com/package/markdownlint-cli2
https://github.com/biomejs/biome
https://www.freshcodeit.com/blog/startup-category-creation
https://tactyqal.com/blog/what-is-category-creation/
https://theproductmanager.com/topics/create-and-dominate-how-to-tap-into-new-markets-with-category-creation
https://dev.to/azure/using-npx-and-npm-scripts-to-reduce-the-burden-of-developer-tools-57f9
https://formulae.brew.sh/formula/vale
https://github.com/IgorOffline/msitarzewski-agency-agents
https://github.com/hesreallyhim/awesome-claude-code
https://github.com/VoltAgent/awesome-claude-code-subagents
https://github.com/sickn33/antigravity-awesome-skills
https://github.com/jqueryscript/awesome-claude-code
https://github.com/rahulvrane/awesome-claude-agents
https://github.com/DVC2/cursor_prompts
https://github.com/instructa/ai-prompts
https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools
https://semantic-release.gitbook.io/
https://github.com/semantic-release/semantic-release
https://github.com/lint-staged/lint-staged
https://www.producthunt.com/products/skillkit-2
https://www.npmjs.com/package/@agentskillkit/agent-skills
https://github.com/github/spec-kit
https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
https://tessl.io/blog/spec-driven-development-10-things-you-need-to-know-about-specs/
https://agentfactory.panaversity.org/docs/General-Agents-Foundations/spec-driven-development
https://www.augmentcode.com/guides/what-is-spec-driven-development
https://en.wikipedia.org/wiki/Spec-driven_development
```

---

## Open Questions That Emerged

1. **AAIF membership or compatibility statement?** AGENTS.md is now under Linux Foundation/AAIF governance. Should behavioral-agents seek formal compatibility/endorsement, or stay independent?
2. **TDAD integration feasibility.** Can behavioral-agent frontmatter be compiled into TDAD test suites? Worth a spike session.
3. **Cross-tool install scripts.** agency-agents ships scripts for 7 tools. behavioral-agents needs matching or better portability. What's the install story for each tool?
4. **Greg Isenberg / influencer outreach.** He amplified agency-agents to 10k stars in a week. Should Sherpa reach out? Timing matters -- his audience already knows the agent-definition space.
5. **Domain acquisition.** Is behavioral-agents.dev available? What about behavioral.sh?
6. **The "migrate" command scope.** Can it handle all 112 agency-agents files automatically, or does each need manual review? If automatic, the migration story is much stronger.
7. **Competitive response risk.** agency-agents has momentum (21k stars in 7 days). If they add behavioral validation, the window closes. How fast can behavioral-lint ship?
