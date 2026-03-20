# Vector 2: MCP Federation Patterns

**Question:** How do API gateways and federation patterns work for aggregating multiple backend services into a unified interface?
**Agent dispatched:** 2026-03-20

## Findings

### GraphQL Federation
- Multiple subgraphs compose into a supergraph via schema composition. Apollo Router decomposes queries across subgraphs
- **Problems at scale:** single point of failure, N+1 queries, schema conflicts, authorization inconsistency
- **Verdict for Sherpa:** Massive overhead for filesystem-based governance data. Overkill.

### API Gateway Patterns (Kong, Envoy)
- Scatter-gather, request routing (path/host/header/context-based), response composition, protocol translation
- AI Gateway emerging as new category for LLM/agent traffic
- **Verdict for Sherpa:** Sherpa isn't HTTP REST microservices. MCP is already the transport. Impedance mismatch.

### BFF (Backend for Frontend)
- Dedicated backend aggregating multiple downstream services into frontend-optimized payloads
- **Next.js is a natural BFF** — Server Components fetch directly from sources, no separate service needed
- Vercel recommends edge caching and rate-limiting at this layer
- **Key insight:** Studio's Server Components can serve as the BFF, fetching from multiple MCP backends at the server level

### MCP Gateway/Proxy Patterns (most relevant)

**Pattern A: MCP Gateway (reverse proxy + control plane)**
- Session-aware reverse proxy fronting multiple MCP servers behind one endpoint
- Session fan-out, tool-name routing, SSE stream multiplexing
- **Namespace prefixing** avoids collisions: `weather__get_forecast`, `tasks__task_list`

**Pattern B: Virtual MCP Server ("Remix Server")**
- Stand up virtual server C in front of servers A and B
- Cherry-pick which tools to expose from each backend
- "Workflow knowledge lives on C — any client connecting to C gets that knowledge"
- **Lightest-weight approach, closest to what Sherpa needs**

**Pattern C: Enterprise MCP Gateway**
- Full registry with tool discovery, ACL per tool, audit logging
- IBM ContextForge, Microsoft MCP Gateway, Kong AI MCP Proxy
- **Premature for Sherpa** — solves enterprise problems (Kubernetes, multi-org federation, OAuth)

**Critical insight (Anthropic/Prefect):** When too many tools connected, tool definitions consume excessive tokens. Cherry-picking via virtual MCP is the recommended approach.

### Database-per-Tenant vs Shared

| Model | Isolation | Cost | Best For |
|-------|-----------|------|----------|
| Silo (DB per tenant) | Strongest | Highest | Regulated industries |
| Bridge (schema per tenant) | Medium | Medium | Dozens of tenants |
| Pool (shared DB, tenant_id) | App-enforced | Lowest | Most SaaS, early stage |

## Recommendation: Two-Layer Approach

**Layer 1 — Next.js BFF (dashboard reads):**
Server Components call multiple MCP backends and compose the view. No gateway needed. Each project gets a `projectRoot` config. Studio aggregates at render time.

**Layer 2 — Virtual MCP Server (agent tool access):**
Lightweight "remix server" pattern:
- Cherry-picks tools from per-project MCP instances
- Namespace prefixing (`sherpa__task_list`, `wavepoint__task_list`)
- Manages context window budget
- Single process, multiple `createStudioMcpServer()` instances with different `projectRoot` values

**Why this works:**
- `createStudioMcpServer()` already accepts `projectRoot` as an option — instantiating multiple times is trivial
- Knowledge engine (SQLite) is already per-project via `resolveDbPaths()`
- No new infrastructure. No Docker, no Kubernetes, no Redis. Just TypeScript
- Data isolation: SQLite per project (Silo at DB level, trivial operationally)

## Sources

- [Apollo Federation](https://www.apollographql.com/docs/federation/v1)
- [API Gateway Aggregation (API7.ai)](https://api7.ai/learning-center/api-gateway-guide/api-gateway-api-aggregation)
- [Next.js BFF Guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [BFF Pattern (Sam Newman)](https://samnewman.io/patterns/architectural/bff/)
- [Best MCP Gateways 2026 (TrueFoundry)](https://www.truefoundry.com/blog/best-mcp-gateways)
- [Microsoft MCP Gateway](https://github.com/microsoft/mcp-gateway)
- [IBM ContextForge](https://github.com/IBM/mcp-context-forge)
- [Kong AI MCP Proxy](https://developer.konghq.com/plugins/ai-mcp-proxy/)
- [Remix Servers (Prefect)](https://www.prefect.io/blog/moving-claude-skills-server-side-with-remix-servers)
- [Virtual MCP Server (Stacklok)](https://stacklok.com/blog/introducing-virtual-mcp-server-unified-gateway-for-multi-mcp-workflows/)
- [Multi-Tenant DB Patterns (Bytebase)](https://www.bytebase.com/blog/multi-tenant-database-architecture-patterns-explained/)

## Open Questions

1. Tool explosion — 3 projects x 12 tools = 36 tools per MCP session. Within context budget?
2. Cross-project search — merged FTS5 index or scatter-gather?
3. Write path routing — which MCP handles mutations from Studio UI?
4. Multi-project auth scoping — shared auth layer or per-project?
