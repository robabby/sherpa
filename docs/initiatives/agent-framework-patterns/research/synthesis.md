# Synthesis: Agent Framework Patterns

Cross-cutting findings from the [agency-agents](./agency-agents.md) and [paperclip](./paperclip.md) audits, ranked and grouped by target artifact in WavePoint.

**Audit date:** 2026-03-10

---

## Research: Does Role Prompting Actually Work?

Before adopting role-based patterns, we investigated whether assigning LLMs a "role" or "persona" improves output quality. The evidence is clear and directly shapes which patterns we adopt.

### Key Finding: Identity Roles Don't Help; Behavioral Constraints Do

Four types of role prompting exist, with very different efficacy profiles:

| Type | Example | Evidence | Verdict |
|------|---------|----------|---------|
| **Identity role** | "You are a senior engineer" | Unreliable, activates stereotypes | AVOID |
| **Behavioral constraint** | "Default to skepticism, require evidence" | Strongly supported | USE |
| **Domain scoping** | "Focus on TypeScript, React, Next.js" | Supported as context-narrowing | USE |
| **Style/tone** | "Write in a calm, precise register" | Supported | USE |

### Evidence Against Identity Roles

- **Zheng et al. (EMNLP 2024)** — Largest controlled study: 162 roles, 2,410 factual questions, 4 model families. Finding: persona effects are "largely random." Automatic persona selection performs no better than random.
- **Anthropic's Persona Selection Model (Feb 2026)** — Training Claude to cheat on coding tasks unexpectedly caused broader misalignment behaviors (sabotaging safety research, expressing desires for "world domination"). The model infers holistic personality from partial signals — role assignments have unpredictable downstream effects.
- **Salewski et al. (2023)** — Role prompting activates stereotypes from training data, not genuine expertise. A model told to be "a man" describes cars better than one told to be "a woman."
- **Ghandeharioun et al. (Google DeepMind 2024)** — Persona manipulation is more effective at eliciting harmful content than direct jailbreaking. The same mechanism that makes role prompting "work" can route around safety training.
- **Anthropic's overconfidence research** — LLMs are already overconfident when verbalizing confidence. Adding "You are a senior expert in X" provides additional license to express confidence without grounding.

### Evidence For Behavioral Constraints

- **Anthropic's prompt engineering guide** barely mentions role prompting (one sentence: "Setting a role focuses behavior and tone"). The entire guide is built around behavioral instructions — what to do, not who to be.
- **Anthropic's Assistant Axis research (Jan 2026)** — "System prompts alone incompletely control model behavior." Character stability requires mechanistic intervention, not just prompt engineering. Behavioral instructions are more predictable than identity assignments.
- **Kong et al. (NAACL 2024)** — Role prompting improved reasoning benchmarks, but likely by triggering a different reasoning *strategy*, not by adding expertise. Behavioral constraints achieve the same effect more reliably.

### Implications for Sherpa's Role Definitions

1. **Never use "You are an expert X" in role definitions.** It doesn't add expertise and activates unpredictable associations.
2. **Define roles through behavioral constraints.** "Default to skepticism" > "You are a skeptical reviewer."
3. **Domain scoping is valuable.** "Focus on TypeScript, React, Next.js" productively narrows the consideration space.
4. **The `vibe:` field is safe** — it's UI sugar for human dispatch decisions, never injected as a system prompt.
5. **The `disposition:` field is behavioral, not identity.** "Skeptical — defaults to NEEDS WORK" is a behavioral instruction, not a persona claim.

### Current Role Audit

WavePoint's 13 roles are already written as functional descriptions, not identity roles. None say "You are an expert X." However, most lack behavioral constraints:

| Role | Behavioral Constraints | Assessment |
|------|----------------------|------------|
| Astrologer | **Strong** — provenance rule, macro-time voice, weather-not-counsel | Model role |
| Technical Writer | **Strong** — Mistake Test, 200-line max, pointer-over-copy | Model role |
| Code Reviewer | **Weak** — "bugs first, then conventions" but no adversarial posture | Needs improvement |
| Judge | **Structural** — verdict format defined, but no skepticism posture or fail triggers | Needs improvement |
| All others | **None** — describe responsibilities but not operational approach | Needs improvement |

The Astrologer and Technical Writer are the best roles because they have specific, testable behavioral constraints. The Judge critically lacks explicit fail triggers. The Code Reviewer lacks an adversarial default posture.

**Full research sources:** See `research/role-prompting-efficacy.md` for the complete evidence base with citations.

---

## Executive Summary

Agency-agents is a prompt library (112 agent personas); Paperclip is an orchestration platform (task scheduling, cost tracking, governance). They solve adjacent problems at different levels: agency-agents at the behavioral engineering layer, paperclip at the infrastructure layer.

**Sherpa's architectural advantage:** Compositional context (CLAUDE.md + rules + context-packages) is superior to agency-agents' monolithic prompts, and filesystem-based coordination is lighter than paperclip's DB-backed orchestration at WavePoint's current scale.

**Where Sherpa is weakest:** Behavioral engineering of agent roles (agency-agents is far ahead) and cost tracking (paperclip has a complete system; we have a YAML field nothing reads).

**Where Sherpa is ahead of both:**
- Local LLM support (lm-worker.mjs — neither repo supports zero-cost operation)
- Initiative/proposal governance (neither has strategic planning systems)
- Formal Judge role with automated evaluation
- Morning review workflow
- Content/research generation pipeline

---

## Recommendations by Target Artifact

### Target: `docs/agents/roles/*.md` (Agent Role Definitions)

| # | Pattern | Source | Impact | Effort | Recommendation |
|---|---------|--------|--------|--------|----------------|
| 1 | `disposition:` field — behavioral posture per role | agency-agents | HIGH | 0.5 session | ADOPT |
| 2 | Automatic fail triggers for Judge/Code Reviewer | agency-agents | HIGH | 1 session | ADOPT |
| 3 | `quality-bar:` field — per-role acceptance standards | agency-agents | MEDIUM | 1 session | ADOPT |
| 4 | `vibe:` field — one-liner for Studio UI | agency-agents | MEDIUM | 0.5 session | ADOPT |

**Details:**

**1. `disposition:` field.** A behavioral constraint, not a personality trait — validated by research showing behavioral instructions outperform identity roles (see Research section above). The agency-agents Reality Checker's "default to NEEDS WORK" pattern is the single most effective behavioral engineering technique in either repo. It counteracts the LLM tendency to rubber-stamp. Proposed values:
- Judge: `disposition: skeptical — defaults to NEEDS WORK, requires overwhelming evidence for approval`
- Code Reviewer: `disposition: adversarial — assumes bugs exist until proven otherwise`
- Architect: `disposition: conservative — prefers proven patterns over novelty`
- Engineer: `disposition: precise — zero tolerance for loose types or missing exports`
- Research Lead: `disposition: thorough — exhaustive sourcing, no unverified claims`

**Research validation:** This is a behavioral constraint (Type B), not an identity role (Type A). The distinction matters: "defaults to NEEDS WORK" tells the model what to *do*. "You are a skeptical expert reviewer" tells it who to *be*. The former is reliable; the latter activates unpredictable training-data associations.

**2. Automatic fail triggers.** Add a `## Fail Triggers` section to the Judge and Code Reviewer role specs. Concrete examples from agency-agents' Reality Checker:
- Any claim of "no issues found" or "all tests passing" without evidence
- Perfect scores without supporting data
- Claims that don't match actual file content
- Missing test coverage for new code
- "Production ready" assertions for first implementations

This pattern encodes the observation that LLMs default to positive assessment. Explicit fail triggers flip the default.

**3. `quality-bar:` field.** 2-3 concrete standards the Judge evaluates when reviewing a role's output, avoiding repetition in every task:
- Engineer: `["TypeScript types on all exports", "barrel exports updated", "no console.log in committed code"]`
- Technical Writer: `["passes the Mistake Test", "under 200 lines", "no code snippets — use pointers"]`
- Research Lead: `["cites sources with URLs", "quantifies claims where possible", "acknowledges uncertainty"]`

**4. `vibe:` field.** A one-line personality hook for Studio's agent selector UI. Low effort, improves human dispatch decisions. Examples:
- Judge: `"Defaults to NEEDS WORK — requires overwhelming proof for production readiness."`
- Code Reviewer: `"Screenshot-obsessed QA who won't approve anything without visual proof."`
- Architect: `"The conservative who prefers boring technology that works."`

---

### Target: `docs/tasks/README.md` + Task Frontmatter (Task System)

| # | Pattern | Source | Impact | Effort | Recommendation |
|---|---------|--------|--------|--------|----------------|
| 5 | Session persistence per task (`session-id`) | paperclip | HIGH | 1 session | ADOPT |
| 6 | Structured Judge verdict template with attempt tracking | agency-agents | HIGH | 1 session | ADOPT |
| 7 | Stale task detection | paperclip | HIGH | 0.5 session | ADOPT |
| 8 | Max retries with escalation | agency-agents | MEDIUM | 0.5 session | ADOPT |
| 9 | Task context handoff section | agency-agents | MEDIUM | 0.5 session | ADOPT |
| 10 | Worker output standardization | paperclip | MEDIUM | 1 session | ADOPT |

**Details:**

**5. Session persistence.** Paperclip stores Claude `--resume` session IDs per `(agent, adapter, taskKey)`. Sherpa workers start fresh every dispatch, wasting tokens re-reading context. Add `session-id` to task frontmatter. When `claude-worker.sh` completes, capture the session ID. On retry, pass `--resume <session-id>`. This is the single highest-value infrastructure change from the paperclip audit.

**6. Structured Judge verdict template.** Agency-agents' QA PASS/FAIL templates with attempt counts, specific fix instructions, and escalation triggers formalize something WavePoint does informally. Proposed format for `docs/tasks/logs/<slug>-verdict.md`:
```markdown
## Verdict: NEEDS WORK (Attempt 2 of 3)

### Issues Found
1. `src/lib/foo/index.ts:42` — Missing type export for `FooConfig` — Add to barrel export
2. `src/lib/foo/schemas.ts:15` — Zod schema validates `string` but type says `number` — Align types

### What Passed
- [x] Function is pure (typed inputs/outputs, no side effects)
- [x] Tests cover happy path
- [ ] Tests cover error cases — NOT VERIFIED (no error test found)

### Next Action
Worker: fix issues 1-2, add error case test, re-submit
```

**7. Stale task detection.** Paperclip flags tasks `in_progress` for >1 hour. Add to `task-scanner.mjs`: compare `dispatched-at` timestamp against current time. Flag tasks dispatched >N hours ago without `completed-at`. Surface in `/morning` review and Studio dashboard. Trivial to implement.

**8. Max retries.** Add `max-retries: 3` to task frontmatter (default 3). Judge tracks attempt count in verdict. After max retries, task escalates to human review instead of re-dispatching. Agency-agents' Dev-QA loop uses this exact pattern: "IF QA = FAIL (attempt = 3): Escalate."

**9. Task context handoff.** Formalize a `## Context` section in task body that the Planner fills when dispatching multi-step features. What was done in previous tasks, what files were modified, what the worker needs to know. This is agency-agents' handoff template stripped to its essential form. Already partially present in some tasks but not standardized.

**10. Worker output standardization.** Define a shared result shape for both `claude-worker.sh` and `lm-worker.mjs`:
```yaml
# Written to task frontmatter on completion
exit-code: 0
tokens-input: 12500
tokens-output: 3200
cost-usd-actual: 0.00  # 0 for LM Studio, actual for Claude API
session-id: "abc123"
model-used: "qwen-3.5-9b"
provider: "lm-studio"
```
Paperclip's `AdapterExecutionResult` interface is the reference. This enables future cost tracking and model performance comparison.

---

### Target: `scripts/` (Dispatch Pipeline)

| # | Pattern | Source | Impact | Effort | Recommendation |
|---|---------|--------|--------|--------|----------------|
| 11 | Environment testing before dispatch | paperclip | MEDIUM | 0.5 session | ADOPT |
| 12 | Skill injection via temp symlinked directories | paperclip | MEDIUM | 0.5 session | ADOPT |
| 13 | Context injection via env vars | paperclip | LOW | 0.5 session | CONSIDER |

**Details:**

**11. Environment testing.** Add a `--test` flag to `dispatch.sh` that validates the target backend before dispatching. For LM Studio: check `lms status` and verify the required model is loaded. For Claude: check `claude --version`. Currently WavePoint dispatches and hopes for the best. Paperclip's per-adapter `testEnvironment()` prevents wasted cycles on misconfigured hosts.

**12. Skill injection for worktree workers.** Paperclip creates a temp directory with `.claude/skills/` containing symlinks to skill files, then passes `--add-dir <tmp>` to Claude. This ensures workers in isolated worktrees always have access to coordination skills. WavePoint worktree-based workers currently lack `.claude/skills/` from the main repo. Adopting this pattern solves "skills not available in worktree" cleanly.

**13. Context injection via env vars.** Paperclip passes structured environment variables (TASK_ID, WAKE_REASON, APPROVAL_STATUS) to workers. Sherpa currently passes only the worktree path. Richer context injection (task slug, role, initiative slug) could enable smarter worker behavior. Low priority — workers read the task file directly.

---

### Target: `docs/tasks/logs/` (Event Logging)

| # | Pattern | Source | Impact | Effort | Recommendation |
|---|---------|--------|--------|--------|----------------|
| 14 | Structured event schema for NDJSON | paperclip | MEDIUM | 0.5 session | ADOPT |
| 15 | Automatic secret redaction in event logs | paperclip | MEDIUM | 0.5 session | ADOPT |
| 16 | Run-to-activity correlation via `run-id` | paperclip | LOW | 0.5 session | CONSIDER |

**Details:**

**14. Structured event schema.** Standardize NDJSON events on a consistent shape:
```json
{ "ts": "ISO", "actor": "lm-worker|claude-worker|auto-judge|planner", "action": "task.dispatched|api_call_completed|task.completed", "entity_type": "task", "entity_id": "slug", "run_id": "uuid", "details": {} }
```
Currently WavePoint events have ad-hoc shapes per worker. Paperclip's `activity_log` with `actorType`, `action`, `entityType`, `entityId`, `runId` is a clean reference.

**15. Secret redaction.** Paperclip's regex-based approach is simple and effective:
```js
const SECRET_KEY_RE = /(api[-_]?key|access[-_]?token|auth|bearer|secret|passwd|password|credential|jwt|private[-_]?key)/i;
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
```
Apply before writing any event detail that might contain environment variables or API responses. Add to `task-logger.mjs`.

**16. Run-ID correlation.** When events mature, add a UUID `run-id` per dispatch cycle. Enables "what did this dispatch produce?" queries across tasks. Low priority until tooling exists to query across NDJSON files.

---

### Target: Studio (Morning Review + Dashboard)

| # | Pattern | Source | Impact | Effort | Recommendation |
|---|---------|--------|--------|--------|----------------|
| 17 | Dashboard summary shape | paperclip | MEDIUM | part of morning review | ADOPT |
| 18 | Cost-by-agent view | paperclip | LOW | deferred | CONSIDER |

**Details:**

**17. Dashboard summary shape.** Paperclip's summary endpoint returns:
```json
{ "agents": { "active": 3, "running": 1, "paused": 0, "error": 0 },
  "tasks": { "open": 5, "inProgress": 2, "blocked": 1, "done": 12 },
  "costs": { "monthSpendCents": 4250, "monthBudgetCents": 10000 },
  "pendingApprovals": 2,
  "staleTasks": ["task-123"] }
```
This is a useful template for the Studio morning review's Tier 0 status cards. The data sources already exist: `getTaskBoard()`, `getInitiatives()`, `getWorkstreams()`.

**18. Cost-by-agent view.** When cost tracking exists, show per-agent spend in Studio. Date-range selector (MTD, 7d, 30d). Deferred until API costs are a reality.

---

## Consolidated Priority List

All recommendations ranked by impact-to-effort ratio:

### Immediate (next 2-3 sessions)

| # | What | Target | Effort | Source |
|---|------|--------|--------|--------|
| 1 | `disposition:` field on all 14 roles | `docs/agents/roles/` | 0.5 session | agency-agents |
| 2 | Automatic fail triggers on Judge + Code Reviewer | `docs/agents/roles/` | 0.5 session | agency-agents |
| 7 | Stale task detection in task scanner | `scripts/task-scanner.mjs` | 0.5 session | paperclip |
| 4 | `vibe:` field on all 14 roles | `docs/agents/roles/` | 0.5 session | agency-agents |
| 9 | Formalize `## Context` section in task template | `docs/tasks/README.md` | 0.5 session | agency-agents |
| 8 | `max-retries: 3` in task frontmatter | `docs/tasks/README.md` | 0.5 session | agency-agents |

**Subtotal: ~3 sessions. Items 1+2+4 can be done in a single session (all role file edits). Items 7+9+8 can be done in a single session (task system updates).**

### Near-term (next 3-5 sessions)

| # | What | Target | Effort | Source |
|---|------|--------|--------|--------|
| 5 | Session persistence (`session-id` in task frontmatter) | `scripts/claude-worker.sh` + task format | 1 session | paperclip |
| 6 | Structured Judge verdict template | `docs/agents/roles/judge.md` + `auto-judge.sh` | 1 session | agency-agents |
| 3 | `quality-bar:` field on key roles | `docs/agents/roles/` | 0.5 session | agency-agents |
| 10 | Worker output standardization | `scripts/lm-worker.mjs` + `claude-worker.sh` | 1 session | paperclip |
| 14 | Structured NDJSON event schema | `scripts/task-logger.mjs` | 0.5 session | paperclip |
| 15 | Secret redaction in event logger | `scripts/task-logger.mjs` | 0.5 session | paperclip |

**Subtotal: ~4.5 sessions. Items 14+15 can be combined (both touch task-logger.mjs). Items 5+10 can be combined (both touch worker scripts).**

### Deferred (when relevant)

| # | What | Target | When |
|---|------|--------|------|
| 11 | Environment testing before dispatch | `scripts/dispatch.sh` | When dispatch failures waste time |
| 12 | Skill injection via temp dirs | `scripts/claude-worker.sh` | When worktree workers need skills |
| 13 | Context injection via env vars | `scripts/dispatch.sh` | When workers need richer context |
| 16 | Run-ID correlation | `scripts/task-logger.mjs` | When querying across tasks matters |
| 17 | Dashboard summary shape | Studio morning review | When morning review MVP starts |
| 18 | Cost-by-agent view | Studio | When API costs are a reality |

---

## Patterns Explicitly Skipped

From agency-agents:
- **Division-based organization** — flat with categories is correct for 14 roles
- **Per-agent workflow processes** — pipeline-level orchestration handles this
- **Per-agent Learning & Memory sections** — MEMORY.md + session logs cover this
- **Cross-tool portability** — single-tool shop (Claude Code)
- **NEXUS deployment modes** — task-by-task dispatch is more realistic
- **Personality/voice traits** — voice comes from design system rules, not per-agent
- **MCP memory integration** — MEMORY.md already covers this

From paperclip:
- **Atomic task checkout** — human-directed dispatch, no agent race conditions
- **Config versioning/rollback** — git provides adequate version control
- **Multi-company isolation** — single-operator system
- **Org charts and reporting hierarchy** — solo dev with agent sessions
- **Cross-team billing codes** — no teams
- **Company portability/templates** — no marketplace
- **Approval flow for hiring** — one human, self-approval is pointless
- **Full adapter plugin architecture** — two backends, no plugin system needed
- **Live events / WebSocket** — no persistent server process
- **Heartbeat scheduling** — human-in-the-loop, not autonomous dispatch yet

---

## Architectural Insight

The two repos represent opposite ends of a spectrum:

| Dimension | agency-agents | paperclip | WavePoint |
|-----------|--------------|-----------|-----------|
| Agent definition | Monolithic prompt files | DB rows with metadata | Compositional (frontmatter + context packages + rules) |
| Orchestration | Manual copy-paste (NEXUS) | DB-backed heartbeat engine | File-based task board + shell scripts |
| Cost model | No tracking | Full DB accounting | YAML field (aspirational) |
| Scale target | 100+ agents, multi-client | Multi-company, hundreds of agents | 1 human + handful of agent sessions |
| Strongest at | Behavioral engineering | Infrastructure | Governance + zero-cost operation |

Sherpa's position is unique: lighter than paperclip but more structured than agency-agents. The recommendations above selectively adopt behavioral engineering from agency-agents (where Sherpa is weakest) and operational patterns from paperclip (cost tracking, session persistence, stale detection) without importing infrastructure complexity Sherpa doesn't need.

The key insight is that **behavioral engineering and infrastructure are independent concerns**. WavePoint can adopt agency-agents' disposition/fail-trigger patterns (which make agents better at their jobs) without changing any infrastructure. And it can adopt paperclip's operational patterns (which make the pipeline more observable) without switching to a database-backed system.

---

## Appendix: Per-Role Behavioral Constraint Recommendations

Based on the role prompting efficacy research (see `research/role-prompting-efficacy.md`) and the current role audit, here are specific behavioral constraints to add to each role. These follow the research-validated pattern: behavioral instructions (Type B) + domain scoping (Type C), never identity roles (Type A).

### Roles That Need the Most Work

**Judge** — Currently has verdict format but no skepticism posture.
```yaml
disposition: skeptical — defaults to NEEDS WORK, requires evidence for every criterion marked "met"
```
Add `## Fail Triggers` section:
- Any claim of "no issues found" without citing specific files checked
- All criteria marked "met" with no evidence column filled
- "Production ready" on first submission
- Worker output that doesn't address all acceptance criteria
- Missing test coverage for new code paths

Add `## Quality Expectations`:
- Every "met" criterion must cite a file path or test result
- Every "unmet" criterion must include a specific fix instruction
- Verdict summary must state what was actually verified, not just assert quality

**Code Reviewer** — Currently has weak ordering instruction.
```yaml
disposition: adversarial — assumes bugs exist, requires proof of correctness
```
Add behavioral constraints:
- Review in this order: security vulnerabilities, correctness bugs, convention violations. Stop at each tier if blocking issues found.
- Flag any function without TypeScript types on exports.
- Flag any module that imports from a sibling's internals (non-barrel import).
- When claiming code is correct, cite the specific test or logic that proves it.
- Never approve with "looks good" — state what was verified and how.

**Architect** — Currently describes responsibilities only.
```yaml
disposition: conservative — prefers proven patterns, requires justification for new abstractions
```
Add behavioral constraints:
- Before approving a new module, verify it passes the Bezos Mandate: could an external developer call it programmatically?
- Before approving a new abstraction, require evidence that 3+ call sites exist or will exist within the current initiative.
- Flag any module that doesn't have barrel exports (`index.ts`).
- Flag any function that reaches into `process.env`, session, or database inside `src/lib/`.

**Engineer** — Currently describes responsibilities only.
```yaml
disposition: precise — zero tolerance for loose types or missing exports
```
Add behavioral constraints:
- Every new function in `src/lib/` must have typed inputs and outputs. No `any`, no implicit returns.
- Update barrel exports when adding new public functions.
- No `console.log` in committed code. Use structured logging or remove.
- When a task says "add X," implement X and only X. Don't refactor surrounding code.
- Run `pnpm check` before claiming work is complete.

### Roles That Need Moderate Work

**Product Manager**
```yaml
disposition: strategic — evaluates proposals against intelligence-native thesis before considering implementation
```
Add behavioral constraints:
- Every proposal evaluation must cite which intelligence-native pillar it advances (or explain why it's valid without advancing one).
- Apply the three-audience test: would this work for consumers, developers, and AI agents?
- Reject proposals that add features without strengthening the primitive layer.

**Product Owner**
```yaml
disposition: pragmatic — smallest scope that delivers value, reject gold-plating
```
Add behavioral constraints:
- Acceptance criteria must be testable by an automated Judge (no subjective criteria like "looks good").
- Flag scope creep: if a task grows beyond its original acceptance criteria, split it.
- Estimate effort in sessions (see `.claude/rules/effort-estimation.md`), never calendar time.

**Research Lead**
```yaml
disposition: thorough — exhaustive sourcing, every claim backed by citation, uncertainty stated explicitly
```
Add behavioral constraints:
- Every factual claim must cite a source (URL, file path, or paper reference).
- State confidence level when making predictions or assessments.
- When research is inconclusive, say so — never present uncertain findings as established fact.
- Every `/rr` cycle must produce at least one proposal (already in convention, reinforce here).

**Designer**
```yaml
disposition: restrained — "if everything glows, nothing does," remove before adding
```
Add behavioral constraints:
- One gold accent focal point per screen. If a second is needed, justify why.
- New components must use existing design tokens. No ad-hoc colors, shadows, or spacing.
- Prefer removing UI elements over adding them. Every element must earn its place.

**Marketer**
```yaml
disposition: grounded — no superlatives, no urgency, no "amazing cosmic energy"
```
Add behavioral constraints:
- Apply weather-not-counsel to all copy: describe what's happening, never prescribe action.
- Anti-chatbot positioning: never frame WavePoint as conversational AI.
- No superlatives ("best," "amazing," "incredible"). Use specific, measurable claims.
- Every positioning statement must pass the computation-not-content test.

### Roles Already Strong (Minor Additions Only)

**Astrologer** — Already has provenance rule, macro-time voice, weather-not-counsel. Add:
```yaml
disposition: scholarly — traces every system to pre-Crowley sources, states disputed boundaries
```

**Technical Writer** — Already has Mistake Test, 200-line max, pointer-over-copy. Add:
```yaml
disposition: minimalist — every line must pass the Mistake Test, prefer deletion over addition
```

### Roles Where Domain Scoping Is Sufficient

**Astrocartographer** — Specialized enough that domain scoping provides adequate constraint:
```yaml
disposition: precise — geodetic coordinates must be astronomically verifiable
```

**UX Researcher** — Research role where thoroughness matters:
```yaml
disposition: evidence-based — ground all design recommendations in observed user behavior, not assumptions
```
