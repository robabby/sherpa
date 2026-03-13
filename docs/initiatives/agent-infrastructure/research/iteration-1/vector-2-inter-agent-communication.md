# Vector 2: Inter-Agent Communication Protocols

**Question:** What are the practical options for inter-agent communication in a solo-founder AI agent fleet? Compare filesystem-based, MCP-based, A2A protocol, and hybrid approaches.
**Agent dispatched:** 2026-03-06

## Findings

### Google A2A Protocol Status

- Announced April 2025 with 50+ partners. By July 2025 (v0.3): 150+ orgs, gRPC support, signed security cards, Python SDK.
- Google donated A2A to Linux Foundation. IBM's competing ACP protocol merged into A2A (September 2025).
- Reference implementation in Google ADK, Python and TypeScript SDKs. GitHub at [a2aproject/A2A](https://github.com/a2aproject/A2A). AWS Bedrock AgentCore supports A2A natively.
- **But adoption stalled in practice.** Most ecosystem consolidated around MCP. A2A over-engineered for basic needs — agent discovery, capability negotiation, and security cards were overkill for most developers. MCP had Claude integration from day one, giving an immediate testing path.
- Enterprise showcases: Tyson Foods and Gordon Food Service for supply chain coordination — multi-org, multi-vendor scenarios.
- **Key extractable concept — Agent Cards:** JSON metadata at `/.well-known/agent-card.json` describing identity, capabilities, skills, endpoints, and auth requirements.
- **Verdict:** Enterprise multi-org infrastructure. Massive overkill for solo-founder. The Agent Card concept is worth borrowing as a standalone convention.

### MCP for Agent Coordination

- MCP standardizes agent-to-tool communication. **Not designed for agent-to-agent coordination.**
- Microsoft demonstrated that MCP's November 2025 spec additions (resumable streams, elicitation, sampling, progress notifications) provide enough primitives to build agent-to-agent communication. Pattern: orchestrator agents invoke specialist agents exposed as MCP tools.
- Industry consensus: MCP and A2A are complementary. MCP handles intra-agent capability (how an agent uses tools), A2A handles inter-agent coordination (how agents talk to each other).
- December 2025: Anthropic donated MCP to Agentic AI Foundation (AAIF) under Linux Foundation, co-founded with Block and OpenAI.
- **Verdict:** Keep MCP on the platform externalization track. Don't use it for inter-session coordination — it's tool invocation, not peer collaboration.

### Filesystem-Based Agent Coordination

**The five primitives every agent swarm rediscovers** (identified independently by Cursor and Anthropic teams, documented by Alex Lavaee):
1. **Isolation** — Workers execute on their own repository copies, producing structured handoffs
2. **Hierarchical decomposition** — Beyond 3-5 agents, introduce a planner layer that doesn't write code
3. **Coordination via Git** — Don't build custom orchestration; let Git handle synchronization
4. **Ephemeral state** — Processes start fast, die cleanly, carry no irreplaceable state
5. **Eventual consistency** — Git provides this out of the box

**1Password's analysis:** Filesystems scale for agent coordination because they offer a shared, addressable namespace without tight coupling. Every action leaves an auditable trail.

**Claude Code Agent Teams** (experimental, early 2026): One session as team lead coordinates teammates. Each gets its own worktree. Known limitations: no session resumption, task status can lag, one team per session.

**incident.io:** 4-5 Claude Code agents in parallel on separate worktrees. Tasks estimated at 2 hours completing in 10 minutes. Custom worktree manager for instant setup.

**DoltHub:** Central human coordinator breaks work into discrete steps, each agent gets isolated workspace (Docker containers), manual signaling between steps.

**AGENTS.md convention:** Emerging standard for per-project agent instructions. Supported by Claude Code, Cursor, GitHub Copilot. Subdirectory-level scoping.

### Scaling Limits of Filesystem Coordination

**Google Research (December 2025, 180 agent configurations):**
- On parallelizable tasks, centralized coordination improved performance by 80.9% over single agent
- On sequential-dependency tasks, every multi-agent variant degraded performance by 39-70%
- Independent agents amplify errors 17.2x; centralized coordination contains to 4.4x
- Predictive model correctly identifies optimal coordination strategy for 87% of unseen tasks

**Practical scaling numbers:**
- Coordination latency: 200ms with 5 agents → 2 seconds with 50 agents
- Filesystem coordination stable up to dozens of agents before requiring formal coordination
- File locks prevent conflicts but add complexity; without them, race conditions emerge

**The infrastructure gap** (Lavaee): Two dev servers can't bind the same port. No standard mechanism for automatic port allocation across isolated agent environments. Biggest bottleneck isn't model capability — it's the orchestration layer.

**For WavePoint (3-5 agents):** Well within the safe zone. Failure modes start at 10+ agents with shared state. Worktree isolation + proposal-based writes already avoids primary failure modes.

### Lightweight Alternatives to Full A2A

- **ACP (Agent Communication Protocol):** REST-based (simpler than A2A's JSON-RPC). Passive discovery via YAML at well-known URIs. Merged into A2A under Linux Foundation.
- **ANP (Agent Network Protocol):** "DNS for agents" — discovery, naming, resolution. More relevant for cross-org.
- **Agent Cards without A2A:** The JSON capability metadata can be a standalone convention without the full protocol stack. Essentially what WavePoint's workstream files already do in markdown.
- **CLAUDE.md / AGENTS.md as lightweight agent cards:** Already function as capability advertisements for the codebase. Gap: they describe the *codebase*, not the *agent session*.

### Minimum Viable Coordination Protocol (3-5 Sessions)

Four requirements, most already solved:

**1. Isolation (solved):** Git worktrees via `.worktrees/`.

**2. Registry (partially solved):** `docs/workstreams/<slug>.md` lists active work. Gap: updated manually, may be stale.

**3. Claim/signal mechanism (partially solved):** Proposal status lifecycle (pending/approved/in-progress/integrated). Gap: no real-time signaling — agents must poll filesystem.

**4. Conflict prevention (solved):** "Never edit shared artifacts directly" rule prevents merge conflicts.

**What's missing:**
- **Session heartbeat:** `.worktrees/<name>/.agent-status.json` with last-active timestamp, current task, blockers.
- **Task board:** Single file listing available work items with claimed/unclaimed status. Prevents duplicate work.
- **Completion signal:** Explicit "I'm done, here's what I produced" beyond the proposal system.

None require MCP or A2A — they're filesystem conventions.

## Sources

- [Google Developers Blog - A2A](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Launch announcement
- [Google Cloud Blog - A2A Upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade) — v0.3 features
- [Linux Foundation - A2A Project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents) — Governance
- [fka.dev - What happened to A2A](https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/) — Critical adoption assessment
- [fka.dev - Why A2A doesn't make sense](https://blog.fka.dev/blog/2025-04-15-why-googles-a2a-protocol-doesnt-make-sense/) — Design critique
- [A2A Protocol Specification](https://a2a-protocol.org/latest/specification/) — Full spec
- [A2A and MCP - Official](https://a2a-protocol.org/latest/topics/a2a-and-mcp/) — Complementary relationship
- [Auth0 - MCP vs A2A](https://auth0.com/blog/mcp-vs-a2a/) — Comparison
- [Microsoft - A2A on MCP](https://developer.microsoft.com/blog/can-you-build-agent2agent-communication-on-mcp-yes) — MCP as A2A substrate
- [Alex Lavaee - Five Primitives](https://alexlavaee.me/blog/five-primitives-agent-swarms/) — Agent swarm convergent design
- [Alex Lavaee - Infrastructure Gap](https://alexlavaee.me/blog/parallel-agent-sessions-infrastructure-gap/) — Scaling bottlenecks
- [1Password - Filesystems for Agent Swarms](https://1password.com/blog/filesystems-for-agent-swarms) — Filesystem coordination analysis
- [Google Research - Scaling Agent Systems](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) — 180-config study
- [arXiv - Scaling Agent Systems](https://arxiv.org/abs/2512.08296) — Full paper
- [incident.io - Shipping Faster](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees) — Worktree-based multi-agent
- [DoltHub - Multiple Agents](https://www.dolthub.com/blog/2025-08-28-how-i-use-multiple-agents-in-parallel/) — Manual coordination approach
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Built-in multi-agent
- [agents.md](https://agents.md/) — Emerging agent instruction standard
- [GitHub Blog - AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) — Best practices from 2500+ repos
- [DataCamp - CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen) — Framework comparison
- [Fast.io - Agentic Workflow Storage](https://fast.io/resources/agentic-workflow-storage/) — Scaling numbers
- [Pento - A Year of MCP](https://www.pento.ai/blog/a-year-of-mcp-2025-review) — MCP → AAIF transition

## Raw Links

- https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade
- https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents
- https://blog.fka.dev/blog/2025-09-11-what-happened-to-googles-a2a/
- https://blog.fka.dev/blog/2025-04-15-why-googles-a2a-protocol-doesnt-make-sense/
- https://a2a-protocol.org/latest/specification/
- https://a2a-protocol.org/v0.3.0/specification/
- https://a2a-protocol.org/latest/topics/a2a-and-mcp/
- https://github.com/a2aproject/A2A
- https://agent2agent.info/docs/concepts/agentcard/
- https://www.agentcard.net/
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-a2a-protocol-contract.html
- https://www.ibm.com/think/topics/agent2agent-protocol
- https://auth0.com/blog/mcp-vs-a2a/
- https://www.truefoundry.com/blog/mcp-vs-a2a
- https://www.koyeb.com/blog/a2a-and-mcp-start-of-the-ai-agent-protocol-wars
- https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/
- https://www.descope.com/blog/post/mcp-vs-a2a
- https://akka.io/blog/mcp-a2a-acp-what-does-it-all-mean
- https://dotsquarelab.com/resources/acp-and-a2a-united
- https://developer.microsoft.com/blog/can-you-build-agent2agent-communication-on-mcp-yes
- https://azure.microsoft.com/en-us/blog/agent-factory-connecting-agents-apps-and-data-with-new-open-standards-like-mcp-and-a2a/
- https://camunda.com/blog/2025/05/mcp-acp-a2a-growing-world-inter-agent-communication/
- https://en.wikipedia.org/wiki/Model_Context_Protocol
- https://modelcontextprotocol.io/specification/2025-11-25
- http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/
- https://www.pento.ai/blog/a-year-of-mcp-2025-review
- https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen
- https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared
- https://composio.dev/blog/openai-agents-sdk-vs-langgraph-vs-autogen-vs-crewai
- https://alexlavaee.me/blog/five-primitives-agent-swarms/
- https://alexlavaee.me/blog/parallel-agent-sessions-infrastructure-gap/
- https://alexlavaee.me/blog/new-sdlc-agentic-engineering/
- https://1password.com/blog/filesystems-for-agent-swarms
- https://1password.com/blog/how-to-build-secure-agent-swarms-that-power-autonomous-systems
- https://fast.io/resources/agentic-workflow-storage/
- https://fast.io/resources/ai-agent-rate-limiting/
- https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/
- https://arxiv.org/abs/2512.08296
- https://fortune.com/2025/12/16/google-researchers-ai-agents-multi-agent-getting-them-to-work/
- https://code.claude.com/docs/en/agent-teams
- https://claudefa.st/blog/guide/agents/agent-teams
- https://addyosmani.com/blog/claude-code-agent-teams/
- https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees
- https://www.dolthub.com/blog/2025-08-28-how-i-use-multiple-agents-in-parallel/
- https://www.dolthub.com/blog/2025-09-24-berkeley-cs-agents-need-branches/
- https://www.dolthub.com/blog/2025-08-05-agent-dot-md/
- https://www.dolthub.com/blog/2025-09-08-agentic-ai-three-pillars/
- https://www.dolthub.com/blog/2026-01-22-agentic-memory/
- https://agents.md/
- https://github.com/agentsmd/agents.md
- https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- https://www.infoq.com/news/2025/08/agents-md/
- https://www.solo.io/blog/agent-discovery-naming-and-resolution---the-missing-pieces-to-a2a
- https://www.adopt.ai/blog/mcp-vs-a2a-in-practice
- https://dev.to/datadeer/part-2-running-multiple-claude-code-sessions-in-parallel-with-git-worktree-165i
- https://www.dandoescode.com/blog/parallel-vibe-coding-with-git-worktrees
- https://github.com/anthropics/claude-code/issues/20875
- https://www.ksred.com/building-ccswitch-managing-multiple-claude-code-sessions-without-the-chaos/
- https://github.com/kbwo/ccmanager
- https://github.com/nwiizo/ccswarm
- https://github.com/dsifry/metaswarm
- https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea
- https://arxiv.org/html/2505.02279v1
- https://arxiv.org/pdf/2510.17149
- https://arxiv.org/pdf/2506.01804
- https://www.infoq.com/news/2026/03/google-multi-agent/
- https://www.infoq.com/news/2026/02/google-agent-scaling-principles/
- https://arxiv.org/html/2508.12683
- https://www.swarmtools.ai/
- https://github.com/openai/swarm
- https://vibehackers.io/blog/git-worktrees-multi-agent-development
- https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/

## Implications

1. **WavePoint's current approach is well-calibrated.** Filesystem + git worktree + proposal convention is the same pattern Cursor, Anthropic, incident.io, and DoltHub independently converged on.
2. **Don't adopt A2A.** Enterprise multi-org infrastructure, overkill for solo-founder. Borrow the Agent Card concept as a simple JSON/YAML convention.
3. **MCP is for tool access, not agent coordination.** Keep on platform externalization track.
4. **Claude Code Agent Teams is the most relevant new capability** but experimental with known limitations. Monitor, don't build around.
5. **Highest-value investment is incremental:** Add session heartbeats and lightweight task board to existing filesystem convention. Closes remaining gaps without protocol overhead.
6. **Google's scaling research validates the approach:** At 3-5 agents, centralized coordination (human as team lead) with isolated parallel agents is optimal.

## Open Questions

1. **Claude Code Agent Teams maturation timeline:** When will session resumption and reliable task status be production-ready?
2. **Structured vs. markdown for coordination files:** Would JSON/YAML improve agent parsing while keeping markdown for narrative?
3. **Heartbeat implementation:** Timer-based files or implicit via git commit timestamps?
4. **Integration review automation:** File-watcher or git hook to trigger review when proposals accumulate?
5. **Re-evaluation threshold:** At what agent count (10+?) should WavePoint revisit filesystem coordination?
