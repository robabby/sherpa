# MCP Core Primitives & Coordination Mapping

**Research date:** 2026-03-11
**Spec version analyzed:** 2025-11-25 (latest as of this research)
**Spec source:** https://modelcontextprotocol.io/specification/2025-11-25

---

## Key Discoveries

### Spec Version & Architecture

- **Current spec version is `2025-11-25`**, released on MCP's first anniversary. Previous versions: `2025-06-18`, `2025-03-26`, `2024-11-05`. ([Spec landing page](https://modelcontextprotocol.io/specification/2025-11-25), [Changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog))
- MCP uses **JSON-RPC 2.0** over stateful connections between Hosts, Clients, and Servers. ([Base protocol](https://modelcontextprotocol.io/specification/2025-11-25/basic))
- Architecture is **client-server with capability negotiation** at initialization. Both sides declare what they support; only negotiated features are used. ([Lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle))
- In December 2025, Anthropic donated MCP to the **Agentic AI Foundation (AAIF)** under the Linux Foundation. ([Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol))

### The Six Primitives

MCP defines **three server-side primitives** and **three client-side primitives**:

**Server-side (server exposes to client):**
1. **Resources** -- data/context for the user or AI model
2. **Tools** -- functions the AI model can execute
3. **Prompts** -- templated messages and workflows

**Client-side (client exposes to server):**
4. **Sampling** -- server requests LLM completions from the client
5. **Roots** -- server queries filesystem/URI boundaries
6. **Elicitation** -- server requests structured user input

Plus one **experimental primitive** added in 2025-11-25:
7. **Tasks** -- durable async state machines for long-running operations

### Resources: Read-Only with Subscriptions

- Resources are **read-only** at the protocol level. The spec defines `resources/list` and `resources/read` but **no `resources/write` or `resources/update`**. All mutations must go through Tools. ([Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources))
- **Subscriptions are supported.** Servers declare `resources.subscribe: true` capability. Clients send `resources/subscribe` with a URI; servers emit `notifications/resources/updated` when that resource changes. Client then re-reads via `resources/read`. ([Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources))
- **List change notifications** are also supported. Servers declare `resources.listChanged: true` and emit `notifications/resources/list_changed` when available resources change. ([Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources))
- Resource annotations support **`lastModified`** (ISO 8601 timestamp), `audience` (user/assistant), and `priority` (0.0-1.0). ([Resources spec - Annotations](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#annotations))
- Resources support `size` (bytes) and `mimeType` fields but **no ETags, version numbers, or revision hashes**. ([Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources))
- URI schemes include `file://`, `https://`, `git://`, and custom schemes per RFC 3986. ([Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#common-uri-schemes))

### Tools: Structured Results, No Built-in Concurrency Metadata

- Tools support both **unstructured content** (text, images, audio, resource links, embedded resources) and **structured content** via `structuredContent` field with JSON Schema validation through `outputSchema`. ([Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools))
- **Tool annotations** include behavioral hints: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`. These are advisory, not enforced. ([Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), [GitHub issues](https://github.com/modelcontextprotocol/servers/issues/2988))
- **No built-in ETags, version numbers, or optimistic concurrency** in tool call/result messages. However, `_meta` is an open extension point where custom metadata (including version info) could be attached. ([Base protocol - _meta](https://modelcontextprotocol.io/specification/2025-11-25/basic))
- Tools support `notifications/tools/list_changed` for dynamic tool registration. ([Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools))
- Tool results can return `resource_link` items, enabling tools to point clients at subscribable resources after mutation. ([Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools))
- New in 2025-11-25: `execution.taskSupport` field (`"forbidden"` | `"optional"` | `"required"`) for declaring async task capability per-tool. ([Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools))

### Prompts: Templated Workflows, Not Coordination Templates

- Prompts are **user-controlled** templates that produce sequences of messages (with `role: "user"` or `role: "assistant"`). They accept named arguments and return `PromptMessage[]`. ([Prompts spec](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts))
- Prompts can embed resources and support argument auto-completion. ([Prompts spec](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts))
- **For coordination:** Prompts could serve as "playbooks" -- e.g., a `propose_change` prompt that structures how an agent formulates a proposal. But they are interaction templates, not state machines or transaction coordinators. They don't carry execution semantics.
- Support `notifications/prompts/list_changed`. ([Prompts spec](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts))

### Sampling: Server Requests LLM Completions from Client

- Sampling is a **server-to-client request** (`sampling/createMessage`). The server asks the client's LLM to generate a completion. The client controls model selection, approval, and visibility. ([Sampling spec](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling))
- **New in 2025-11-25:** Sampling now supports **tool use within sampling** -- servers can provide tools to the client's LLM, enabling nested agentic loops where the LLM calls tools, gets results, and continues. ([Sampling spec](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling), [SEP-1577](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1577))
- **Human-in-the-loop is recommended** for all sampling requests. ([Sampling spec](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling))
- Model preferences use abstract priorities (`costPriority`, `speedPriority`, `intelligencePriority`) plus optional model `hints`. ([Sampling spec](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling))
- **For coordination:** A coordination server could use sampling to ask an agent to review or judge a proposal, effectively delegating cognitive work back to the client's LLM.

### Elicitation: Server Requests User Input

- Elicitation (`elicitation/create`) allows servers to request structured input from users via **form mode** (JSON Schema-validated flat forms) or **URL mode** (redirect to external URL for sensitive operations). ([Elicitation spec](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation))
- **For coordination:** Elicitation could be used for human approval gates -- e.g., "Approve this proposal before it's applied." The form mode supports typed fields (string, number, boolean, enum) with validation.

### Tasks: Async State Machine (Experimental)

- **Tasks are the most coordination-relevant primitive.** Introduced in 2025-11-25 as experimental. ([Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks), [SEP-1686](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686))
- Tasks are **durable state machines** with states: `working` -> `input_required` / `completed` / `failed` / `cancelled`. ([Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks))
- Task-augmented request types (current): `tools/call`, `sampling/createMessage`, `elicitation/create`. ([Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks))
- Tasks support **polling** (`tasks/get`), **result retrieval** (`tasks/result`), **listing** (`tasks/list`), **cancellation** (`tasks/cancel`), and **status notifications** (`notifications/tasks/status`). ([Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks))
- Tasks have **TTL-based lifecycle** with `createdAt`, `lastUpdatedAt`, and `pollInterval` fields. ([Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks))
- Related messages are linked via `_meta["io.modelcontextprotocol/related-task"]`. ([Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks))

### Server-Push and Notifications

- **MCP supports server-initiated messaging** through several mechanisms:
  - **Notifications** (JSON-RPC notifications, no response expected): `notifications/resources/updated`, `notifications/resources/list_changed`, `notifications/tools/list_changed`, `notifications/prompts/list_changed`, `notifications/tasks/status`. ([Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources), [Tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), [Tasks spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks))
  - **Server-to-client requests**: `sampling/createMessage`, `elicitation/create`. These are full requests where the server asks the client to do something. ([Sampling spec](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling), [Elicitation spec](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation))
  - **SSE streams** in Streamable HTTP transport: servers can push JSON-RPC messages on SSE streams opened by GET or during POST responses. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports))
- **However**, a key limitation noted in community analysis: today's MCP clients and agent frameworks are built around request-response patterns. External messages arriving outside the user prompt cycle don't fit well. ([Medium analysis](https://ankitmundada.medium.com/mcp-has-notifications-so-why-cant-your-agent-watch-your-inbox-bb688fde7ac5))

### Transport Protocols

- **Two standard transports** defined:
  1. **stdio** -- client spawns server as subprocess, communicates via stdin/stdout. Newline-delimited JSON-RPC. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports))
  2. **Streamable HTTP** -- single HTTP endpoint supporting POST (client-to-server) and optional GET (server-to-client SSE stream). Replaces the deprecated HTTP+SSE transport from 2024-11-05. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), [Blog post on SSE deprecation](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/))
- **SSE is not deprecated as a mechanism** -- it's used *within* Streamable HTTP for server-push. What's deprecated is the old standalone SSE transport with separate endpoints. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports))
- **Session management** via `MCP-Session-Id` header. Session IDs must be cryptographically secure. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#session-management))
- **Resumability**: SSE events can carry `id` fields; clients reconnect with `Last-Event-ID` header for message replay. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#resumability-and-redelivery))
- **Custom transports** are allowed -- protocol is transport-agnostic. ([Transports spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#custom-transports))

### Extensions and Coordination Proposals

- **No MCP SEPs or spec proposals specifically address coordination, concurrency control, ETags, or optimistic locking** as of March 2026. The spec has no built-in primitives for these concerns.
- The **`_meta` field** is the designated extension point. Custom metadata keys follow a namespaced format (e.g., `com.example/myKey`). Keys prefixed with `io.modelcontextprotocol/` or `dev.mcp/` are reserved for protocol use. ([Base protocol](https://modelcontextprotocol.io/specification/2025-11-25/basic))
- The **Extensions framework** (new in 2025-11-25) allows optional, additive, composable protocol additions. ([Anniversary blog](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/), [SEP-1724](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1724))
- Research on multi-agent MCP coordination exists but is application-level, not protocol-level: coordination flows through the LLM orchestrator, not through MCP primitives. ([ArXiv paper](https://arxiv.org/html/2504.21030v1), [Microsoft blog](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150))
- **Agent-MCP** is a third-party framework for multi-agent coordination over MCP, using a shared task ledger pattern. ([GitHub](https://github.com/rinadelph/Agent-MCP))

---

## Primitive-to-Coordination Mapping

| Coordination Concern | MCP Primitive | How It Maps | Gap? |
|---|---|---|---|
| **State reading** | Resources | `resources/read` provides current state | No gap for reads |
| **State mutation** | Tools | All writes go through `tools/call` | No gap -- this is the intended pattern |
| **Change notification** | Resource subscriptions | `resources/subscribe` + `notifications/resources/updated` | Works for individual resources, but notification only says "changed" -- no diff/delta |
| **Authority tracking** | None built-in | Must be implemented in tool logic or via `_meta` | **Gap** -- no protocol-level concept of "who owns this" or "who can write" |
| **Optimistic concurrency** | None built-in | No ETags, version vectors, or CAS in the protocol | **Gap** -- must be implemented as tool input parameters (e.g., `expectedVersion`) |
| **Conflict detection** | None built-in | No protocol-level merge or conflict semantics | **Gap** -- must be application-layer |
| **Async operations** | Tasks | Task state machine with polling and cancellation | Experimental but well-designed |
| **Human approval gates** | Elicitation | Form/URL mode for structured user input | Good fit for approval workflows |
| **Agent-to-agent delegation** | Sampling | Server asks client's LLM to do work | Indirect -- goes through the client, not peer-to-peer |
| **Scope boundaries** | Roots | Client tells server what directories/URIs to work within | Advisory only, not enforced |
| **Workflow templates** | Prompts | Parameterized message sequences | Could template coordination protocols |

---

## Implications for Sherpa's Coordination Layer

### What MCP gives us for free

1. **Read-write separation.** Resources for reads, Tools for writes. This is the right foundation for a coordination layer -- all mutations funnel through tool calls, giving us a single interception point.

2. **Subscription-based change propagation.** When Agent A mutates an initiative file via a tool call, the server can notify all subscribed agents via `notifications/resources/updated`. Agents re-read to get current state.

3. **Structured tool results.** Tools can return structured JSON with schema validation. Our coordination tools (e.g., `mutate_initiative`, `approve_proposal`) can return typed results including version info, conflict reports, etc.

4. **Async tasks.** Long-running operations (e.g., a Planner breaking an initiative into tasks) can use task-augmented tool calls. The client can poll or get notified when complete.

5. **Extension points.** The `_meta` field on all messages lets us attach coordination metadata (versions, authority tokens, lock IDs) without violating the protocol.

### What we must build ourselves

1. **Optimistic concurrency control.** MCP has no ETags or CAS. We need to implement this in our tool layer:
   - Every mutable resource gets a version (hash, counter, or timestamp)
   - Mutation tools accept an `expectedVersion` parameter
   - Server rejects mutations where `expectedVersion` doesn't match current
   - This is entirely within our MCP server implementation -- no protocol changes needed

2. **Authority/ownership model.** MCP has no concept of "this agent owns this resource" or "only the Planner can approve." We implement this as:
   - Tool-level access control (tool checks caller identity before executing)
   - Metadata on resources indicating ownership/authority
   - Potentially using Roots to scope what each agent can see

3. **Conflict resolution.** When two agents try to mutate the same resource:
   - Optimistic concurrency catches the conflict at write time
   - Our server decides resolution strategy: last-writer-wins, merge, reject-and-notify
   - No MCP primitive helps here -- it's pure application logic

4. **Coordination state machine.** The initiative lifecycle (proposal -> approved -> in-progress -> integrated) is application state. We model it as:
   - Resources that expose lifecycle state
   - Tools that perform transitions (with precondition checking)
   - Subscriptions that notify agents of state changes

5. **Multi-agent awareness.** MCP is point-to-point (one client, one server). For multiple agents:
   - Each agent is a separate MCP client connecting to our coordination server
   - The server is the single source of truth, mediating all state
   - Server-side notifications propagate changes to all subscribed clients

### Architecture Sketch

```
Agent A (Client) ----\
Agent B (Client) ------> Sherpa MCP Server <-----> Filesystem (initiatives, tasks, proposals)
Agent C (Client) ----/         |
                               |
                    [Coordination Logic]
                    - Version tracking per resource
                    - Authority checks per tool call
                    - Subscription management
                    - Conflict detection & resolution
                    - Lifecycle state machine
```

---

## Sources

| URL | Description |
|-----|-------------|
| https://modelcontextprotocol.io/specification/2025-11-25 | MCP spec v2025-11-25 landing page |
| https://modelcontextprotocol.io/specification/2025-11-25/server/resources | Resources primitive spec -- subscriptions, annotations, URI schemes |
| https://modelcontextprotocol.io/specification/2025-11-25/server/tools | Tools primitive spec -- structured content, annotations, outputSchema |
| https://modelcontextprotocol.io/specification/2025-11-25/server/prompts | Prompts primitive spec -- templated messages |
| https://modelcontextprotocol.io/specification/2025-11-25/client/sampling | Sampling primitive spec -- server-initiated LLM requests |
| https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation | Elicitation primitive spec -- form and URL mode user input |
| https://modelcontextprotocol.io/specification/2025-11-25/client/roots | Roots primitive spec -- filesystem boundaries |
| https://modelcontextprotocol.io/specification/2025-11-25/basic | Base protocol -- JSON-RPC, _meta, JSON Schema usage |
| https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | Lifecycle -- initialization, capability negotiation, shutdown |
| https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | Transports -- stdio, Streamable HTTP, SSE, resumability |
| https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks | Tasks primitive spec -- async state machine, polling, cancellation |
| https://modelcontextprotocol.io/specification/2025-11-25/changelog | Changelog for 2025-11-25 vs 2025-06-18 |
| http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/ | MCP first anniversary blog -- Nov 2025 release overview |
| https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/ | Why SSE transport was deprecated in favor of Streamable HTTP |
| https://ankitmundada.medium.com/mcp-has-notifications-so-why-cant-your-agent-watch-your-inbox-bb688fde7ac5 | Analysis of MCP notification limitations in current clients |
| https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-11-25/schema.ts | TypeScript schema (source of truth for protocol types) |
| https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-11-25/schema.json | JSON Schema (auto-generated from TS) |
| https://en.wikipedia.org/wiki/Model_Context_Protocol | Wikipedia -- MCP history, governance, AAIF donation |
| https://workos.com/blog/mcp-features-guide | WorkOS guide to MCP features |
| https://workos.com/blog/mcp-async-tasks-ai-agent-workflows | WorkOS guide to MCP async tasks |
| https://workos.com/blog/mcp-elicitation | WorkOS guide to MCP elicitation |
| https://workos.com/blog/mcp-roots-guide | WorkOS guide to MCP roots |
| https://glama.ai/blog/2025-07-10-exploring-mcps-hidden-primitives-prompts-resources-sampling-and-roots | Glama blog on MCP's lesser-known primitives |
| https://stn1slv.medium.com/architecting-the-asynchronous-agent-a-guide-to-mcp-tasks-7348c6527233 | Medium guide to MCP Tasks architecture |
| https://agnost.ai/blog/long-running-tasks-mcp/ | Agnost blog on MCP long-running tasks |
| https://subramanya.ai/2025/12/01/mcp-enterprise-readiness-how-the-2025-11-25-spec-closes-the-production-gap/ | Enterprise readiness analysis of Nov 2025 spec |
| https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03 | Dave Patten's analysis of November 2025 spec |

---

## Raw Links

Every URL encountered during research, including tangential ones:

```
https://modelcontextprotocol.io/specification/2025-11-25
https://modelcontextprotocol.io/specification/2025-11-25/server/resources
https://modelcontextprotocol.io/specification/2025-11-25/server/tools
https://modelcontextprotocol.io/specification/2025-11-25/server/prompts
https://modelcontextprotocol.io/specification/2025-11-25/client/sampling
https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation
https://modelcontextprotocol.io/specification/2025-11-25/client/roots
https://modelcontextprotocol.io/specification/2025-11-25/basic
https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks
https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices
https://modelcontextprotocol.io/specification/2025-11-25/changelog
https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/pagination
https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging
https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/completion
https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/ping
https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation
https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/progress
https://modelcontextprotocol.io/specification/2025-11-25/schema
https://modelcontextprotocol.io/specification/2025-11-25/architecture
https://modelcontextprotocol.io/specification/2025-11-25/server
https://modelcontextprotocol.io/specification/2025-11-25/client
https://modelcontextprotocol.io/specification/2024-11-05/basic/transports
https://modelcontextprotocol.io/specification/draft/client/sampling
https://modelcontextprotocol.io/specification/draft/client/elicitation
https://modelcontextprotocol.io/specification/2025-06-18/server/resources
https://modelcontextprotocol.io/specification/2025-06-18/client/roots
https://modelcontextprotocol.io/specification/2025-06-18
https://modelcontextprotocol.io/legacy/concepts/tools
https://modelcontextprotocol.io/legacy/concepts/transports
https://modelcontextprotocol.io/community/sep-guidelines
https://modelcontextprotocol.io/community/seps
https://modelcontextprotocol.io/community/governance
https://modelcontextprotocol.io/community/contributing
https://modelcontextprotocol.io/development/roadmap
https://modelcontextprotocol.io/llms.txt
https://modelcontextprotocol.io/docs/getting-started/intro
http://blog.modelcontextprotocol.io/
http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/
http://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/
http://blog.modelcontextprotocol.io/posts/2025-11-28-sep-process-update/
https://github.com/modelcontextprotocol
https://github.com/modelcontextprotocol/modelcontextprotocol
https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-11-25/schema.ts
https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-11-25/schema.json
https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-03-26/schema.ts
https://github.com/modelcontextprotocol/specification/compare/2025-06-18...2025-11-25
https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/seps
https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/seps/README.md
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/124
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/491
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/629
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1780
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/932
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/991
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/994
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1061
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1302
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1303
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1309
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1330
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1391
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1400
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1487
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1502
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1577
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1613
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1699
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1724
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1730
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1847
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/670
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/797
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/835
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/887
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1284
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1296
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1439
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1603
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1850
https://github.com/modelcontextprotocol/servers
https://github.com/modelcontextprotocol/servers/issues/2988
https://github.com/modelcontextprotocol/servers/issues/3402
https://github.com/modelcontextprotocol/python-sdk
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md
https://github.com/rinadelph/Agent-MCP
https://github.com/lastmile-ai/mcp-agent
https://github.com/Dicklesworthstone/ultimate_mcp_server
https://github.com/github/github-mcp-server
https://github.com/github/github-mcp-server/releases
https://github.com/spring-ai-community/mcp-annotations
https://github.com/IBM/mcp-context-forge/issues/234
https://github.com/anomalyco/opencode/issues/11948
https://github.com/openai/codex/issues/4929
https://github.com/awslabs/mcp/issues/671
https://github.com/anthropics/claude-code/issues/25081
https://github.com/anthropics/claude-ai-mcp
https://github.com/anthropics/mcpb
https://github.com/agent-network-protocol/AgentNetworkProtocol/blob/main/blogs/anthropic-mcp-2025h1-milestone-analysis.md
https://en.wikipedia.org/wiki/Model_Context_Protocol
https://arxiv.org/html/2601.11595v2
https://arxiv.org/html/2504.21030v1
https://www.jsonrpc.org/
https://www.jsonrpc.org/specification
https://datatracker.ietf.org/doc/html/bcp14
https://datatracker.ietf.org/doc/html/rfc2119
https://datatracker.ietf.org/doc/html/rfc3986
https://datatracker.ietf.org/doc/html/rfc6570
https://datatracker.ietf.org/doc/html/rfc8174
https://datatracker.ietf.org/doc/html/rfc3339
https://openid.net/specs/openid-connect-discovery-1_0.html
https://html.spec.whatwg.org/multipage/server-sent-events.html
https://microsoft.github.io/language-server-protocol/
https://json-schema.org/draft/2020-12/schema
https://code.visualstudio.com/blogs/2025/06/12/full-mcp-spec-support
https://www.descope.com/learn/post/mcp
https://datasciencedojo.com/blog/guide-to-model-context-protocol/
https://codilime.com/blog/model-context-protocol-explained/
https://modelcontextprotocol.info/docs/concepts/resources/
https://modelcontextprotocol.info/docs/concepts/sampling/
https://modelcontextprotocol.info/docs/concepts/roots/
https://modelcontextprotocol.info/blog/mcp-next-version-update/
https://www.speakeasy.com/mcp/core-concepts/sampling
https://www.speakeasy.com/mcp/core-concepts/roots
https://www.mcpevals.io/blog/roots-mcp
https://mingzilla.github.io/specification/mcp-sampling-guide.html
https://portkey.ai/blog/mcp-message-types-complete-json-rpc-reference-guide/
https://www.ibm.com/think/topics/model-context-protocol
https://stytch.com/blog/model-context-protocol-introduction/
https://www.databricks.com/blog/what-is-model-context-protocol
https://cloud.google.com/discover/what-is-model-context-protocol
https://www.kubiya.ai/blog/model-context-protocol-mcp-architecture-components-and-workflow
https://developers.openai.com/apps-sdk/concepts/mcp-server/
https://openai.github.io/openai-agents-python/mcp/
https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools
https://docs.roocode.com/features/mcp/server-transports
https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem
https://mcpservers.org/servers/modelcontextprotocol/filesystem
https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03
https://medium.com/@EleventhHourEnthusiast/advancing-multi-agent-systems-through-model-context-protocol-architecture-implementation-and-5146564bc1ff
https://medium.com/@nimritakoul01/the-model-context-protocol-mcp-a-complete-tutorial-a3abe8a7f4ef
https://medium.com/@whatsupai/mcp-series-roots-defining-scope-and-boundaries-6f72a8fcf417
https://medium.com/@daiki.yamashita_67366/using-mcp-elicitation-to-collect-additional-information-from-the-user-d5c599ecae77
https://ankitmundada.medium.com/mcp-has-notifications-so-why-cant-your-agent-watch-your-inbox-bb688fde7ac5
https://stn1slv.medium.com/architecting-the-asynchronous-agent-a-guide-to-mcp-tasks-7348c6527233
https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/
https://blog.fka.dev/blog/2025-01-15-mcp-elicitations-standardizing-interactive-ai-workflows/
https://blog.marcnuri.com/mcp-tool-annotations-introduction
https://dzone.com/articles/mcp-elicitation-human-in-the-loop-for-mcp-servers
https://dev.to/kachurun/mcp-elicitation-human-in-the-loop-for-mcp-servers-m6a
https://dev.to/nickytonline/quick-fix-my-mcp-tools-were-showing-as-write-tools-in-chatgpt-dev-mode-3id9
https://thenewstack.io/how-to-implement-elicitation-with-model-context-protocol/
https://fast-agent.ai/mcp/elicitations/
https://modelcontextprotocol.github.io/csharp-sdk/concepts/elicitation/elicitation.html
https://gofastmcp.com/servers/tasks
https://obot.ai/resources/learning-center/mcp-tools/
https://mcpindotnet.github.io/docs/concepts/server-concepts/resources/
https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-overview.html
https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html
https://www.baeldung.com/spring-ai-mcp-annotations
https://openliberty.io/blog/2025/10/23/mcp-standalone-blog.html
https://www.jetbrains.com/help/youtrack/devportal/custom-ai-tools.html
https://mcpcat.io/guides/adding-custom-tools-mcp-server-python/
https://developers.openai.com/apps-sdk/plan/tools/
https://deepwiki.com/modelcontextprotocol/servers/1.1-mcp-protocol-and-architecture
https://deepwiki.com/IBM/ibmi-mcp-server/4.6-tool-annotations-and-metadata
https://milvus.io/ai-quick-reference/is-model-context-protocol-mcp-a-good-fit-for-multiagent-llm-systems
https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150
https://aws.amazon.com/blogs/machine-learning/build-long-running-mcp-servers-on-amazon-bedrock-agentcore-with-strands-agents-integration/
https://subramanya.ai/2025/12/01/mcp-enterprise-readiness-how-the-2025-11-25-spec-closes-the-production-gap/
https://pythonlibraries.substack.com/p/mcp-turns-one-17-seps-rewiring-ai
https://workos.com/blog/mcp-features-guide
https://workos.com/blog/mcp-async-tasks-ai-agent-workflows
https://workos.com/blog/mcp-elicitation
https://workos.com/blog/mcp-roots-guide
https://agnost.ai/blog/long-running-tasks-mcp/
https://glama.ai/blog/2025-07-10-exploring-mcps-hidden-primitives-prompts-resources-sampling-and-roots
```

---

## Open Questions

1. **Resource write semantics.** MCP deliberately omits write operations on resources. For Sherpa, should we model all state mutations as tool calls that happen to modify files exposed as resources? Or is there value in proposing a `resources/write` extension?

2. **Notification delivery guarantees.** The spec says notifications are fire-and-forget (JSON-RPC notifications have no response). For coordination, missed notifications could mean an agent operates on stale state. Do we need an acknowledgment layer, or is polling (re-reading resources) sufficient?

3. **Multi-client server patterns.** The MCP spec focuses on single client-server pairs. When multiple agents connect to the same server, are subscriptions per-client? The spec doesn't explicitly address this. We need to verify in the SDK implementations.

4. **Task primitive maturity.** Tasks are experimental in 2025-11-25. Should Sherpa depend on them for its coordination layer, or implement a parallel mechanism that's compatible but independent?

5. **`_meta` namespacing.** We should register a namespace (e.g., `solar.sherpa/`) for our coordination metadata to avoid collisions. The spec reserves `io.modelcontextprotocol/` and `dev.mcp/` prefixes. What's the process for registering custom namespaces?

6. **Client notification handling.** The Medium analysis highlights that current MCP clients (Claude Desktop, VS Code, etc.) don't handle server-initiated notifications well outside the request-response cycle. If Sherpa agents are Claude Code sessions, can they actually react to push notifications?

7. **Streamable HTTP vs stdio for multi-agent.** stdio requires the client to spawn the server as a subprocess -- this is 1:1. For N agents connecting to one coordination server, Streamable HTTP seems mandatory. What are the implications for session management?
