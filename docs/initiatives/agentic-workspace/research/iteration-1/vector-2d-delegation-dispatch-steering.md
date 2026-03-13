# Vector 4: Delegation, Dispatch, and Steering Interfaces

**Question:** How do you tell an agent what to do? How do you redirect it mid-task? What UX patterns exist for configuring autonomy levels?

## Delegation Models

### Issue-Based Delegation
The most common pattern: assign a GitHub issue to an agent, agent creates a branch, works, and opens a PR.

- **GitHub Copilot** — assign issue to Copilot from the sidebar, or click "Delegate to coding agent" from VS Code chat. Agent spins up ephemeral dev environment, creates branch, opens PR. ([GitHub Agents](https://github.com/features/copilot/agents))
- **Linear** — delegation is distinct from assignment. "Delegation is a form of assignment used with agents, allowing them to take action on an issue while the assigned teammate maintains ownership." Human remains primary assignee; agent is added as contributor. ([Linear Docs - Assigning](https://linear.app/docs/assigning-issues))
- **Factory.ai** — auto-triggers from issue assignment. No separate delegation step needed. ([NEA Blog](https://www.nea.com/blog/factory-the-platform-for-agent-native-development))

### Natural Language Delegation
Direct prompting in chat or terminal.

- **Claude Code** — type a prompt in the terminal, agent works in the current project
- **Devin** — @mention Devin in Slack with natural language requests ("can you pull yesterday's sales by channel?") ([Cognition Performance Review](https://cognition.ai/blog/devin-annual-performance-review-2025))
- **Amazon Q** — natural language in IDE chat; agent analyzes codebase, creates implementation plan, executes. Autonomous exit logic prevents unproductive paths. ([AWS Blog](https://aws.amazon.com/blogs/devops/reinventing-the-amazon-q-developer-agent-for-software-development/))

### Spec-Driven Delegation
Requirements documents as the delegation mechanism.

- **Kiro** — takes natural language prompt, generates requirements in EARS notation with acceptance criteria. Then generates design (architecture, system design, tech stack). Then creates implementation plan with sequenced tasks. ([Kiro.dev](https://kiro.dev/))
- **Spec Kit** — GitHub's approach to spec-driven development via structured markdown files. ([Martin Fowler - SDD Tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html))
- **skills.md / agents.md** — convention files that define reusable agent behaviors, adopted by Claude Code, Codex, and GitHub Copilot. ([Kiro Blog](https://kiro.dev/blog/from-chat-to-specs-deep-dive/))

### Orchestrator Delegation
A lead agent delegates to subordinate agents.

- **Claude Code Agent Teams** — lead agent spawns teammates, assigns tasks from shared list. Teammates claim tasks and message each other. ([Claude Code Docs](https://code.claude.com/docs/en/agent-teams))
- **Composio Agent Orchestrator** — Planner layer decomposes objectives into verifiable sub-tasks, spawns worker agents. ([GitHub](https://github.com/ComposioHQ/agent-orchestrator))
- **VS Code Subagents** — #runSubagent tool spawns isolated context instances. Multiple subagents run concurrently. ([VS Code Docs](https://code.visualstudio.com/docs/copilot/agents/subagents))

## Mid-Task Steering

### Pause / Refine / Restart
GitHub Mission Control provides three intervention mechanisms during active runs: pause (halt without termination), refinement prompts (corrected instructions mid-task), and restart (relaunch with improved direction). "Catch a problem five minutes in, and you might save an hour of ineffective work." ([GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/))

### Collaborative Plan Editing
Magentic-UI's co-planning lets humans edit agent plans before execution — the human modifies the plan, then the agent executes the revised version. This is the critical human-in-the-loop differentiator from iteration 1 research. ([Magentic-UI Paper](https://arxiv.org/abs/2507.22358))

### Kiro Hooks
Event-driven automations that trigger agents in the background when you save, create, or delete files. The agent acts as a background reviewer, catching issues without interrupting flow. ([Kiro.dev](https://kiro.dev/))

### Comment-Based Steering
Both Devin and GitHub Copilot coding agent accept mid-task corrections via PR comments. The human adds a comment, the agent reads it and adjusts course. ([Cognition Performance Review](https://cognition.ai/blog/devin-annual-performance-review-2025))

## Autonomy Configuration

### Tiered Trust Models

**"Human-in-the-Loop" to "Human-on-the-Loop":**
The industry is shifting from requiring human approval for every action to exception-based oversight. ([ByteBridge - Evolving Autonomy](https://bytebridge.medium.com/from-human-in-the-loop-to-human-on-the-loop-evolving-ai-agent-autonomy-c0ae62c3bf91))

**Permit.io's action-to-decision mapping:**
Configure a mapping of tool actions to decision types (auto-approve, require-approval, deny). Middleware interrupts execution when a tool call matches a sensitive action. ([Permit.io Blog](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo))

**Poolside's gated autonomy:**
Agent proposes changes, but the human must explicitly review and allow execution of commands (build, test scripts). The agent never runs without permission. ([Poolside via Sacra](https://sacra.com/c/poolside/))

### Confidence-Based Routing
From iteration 1 research, reinforced here: Green/Amber/Red lane model where high-confidence auto-approves with sampling, amber routes to review, red blocks. This is the standard across manufacturing QA (Review by Exception), financial services, and now agent systems. ([All Days Tech](https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows))

### Asynchronous Authorization
"AI agent can request authorization and continue its work while waiting for a response." Non-blocking approval. ([Auth0 Blog](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/))

### The 10 Developer Demands (RedMonk)

RedMonk's survey of agentic IDE users found these as the top UX demands: ([RedMonk](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/))

1. **Background agents** — queue tasks, return to review completed PRs
2. **Persistent memory** — session-spanning context retention
3. **Predictable pricing** — show token usage per prompt, clear spending limits
4. **MCP integration** — zero-configuration tool connections
5. **Multi-agent orchestration** — parallel dashboard with pause/redirect/terminate
6. **Spec-driven development** — requirements-as-contract documentation
7. **Reliability** — consistent, production-grade performance over impressive demos
8. **Human-in-the-loop controls** — configurable autonomy gates, least-privilege permissions
9. **Rollbacks/checkpoints** — snapshot-based state recovery (beyond git)
10. **Skills** — packaged, shareable, version-controlled workflow modules

## Notification Design

### When Should an Agent Interrupt?

No product has fully solved this. Current approaches:

- **Devin** — Slack notifications for completion or blocking. Workflow sits in an "awkward middle — too slow to watch in real time, yet fast enough to interrupt deeper focus work." ([Scott Logic](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html))
- **AI notification management** — ML models learn from user behavior (who you respond to quickly gets priority). Context, sender relationships, and temporal patterns determine interrupt-worthiness. ([SentaSight](https://www.sentisight.ai/ai-manages-digital-notification-chaos/))
- **Exception-only interruption** — only notify on failures, blocks requiring input, or anomalies. Success is silent. ([Pando.ai](https://pando.ai/blogs/the-exception-management-revolution-from-15-hour-queues-to-1-hour-weekly-reviews))
- **Quiet hours / do-not-disturb** — agents respect focus time and adjust delivery. ([ShiftMag](https://shiftmag.dev/notifications-could-be-smarter-with-ai-so-why-arent-they-7087/))

### Notification Categories for Agent Work

1. **Needs your input** (highest priority) — agent is blocked, waiting for decision
2. **Failed** (high priority) — agent errored, needs debugging
3. **Completed for review** (medium priority) — batch into morning review
4. **Progress update** (low priority) — suppress unless explicitly requested
5. **Success confirmation** (minimal) — silent by default, optional digest

## Implications for Sherpa Studio

1. **Three delegation paths** — issue-based (from initiative/task board), natural language (chat), and spec-driven (via proposal/plan documents)
2. **Sherpa's initiative system IS the spec** — proposals and plans already contain the requirements that agents need
3. **Linear's delegation-vs-assignment distinction is essential** — humans own initiatives, agents are delegated tasks within them
4. **Notification design should match exception-first philosophy** — only blocks and failures interrupt; successes batch into morning review
5. **Steering files** — Sherpa's `.claude/rules/` convention already implements Kiro's "steering" concept
6. **Skills as reusable delegation** — Sherpa's `/rr`, `/integration-review`, `/plan-tasks` are already the "Skills" pattern that RedMonk identified as #10

## Sources

- [GitHub Agents](https://github.com/features/copilot/agents)
- [GitHub Mission Control Orchestration](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)
- [Linear Docs - Assigning Issues](https://linear.app/docs/assigning-issues)
- [Linear Auto-Apply Triage](https://linear.app/changelog/2025-09-19-auto-apply-triage-suggestions)
- [Linear Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence)
- [NEA Blog - Factory](https://www.nea.com/blog/factory-the-platform-for-agent-native-development)
- [Cognition Devin Performance Review](https://cognition.ai/blog/devin-annual-performance-review-2025)
- [AWS Q Developer](https://aws.amazon.com/blogs/devops/reinventing-the-amazon-q-developer-agent-for-software-development/)
- [Kiro.dev](https://kiro.dev/)
- [Kiro - From Chat to Specs](https://kiro.dev/blog/from-chat-to-specs-deep-dive/)
- [Martin Fowler - SDD Tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [VS Code Subagents](https://code.visualstudio.com/docs/copilot/agents/subagents)
- [Magentic-UI Paper](https://arxiv.org/abs/2507.22358)
- [Permit.io HITL](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo)
- [Auth0 - Secure HITL](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/)
- [ByteBridge - Evolving Autonomy](https://bytebridge.medium.com/from-human-in-the-loop-to-human-on-the-loop-evolving-ai-agent-autonomy-c0ae62c3bf91)
- [RedMonk - 10 Things Developers Want](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/)
- [SentaSight - AI Notification Management](https://www.sentisight.ai/ai-manages-digital-notification-chaos/)
- [Pando.ai - Exception Management Revolution](https://pando.ai/blogs/the-exception-management-revolution-from-15-hour-queues-to-1-hour-weekly-reviews)
- [ShiftMag - Smarter Notifications](https://shiftmag.dev/notifications-could-be-smarter-with-ai-so-why-arent-they-7087/)
- [Scott Logic - Devin Review](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html)
- [Sacra - Poolside](https://sacra.com/c/poolside/)
