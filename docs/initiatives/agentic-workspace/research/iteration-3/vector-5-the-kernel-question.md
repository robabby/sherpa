# Vector 5: What's the "Kernel" Equivalent?

**Question:** If there's an agent OS, what's the minimal core that everything else builds on? Is it MCP? The IDE? The filesystem?

## Key Discoveries

### Candidate Kernels

#### 1. MCP as Kernel

**Case for:** MCP has achieved the most adoption of any agent infrastructure primitive — 97M+ monthly SDK downloads, adopted by every major provider (Anthropic, OpenAI, Google, Microsoft, AWS). Donated to the Linux Foundation's AAIF. Provides the universal interface between agents and tools.

**Case against:** MCP is a tool-access protocol, not a coordination or governance layer. The 2026 roadmap explicitly scopes MCP as transport + tool discovery. It does not handle agent identity, state persistence, scheduling, or governance. The roadmap says "MCP will not add new official transports this cycle" — it's deliberately staying narrow.

**Verdict:** MCP is the **syscall ABI**, not the kernel. Like POSIX, it standardizes how applications call services without being the scheduler, memory manager, or process model.

- [MCP 2026 Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP Official](https://modelcontextprotocol.io/)
- [MCP Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [AAIF announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)

#### 2. The IDE as Kernel

**Case for:** VS Code 1.109-1.110 runs Claude, Codex, and Copilot simultaneously. It manages agent sessions, provides the workspace context, and hosts the execution environment. For developer-facing agents, the IDE IS the runtime.

**Case against:** IDEs only handle developer workflows. Enterprise agents (customer service, marketing, sales, operations) don't run in IDEs. The IDE kernel thesis only works for the "software engineering agent" vertical.

**Verdict:** The IDE is a **user-space shell**, not the kernel. It's the primary interface for a specific class of users, but not the foundational runtime.

- [VS Code multi-agent](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [VS Code 1.110](https://visualstudiomagazine.com/articles/2026/03/04/vs-code-1-110-ships-with-agent-plugins-browser-tools-and-session-memory.aspx)

#### 3. The Filesystem as Kernel

**Case for:** Every convergent design uses the filesystem: CLAUDE.md, AGENTS.md, SOUL.md, .cursorrules, git worktrees, proposal files, session transcripts (JSONL). Claude Code writes tasks to `~/.claude/tasks`. Devin uses knowledge/playbooks. OpenClaw's memory is append-only daily markdown logs. The filesystem is the universal state substrate.

**Case against:** The filesystem is a substrate, not an orchestrator. It doesn't schedule, enforce policies, or manage identity. You need something to read the filesystem and act on it.

**Verdict:** The filesystem is the **disk**, not the kernel — the persistence layer that every kernel needs but that doesn't make decisions.

- [VentureBeat on Claude Code Tasks](https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across)
- [AGENTS.md](https://agents.md/)
- [OpenClaw architecture](https://medium.com/@Micheal-Lanham/210-000-github-stars-in-10-days-what-openclaws-architecture-teaches-us-about-building-personal-ai-dae040fab58f)

#### 4. The LLM Itself as Kernel

**Case for:** The LLM performs the core "kernel" functions: it reads context (filesystem), makes decisions (scheduling), interprets conventions (governance), and calls tools (execution). AIOS proposes the Agent Kernel as an LLM resource scheduler — multiplexing context windows and token budgets like a CPU scheduler multiplexes time slices.

**Case against:** LLMs are non-deterministic. Traditional kernels are deterministic — the scheduler produces predictable, reproducible results. An LLM "kernel" can't guarantee policy enforcement (the SOUL.md bypass problem).

**Verdict:** The LLM is the **CPU** — the compute unit that the kernel schedules, not the kernel itself. The kernel must be deterministic; the compute unit need not be.

- [AIOS paper](https://arxiv.org/abs/2403.16971)

#### 5. The Protocol Stack as Kernel

**Case for:** The four-protocol stack (MCP + A2A + AG-UI + WebMCP) collectively provides tool access, agent-to-agent communication, UI rendering, and web integration. Together, they're a complete IPC layer.

**Case against:** Protocols are interfaces, not implementations. HTTP, TCP/IP, and DNS are the internet's protocol stack, but nobody calls them the "operating system."

**Verdict:** The protocol stack is the **network layer** — essential infrastructure, but not the kernel.

- [Protocol comparison](https://getstream.io/blog/ai-agent-protocols/)
- [A2A protocol](https://a2a-protocol.org/latest/)
- [Protocol survey](https://arxiv.org/abs/2505.02279)

#### 6. The Convention System as Kernel

**Case for:** Conventions (CLAUDE.md, AGENTS.md, behavioral definitions, initiative lifecycle, approval workflows) define what agents should do, what they're allowed to do, and how they coordinate. This is governance in the broadest sense — the set of rules the system operates under. In human organizations, the governance framework IS the operating system.

**Case against:** Convention systems have no enforcement mechanism. They rely on LLM compliance, which research shows is unreliable against adversarial inputs. A kernel without enforcement is an advisory document, not an OS.

**Verdict:** Convention systems are the **constitution** — the governance framework that the kernel enforces. Without an enforcement mechanism, they're necessary but not sufficient.

### What the Research Actually Points To

The kernel question may be wrong. Traditional OS kernels combine:
- **Policy** (what should happen) — scheduling algorithms, access control rules
- **Mechanism** (how it happens) — context switching, page tables, syscall dispatch

For agent systems, these are separating:
- **Policy** lives in convention files (CLAUDE.md, AGENTS.md, behavioral definitions, SOUL.md)
- **Mechanism** lives in runtimes (AWS AgentCore, K8s Agent Sandbox, Docker containers, IDE Shadow Workspaces)

The "kernel" may not be a single component but the **binding layer** between policy and mechanism — the thing that reads conventions and enforces them through runtime boundaries.

### The AgenticOS Workshop Framing

The ASPLOS 2026 workshop explicitly asks: what are the right kernel primitives for agent workloads? Their list:

- Novel OS abstractions for agent execution
- Dynamic sandboxing and lightweight runtimes
- Semantics-aware scheduling for multi-agent workloads
- Long-lived state abstractions for agent context and memory
- eBPF extensions for observability and constraint enforcement
- Security and isolation for agent-invoked tools

This is a traditional systems-research framing — extending Linux kernel abstractions for agent workloads. It assumes the kernel IS the OS kernel (Linux) with agent-specific extensions.

- [AgenticOS Workshop](https://os-for-agent.github.io/)

## Synthesis

There is no consensus "kernel" for the agent OS. Instead, there are six candidate components, each analogous to a different part of a traditional OS:

| Agent OS Component | Traditional OS Analog | Current Leader |
|---|---|---|
| MCP | Syscall ABI / POSIX | MCP (97M downloads, AAIF) |
| IDE | User-space shell | VS Code (multi-agent hub) |
| Filesystem conventions | Disk / persistence layer | CLAUDE.md / AGENTS.md ecosystem |
| LLM | CPU | Frontier models (Claude, GPT, Gemini) |
| Protocol stack | Network layer | MCP + A2A + AG-UI + WebMCP |
| Convention system | Constitution / policy framework | Sherpa (most complete), OpenClaw SOUL.md |

The "kernel" is likely the **enforcement layer** that binds policy (conventions) to mechanism (runtime) — something that doesn't fully exist yet. The closest projects:
- Agent OS (imran-siddique): policy enforcement kernel with sub-ms interception
- Splendor: kernel-grade runtime with six primitives
- LGA paper: four-layer defense-in-depth architecture

## Implications for Sherpa

Sherpa owns the "constitution" layer — the governance framework that defines policy. The kernel question for Sherpa is: **does Sherpa need to build enforcement mechanisms, or does it remain a policy-only layer that plugs into enforcement mechanisms built by others?**

Arguments for policy-only:
- Separation of concerns (like OPA — policy engine, not runtime)
- Framework model works across heterogeneous runtimes
- Simpler to maintain and distribute

Arguments for enforcement:
- Convention-only governance is bypassed by prompt injection
- Production-grade governance requires hard boundaries
- The governance market values enforcement ($4.83B by 2034)

The Agent OS kernel may end up looking like: `MCP (tool syscalls) + Convention system (policy) + Enforcement layer (mechanism) + State persistence (filesystem)`. Sherpa already owns the convention system. The question is whether to build or integrate the enforcement layer.

## All URLs Encountered

- http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
- https://modelcontextprotocol.io/
- https://en.wikipedia.org/wiki/Model_Context_Protocol
- https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
- https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation
- https://openai.com/index/agentic-ai-foundation/
- https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation
- https://aaif.io/
- http://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/
- https://www.credal.ai/blog/what-is-the-agentic-artificial-intelligence-foundation-aaif
- https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development
- https://visualstudiomagazine.com/articles/2026/03/04/vs-code-1-110-ships-with-agent-plugins-browser-tools-and-session-memory.aspx
- https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across
- https://agents.md/
- https://medium.com/@Micheal-Lanham/210-000-github-stars-in-10-days-what-openclaws-architecture-teaches-us-about-building-personal-ai-dae040fab58f
- https://arxiv.org/abs/2403.16971
- https://os-for-agent.github.io/
- https://getstream.io/blog/ai-agent-protocols/
- https://a2a-protocol.org/latest/
- https://arxiv.org/abs/2505.02279
- https://github.com/imran-siddique/agent-os
- https://splendor-os.org
- https://arxiv.org/html/2603.07191
- https://modelcontextprotocol.io/development/roadmap
- https://www.getknit.dev/blog/the-future-of-mcp-roadmap-enhancements-and-whats-next
- https://earezki.com/ai-news/2026-02-21-i-scanned-every-server-in-the-official-mcp-registry-heres-what-i-found/
- https://www.lakera.ai/blog/what-the-new-mcp-specification-means-to-you-and-your-agents
- https://www.truefoundry.com/blog/what-is-mcp-registry-and-why-you-cant-run-agents-without-one
- https://www.solo.io/blog/aaif-announcement-agentgateway
