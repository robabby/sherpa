---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-18
last-verified: 2026-03-18
source-initiatives:
  - overnight-research-ops
  - vps-remote-compute
  - mcp-multi-backend-dispatch
---

> **AI-generated** 2026-03-18 · Awaiting human review
> Sources: overnight-research-ops, vps-remote-compute, mcp-multi-backend-dispatch

# Platform Model

Sherpa Studio is a convention system with a pluggable runtime. The documents, the lifecycle, the governance, the behavioral agent definitions — that is the product. The filesystem, the database, the VPS, the desktop app, the web UI — those are deployment decisions.

This distinction matters because it determines how the platform grows. Sherpa doesn't scale by adding servers. It scales by adding instances — each independently configured, each running the same conventions against whatever storage and runtime their deployment requires.

The foundation stone declares: "We do not build dependence." This architecture embodies that. No central server, no platform lock-in, no data extraction. Each instance is sovereign.

---

## Three Invariants

Three invariants govern how Sherpa Studio operates, regardless of deployment.

### 1. Conventions Are the Product

The initiative lifecycle, behavioral agent schema, proposal-based change process, Planner/Worker/Judge dispatch, quality gates — these are constant. They work the same whether the underlying storage is a filesystem, a database, or an object store.

The seven pillars described in `docs/framework.md` are the product. Everything else is infrastructure.

### 2. MCP and Studio API Are Always Lock-Step

Every operation available to a human through the Studio API is available to an agent through MCP. Every operation available through MCP is available through the API. They are always lock-step.

This is non-negotiable because Sherpa is a Human + AI collaboration system. Asymmetry between human and agent capabilities breaks the model. A PM approving a proposal through the web interface triggers the same state transition an agent would via MCP. A remote agent writing research results uses the same persistence path a local user uses.

### 3. Storage and Runtime Are Deployment Decisions

Where documents live (filesystem, database, object store) and where agents run (laptop, VPS, hosted API) are configured per-instance. The conventions, the document model, and the access layer don't change.

---

## The Access Layer

The MCP server and Studio API form a single logical interface to the platform. Internally, both resolve to the same operations against the same state. The transport differs — MCP serves agents, the API serves UIs and integrations — but the capability set is identical.

**What the access layer exposes:**

- Initiative lifecycle (create, query, transition, review)
- Document operations (read, write, search, summarize, get context)
- Task dispatch (create, route, execute, report)
- Knowledge operations (search, classify, relate)

**What the access layer abstracts:**

- Where documents are stored (filesystem, database, object store)
- Where agents run (local process, VPS, hosted API)
- How sync happens (git push, database replication, webhook)
- How permissions are enforced (filesystem ownership, database ACLs, org-level policies)

Agents and UIs built against this interface work across all deployment tiers without modification. The access layer is the stability contract.

---

## Runtime Model

Agents are dispatched, not hosted. The dispatch system routes a task to a backend and a host. The agent runs, produces results, and reports back through the access layer. Sherpa does not maintain persistent agent processes — it dispatches work and receives outcomes.

Host resolution adds a dimension to the existing routing table:

```
task-type → backend → model → host
```

- **local** — Agent process runs on the developer's machine. Current default. Best for interactive collaboration and governance-scoped work.
- **remote** — Agent process runs on infrastructure the organization controls (VPS, container, internal server). Survives closed laptops. Preferred for overnight and long-running work.
- **hosted** — Agent session managed by a provider API (Claude, Codex, Gemini). Fire-and-forget with callback. Simplest operationally, least control.

Overnight research is the forcing function for remote and hosted runtimes. A research agent dispatched at 11pm must continue when the laptop sleeps. It writes results through the access layer. When the user opens Studio in the morning, the results are there — indexed, searchable, ready for review. The sync mechanism is an implementation detail of the deployment tier, invisible to the user.

**Governance constraint:** Interactive human+AI collaboration and governance-scoped operations (convention edits, agent role definitions, CLAUDE.md) always run locally. Autonomous agents — especially overnight research — are the primary consumers of remote and hosted runtimes.

---

## Deployment Tiers (Provisional)

Three deployment tiers serve different organizational contexts. These are provisional — real boundaries will emerge through experience.

| Tier | Who | Storage | Runtime | Access |
|------|-----|---------|---------|--------|
| **Developer** | Engineers using CLI + Studio locally | Filesystem + git | Local processes, direct file access + MCP | Full technical access |
| **Managed** | Teams with a technical deployer | Git-backed or database | VPS + hosted APIs via MCP | UI-mediated, git invisible |
| **Organizational** | Non-technical teams | Database with permissions, sharing, access control | Hosted agents via MCP | UI only, no infrastructure concepts exposed |

The tier is a deployment choice, not a product tier. The same conventions run at every level. What changes is the storage backend, the access control model, and how much infrastructure is visible to the user.

---

## What This Document Is Not

**This is not a roadmap.** It does not promise delivery dates or sequence implementation work. The deployment tiers, the storage backends, the hosted agent integrations — these will emerge through real usage, starting with Sherpa Consulting's own overnight research operation and expanding as client engagements reveal what's actually needed.

**This is not a spec.** The access layer operations, the sync mechanisms, the permission model — these will be designed when their initiatives reach planning stage. This document establishes the architectural constraints those designs must satisfy.

**This is a declaration of platform identity.** Sherpa Studio is a convention system. Storage is pluggable. Runtime is pluggable. The access layer is the stability contract. API and MCP are always lock-step. These are the load-bearing walls. Everything else is interior design.
