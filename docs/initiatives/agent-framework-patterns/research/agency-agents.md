# Agency-Agents Repository Audit

Full audit of [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — a community-driven collection of AI agent personality files for Claude Code, Cursor, Aider, Windsurf, Gemini CLI, and other tools.

**Audit date:** 2026-03-10
**Repo scale:** 147 markdown files, ~112 agent specs across 11 divisions, plus strategy docs, integration scripts, examples, and CI/CD
**License:** MIT
**Maturity:** Active community project with contributions, linting CI, translations (zh-CN), and multi-tool install scripts. Born from a Reddit thread. Not a production orchestration framework.

---

## 1. Architecture

### Repository Structure

```
agency-agents/
  design/              8 agents
  engineering/        15 agents (including embedded firmware, threat detection, WeChat mini-programs)
  game-development/   18 agents (cross-engine + Unity + Unreal + Godot + Roblox)
  marketing/          17 agents (including 7 China-market specialists)
  paid-media/          7 agents
  product/             4 agents
  project-management/  6 agents
  testing/             8 agents
  support/             6 agents
  spatial-computing/   6 agents
  specialized/        15 agents (including blockchain, identity graph, data pipeline agents)
  strategy/           NEXUS orchestration doctrine (1 master + 7 phase playbooks + 4 runbooks + coordination docs)
  examples/           4 workflow examples (startup MVP, landing page, memory-powered, spatial discovery)
  integrations/       Conversion output for 8 tools + MCP memory extension
  scripts/            convert.sh, install.sh, lint-agents.sh
```

### Key Design Decisions

1. **Flat markdown files, not code.** Each agent is a single `.md` file with YAML frontmatter. No runtime, no framework, no orchestration engine. The "framework" is a collection of system prompts.

2. **Division-based organization.** Agents are grouped by professional domain (engineering, design, marketing, etc.), not by function or tier. This mirrors an agency staffing model.

3. **Persona-first design.** Every agent opens with identity, personality, and memory sections before getting to what it does. The personality is the differentiator, not the tooling.

4. **Cross-tool portability via `convert.sh`.** A 480-line bash script reads agent markdown, strips frontmatter, and reformats for Cursor (`.mdc`), Aider (`CONVENTIONS.md`), Windsurf (`.windsurfrules`), Gemini CLI (skills), Antigravity (skills), OpenCode (agents), and OpenClaw (SOUL/AGENTS/IDENTITY split). Smart: section headers are used as semantic markers to split persona vs. operations content.

5. **Strategy layer is separate from agents.** NEXUS (the orchestration doctrine) lives in `strategy/` and references agents by name. Agents don't know about NEXUS. This separation means you can use individual agents without buying into the full pipeline.

---

## 2. Pattern Catalog

### 2.1 Role Anatomy (Agent File Structure)

**What they do:** Every agent file follows a consistent template defined in `CONTRIBUTING.md`:

```yaml
---
name: Frontend Developer
description: Expert frontend developer specializing in...
color: cyan
emoji: 🖥️
vibe: Builds responsive, accessible web apps with pixel-perfect precision.
services:          # optional — external API dependencies
  - name: Service
    url: https://...
    tier: free
---
```

Body sections (in order):
1. **Identity & Memory** — role, personality traits, memory claim, experience claim
2. **Core Mission** — 3-5 primary responsibilities with a "default requirement"
3. **Critical Rules** — hard constraints and domain-specific guardrails
4. **Technical Deliverables** — code examples, templates, frameworks
5. **Workflow Process** — 3-4 step process (discovery, planning, execution, review)
6. **Communication Style** — 3-4 example phrases showing how the agent talks
7. **Learning & Memory** — what patterns the agent claims to learn from
8. **Success Metrics** — 4-6 measurable outcomes
9. **Advanced Capabilities** — stretch capabilities beyond core

**What Sherpa does:** YAML frontmatter with `role`, `display-name`, `category`, `model-tier`, `patterns`, `structure`, `context-packages`, `rules`, `tool-permissions`, `escalation`. Body is a 1-paragraph role description. No personality, no workflow, no metrics, no code examples.

**Delta:** Their spec is 5-10x longer per agent and designed to be injected as a system prompt. WavePoint's spec is a metadata record that tells the dispatcher which CLAUDE.md files and rules to load. Fundamentally different approaches: theirs embeds everything in the agent file; ours composes context from the existing codebase.

**Recommendation: SKIP.** Sherpa's compositional approach (role metadata + CLAUDE.md context packages + `.claude/rules/`) is architecturally superior for a monorepo. Embedding all context in each agent file creates massive duplication and staleness risk. However, two fields are worth adopting:

- `vibe:` — A one-line personality hook. Useful for the Studio UI agent selector. Example: `"Defaults to NEEDS WORK — requires overwhelming proof for production readiness."` This is pure UI sugar but aids human dispatch decisions.
- Explicit escalation paths are already in WavePoint's format and are the more important concept.

### 2.2 Persona Design

**What they do:** Every agent opens with a persona block that establishes identity, personality traits, memory, and experience. The best ones create a distinct character:

**Reality Checker (best example):**
> - **Personality**: Skeptical, thorough, evidence-obsessed, fantasy-immune
> - **Memory**: You remember previous integration failures and patterns of premature approvals
> - **Experience**: You've seen too many "A+ certifications" for basic websites that weren't ready

**Blockchain Security Auditor (best example):**
> - **Personality**: Paranoid, methodical, adversarial — you think like an attacker with a $100M flash loan and unlimited patience
> - **Memory**: You carry a mental database of every major DeFi exploit since The DAO hack in 2016. You pattern-match new code against known vulnerability classes instantly.

**Agentic Identity & Trust Architect (best example):**
> - **Memory**: You remember trust architecture failures — the agent that forged a delegation, the audit trail that got silently modified, the credential that never expired. You design against these.

These are effective because they establish a skeptical/adversarial default posture — the model defaults to finding problems rather than rubber-stamping.

**What Sherpa does:** No persona fields. Roles are described functionally in third person. The Judge role (`docs/agents/roles/judge.md`) has the closest thing to a persona through its "default to NEEDS WORK" instruction, but it's operational, not characterful.

**Delta:** Persona design can meaningfully shift model behavior when injected as a system prompt. The "default to skepticism" pattern is the highest-value version. A "personality: playful, creative" trait adds color but doesn't materially change output quality.

**Recommendation: ADAPT (selectively).** Add a `disposition:` field to WavePoint role specs for roles where a default posture matters:
- Judge: `disposition: skeptical — defaults to NEEDS WORK`
- Code Reviewer: `disposition: adversarial — assumes bugs exist until proven otherwise`
- Architect: `disposition: conservative — prefers proven patterns over novelty`

Skip personality/voice traits. Sherpa's voice comes from `docs/ux/voice-and-tone.md` and the Modern Mystic design system rules, which are loaded contextually. Duplicating voice guidance per agent would create drift.

### 2.3 Workflow Definitions

**What they do:** Each agent includes a 3-4 step workflow process, typically:
1. Discovery/Analysis
2. Planning/Strategy
3. Execution/Implementation
4. Review/Optimization

These range from generic (most agents) to highly specific. The best examples include actual shell commands and decision trees.

**Agents Orchestrator workflow (detailed example):**
```
Phase 1: PM → ArchitectUX → [Dev ↔ QA Loop] → Integration
Phase 3 decision logic:
  IF QA = PASS: Move to Task 2
  IF QA = FAIL (attempt < 3): Loop back to developer
  IF QA = FAIL (attempt = 3): Escalate
```

**Evidence Collector workflow (operational example):**
```bash
# 1. Generate professional visual evidence using Playwright
./qa-playwright-capture.sh http://localhost:8000 public/qa-screenshots
# 2. Check what's actually built
ls -la resources/views/ || ls -la *.html
# 3. Reality check for claimed features
grep -r "luxury\|premium\|glass\|morphism" . --include="*.html" --include="*.css"
```

**What Sherpa does:** Workflows are defined at the pipeline level (`docs/tasks/README.md`, Planner/Worker/Judge pattern), not per role. Individual roles describe what they do, not how they do it step by step.

**Delta:** Their per-agent workflows are largely aspirational — the agents don't actually execute shell commands autonomously. The Orchestrator's Dev-QA loop is the same pattern as Sherpa's Planner/Worker/Judge pipeline. The real difference is that Sherpa's pipeline is implemented (task board, worker scripts, auto-judge), while theirs is documented-but-manual.

**Recommendation: SKIP for per-agent workflows.** They add length without material value when the agent is an LLM — the model adapts its process to the task. Sherpa's pipeline-level orchestration (Planner/Worker/Judge) already handles the coordination that matters.

The one adoptable idea: the **Dev-QA retry loop with max 3 attempts** is a pattern Sherpa could formalize. Currently the Judge role provides a verdict, but there's no explicit retry-count escalation. Adding `max-retries: 3` to task frontmatter and having the Judge track attempt count would be a small, concrete improvement.

### 2.4 Success Metrics

**What they do:** Every agent includes 4-6 measurable success criteria. Examples:

**Frontend Developer:**
- Page load times under 3 seconds on 3G networks
- Lighthouse scores consistently exceed 90 for Performance and Accessibility
- Component reusability rate exceeds 80%
- Zero console errors in production

**Reddit Community Builder:**
- Community Karma: 10,000+ combined karma across relevant accounts
- Post Engagement: 85%+ upvote ratio on educational content
- Comment Quality: Average 5+ upvotes per helpful comment
- Trusted contributor status in 5+ relevant subreddits

**Executive Summary Generator:**
- Summary enables executive decision in < 3 minutes reading time
- Word count stays within 325-475 range
- Zero assumptions made beyond provided data

**What Sherpa does:** No per-role success metrics. Quality is evaluated by the Judge role using task-specific acceptance criteria from the task frontmatter.

**Delta:** Per-role success metrics are aspirational benchmarks (the LLM isn't actually measuring Lighthouse scores), but they serve as built-in acceptance criteria that bias the model toward specific quality standards without needing them in every task prompt.

**Recommendation: ADAPT.** Not per-role metrics, but a `quality-bar:` field in role specs containing 2-3 concrete standards the Judge should evaluate against when reviewing that role's output. Example for Engineer: `quality-bar: ["all new functions have TypeScript types", "barrel exports updated", "no console.log in committed code"]`. This feeds the Judge without embedding it in every task description.

### 2.5 Division Organization

**What they do:** 11 divisions organized by professional domain:
- Engineering (15 agents)
- Design (8)
- Marketing (17 — including 7 China-market specialists)
- Paid Media (7)
- Product (4)
- Project Management (6)
- Testing (8)
- Support (6)
- Spatial Computing (6)
- Specialized (15)
- Game Development (18 — with sub-divisions per engine)

**What Sherpa does:** 13 roles in a flat structure with `category:` field (engineering, product, design, content, qa). No divisions.

**Delta:** Their division model is built for an agency selling services across many client types — most divisions (paid media, game development, China marketing) are irrelevant to WavePoint. The flat structure with categories is sufficient for 13 roles.

**Recommendation: SKIP.** Sherpa's flat structure with `category:` is correct for the current scale. Division hierarchy adds complexity without value until you have 30+ roles.

### 2.6 Cross-Tool Portability

**What they do:** `scripts/convert.sh` (480 lines) reads agent markdown and outputs tool-specific formats:

| Tool | Format | Key Transformation |
|------|--------|--------------------|
| Cursor | `.mdc` with `description`, `globs`, `alwaysApply` frontmatter | Strips agent frontmatter, adds Cursor-specific fields |
| Aider | Single `CONVENTIONS.md` | Concatenates all agents into one file |
| Windsurf | Single `.windsurfrules` | Same concatenation, different separators |
| Gemini CLI | Extension manifest + `SKILL.md` per agent | Minimal frontmatter (name + description) |
| Antigravity | `SKILL.md` per agent in skill directories | Adds `risk: low`, `source: community`, date |
| OpenCode | `.md` with `mode: subagent`, color as hex | Named color-to-hex resolution |
| OpenClaw | Split into `SOUL.md` + `AGENTS.md` + `IDENTITY.md` | Section headers classified as persona vs. operations |

`scripts/install.sh` (519 lines) has an interactive TUI with checkbox selection, auto-detects installed tools, and copies converted files to the right locations.

`scripts/lint-agents.sh` validates frontmatter fields and recommended sections, runs in CI via GitHub Actions.

**What Sherpa does:** Agent roles are used exclusively by Claude Code via `scripts/dispatch.sh`, which routes by model-tier. No cross-tool portability.

**Delta:** This is the most polished engineering in the repo. The `convert.sh` → `install.sh` pipeline is well-designed, handles edge cases (color resolution, section-based content splitting), and supports 8+ tools. However, Sherpa is a single-tool shop (Claude Code) and the agent spec format is fundamentally different (metadata + context packages vs. self-contained prompt).

**Recommendation: SKIP for now.** Cross-tool portability is a concern for tool-agnostic open-source projects, not for a monorepo with a specific agent framework. If WavePoint ever publishes its agent specs as open-source, the `convert.sh` approach is a good reference.

### 2.7 Orchestration Strategy (NEXUS)

**What they do:** NEXUS is a ~2,000-line coordination doctrine in `strategy/` comprising:

- **Master strategy** (`nexus-strategy.md`): 7 phases from discovery to operations, agent coordination matrix, handoff protocols, quality gates, risk management
- **Phase playbooks** (7 files): Step-by-step activation sequences per phase with agent prompts, timelines, and gate criteria
- **Handoff templates** (7 templates): Standard handoff, QA pass/fail, escalation report, phase gate, sprint handoff, incident handoff
- **Activation prompts**: Ready-to-paste prompt templates for every agent in every pipeline role
- **Runbooks** (4): Startup MVP, enterprise feature, marketing campaign, incident response
- **Three deployment modes**: NEXUS-Full (all agents, 12-24 weeks), NEXUS-Sprint (15-25 agents, 2-6 weeks), NEXUS-Micro (5-10 agents, 1-5 days)

Key NEXUS concepts:
- **Dev-QA loop**: Build → test → pass/fail → retry (max 3) → escalate. "Catches 95% of defects before integration."
- **Quality gates between phases**: No advancement without evidence-based approval.
- **Handoff context continuity**: Structured documents carry context between agents. "Multi-agent projects fail at handoff boundaries 73% of the time without structured coordination."
- **Reality Checker as final authority**: Defaults to NEEDS WORK. No A+ ratings for first implementations.
- **Parallel execution**: 4 simultaneous workstreams "compress timelines by 40-60%."

**What Sherpa does:** Planner/Worker/Judge pipeline with task board, worker scripts, auto-judge. Worktree isolation per initiative. Initiative proposals and integration review. Event logging.

**Delta:** NEXUS is a manual-copy-paste orchestration protocol, not an automated system. It's documentation for how a human should prompt a sequence of agents. Sherpa's pipeline is partially automated (background workers, task scanner, auto-judge). NEXUS has richer inter-agent communication templates (handoff documents) that Sherpa doesn't formalize.

**Recommendation: ADAPT (handoff templates only).** The handoff template concept — a structured document that carries context between agents — is the highest-value idea in NEXUS. Sherpa tasks have frontmatter but no standardized "context from previous phase" section. Adding a `context:` field to task frontmatter (or a `## Context` section in the task body) that the planner fills when dispatching would improve worker performance on multi-step features.

The QA pass/fail template with attempt tracking is also worth formalizing. Currently the Judge writes a verdict to the task file, but there's no structured format for "here's what failed, here's what to fix, this is attempt 2 of 3."

### 2.8 MCP Memory Integration

**What they do:** `integrations/mcp-memory/` provides a pattern for giving agents persistent memory across sessions using MCP:

```markdown
## Memory Integration

When you start a session:
- Recall relevant context from previous sessions

When you make key decisions or complete deliverables:
- Remember the decision with descriptive tags

When handing off to another agent:
- Remember deliverables tagged for the receiving agent

When something fails:
- Search for the last known-good state
- Use rollback to restore
```

They provide an enhanced Backend Architect example with these memory instructions added.

**What Sherpa does:** MEMORY.md for cross-session persistence. Event logging via ndjson. Session files in `docs/sessions/`.

**Delta:** Sherpa already has persistent memory (MEMORY.md) and session logs. The MCP memory pattern is interesting as a protocol but doesn't add capability WavePoint lacks. The "rollback to known-good state" concept is novel but requires an MCP server that Sherpa doesn't run.

**Recommendation: SKIP.** Sherpa's MEMORY.md + session logs + event logging already cover this space.

---

## 3. Quality Variation Analysis

Agents vary dramatically in quality. Three tiers are visible:

### Tier 1 — Battle-Tested (clearly evolved from real use)

These agents have specific, opinionated constraints and feel like they were written after hitting real failures:

- **Reality Checker** — The "default to NEEDS WORK" posture, automatic fail triggers, and anti-fantasy-reporting stance feel born from actual experience with LLMs rubber-stamping bad code.
- **Evidence Collector** — "Screenshots don't lie" philosophy, mandatory Playwright capture steps, specific test protocols for accordions/forms/mobile.
- **Agents Orchestrator** — Detailed decision logic, retry management, agent spawn commands.
- **Blockchain Security Auditor** — Genuine adversarial posture, specific exploit classes, tool recommendations (Slither, Mythril, Echidna).
- **Agentic Identity & Trust Architect** — Deeply technical, real cryptographic patterns, addresses actual multi-agent security problems.
- **Senior Project Manager** — Anti-scope-creep personality, "don't add luxury features" rule.
- **Executive Summary Generator** — Tight word limits, specific framework (SCQA), structured output format.

### Tier 2 — Professional but Generic

Competent descriptions of professional roles with reasonable code examples, but no distinctive personality or battle-tested constraints:

- **Frontend Developer** — Good React code example, standard web performance advice.
- **Backend Architect** — Good SQL/Express examples, standard architecture advice.
- **Sprint Prioritizer** — Comprehensive framework list but reads like a textbook.
- **Most marketing agents** — Domain-appropriate advice but interchangeable personality.
- **Most game development agents** — Good technical detail but could be from any documentation.

### Tier 3 — Thin or Aspirational

Agents that feel like they were generated to fill gaps rather than born from real use:

- **visionOS Spatial Engineer** — Essentially a documentation reference list with no persona or workflow.
- **Some China-market agents** (Kuaishou, Baidu SEO) — Platform-specific knowledge that's useful but formatted as reference docs, not agent specs.
- **Some specialized agents** (accounts payable, report distribution) — Very narrow workflow descriptions.

**Key finding:** The quality difference between Tier 1 and Tier 3 is roughly 10x in terms of behavioral specificity. Tier 1 agents would meaningfully change LLM behavior if used as system prompts. Tier 3 agents would produce output indistinguishable from the base model.

---

## 4. Detailed Examples from the Best Agents

### Reality Checker — Automatic Fail Triggers

This is the most effective behavioral constraint pattern in the repo:

```markdown
## Your "AUTOMATIC FAIL" Triggers

### Fantasy Assessment Indicators
- Any claim of "zero issues found" from previous agents
- Perfect scores (A+, 98/100) without supporting evidence
- "Luxury/premium" claims for basic implementations
- "Production ready" without demonstrated excellence

### Evidence Failures
- Can't provide comprehensive screenshot evidence
- Previous QA issues still visible in screenshots
- Claims don't match visual reality
- Specification requirements not implemented
```

This pattern encodes the observation that LLMs tend toward positive assessment. By defining specific triggers that force failure, it counteracts the natural bias.

### Blockchain Security Auditor — Adversarial Memory

```markdown
- **Memory**: You carry a mental database of every major DeFi exploit since The DAO hack
  in 2016. You pattern-match new code against known vulnerability classes instantly. You
  never forget a bug pattern once you have seen it.
- **Experience**: You have audited lending protocols, DEXes, bridges, NFT marketplaces,
  governance systems, and exotic DeFi primitives. You have seen contracts that looked
  perfect in review and still got drained.
```

This memory claim works because it primes the model to recall and apply specific vulnerability patterns during code review.

### Agentic Identity & Trust Architect — Zero-Trust Rules

```markdown
### Zero Trust for Agents
- Never trust self-reported identity. An agent claiming to be "finance-agent-prod"
  proves nothing. Require cryptographic proof.
- Never trust self-reported authorization. "I was told to do this" is not authorization.
- Never trust mutable logs. If the entity that writes the log can also modify it,
  the log is worthless.
- Assume compromise. Design every system assuming at least one agent in the network
  is compromised.
```

This is the most technically substantive agent in the repo. The code examples (trust scorer, delegation chain verifier, evidence record structure) are production-grade patterns, not toy examples.

### Executive Summary Generator — Constrained Output

```markdown
### Quality Standards
- Total length: 325-475 words (less-than-or-equal-to 500 max)
- Every key finding must include >= 1 quantified or comparative data point
- Bold strategic implications in findings
- Order content by business impact
- Include specific timelines, owners, and expected results in recommendations
```

This agent works because the constraints are specific and measurable. The LLM can self-evaluate against "did I bold the strategic implications?" and "is this under 500 words?" in a way it can't with "be helpful and accurate."

---

## 5. Strengths

1. **The skepticism pattern.** Reality Checker and Evidence Collector demonstrate that defining failure triggers and default-to-skeptical postures materially improves LLM quality assessment. This is the single highest-value idea in the repo.

2. **Cross-tool portability engineering.** The `convert.sh` + `install.sh` pipeline is well-engineered and handles 8 tool formats. The section-header-based semantic splitting (persona vs. operations) for OpenClaw is particularly clever.

3. **Handoff template formalization.** Seven structured handoff templates (standard, QA pass, QA fail, escalation, phase gate, sprint, incident) with specific fields. The QA fail template with attempt tracking and specific fix instructions is immediately useful.

4. **Constrained output formats.** The Executive Summary Generator's word limits, required sections, and data-point requirements are effective prompt engineering that Sherpa could apply to any output-producing role.

5. **Vibe lines.** The one-line `vibe:` field in frontmatter is a low-cost, high-value addition for human agent selection UIs. Examples: "Defaults to NEEDS WORK," "Screenshot-obsessed QA who won't approve anything without visual proof," "The conductor who runs the entire dev pipeline from spec to ship."

---

## 6. Over-Engineering (What WavePoint Doesn't Need)

1. **112 agents across 11 divisions.** Sherpa has 13 roles. The agency model (paid media, game development, China marketing, support responder) is designed for a consulting firm serving diverse clients, not a solo-dev monorepo. Most of these divisions are irrelevant.

2. **Per-agent workflow processes.** 3-4 step workflows repeated across 112 agents add length without differentiation. When the orchestration is at the pipeline level (which Sherpa already has), per-agent workflows are redundant.

3. **"Learning & Memory" sections.** Every agent claims to "remember successful patterns" and "learn from previous approaches." This is aspirational — LLMs don't actually learn across sessions from these instructions. WavePoint solves this with MEMORY.md and session logs.

4. **NEXUS deployment modes.** NEXUS-Full (12-24 weeks, all agents) is a coordination fantasy. No current tool can actually orchestrate 30+ LLM agents across 7 phases over 24 weeks. Sherpa's task-by-task dispatch is more realistic.

5. **Phase playbooks for 7 phases.** The build phase playbook alone is excellent; the discovery, strategy, and launch phases are generic enough to be unhelpful. WavePoint's initiative/proposal/plan lifecycle handles this better.

6. **Agent personality/voice traits.** "Playful, creative, joy-focused" (Whimsy Injector) or "Detail-oriented, organized, client-focused" (Senior PM) don't meaningfully change LLM behavior. The traits that work are behavioral constraints ("default to skepticism," "never trust self-reported identity"), not personality descriptors.

---

## 7. Gaps (What's Missing from Their System)

1. **No context composition.** Agents are self-contained prompts. There's no equivalent of WavePoint's `context-packages:` that loads project-specific CLAUDE.md files. Every agent must carry all relevant knowledge in its own file, leading to generic advice instead of codebase-aware guidance.

2. **No model tier routing.** All agents are treated identically. There's no `model-tier:` to route expensive tasks to capable models and cheap tasks to fast models. WavePoint's high/medium/low tier system is more cost-efficient.

3. **No tool permissions.** Agents don't specify what they're allowed to do. WavePoint's `tool-permissions:` (read, write-code, write-docs, deploy) enables least-privilege dispatch.

4. **No escalation graph.** Agents don't know who to escalate to. WavePoint's `escalation:` field ("architectural decisions -> architect") creates a directed graph of expertise routing.

5. **No actual orchestration runtime.** NEXUS is a documentation system for manual copy-paste workflows. There's no task scanner, no background workers, no auto-judge. Sherpa's pipeline is partially automated.

6. **No codebase awareness.** Agents give generic advice about "React/Vue/Angular" because they don't know what framework the project uses. WavePoint's context packages solve this — the Engineer loads `apps/web/CLAUDE.md` which specifies "Next.js 16, T3 Stack, Supabase."

7. **No cost controls.** Despite having an "Autonomous Optimization Architect" agent, the framework has no budget tracking, token limits, or cost-per-task estimation. WavePoint's `budget-usd:` in task frontmatter is more practical.

---

## 8. Key Takeaways (Ranked by Impact for Sherpa)

### HIGH IMPACT

**1. Default-to-skepticism pattern for Judge and Code Reviewer roles.**
The Reality Checker's "automatic fail triggers" and "default to NEEDS WORK" posture is the highest-value pattern in the repo. Apply to WavePoint's Judge role by adding explicit failure triggers to the role spec:
- Any claim of "no issues found"
- Perfect scores without evidence
- Claims that don't match actual file content
- Missing test coverage for new code

Estimated effort: 1 session (update `docs/agents/roles/judge.md` and `docs/agents/roles/code-reviewer.md`).

**2. Structured QA verdict templates with attempt tracking.**
The QA PASS/FAIL handoff templates with attempt counts, specific fix instructions, and escalation triggers formalize something WavePoint does informally. Add a `## Judge Verdict` template to the Judge role spec that workers and the auto-judge populate:
```markdown
## Verdict: FAIL (Attempt 2 of 3)
### Issues Found
1. [file:line] — [description] — [fix instruction]
### What Passed
- [criterion] — verified
### Next Action
- Worker: fix issues 1-2, re-submit
```

Estimated effort: 1 session.

**3. `disposition:` field for role specs.**
Not personality traits, but behavioral posture. A single field per role that tells the model how to default:
- Judge: `disposition: skeptical`
- Code Reviewer: `disposition: adversarial`
- Architect: `disposition: conservative`
- Engineer: `disposition: precise`
- Research Lead: `disposition: thorough`

Estimated effort: 0.5 sessions (add to frontmatter, update dispatch script if needed).

### MEDIUM IMPACT

**4. `vibe:` field for Studio UI.**
A one-line personality hook displayed in the Studio agent selector. Pure UX improvement for human dispatch decisions. Low cost, no runtime impact.

Estimated effort: 0.5 sessions.

**5. Task context section for multi-step features.**
Formalize a `## Context` section in task body that the Planner fills when dispatching: what was done in previous tasks, what files were modified, what the worker needs to know. This is the handoff template concept stripped to its essential form.

Estimated effort: 0.5 sessions (update task template in `docs/tasks/README.md`).

**6. `quality-bar:` field in role specs.**
2-3 concrete standards per role that the Judge evaluates against, avoiding the need to repeat them in every task:
- Engineer: `["TypeScript types on all exports", "barrel exports updated", "no TODO without issue link"]`
- Technical Writer: `["passes the Mistake Test", "under 200 lines", "no code snippets that belong in source"]`

Estimated effort: 1 session.

### LOW IMPACT

**7. Max-retries on tasks.**
Add `max-retries: 3` to task frontmatter. Judge tracks attempt count and escalates after 3 failures. Simple but useful for overnight pipeline runs.

Estimated effort: 0.5 sessions.

**8. Constrained output templates for specific roles.**
The Executive Summary Generator's word limits and required sections work because they're measurable. Apply to roles that produce structured output (Technical Writer, Product Manager). Already partially handled by WavePoint's CLAUDE.md standards and plan templates.

Estimated effort: Minimal, folded into other work.

### SKIP

- Division-based organization (flat with categories is fine for 13 roles)
- Per-agent workflow processes (pipeline-level orchestration handles this)
- Per-agent Learning & Memory sections (MEMORY.md + session logs)
- Cross-tool portability scripts (single-tool shop)
- NEXUS deployment modes (task-by-task dispatch is more realistic)
- 112 agent personalities (we need 13 well-tuned roles, not 112 generic ones)
- MCP memory integration (MEMORY.md already covers this)
- Personality/voice traits per agent (voice comes from design system rules)

---

## 9. Summary

Agency-agents is a community prompt library dressed as an agent framework. Its strengths are in behavioral prompt engineering (skepticism patterns, failure triggers, constrained outputs) and cross-tool portability engineering. Its weaknesses are the absence of actual orchestration, no codebase awareness, and significant quality variance across 112 agents.

For WavePoint, the highest-value extractions are:
1. The default-to-skepticism pattern for quality gates
2. Structured verdict templates with attempt tracking
3. The `disposition:` concept for role behavioral defaults
4. Task context handoff sections for multi-step work

These four patterns can be implemented in approximately 3 sessions and would materially improve the Planner/Worker/Judge pipeline's quality without adding framework complexity.
