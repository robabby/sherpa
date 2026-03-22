# Iteration 1 — 2026-03-21

## Findings

### Vector 1: Linear API & GraphQL Surface
**Question:** What does Linear's API offer for programmatic project management?
**Full report:** [iteration-1/vector-1-linear-api-graphql-surface.md](iteration-1/vector-1-linear-api-graphql-surface.md)

- Single GraphQL endpoint at `api.linear.app/graphql` — same API Linear uses internally. Full schema public (42K lines). ([Linear Developers](https://linear.app/developers/graphql))
- Three auth methods: Personal API Keys (scripts), OAuth 2.0 (PKCE for CLI, Client Credentials for server-to-server), Actor Authorization (bot identity). ([Linear OAuth docs](https://linear.app/developers/oauth-2-0-authentication))
- Rate limits: 5K req/hr (API key), 2M complexity points/hr (OAuth). Leaky bucket. Generous for Sherpa's volume. ([Linear Rate Limiting](https://linear.app/developers/rate-limiting))
- Webhooks for all resource types (issues, projects, initiatives, cycles). HMAC-SHA256 signed. 3 retries with backoff. No GraphQL subscriptions. ([Linear Webhooks](https://linear.app/developers/webhooks))
- Batch operations: `issueBatchCreate` and `issueBatchUpdate` for bulk task management. ([Apollo Studio](https://studio.apollographql.com/public/Linear-API/schema/reference))
- **Linear ships a first-party MCP server** at `mcp.linear.app/mcp` — OAuth 2.1, Streamable HTTP, supports issues/projects/comments. ([Linear MCP docs](https://linear.app/docs/mcp))

**Implications:** The API surface is more than sufficient. Batch operations replace `dispatch-queue.sh`, rich filtering replaces YAML grep, webhooks eliminate sync latency.

### Vector 2: Linear SDK & Automation
**Question:** What does the SDK and automation system offer for building integrations?
**Full report:** [iteration-1/vector-2-linear-sdk-automation.md](iteration-1/vector-2-linear-sdk-automation.md)

- `@linear/sdk` v77.0.0 — auto-generated TypeScript client from production schema. Pagination helpers, error classes, webhook verification. ([npm](https://www.npmjs.com/package/@linear/sdk))
- Built-in automations are limited: single-trigger, single-action, same-issue scope. No cross-issue analysis, no time-based triggers, no pattern detection. ([Cotera](https://cotera.co/articles/linear-automation-guide))
- **21 agents in Integration Directory. All coding agents except ChatPRD (docs). Zero governance agents.** ([Linear Agents Directory](https://linear.app/integrations/agents))
- Agent Guidance: free-text markdown, advisory only. No enforcement mechanism, no validation, no feedback loop. ([Linear docs](https://linear.app/docs/agents-in-linear))
- Agents API (Developer Preview): `app:assignable`, `app:mentionable` scopes. Delegation model (human=accountable, agent=executor). 6 session states, 5 activity types, agent plans (tech preview). 10-second first-response requirement. ([Linear Agent Interaction](https://linear.app/developers/agent-interaction))

**Implications:** The governance gap is real and documented. Sherpa would be the first agent in Linear's ecosystem that enforces conventions rather than writing code.

### Vector 3: Agent Workflows in Production
**Question:** How are teams using Linear with AI agents? What patterns exist?
**Full report:** [iteration-1/vector-3-linear-agent-workflows.md](iteration-1/vector-3-linear-agent-workflows.md)

- Dominant pattern: Triage → Agent → PR → Human Review. Cursor, Codex, Devin, Factory all follow this. ([Cursor case study](https://linear.app/now/how-cursor-integrated-with-linear-for-agents))
- **No governance agent sits between triage and coding.** Nobody validates issue readiness, lifecycle compliance, or behavioral constraints before delegation. ([GitHub blog](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/))
- Pain point: custom triage bot cost 120 eng hours + 40 hours maintenance, exceeded time saved. API changes broke it repeatedly. Lesson: "build scripts, not services." ([Cotera](https://cotera.co/articles/linear-api-automation-guide))
- Claude Code + Linear is an open feature request with 77 thumbs-up. ([GitHub #12925](https://github.com/anthropics/claude-code/issues/12925))
- Community MCP server (jerhadf) deprecated; official MCP server active. ([Linear MCP docs](https://linear.app/docs/mcp))

**Implications:** The triage→coding pipeline has no quality gate. Sherpa fills this gap — intercept delegation, validate readiness, enforce conventions, then route to coding agents.

### Vector 4: Data Model & Taxonomy Mapping
**Question:** How does Linear's data model map to Sherpa's task taxonomy?
**Full report:** [iteration-1/vector-4-linear-data-model-taxonomy.md](iteration-1/vector-4-linear-data-model-taxonomy.md)

- **No custom fields** in Linear's 42K-line schema. Label groups (mutually exclusive, single-select) are the extensibility mechanism. ([Linear Labels docs](https://linear.app/docs/labels))
- Priority maps natively (Linear 0-4 ≈ Sherpa urgent/high/medium/low). Status maps to workflow states with custom substates. ([Linear Workflow docs](https://linear.app/docs/configuring-workflows))
- Sherpa initiatives → Linear Projects (6 status categories: backlog/planned/started/paused/completed/canceled). Linear Initiatives only have 3 statuses — too coarse. ([Linear Projects docs](https://linear.app/docs/projects))
- Sherpa tasks → Linear Issues. Direct mapping. Task body → issue description.
- **Backend routing stays framework-side.** Linear has no concept of execution backends. Judge pipeline, governance files, dispatch config all remain Sherpa-native.
- Linear adds: burndown/velocity, health reporting (onTrack/atRisk/offTrack), SLA enforcement, timeline visualization, update reminders.

**Implications:** Most Sherpa dimensions map cleanly via labels + workflow states. Backend/dispatch/governance stay framework-side — this is Sherpa's differentiator.

## Synthesis

### The Core Insight

**Linear is not a competitor to Sherpa — it's the ideal substrate.** The research reveals a clean separation of concerns:

- **Linear handles state** — issues, projects, cycles, priorities, assignments, notifications, SLAs, burndown charts. It does this at scale (25,000+ companies) with a polished UI.
- **Sherpa handles governance** — behavioral constraints, convention enforcement, lifecycle management, dispatch routing, quality gates. This is what Linear explicitly lacks and what its architecture is designed to accept.

Linear's Agent Guidance feature is the smoking gun: they built a mechanism for agents to receive instructions, but deliberately made it advisory-only with no enforcement. They're inviting someone to build the enforcement layer. That's Sherpa.

### The Architecture Validates

The "Sherpa as Linear Agent" architecture (absorbed from the parallel proposal) is strongly supported by the research:

1. **OAuth Actor Authorization** gives Sherpa its own identity in Linear workspaces — actions attributed to the app, not a human user
2. **Delegation model** (human=accountable, agent=executor) maps directly to Sherpa's Planner/Worker/Judge pipeline
3. **Session activities** (thought, action, elicitation, response, error) provide the structured communication channel for governance feedback
4. **Agent Plans** (session-level checklists) can represent governance checklists — convention compliance, quality gates, lifecycle requirements
5. **`promptContext` XML** is the injection point for behavioral constraints — Sherpa can consume guidance AND layer enforcement on top
6. **Label groups** map Sherpa's task taxonomy (task-type, mode, role, verdict) cleanly despite no custom fields
7. **Official MCP server** provides the direct integration path — Sherpa's MCP layer can compose Linear's MCP natively

### The Market Gap Is Real

Zero governance agents exist in Linear's 21-agent directory. Every agent writes code. Nobody enforces conventions. This is independently documented across multiple sources as a critical gap in AI agent ecosystems (GitHub blog, Palo Alto Networks, Sekuire). Sherpa would be the first — and the submission criteria ("useful to the community, built by formal companies") are achievable.

### Key Constraints

1. **10-second response requirement** — Sherpa must acknowledge webhooks immediately (emit `thought`), then process governance asynchronously. Queue-based architecture, not synchronous.
2. **No custom fields** — label groups work for single-select dimensions but won't support multi-select scenarios (e.g., issue touching both research AND content-generation)
3. **Agent API is Developer Preview** — may change before GA. Build defensively.
4. **"Build scripts, not services" warning** — a production Linear integration requires ongoing maintenance. API changes, webhook reliability, token refresh. Budget for this.
5. **Offline dependency** — moving to Linear creates a hard network requirement. Sherpa's filesystem system works without internet. Need a fallback story for the "thumb drive test."

### What This Means for Sherpa's Dispatch Roadmap

If Linear adoption proceeds, several in-flight initiatives change:

| Initiative | Impact |
|---|---|
| `dispatch-evolution` | UI simplification still valid, but task backend shifts from filesystem to Linear |
| `scheduled-dispatch` | Potentially unnecessary — Linear has cycles and automation rules |
| `dispatch-idempotence` | Largely solved — Linear's API handles concurrent state |
| `ai-sdk-dispatch` | Stays relevant — API backends for direct model access vs Linear for state |

## Proposals Generated

Updated `docs/initiatives/sherpa-linear-integration/proposal.md` with:
- Absorbed "Sherpa as Linear Agent" candidate architecture (Phase 1 MVP + Phase 2 Marketplace)
- Added strategic dual-purpose framing (product evolution + job search differentiator)
- Added candidate architecture section with implementation phases

## Open Questions for Next Iteration

1. **Agent-to-agent delegation** — Can Sherpa's governance agent route validated issues to coding agents (Cursor, Codex) within Linear? Or does it require label/state changes that trigger triage rules? This determines whether Sherpa is a gateway or a filter.

2. **Source-of-truth architecture** — If both Linear and filesystem tasks exist, who owns status updates? Options: (a) Linear is truth, Sherpa reads; (b) Sherpa dispatches, updates Linear; (c) bidirectional webhook sync. The Cotera "build scripts, not services" warning favors (b).

3. **MVP scope** — What is the smallest demo-worthy integration? Possibly: read Linear issues → apply governance check → post verdict as comment. No OAuth app, no webhook server, just API key + polling. Would this be compelling in an interview?

4. **Integration Directory feasibility** — Does Sherpa Consulting qualify as a "formal company"? No LLC, no EIN. Would they accept a sole proprietorship / consulting practice?

5. **Offline fallback** — Can Sherpa maintain a local filesystem cache of Linear state for offline operation? Or accept that Linear integration is online-only and keep filesystem tasks as the offline path?
