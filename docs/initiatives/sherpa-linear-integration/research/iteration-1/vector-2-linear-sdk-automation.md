# Vector 2: Linear SDK & Automation

**Question:** What does Linear's TypeScript SDK and automation system offer for building integrations? SDK API surface, built-in automations, Integration Directory, Agent Guidance, and Agents API.
**Agent dispatched:** 2026-03-21

## Findings

### @linear/sdk
- Current version: 77.0.0, MIT license, 44 contributors
- Auto-generated from production GraphQL schema via custom codegen plugins
- Monorepo at github.com/linear/linear with 5 packages
- Auth: `new LinearClient({ apiKey })` or `new LinearClient({ accessToken })`
- `actor=app` mode for agent identity (actions attributed to app, not user)
- Post-Oct-2025 apps: 24-hour access tokens with refresh; client credentials grant: 30-day tokens
- Typed methods: `issues()`, `projects()`, `teams()` return `Connection` objects with `.nodes`
- Chaining: `me.assignedIssues()` → `issue.comments()`
- Mutations: `createIssue({ teamId, title })`, `issueUpdate("id", { title, stateId })` → `{ success, entity }`
- Agent-specific mutations: `createAgentActivity({ agentSessionId, content })`, `agentSessionUpdate()`
- Pagination: Relay cursor-based, 50/page default, `connection.fetchNext()` / `fetchPrevious()` helpers
- Error handling: `LinearError`, `InvalidInputLinearError`, `LinearErrorType` — structured `query`, `variables`, `status`, `errors[]`
- Webhook verification: `LinearWebhooks` class, HMAC-SHA256, timestamp replay protection
- Raw GraphQL access: `linearClient.client` exposes `LinearGraphQLClient` for custom queries

### Built-in Automation Rules
- **Workflow automations** (per-team): state change triggers auto-assign, add label, set priority, move to project
- **Auto-close**: close issues not updated within configurable period
- **Auto-archive**: archive issues, projects, cycles after inactivity
- **GitHub integration**: branch created → "In Progress"; PR opened → "In Review"; PR merged → "Done"
- **Triage rules** (Business/Enterprise only): trigger on any filterable property combo, actions update team/status/assignee/label/project/priority, sequential execution
- **Triage Intelligence**: LLM-powered (GPT-5, Gemini 2.5 Pro), suggests assignee/labels, identifies duplicates
- **Auto-apply triage suggestions**: available since Sept 2025
- **SLA tracking** (Business/Enterprise): auto-applied based on rules, presets from 12h to 4wk

**Key limitation:** Single-trigger, single-action, same-issue scope only. No cross-issue analysis, pattern detection, time-based triggers, or customer-centric escalation. No conditional logic beyond "title contains word."

### Integration Directory / Marketplace
- Three-step process: form → design assets via email → support via integrations@linear.app
- Figma template provided for assets
- Criteria: "useful to the community and built by formal companies" — do not accept hobbyist scripts
- Must use OAuth authentication with dedicated workspace application
- Official integrations get star badge
- **21 agents listed** as of March 2026
- Featured (6): Codex, Cursor, GitHub Copilot, Factory, Sentry Agent, Devin
- Community (15): ChatPRD, Charlie, cto.new, Cyrus, Pixelesq, Ranger, Reflag, Stilla, Panaptico, Tembo, Solo, Oz by Warp, Dash0, Replicas, Blocks
- **All are coding agents except ChatPRD (documentation). Zero governance agents.**

### Agent Guidance Feature
- Free-text instructions agents receive via `promptContext` XML in webhook payloads
- Two levels: workspace-wide (Settings > Agents) and team-specific (Team settings > Agents)
- Team guidance takes priority when both exist
- Delivered as `<guidance>` elements with `origin` and `team-name` attributes in XML
- **Purely advisory** — "how it is interpreted or applied depends on the specific agent integration"
- No structured schema, no enforcement mechanism, no validation, no feedback loop
- No documented character limit

### Agents API
- **Scopes**: `app:assignable` (assigned as delegate, added as project member), `app:mentionable` (@mentioned in issues/docs/editor)
- **Delegation model**: humans assigned (accountable), agents delegated (execute). Human remains primary; agent added as contributor
- **Agent sessions**: 6 states (pending, active, error, awaitingInput, complete, stale), auto-managed by Linear
- **10-second rule**: must emit first activity within 10 seconds or marked unresponsive
- **30-minute window**: activities valid for 30 minutes after initial response; then stale (recoverable)
- **5 activity types**: thought (ephemeral), action (ephemeral), elicitation (persistent — ask user), response (persistent — result), error (persistent)
- **Agent Plans** (tech preview): session-level checklists, pending/inProgress/completed/canceled per step, must be replaced in entirety (no partial updates)
- **External URLs**: attach label+URL pairs to sessions (e.g., link to GitHub PRs)
- **Identity**: unique user ID per workspace, app name/icon appear in mention menus and filters
- **Webhook actions**: `created` (new session), `prompted` (user follow-up), stop signal via `agentActivity.signal: "stop"`
- **Status**: Developer Preview — may change before GA
- **Reference implementation**: linear/weather-bot on GitHub (TypeScript + Cloudflare Worker)

## Sources

- [Linear SDK Getting Started](https://linear.app/developers/sdk)
- [Linear SDK GitHub Monorepo](https://github.com/linear/linear)
- [Linear SDK Fetching & Modifying Data](https://linear.app/developers/sdk-fetching-and-modifying-data)
- [Linear SDK Pagination](https://linear.app/developers/pagination)
- [Linear SDK Errors](https://linear.app/developers/sdk-errors)
- [Linear SDK Advanced Usage](https://linear.app/developers/advanced-usage)
- [Linear Webhooks](https://linear.app/developers/webhooks)
- [Linear OAuth 2.0 Authentication](https://linear.app/developers/oauth-2-0-authentication)
- [Linear OAuth Actor Authorization](https://linear.app/developers/oauth-actor-authorization)
- [Linear Agents Getting Started](https://linear.app/developers/agents)
- [Linear Agent Interaction Development](https://linear.app/developers/agent-interaction)
- [Linear Agent Best Practices](https://linear.app/developers/agent-best-practices)
- [Linear Agents in Linear (User Docs)](https://linear.app/docs/agents-in-linear)
- [Linear Integration Directory](https://linear.app/docs/integration-directory)
- [Linear Agent Integrations Directory](https://linear.app/integrations/agents)
- [Linear's Approach to Building the Agent Interaction SDK](https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk)
- [Linear Workflow Configuration](https://linear.app/docs/configuring-workflows)
- [Linear Triage](https://linear.app/docs/triage)
- [Linear SLAs](https://linear.app/docs/sla)
- [Linear GitHub Integration](https://linear.app/docs/github-integration)
- [Cotera: Linear Automation Guide](https://cotera.co/articles/linear-automation-guide)
- [Hookdeck: How to Build Linear Agents](https://hookdeck.com/webhooks/platforms/how-to-build-linear-agents-with-hookdeck-cli)
- [Linear Sept 2025 Changelog: Auto-apply triage](https://linear.app/changelog/2025-09-19-auto-apply-triage-suggestions)

## Implications

1. **The governance gap is wide open.** All 21 agents are coding/infra tools. Zero governance agents. Sherpa would be first.
2. **Agent Guidance is the injection point for Sherpa conventions.** It's advisory-only — Sherpa adds enforcement.
3. **Delegation model aligns with Sherpa's accountability philosophy.** Humans own outcomes, agents execute. Maps to Planner/Worker/Judge.
4. **Session activities = dispatch visibility.** The 5 activity types provide structured update channels for Studio visualization.
5. **SDK is production-ready.** Auto-generated types, pagination helpers, error classes, webhook verification.
6. **Integration Directory listing is feasible.** Sherpa Consulting qualifies as a formal company. Novel governance category would get attention.
7. **10-second response constraint shapes architecture.** Need immediate `thought` activity, async governance processing, then `response`/`error`.
8. **Built-in automations handle the simple cases.** Don't compete with state transitions and auto-assign — Sherpa's value is the layer above.
9. **Token management needs planning.** 24-hour access tokens with refresh, or 30-day client credentials for VPS service.

## Open Questions

1. Can agents read/write custom fields (when/if they exist)?
2. GA timeline for Agent API? Risk of breaking changes?
3. Can agents intercept state transitions or only react after the fact?
4. `promptContext` size limits for large issues?
5. Can agents create other agents' sessions (pipeline delegation)?
6. Agent Guidance character limit? Can it contain structured data (YAML/JSON)?
7. Multi-workspace support — per-workspace configuration strategy?
8. Billing model for marketplace agents? Revenue share?
