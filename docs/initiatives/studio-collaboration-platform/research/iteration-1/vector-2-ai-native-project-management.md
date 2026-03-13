# Vector 2: AI-Native Project Management

**Question:** How do modern PM tools handle AI-native workflows where AI agents are workers? What patterns exist for task boards designed for human+AI collaboration?
**Agent dispatched:** 2026-03-09

## Findings

### Linear: "Self-Driving Product Operations"

- **Triage Intelligence** auto-suggests assignees, teams, labels, and projects using historical patterns. Configurable auto-apply. Uses GPT-5 and Gemini 2.5 Pro. [Triage Intelligence docs](https://linear.app/docs/triage-intelligence)
- **AI Agents as teammates** — "build and deploy AI agents that work alongside you as teammates" handling entire issues end-to-end. [Linear AI](https://linear.app/ai)
- **Linear MCP** connects with Cursor, Claude, ChatGPT. [Linear AI](https://linear.app/ai)
- **Pulse Updates** — AI-generated daily/weekly project summaries as text or audio. [Linear AI](https://linear.app/ai)
- **Linear Intake** — self-driving product operations for request routing. [Linear Intake](https://linear.app/intake)

### Height.app: The Cautionary Tale

- **Shut down September 24, 2025.** The most AI-native PM tool failed commercially. [Post-mortem](https://skywork.ai/skypage/en/Height-App-The-Rise-and-Sunset-of-an-AI-Project-Management-Pioneer/1975012339164966912)
- Before shutdown: auto-prioritized bugs, Copilot subtask creation, AI-generated async standups, real-time project tracking.
- **Lesson:** Being "AI-native" is not a moat. Height's features are now table stakes in Linear, Plane, and Shortcut.

### Plane.so: Open-Source with Native MCP Server

- **Built around AI from inception** — "not retrofitted for AI." [Plane](https://plane.so)
- **Native MCP server** — official, open-source, multiple transport methods. Agents create/update/track issues programmatically. [MCP docs](https://developers.plane.so/dev-tools/mcp-server)
- **Built-in agents** for triage, owner assignment, blocker tracking, shipping updates.
- **Self-hostable** under AGPL-3.0. Most relevant to WavePoint because of self-hosting + MCP + agent-first design.

### Devin: The AI Coding Agent Dashboard

- **Session-based, not board-based** — each task is a sandboxed "session" with terminal, editor, browser. [Devin guide](https://aitoolsdevpro.com/ai-tools/devin-guide/)
- **Favicon status dots** — green (working), orange (waiting-for-you). Minimal but effective. [Devin docs](https://docs.devin.ai/release-notes/overview)
- **Batch sessions indented under parent** in sidebar — hierarchical task view.
- **Auto-wake** on PR comments or lint failures.
- **Slack-first workflow** — Devin comments on tickets with step-by-step plan + confidence estimate. Human replies "Yes." Devin posts "Merged" when done. [How Cognition Uses Devin](https://cognition.ai/blog/how-cognition-uses-devin-to-build-devin)
- **Key insight:** Status is binary (working / waiting-for-you), not columnar. No kanban.

### Factory.ai: AI Project Manager

- **Droids** embed into IDE, Web, CLI, Slack, Linear. [Factory.ai](https://factory.ai)
- **Auto-triggered from issue assignment** — agents pull context, implement, create PRs with full ticket-to-code traceability. [Factory PM](https://factory.ai/product/ai-project-manager)

### Codegen (ClickUp-acquired)

- **ClickUp acquired Codegen** late 2025. Standalone sunsetted Jan 2026. [Acquisition](https://news.designrush.com/clickup-moves-beyond-work-management-codegen-ai-agents)
- **Key signal:** PM tools are acquiring coding agent companies. The market is converging.

### Workflow Orchestration UIs

**Temporal:** Timeline View — events in time, color-coded, position shows parallelism. Compact view and Full History view. [Blog](https://temporal.io/blog/lets-visualize-a-workflow)

**Inngest:** Visual function timeline, step-level observability, Workflow Kit (open-source React components). 2025 redesign optimized for agentic AI workflows. [Inngest](https://www.inngest.com/)

**Trigger.dev:** Human-in-the-loop waitpoints — pause execution until human completes or timeout. Run metadata updates as runs progress. [HITL guide](https://trigger.dev/docs/guides/example-projects/human-in-the-loop-workflow)

### Microsoft Magentic-UI (Research Prototype)

- **Six interaction mechanisms:** co-planning, co-tasking, multi-tasking, action guards, plan saving, long-term memory. [Paper](https://arxiv.org/abs/2507.22358)
- **Co-planning** — user modifies agent's plan via plan editor or textual feedback before execution.
- **Action guards** — configurable approval frequency for irreversible actions.
- Uses MCP for extensibility. [GitHub](https://github.com/microsoft/magentic-ui)

### Anthropic's Multi-Agent Research System

- **Orchestrator-worker pattern:** Opus 4 decomposes queries, spawns Sonnet 4 subagents in parallel. [Blog](https://www.anthropic.com/engineering/multi-agent-research-system)
- **15x token cost** vs. single-agent. Multi-agent is for high-value tasks only.
- **Key lesson:** Without detailed task descriptions, agents duplicate work, leave gaps, or fail.

### Claude Code Agent Teams

- **TeammateTool** — 13 operations with defined schemas. Shipped with Opus 4.6. [Docs](https://code.claude.com/docs/en/agent-teams)
- **Shared task list** with dependency tracking, inbox messaging, self-claim.
- **Planner/Worker/Judge is the established pattern.** [Guide](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)

### Agentic UX Design Patterns

**Smashing Magazine's six lifecycle patterns (Feb 2026):**
- Pre-Action: Intent Preview, Autonomy Dial
- In-Action: Explainable Rationale, Confidence Signal
- Post-Action: Action Audit & Undo, Escalation Pathway
- [Source](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/)

**UX Magazine:** "When agents run in the background, users orchestrate AI work more. Task-oriented UIs emphasize the work, the plan, the tasks — the outcome, instead of the chat input." [Source](https://uxmag.com/articles/secrets-of-agentic-ux-emerging-design-patterns-for-human-interaction-with-ai-agents)

## Sources

- [Linear AI](https://linear.app/ai) — AI agents, triage intelligence, Pulse updates
- [Linear Triage Intelligence](https://linear.app/docs/triage-intelligence) — Auto-suggest for assignees, labels, projects
- [Height Shutdown Post-mortem](https://skywork.ai/skypage/en/Height-App-The-Rise-and-Sunset-of-an-AI-Project-Management-Pioneer/1975012339164966912)
- [Plane MCP Server](https://developers.plane.so/dev-tools/mcp-server) — Open-source agent-first PM
- [Devin Docs](https://docs.devin.ai/release-notes/overview) — Session-based AI agent dashboard
- [Cognition: How they use Devin](https://cognition.ai/blog/how-cognition-uses-devin-to-build-devin) — Slack-first workflow
- [Factory.ai PM](https://factory.ai/product/ai-project-manager) — Auto-triggered from issue assignment
- [Temporal Timeline View](https://temporal.io/blog/lets-visualize-a-workflow) — Workflow visualization
- [Trigger.dev HITL](https://trigger.dev/docs/guides/example-projects/human-in-the-loop-workflow) — Waitpoints
- [Magentic-UI](https://arxiv.org/abs/2507.22358) — Co-planning, action guards
- [Anthropic Multi-Agent](https://www.anthropic.com/engineering/multi-agent-research-system) — Orchestrator-worker pattern
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — TeammateTool, shared task list
- [Smashing Mag Agentic UX](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/) — Six lifecycle patterns
- [UX Mag Agentic UX](https://uxmag.com/articles/secrets-of-agentic-ux-emerging-design-patterns-for-human-interaction-with-ai-agents) — Task-oriented UIs

## Raw Links

- https://linear.app/ai
- https://linear.app/docs/triage-intelligence
- https://linear.app/now/how-we-built-triage-intelligence
- https://linear.app/changelog/2025-09-19-auto-apply-triage-suggestions
- https://linear.app/changelog/2025-08-14-product-intelligence-technology-preview
- https://linear.app/intake
- https://x.com/height_app/status/1903820182557999555
- https://skywork.ai/skypage/en/Height-App-The-Rise-and-Sunset-of-an-AI-Project-Management-Pioneer/1975012339164966912
- https://height.app/autonomous
- https://plane.so
- https://developers.plane.so/dev-tools/mcp-server
- https://github.com/makeplane/plane-mcp-server
- https://plane.so/open-source
- https://efficient.app/apps/shortcut
- https://cognition.ai/blog/devin-2
- https://docs.devin.ai/release-notes/overview
- https://aitoolsdevpro.com/ai-tools/devin-guide/
- https://cognition.ai/blog/how-cognition-uses-devin-to-build-devin
- https://factory.ai
- https://factory.ai/product/ai-project-manager
- https://codegen.com/
- https://news.designrush.com/clickup-moves-beyond-work-management-codegen-ai-agents
- https://temporal.io/blog/lets-visualize-a-workflow
- https://temporal.io/blog/the-dark-magic-of-workflow-exploration
- https://www.inngest.com/
- https://github.com/inngest/workflow-kit
- https://trigger.dev/
- https://trigger.dev/docs/guides/example-projects/human-in-the-loop-workflow
- https://trigger.dev/blog/our-roadmap-for-the-next-3-months
- https://crewai.com/
- https://docs.crewai.com/en/concepts/tasks
- https://www.microsoft.com/en-us/research/blog/magentic-ui-an-experimental-human-centered-web-agent/
- https://arxiv.org/abs/2507.22358
- https://github.com/microsoft/magentic-ui
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://code.claude.com/docs/en/agent-teams
- https://claudefa.st/blog/guide/agents/agent-teams
- https://claudefa.st/blog/guide/agents/async-workflows
- https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide
- https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/
- https://uxmag.com/articles/secrets-of-agentic-ux-emerging-design-patterns-for-human-interaction-with-ai-agents
- https://microsoft.design/articles/ux-design-for-agents/
- https://dailystack.ai/
- https://addyosmani.com/blog/ai-coding-workflow/

## Implications

1. **The board metaphor is dying for AI work.** Devin uses sessions, Factory uses ticket integration. Status-oriented (working/waiting-for-you/done/failed), not column-oriented.
2. **Filesystem-based task queues are valid.** Claude Code Agent Teams uses directory structures and file-based task lists.
3. **The morning review is an established pattern.** Linear Pulse, DailyStack — async AI work with human review at a fixed cadence.
4. **Plan visibility is critical.** Magentic-UI's co-planning, Anthropic's emphasis on detailed task descriptions.
5. **Workflow orchestration UIs (Temporal, Inngest, Trigger.dev) are the closest analog** — not PM tools.
6. **Height's shutdown is a warning:** AI-native PM as standalone product failed. As internal tool, economics differ.

## Open Questions

1. Is a visual task board even needed, or is a lightweight status page sufficient?
2. What metrics matter for AI worker management? (Token consumption, execution time, task distribution, tool efficiency)
3. How granular should plan editing be?
4. Should the task pipeline integrate with Linear/Plane via MCP?
5. Should the morning review be push or pull?
