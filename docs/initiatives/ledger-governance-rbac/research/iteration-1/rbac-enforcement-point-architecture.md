# RBAC Enforcement Point Architecture: Where Authorization Lives in a Three-Layer System

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** In a three-layer enforcement architecture (state server + runtime hooks + behavioral conventions), where should RBAC enforcement live? How do production systems split authorization across multiple enforcement points?

---

## Key Discoveries

### 1. The XACML PEP/PDP Split Is the Canonical Answer: Separate Decision from Enforcement

The XACML standard (OASIS, ISO 10181-3) defines the foundational architecture for distributed authorization. The core insight: **policy decisions and policy enforcement are separate concerns that belong in separate components**.

- **PDP (Policy Decision Point):** Evaluates policies, returns allow/deny. This is where authorization logic lives. It is a centralized service (or distributed sidecar) that owns the policy rules. It does NOT intercept requests or block operations directly.
- **PEP (Policy Enforcement Point):** Intercepts requests, calls the PDP, and enforces the result. The PEP does NOT make decisions -- it asks the PDP and acts on the answer. PEPs are distributed across every access point.
- **PIP (Policy Information Point):** Provides attribute data to the PDP (user attributes, resource metadata, environment context). The PDP queries PIPs to assemble the facts needed for a decision.
- **PAP (Policy Administration Point):** Manages policies. Administrators define rules here; the PDP retrieves them.

**The critical architectural rule:** PEPs are dumb enforcers. They contain no policy logic. All they do is: (1) intercept a request, (2) construct an authorization query, (3) send it to the PDP, (4) enforce the PDP's response. This means you can have **multiple PEPs** (gateway, hook, service-level) all calling the **same PDP**, without duplicating authorization logic.

Sources:
- [XACML Wikipedia](https://en.wikipedia.org/wiki/XACML) -- Architecture overview, PEP/PDP/PIP/PAP roles
- [NIST SP 800-162: ABAC Guide](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) -- Formalizes PEP/PDP/PIP/PAP as the four functional components
- [NextLabs: What is a PEP?](https://www.nextlabs.com/blogs/what-is-a-policy-enforcement-point-pep/) -- PEP role explained

**Sherpa mapping:**
- **MCP Server = PDP.** It holds the RBAC table, the authority state machine, and agent registrations. It evaluates "can agent X with role Y do operation Z on resource R?" and returns allow/deny.
- **Claude Code Hooks = PEP.** They intercept every Edit/Write, call the MCP server, and enforce the response. They contain zero policy logic -- just the HTTP call and the allow/deny gate.
- **CLAUDE.md + Rules = PAP (soft).** They define the behavioral expectations (which roles exist, what each role should do). They are the "policy administration" layer, but with soft enforcement -- the agent can technically violate them.

### 2. Kubernetes Proves the Three-Layer Model: RBAC + Admission Controllers + Pod Security

Kubernetes implements exactly the three-layer pattern Sherpa is building, with explicit separation of what each layer checks:

**Layer 1: RBAC (API server authorization)**
- Answers: "Can this identity perform this verb on this resource type?"
- Checked FIRST, before the request reaches any business logic
- Coarse-grained: operates on resource types and verbs, not on resource content
- Example: "Can ServiceAccount `worker-agent` create Pods in namespace `default`?"

**Layer 2: Admission Controllers (content validation)**
- Answers: "Is this specific resource configuration acceptable?"
- Checked AFTER RBAC passes, BEFORE persistence
- Fine-grained: inspects the actual resource content (labels, security context, resource limits)
- Example: "Does this Pod spec comply with the `restricted` security standard?"
- Two phases: mutating (can modify the resource) then validating (can only reject)

**Layer 3: Pod Security Standards / Network Policies (runtime enforcement)**
- Answers: "Is this runtime behavior allowed?"
- Enforced continuously at runtime, not just at request time
- Example: Network policies restricting pod-to-pod communication

**The key insight for Sherpa:** RBAC and admission controllers are NOT redundant -- they check fundamentally different things. RBAC asks "is this actor authorized?" Admission controllers ask "is this content acceptable?" A user can pass RBAC (they have permission to create Pods) but fail admission (the Pod spec violates security policy). This is not redundant checking -- it is complementary checking at different levels of granularity.

The evaluation order is deterministic and documented:
```
Request -> Authentication -> Authorization (RBAC) -> Mutating Admission -> Validating Admission -> Persistence
```

Sources:
- [Kubernetes Admission Controllers](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/) -- Request pipeline, controller types, separation from RBAC
- [OPA Gatekeeper: Policy and Governance](https://kubernetes.io/blog/2019/08/06/opa-gatekeeper-policy-and-governance-for-kubernetes/) -- OPA as validating admission controller
- [Styra: K8s Admission Control vs RBAC](https://www.styra.com/blog/k8s-admission-control-vs-rbac/) -- Explicit comparison of what each checks
- [Sysdig: Admission Controllers for Security](https://www.sysdig.com/learn-cloud-native/kubernetes-admission-controllers) -- RBAC controls access to API; admission controls shape and safety of content

### 3. AWS IAM Proves Deny-Overrides Composition Across Policy Layers

AWS evaluates authorization across up to seven policy types, composing them with a mix of AND (intersection) and OR (union) logic, but with a universal rule: **explicit deny always wins**.

**The evaluation algorithm:**
1. Check for explicit deny in ANY policy type -> if found, DENY (stop)
2. Identity-based + Resource-based policies compose with UNION (either allows = allow)
3. Identity-based + Permissions Boundaries compose with INTERSECTION (both must allow)
4. Identity-based + SCPs/RCPs compose with INTERSECTION (all must allow)

**The seven policy types in evaluation order:**
1. Service Control Policies (SCPs) -- organizational guardrails, cannot grant, only restrict
2. Resource Control Policies (RCPs) -- resource-level organizational guardrails
3. Identity-based policies -- what the principal can do
4. Resource-based policies -- what the resource allows
5. Permissions boundaries -- maximum permissions for an identity
6. Session policies -- temporary restrictions for a session
7. Access Control Lists (ACLs) -- legacy cross-account mechanism

**Critical design lesson:** SCPs and RCPs are "guardrail" policies that cannot grant permissions -- they can only restrict what other policies allow. This maps directly to Sherpa's hook layer: hooks should be deny-only guardrails, never granting permissions that the MCP server hasn't approved.

Sources:
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) -- Complete evaluation algorithm
- [AWS IAM Policy Types](https://aws.amazon.com/blogs/security/iam-policy-types-how-and-when-to-use-them/) -- When to use each type
- [AWS Defense in Depth Control Framework](https://aws.amazon.com/blogs/security/minimize-risk-through-defense-in-depth-building-a-comprehensive-aws-control-framework/) -- Multi-layer authorization strategy

### 4. OWASP Recommends Three Enforcement Points with Centralized Decision, Embedded PDP

The OWASP Microservices Security Cheat Sheet explicitly recommends defense-in-depth authorization with three enforcement layers:

> "It is advisable to implement the defense in depth principle and enforce authorization on: (1) Gateway and proxy level, at a coarse level of granularity; (2) Microservice level, using shared authorization library/components; (3) Microservice business code level, to implement business-specific rules."

**OWASP's recommended pattern: "Centralized pattern with embedded PDP"**
- Policy rules are defined centrally (single source of truth)
- PDP is deployed as a sidecar or library alongside each service (local evaluation, no network hop)
- Each enforcement point calls the local PDP, which has the same rules as every other PDP
- Updates to policy propagate from the central PAP to all embedded PDPs

**Why this beats alternatives:**
- Pure centralized PDP: single point of failure, network latency on every decision
- Pure decentralized PDP: policy drift, no single source of truth
- Centralized with embedded: resilient (local decisions survive central outage), fast (no network hop), consistent (all PDPs get the same rules)

Sources:
- [OWASP Microservices Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html) -- Three enforcement layers, centralized-with-embedded PDP recommendation
- [AWS Prescriptive Guidance: PEP Implementation](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/pep.html) -- PEPs should be pervasive, packaged as reusable library
- [AWS Prescriptive Guidance: Centralized vs Distributed PDP](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/opa-design-comparison.html) -- Latency and operational tradeoffs

### 5. Oso's Four-Layer Enforcement Model: Request, Resource, Query, Presentation

Oso (authorization framework) defines the most granular enforcement taxonomy found in this research. Their key equation: **"authorization = decision + enforcement."**

**Four enforcement layers:**

1. **Request-level (service layer):** Enforces coarse rules based on request metadata (HTTP method, path, headers). Cannot access database. Example: reject unauthenticated requests. Returns 403.

2. **Resource-level (business logic):** The primary enforcement point. Fetches the actual resource, then calls the PDP with (actor, action, resource). "Always make the authorization query as precise as possible." Example: "Can user X close issue #312?" not "Can user X edit repository?" On read denial, returns 404 (not 403) to avoid revealing resource existence.

3. **Query-level (data layer):** Pushes authorization into database queries as WHERE clauses. Returns conditions, not yes/no. Essential for list operations ("show all documents user can access"). No explicit errors -- unauthorized items simply don't appear.

4. **Presentation-level (client-side):** Purely UX. Hide/disable UI elements the user cannot use. Never trusted for actual enforcement.

**The explicit recommendation:** "Enforce authorization at multiple layers. Request-level can extract common checks, while resource-level provides granular control. This creates overlapping protections."

**Sherpa mapping:**
- Request-level = Hook PEP (coarse check: does this agent have ANY authority to edit files?)
- Resource-level = MCP server PDP (fine-grained: does this agent hold authority over THIS file?)
- Query-level = N/A for Sherpa (no database queries by agents)
- Presentation-level = CLAUDE.md/Rules (soft guidance about what the agent should attempt)

Sources:
- [Oso Authorization Academy: Enforcement](https://www.osohq.com/academy/authorization-enforcement) -- Four layers, decision vs enforcement, concrete patterns

### 6. The "Authorization 3-Body Problem": Where Data Lives Determines Architecture

Aserto (authorization platform) identifies the fundamental tension in multi-layer authorization as a data problem: the PEP, PDP, and PIP form a "3-body problem" where data flow constraints determine architecture.

**Three data patterns for the PDP:**
1. **Stateless PDP:** Application passes ALL data in the authorization query. PDP is a pure function. Simple but creates coupling -- the PEP must know what data the PDP needs.
2. **Caching PDP:** PDP caches authorization data locally. Requires synchronization with the source of truth. Risk of stale permissions.
3. **Dynamic PDP:** PDP calls back to PIPs for data at decision time. Cleanest separation but creates circular dependencies ("PEP calls PDP, PDP calls back to PEP for data").

**Recommended resolution:** Defense in depth with three PEP locations, all backed by the same PDP:
- **Authentication service as PEP** (coarse-grained): initial access check
- **API gateway as PEP** (medium-grained): endpoint-level access
- **Application as PEP** (fine-grained): resource-level access, PDP as sidecar

**Sherpa implication:** The MCP server is both PDP and PIP -- it holds the RBAC table (policy) and the authority state (data). The hook PEP passes a compact authorization query (agent_id, tool_name, file_path), and the MCP server has everything it needs to decide. This avoids the 3-body problem because decision and information are co-located.

Sources:
- [Aserto: The Authorization 3-Body Problem](https://www.aserto.com/blog/the-authorization-3-body-problem) -- PEP/PDP/PIP data flow tensions
- [Aserto: Where Should I Enforce My Authorization Policy?](https://www.aserto.com/blog/where-should-i-enforce-my-authorization-policy) -- Three PEP locations, defense in depth with single PDP

### 7. Envoy + OPA Sidecar: The PEP/PDP Split in Production Service Meshes

The OPA-Envoy plugin implements the exact PEP/PDP split in production:

- **Envoy proxy = PEP.** Intercepts all service-to-service traffic. Uses the External Authorization filter to call OPA before forwarding requests.
- **OPA sidecar = PDP.** Deployed in the same pod as the application. Evaluates Rego policies. Returns allow/deny.
- **No network hop for authorization.** Because OPA runs as a sidecar, the authorization check is a localhost call. Latency is microseconds, not milliseconds.

**Istio extends this with scoped enforcement:** Authorization policies can be applied at mesh scope (all services), namespace scope (all services in a namespace), or workload scope (specific service). Evaluation order: CUSTOM -> DENY -> ALLOW. This provides defense in depth within the service mesh itself.

**The architectural lesson:** Even within a single enforcement layer (the service mesh), authorization is split into scopes with different granularity levels. The mesh-wide policy is coarse, the namespace policy is medium, and the workload policy is fine-grained.

Sources:
- [OPA-Envoy Plugin](https://www.openpolicyagent.org/docs/envoy) -- Sidecar PDP with Envoy PEP
- [OPA-Envoy Architecture](https://www.openpolicyagent.org/docs/v0.31.0/envoy-introduction/) -- Deployment model, gRPC integration
- [Istio Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/) -- Mesh/namespace/workload scope, CUSTOM/DENY/ALLOW evaluation order
- [Istio Security Best Practices](https://istio.io/latest/docs/ops/best-practices/security/) -- Defense in depth with network policies

### 8. OPAL: Real-Time Policy Distribution Solves the Staleness Problem

OPAL (Open Policy Administration Layer) addresses the biggest risk of distributed enforcement: policy and data staleness.

**Architecture:**
- **OPAL Server:** Watches a git repo for policy changes. Accepts data update notifications via REST API. Publishes diffs via WebSocket pub/sub.
- **OPAL Client:** Runs alongside each OPA instance (the local PDP). Subscribes to policy and data topics. Fetches data from sources (databases, APIs, third-party services). Pushes updates to the local OPA instance.

**How it solves staleness:** When application state changes (e.g., an agent's role is modified, or an authority lease expires), the application notifies the OPAL server. The server publishes the update to all subscribed clients. Each client fetches the relevant data and updates its local OPA. Latency from state change to policy update is near-real-time (WebSocket push, not polling).

**Production validation:** Used by Tesla, Walmart, NBA, Intel, Cisco.

**Sherpa implication:** If hooks cached RBAC decisions locally (for latency), OPAL-style push updates would keep the cache current. But given Sherpa's single-machine deployment (all agents, MCP server, and hooks on the same host), a local HTTP call to the MCP server is likely fast enough without caching.

Sources:
- [OPAL Documentation](https://docs.opal.ac/) -- Architecture overview
- [OPAL Architecture](https://docs.opal.ac/overview/architecture) -- Server/client roles, pub/sub topology
- [GitHub: permitio/opal](https://github.com/permitio/opal) -- Source, production users
- [CNCF: Real-time Dynamic Authorization with OPAL](https://www.cncf.io/blog/2022/06/27/real-time-dynamic-authorization-an-introduction-to-opal/) -- Push-based policy distribution

### 9. Cerbos Embeddable PDP: Policy Sharing Across Heterogeneous Enforcement Points

Cerbos demonstrates a practical pattern for sharing authorization logic across different enforcement points:

**Architecture:**
- **Cerbos Hub (PAP):** Centrally manages policy definitions. Compiles policies into deployable bundles.
- **Cerbos PDP:** Deployed as sidecar, service, or embedded library. Evaluates policies locally.
- **PEP SDKs:** Lightweight clients in each enforcement point that call the local PDP.

**The "90/10 split" insight:** "If 90% of your authorization needs can be met with an embeddable PDP, but 10% truly require server-side aggregation of data, you might run a central PDP for that 10%." This is not all-or-nothing -- you can run different PDP deployment models for different enforcement points while sharing policy definitions.

**Sherpa implication:** The MCP server can be the "central PDP" for fine-grained authority checks (the complex 10%), while hooks use a simplified, cached version of the RBAC table for coarse checks (the fast 90%). Both share the same policy source (the MCP server's RBAC configuration).

Sources:
- [Cerbos: Rise of Embeddable PDPs](https://www.cerbos.dev/news/rise-of-embeddable-pdps-in-architectures) -- Embedded vs sidecar vs service PDP
- [Cerbos PDP](https://www.cerbos.dev/product-cerbos-pdp) -- Architecture, deployment options
- [Cerbos WASM Embedded PDP](https://www.cerbos.dev/features-benefits-and-use-cases/wasm-embedded-pdp) -- Edge deployment

### 10. Claude Code Hooks as PEP: Known Architecture and Limitations

Claude Code PreToolUse hooks function as synchronous enforcement gates before tool execution. They receive JSON input (tool_name, tool_input) via stdin and return a permission decision.

**Architectural properties:**
- **Deterministic:** Cannot be bypassed by the agent's reasoning. The hook runs in a separate process.
- **Synchronous:** Block until the hook script returns. The latency budget is real.
- **Composable:** Multiple hooks can be chained on the same tool matcher. All must pass.
- **External-state-capable:** Hooks are bash scripts that can call external systems (curl to MCP server).

**Known security gap:** Hooks cannot protect themselves from modification. Claude Code's Edit/Write tools can modify hook scripts. This is documented in [GitHub issue #11226](https://github.com/anthropics/claude-code/issues/11226). Mitigation: use `allowManagedPermissionRulesOnly` setting to prevent agents from adding/modifying hooks.

**Enforcement vs. permissions:** Claude Code has two mechanisms -- permissions (convenience, reduces prompts) and hooks (safety, hard blocks). They are independent: permissions don't bypass hooks.

Sources:
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) -- 18 events, exit code semantics
- [DEV.to: Fix Claude Code Permissions with Hooks](https://dev.to/boucle2026/how-to-fix-claude-codes-broken-permissions-with-hooks-23gl) -- Hook as enforcement, permissions as convenience
- [GitHub Issue #11226: Hook Self-Modification](https://github.com/anthropics/claude-code/issues/11226) -- Security gap in hook protection

---

## The Architecture for Sherpa

### Answer: MCP Server = PDP, Hooks = PEP, CLAUDE.md = PAP (Soft)

Based on every production system examined, the answer is unambiguous: **authorization decisions live in the MCP server, enforcement lives in the hooks, and they are NOT redundant -- they are complementary.**

```
                  ┌─────────────────────────────────┐
                  │        CLAUDE.md / Rules         │
                  │   PAP (soft policy definition)   │
                  │ Defines roles, behavioral norms  │
                  │   Agent follows by convention     │
                  └──────────────┬──────────────────┘
                                 │ (informs agent behavior)
                                 ▼
┌──────────────┐    authorize    ┌──────────────────────┐
│  Claude Code │───────────────►│     MCP Server        │
│    Hooks     │   (HTTP POST)  │                       │
│  PEP layer   │◄──────────────│  PDP + PIP layer      │
│              │   allow/deny   │  RBAC table           │
│ Intercepts   │                │  Authority state      │
│ Edit/Write   │                │  Agent registry       │
│ Enforces     │                │  SQLite backing       │
│ result       │                └──────────────────────┘
└──────────────┘
```

### What Each Layer Checks (Non-Redundant)

| Layer | Role | What It Checks | What It Does NOT Check | Analogy |
|-------|------|----------------|----------------------|---------|
| **Hooks (PEP)** | Enforcement gate | "Has the MCP server authorized this operation?" (binary allow/deny from the PDP) | Does NOT evaluate RBAC rules. Does NOT check authority validity. Does NOT know policy logic. | Kubernetes admission controller, Envoy ext_authz filter |
| **MCP Server (PDP)** | Decision engine | "Does this agent's role permit this operation on this resource type? Does this agent currently hold authority over this scope?" | Does NOT intercept operations. Does NOT block file writes. Cannot enforce anything -- only returns decisions. | OPA, AWS IAM evaluation engine, Zanzibar check API |
| **CLAUDE.md/Rules (PAP)** | Policy definition + soft enforcement | "What roles exist? What should each role do? What behavioral constraints apply?" | Does NOT make runtime decisions. Does NOT block operations. Agent compliance is voluntary. | Kubernetes RBAC role definitions, OPA Rego policies (the rules, not the engine) |

### Why This Is NOT Redundant

The Kubernetes analogy makes it clearest:
- RBAC does NOT check resource content. It only checks "can user X do verb Y on type Z?"
- Admission controllers do NOT check identity permissions. They only check "is this resource spec acceptable?"
- Network policies do NOT check either. They only check "is this network flow allowed?"

Each layer checks something the others CANNOT check. This is **complementary enforcement**, not **redundant checking**.

In Sherpa:
- **Hooks** enforce the MCP server's decision at the point of action. They cannot be bypassed by the agent's reasoning. But they have no policy logic -- they just call the server and enforce the answer.
- **MCP server** evaluates the authorization decision (RBAC + authority). It has all the data and all the policy. But it cannot enforce anything -- it is not in the request path for file operations.
- **CLAUDE.md** shapes the agent's behavior before it even attempts an operation. An agent that follows its role definition will never trigger a hook denial. But compliance is soft -- the hooks are the hard backstop.

### The Authorization Flow

```
1. Agent reads CLAUDE.md, learns its role (e.g., "worker")
   └─ Soft enforcement: agent SHOULD only attempt operations its role permits

2. Agent calls Edit/Write tool
   └─ PreToolUse hook fires (hard enforcement)

3. Hook POSTs to MCP server: { agent_id, role, tool, file_path }
   └─ MCP server evaluates:
      a. RBAC check: Does "worker" role permit "edit" on file type matching this path?
      b. Authority check: Does this agent hold a valid authority lease covering this path?
      c. Returns: { decision: "allow" } or { decision: "deny", reason: "..." }

4. Hook enforces the decision
   └─ allow: operation proceeds
   └─ deny: operation blocked, reason shown to agent

5. Agent receives the result
   └─ If denied, CLAUDE.md guides recovery behavior ("request authority first")
```

### Avoiding the "Redundant Check" Trap

The anti-pattern would be:
- Hooks evaluate RBAC independently (duplicate logic)
- MCP server also evaluates RBAC (original logic)
- Both check the same thing, potentially with different data or logic

The correct pattern (validated by XACML, Kubernetes, AWS, OWASP, Envoy+OPA):
- **Hooks are dumb PEPs.** They call the MCP server and enforce the result. Zero policy logic in hooks.
- **MCP server is the single PDP.** All RBAC evaluation, all authority checks, in one place.
- **Policy changes happen in one place** (the MCP server's RBAC table or sherpa.config.ts), not in hooks AND the server.

### Performance: Latency Budget for Hook -> MCP Server

The hook fires synchronously on every Edit/Write. The latency budget matters.

**Production benchmarks from research:**
- SQLite RBAC + authority query: 3-7 microseconds (from iteration 1 research)
- Localhost HTTP roundtrip: ~0.5-2ms (TCP) or ~0.1-0.5ms (Unix socket)
- OPA sidecar local evaluation: sub-millisecond
- Centralized PDP over network: 5-50ms

**Sherpa's situation:** Single-machine deployment. MCP server and hooks on the same host. The bottleneck is the HTTP roundtrip, not the database query. A localhost HTTP call adds ~1-2ms to every Edit/Write.

**Is 1-2ms acceptable?** Yes. An agent performing a file edit has multi-second latency from LLM inference anyway. Adding 1-2ms for authorization is negligible. For comparison:
- Kubernetes admission webhook latency budget: 10 seconds default timeout
- Envoy ext_authz: sub-millisecond with sidecar OPA
- AWS IAM evaluation: single-digit milliseconds

**Optimization if needed:** Cache the RBAC table in the hook process (refresh on change), only call MCP server for authority checks. RBAC changes infrequently (config-time), authority changes frequently (runtime). This is the Cerbos "90/10 split": 90% of checks (RBAC) can be answered from cache, 10% (authority) need the live PDP.

### Fail-Open vs. Fail-Closed

If the MCP server is unreachable, should hooks allow or deny?

**Production precedents:**
- Kubernetes admission webhooks: configurable (`failurePolicy: Fail` or `failurePolicy: Ignore`)
- Envoy ext_authz: configurable (`failure_mode_allow: true/false`)
- AWS SCPs: fail-closed (if evaluation is impossible, deny)

**Recommendation for Sherpa:** Fail-closed by default. If the MCP server is unreachable, deny all Edit/Write operations. Rationale:
1. The MCP server is a localhost process -- if it is down, something is wrong enough to warrant stopping
2. Fail-open would mean any agent can edit any file when the server crashes -- unacceptable for governance
3. Agents can retry after a short delay; the MCP server should auto-restart

**Exception:** Read operations should not be gated by hooks at all (matching Kubernetes: admission controllers only apply to create/update/delete, not get/watch/list).

---

## Implications for Sherpa's Architecture

1. **Hooks contain zero policy logic.** The hook script is ~20 lines: read stdin JSON, POST to MCP server, parse response, return allow/deny. If you find yourself writing RBAC rules in the hook script, you have made an architectural error.

2. **The MCP server is the single source of authorization truth.** RBAC table, authority state, agent registry -- all in one SQLite database, all evaluated in one code path. No policy logic lives outside the MCP server.

3. **CLAUDE.md is the "first line of defense" but not a security boundary.** An agent that follows its CLAUDE.md role definition will never trigger hook denials. This reduces friction and improves UX. But CLAUDE.md compliance is voluntary -- the hooks are the hard enforcement backstop, and the MCP server is the decision authority.

4. **The three layers are NOT three copies of the same check.** They are three different checks at three different granularity levels:
   - CLAUDE.md: "Should you attempt this?" (behavioral guidance)
   - Hook: "Is this operation authorized?" (hard gate, calls PDP)
   - MCP server: "Is this agent, with this role, holding authority over this scope, permitted to perform this operation?" (full evaluation)

5. **Deny-overrides composition (AND logic).** If any layer says no, the answer is no. CLAUDE.md says "don't try" (soft), hook says "blocked" (hard), MCP server says "denied" (authoritative). This matches AWS IAM's evaluation logic and XACML's deny-overrides combining algorithm.

6. **The hook PEP pattern is battle-tested.** Envoy ext_authz, Kubernetes admission webhooks, Istio authorization policies, API gateway authorization -- all production systems use "dumb interceptor calls smart decision service" as the enforcement pattern.

---

## Open Questions

1. **Hook authorization payload schema.** What exactly does the hook POST to the MCP server? Minimum: `{ agent_id, role, tool_name, file_path }`. Should it include the full tool input (file content for Write)? Content inspection would enable content-based policies but dramatically increases payload size.

2. **RBAC caching in hooks.** Should hooks cache the RBAC table locally for faster coarse-grained checks (role permits Edit/Write at all) and only call the MCP server for fine-grained authority checks? This reduces localhost HTTP calls by ~90% at the cost of cache invalidation complexity.

3. **Agent identity verification.** The hook receives `agent_id` from... where? The agent itself? That is self-reported and untrustworthy. The session start? How is the session identity bound to subsequent hook calls? This is the weakest link in the enforcement chain.

4. **Multiple concurrent agents.** If two agents are running simultaneously, how does the hook know which agent is making the Edit/Write call? Claude Code's hook API receives the tool call but may not include agent identity metadata.

5. **Policy update propagation.** When RBAC rules change (e.g., an agent's role is upgraded from worker to reviewer), how quickly does the change take effect? If hooks cache RBAC, there is a staleness window. If hooks always call the MCP server, the change is immediate.

6. **Granularity of hook interception.** Should hooks fire on every tool call, or only on Edit/Write/Bash? Gating Read operations adds latency without security benefit (matching Kubernetes: admission controllers skip read operations). Gating Bash is important (agents can write files via bash).

---

## Sources

### Primary Sources (deeply analyzed)

- [XACML Wikipedia](https://en.wikipedia.org/wiki/XACML) -- PEP/PDP/PIP/PAP architecture, combining algorithms
- [NIST SP 800-162: ABAC Guide](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) -- PEP/PDP/PIP/PAP formalization, ABAC as superset of RBAC
- [Kubernetes Admission Controllers](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/) -- Request pipeline, what RBAC checks vs what admission checks
- [OPA Gatekeeper](https://kubernetes.io/blog/2019/08/06/opa-gatekeeper-policy-and-governance-for-kubernetes/) -- Policy validation after RBAC authorization
- [Styra: K8s Admission Control vs RBAC](https://www.styra.com/blog/k8s-admission-control-vs-rbac/) -- Complementary, not redundant
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) -- Seven policy types, AND/OR composition, deny-overrides
- [AWS Defense in Depth Control Framework](https://aws.amazon.com/blogs/security/minimize-risk-through-defense-in-depth-building-a-comprehensive-aws-control-framework/) -- Multi-layer authorization strategy
- [OWASP Microservices Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html) -- Three enforcement layers, centralized-with-embedded PDP
- [Oso Authorization Academy: Enforcement](https://www.osohq.com/academy/authorization-enforcement) -- Four enforcement layers, decision vs enforcement equation
- [Aserto: Authorization 3-Body Problem](https://www.aserto.com/blog/the-authorization-3-body-problem) -- PEP/PDP/PIP data flow, defense in depth with single PDP
- [Aserto: Where to Enforce Authorization](https://www.aserto.com/blog/where-should-i-enforce-my-authorization-policy) -- Three PEP locations, stateful PDP
- [OPA-Envoy Plugin](https://www.openpolicyagent.org/docs/envoy) -- Sidecar PDP with proxy PEP, sub-millisecond latency
- [Istio Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/) -- Mesh/namespace/workload scopes, CUSTOM/DENY/ALLOW order
- [OPAL Architecture](https://docs.opal.ac/overview/architecture) -- Real-time policy distribution, server/client pub/sub
- [Cerbos Embeddable PDPs](https://www.cerbos.dev/news/rise-of-embeddable-pdps-in-architectures) -- 90/10 split, shared policies across deployment models
- [AWS Prescriptive Guidance: PEP Implementation](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/pep.html) -- PEPs should be pervasive, packaged as reusable library
- [AWS Prescriptive Guidance: Centralized vs Distributed PDP](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/opa-design-comparison.html) -- Latency vs operational complexity
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) -- Hook API, PreToolUse events
- [Claude Code Hook Security Gap (GitHub #11226)](https://github.com/anthropics/claude-code/issues/11226) -- Hook self-modification vulnerability
- [Google Zanzibar Paper](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/) -- Centralized authorization with distributed check API
- [Zanzibar / ByteByteGo](https://blog.bytebytego.com/p/how-google-manages-trillions-of-authorizations) -- Scale, caching layers, latency

### Secondary Sources (referenced but not deeply analyzed)

- [NextLabs: What is a PEP?](https://www.nextlabs.com/blogs/what-is-a-policy-enforcement-point-pep/) -- PEP role definition
- [Plurilock: Policy Enforcement Point](https://plurilock.com/glossary/policy-enforcement-point/) -- PEP glossary
- [Permit.io PDP](https://docs.permit.io/concepts/pdp/overview/) -- PDP caching, sidecar deployment
- [Cerbos PDP](https://www.cerbos.dev/product-cerbos-pdp) -- Sidecar/service/embedded deployment
- [Istio Security Best Practices](https://istio.io/latest/docs/ops/best-practices/security/) -- Defense in depth with network policies
- [Styra: Fine vs Coarse-Grained Authorization](https://www.styra.com/blog/fine-grained-vs-coarse-grained-authorization/) -- Granularity levels
- [OPAL GitHub](https://github.com/permitio/opal) -- Source, production usage
- [CNCF: OPAL Introduction](https://www.cncf.io/blog/2022/06/27/real-time-dynamic-authorization-an-introduction-to-opal/) -- Push-based updates
- [DEV.to: Claude Code Hooks](https://dev.to/boucle2026/how-to-fix-claude-codes-broken-permissions-with-hooks-23gl) -- Hook enforcement patterns
- [Sysdig: Admission Controllers](https://www.sysdig.com/learn-cloud-native/kubernetes-admission-controllers) -- RBAC vs admission separation

### Raw Links (all URLs encountered)

- https://en.wikipedia.org/wiki/XACML
- https://docs.oracle.com/cd/E27515_01/common/tutorials/authz_xacml_pep.html
- https://www.nextlabs.com/blogs/what-is-a-policy-enforcement-point-pep/
- https://fedresources.com/beyond-the-buzzword-why-the-policy-decision-point-is-the-true-arbiter-of-zero-trust/
- https://bookstack.soffid.com/books/xacml/page/policy-enforcement-point-pep
- https://www.sciencedirect.com/topics/engineering/policy-decision-point
- https://axiomatics.com/resources/reference-library/extensible-access-control-markup-language-xacml
- https://heimdalsecurity.com/blog/the-complete-guide-to-xacml/
- https://www.sciencedirect.com/topics/computer-science/enforcement-point
- https://medium.com/identity-beyond-borders/the-four-horsemen-of-authorization-the-p-ps-pep-pdp-pap-and-pip-42717e445ce7
- https://www.openpolicyagent.org/docs/v0.12.2/kubernetes-admission-control
- https://trilio.io/kubernetes-best-practices/kubernetes-rbac/
- https://kubernetes.io/blog/2019/08/06/opa-gatekeeper-policy-and-governance-for-kubernetes/
- https://medium.com/@alperrardic/securing-kubernetes-clusters-rbac-and-opa-gatekeeper-9a4cebf5f056
- https://www.redhat.com/en/blog/better-kubernetes-security-with-open-policy-agent-opa-part-1
- https://platform9.com/blog/learning-about-kubernetes-admission-controllers-and-opa-gatekeeper/
- https://www.youngju.dev/blog/kubernetes/2026-03-05-kubernetes-rbac-opa-gatekeeper-policy-as-code.en
- https://blog.gitguardian.com/open-policy-agent-with-kubernetes-tutorial-pt-1/
- https://www.openpolicyagent.org/docs/kubernetes/tutorial
- https://medium.com/@onixoni72/securing-kubernetes-with-open-policy-agent-opa-67167157d477
- https://aws.amazon.com/blogs/security/understanding-iam-for-managed-aws-mcp-servers/
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html
- https://aws.amazon.com/blogs/security/minimize-risk-through-defense-in-depth-building-a-comprehensive-aws-control-framework/
- https://docs.aws.amazon.com/IAM/latest/UserGuide/intro-structure.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html
- https://docs.aws.amazon.com/whitepapers/latest/security-at-the-edge/foundational-security-principles-and-best-practices.html
- https://aws.amazon.com/blogs/aws/introducing-resource-control-policies-rcps-a-new-authorization-policy/
- https://aws.amazon.com/blogs/security/iam-policy-types-how-and-when-to-use-them/
- https://sonraisecurity.com/blog/untangle-aws-iam-policy-logic/
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html
- https://builder.aws.com/content/2d1bIioM3UgQZqyaYquu3kTaWAg/comprehensive-guide-of-aws-iam-policy-evaluation-logic
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_AccessPolicyLanguage_Interplay.html
- https://medium.com/@mehrdadmohsenizadeh/aws-iam-policy-evaluation-logic-0ba377e8fdaf
- https://advancedweb.hu/iam-policy-evaluation-logic-explained-with-examples/
- https://ine.com/blog/policy-evaluation-logic-in-aws
- https://www.saurabhmahajan.blog/aws-iam-policies-part-4-iam-evaluation-logic
- https://www.beyondcorp.com/
- https://cloud.google.com/beyondcorp
- https://en.wikipedia.org/wiki/BeyondCorp
- https://www.guidepointsecurity.com/blog/embracing-zero-trust-with-google-beyondcorp/
- https://cloud.google.com/blog/topics/developers-practitioners/zero-trust-and-beyondcorp-google-cloud
- https://m1le5.medium.com/googles-beyondcorp-fac59a237cf9
- https://www.anantacloud.com/post/implementing-zero-trust-architecture-in-gcp-with-beyondcorp-enterprise
- https://cloud.google.com/blog/products/identity-security/why-snap-chose-beyondcorp-enterprise-to-build-a-durable-zero-trust-framework
- https://ztkb.moderncyber.com/vendors/google/
- https://goteleport.com/blog/how-teleport-extends-beyondcorp-and-federal-zero-trust-strategy/
- https://medium.com/@hydrurdgn/api-gateway-patterns-for-microservices-comparing-kong-nginx-and-envoy-eb899f5bbebd
- https://medium.com/@manzurulhoque/implementing-kong-api-gateway-for-microservices-1a4a85303102
- https://www.cloudraft.io/blog/kubernetes-api-gateway-comparison
- https://www.cerbos.dev/blog/kong-api-gateway-authorization
- https://emrah-t.medium.com/kong-api-gateway-with-microservices-part-ii-handling-authentication-and-authorization-with-kong-4f2471b899b0
- https://dzone.com/articles/deploying-envoy-as-an-api-gateway-for-microservice
- https://konghq.com/blog/learning-center/using-microservices-with-api-gateway
- https://github.com/Kong/kong
- https://docs.opal.ac/
- https://github.com/permitio/opal
- https://www.openpolicyagent.org/ecosystem/entry/opal
- https://www.permit.io/blog/introduction-to-opal
- https://authorizationinsoftware.auth0.com/public/49/Authorization-in-Software-f9b69587/ef3fe571
- https://docs.opal.ac/getting-started/intro/
- https://medium.com/@piyushraw12/building-enterprise-grade-authorization-with-opal-and-opa-decentralized-policy-management-7bddb315433a
- https://medevel.com/opal/
- https://www.cncf.io/blog/2022/06/27/real-time-dynamic-authorization-an-introduction-to-opal/
- https://www.openpolicyagent.org/docs
- https://www.fortinet.com/resources/cyberglossary/defense-in-depth
- https://en.wikipedia.org/wiki/Defense_in_depth_(computing)
- https://docs.secureauth.com/ciam/en/authorization-policy-enforcement-points.html
- https://www.aserto.com/blog/where-should-i-enforce-my-authorization-policy
- https://www.csoonline.com/article/565062/how-important-defense-in-depth-will-be-as-the-lines-between-security-layers-blur.html
- https://www.cloudflare.com/learning/security/glossary/what-is-defense-in-depth/
- https://www.strongdm.com/blog/defense-in-depth
- https://www.coalitioninc.com/blog/security-labs/defense-in-depth-building-multi-layered-security-strategy
- https://www.wiz.io/academy/cloud-security/defense-in-depth
- https://www.zigpoll.com/content/how-can-i-efficiently-manage-ownership-and-access-controls-for-ingame-assets-across-multiple-concurrent-players-in-a-distributed-multiplayer-environment
- https://hackernoon.com/authoritative-mmo-data-models-5dc4c1aa30fa
- https://www.gabrielgambetta.com/client-server-game-architecture.html
- https://prdeving.wordpress.com/2023/10/13/mmo-architecture-client-connections-sockets-threads-and-connection-oriented-servers/
- https://www.researchgate.net/publication/221391409_A_distributed_architecture_for_MMORPG
- https://www.jonwinsley.com/gamedev/2019/11/27/designing-mmo-server-architecture/
- https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- https://github.com/pre-commit/pre-commit-hooks
- https://www.atlassian.com/git/tutorials/git-hooks
- https://pre-commit.com/
- https://git-scm.com/docs/githooks
- https://githooks.com/
- https://www.digitalocean.com/community/tutorials/how-to-use-git-hooks-to-automate-development-and-deployment-tasks
- https://code.claude.com/docs/en/hooks
- https://claudefa.st/blog/tools/hooks/hooks-guide
- https://dev.to/boucle2026/how-to-fix-claude-codes-broken-permissions-with-hooks-23gl
- https://platform.claude.com/docs/en/agent-sdk/hooks
- https://egghead.io/secure-your-claude-skills-with-custom-pre-tool-use-hooks~dhqko
- https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns
- https://paddo.dev/blog/claude-code-hooks-guardrails/
- https://github.com/anthropics/claude-code/issues/11226
- https://www.aserto.com/blog/the-authorization-3-body-problem
- https://www.osohq.com/academy/authorization-enforcement
- https://www.osohq.com/post/why-authorization-is-hard
- https://www.aserto.com/blog/authorization-standards-authzen
- https://docs.oracle.com/cd/E19681-01/820-3740/adrcl/index.html
- https://www.thecyberhut.com/why-authorization-is-more-than-just-enforcement/
- https://plurilock.com/glossary/policy-enforcement-point/
- https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/pep.html
- https://dsr.gematik.solutions/docs/concepts/pdp/
- https://www.cerbos.dev/product-cerbos-pdp
- https://github.com/bhits/pep
- https://blogs.oracle.com/cloud-infrastructure/pdppep-zerotrust-oracle-cloud
- https://www.netizen.net/news/post/4862/understanding-policy-enforcement-points-pep
- https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/best-practices.html
- https://www.chriscn.cn/decoupling-authority-with-peppdp/
- https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/
- https://authzed.com/docs/spicedb/concepts/zanzibar
- https://www.osohq.com/learn/google-zanzibar
- https://blog.bytebytego.com/p/how-google-manages-trillions-of-authorizations
- https://authzed.com/learn/google-zanzibar
- https://medium.com/@anshumantripathi/understanding-zanzibar-googles-consistent-global-authorization-system-7e7eeabe3859
- https://workos.com/guide/google-zanzibar
- https://www.aserto.com/blog/google-zanzibar-drive-rebac-authorization-model
- https://authzed.com/zanzibar
- https://www.permit.io/blog/what-is-google-zanzibar
- https://www.sysdig.com/learn-cloud-native/kubernetes-admission-controllers
- https://www.plural.sh/blog/kubernetes-admission-controller-guide/
- https://oneuptime.com/blog/post/2026-01-25-admission-controllers-security/view
- https://www.styra.com/blog/k8s-admission-control-vs-rbac/
- https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
- https://kyverno.io/docs/introduction/admission-controllers/
- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/
- https://notes.kodekloud.com/docs/Certified-Kubernetes-Application-Developer-CKAD/Security/Admission-Controllers/page
- https://www.armosec.io/blog/kubernetes-admission-controller/
- https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/using-opa.html
- https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/opa-design-comparison.html
- https://www.styra.com/blog/5-opa-deployment-performance-models-for-microservices/
- https://tfir.io/best-practices-for-authorization-in-microservices/
- https://aws.amazon.com/blogs/opensource/deploying-open-policy-agent-opa-as-a-sidecar-on-amazon-elastic-container-service-amazon-ecs/
- https://www.permit.io/blog/policy-engine-showdown-opa-vs-openfga-vs-cedar
- https://docs.permit.io/concepts/pdp/overview/
- https://www.cerbos.dev/news/rise-of-embeddable-pdps-in-architectures
- https://docs.styra.com/opa/deploy/k8s
- https://www.openpolicyagent.org/docs/deploy/k8s
- https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/distributed-pdp.html
- https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/centralized-pdp.html
- https://www.openpolicyagent.org/docs/envoy
- https://github.com/open-policy-agent/opa-envoy-plugin
- https://www.openpolicyagent.org/docs/v0.31.0/envoy-introduction/
- https://istio.io/latest/blog/2021/better-external-authz/
- https://spiffe.io/docs/latest/microservices/envoy-opa/readme/
- https://www.openpolicyagent.org/docs/latest/envoy-tutorial-istio/
- https://spiffe.io/docs/latest/microservices/envoy-jwt-opa/readme/
- https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/ext_authz
- https://axiomatics.com/resources/reference-library/fine-grained-access-control-fgac
- https://www.styra.com/blog/fine-grained-vs-coarse-grained-authorization/
- https://www.osohq.com/learn/what-is-fine-grained-authorization
- https://www.okta.com/identity-101/fine-grained-access-control/
- https://blog.plainid.com/coarse-grained-and-fine-grained-authorization
- https://www.strongdm.com/blog/fine-grained-vs-coarse-grained-access-control
- https://permify.co/post/fine-grained-access-control-where-rbac-falls-short/
- https://www.descope.com/blog/post/coarse-vs-fine-grained-authorization
- https://aws.amazon.com/verified-permissions/
- https://delinea.com/blog/fine-grained-vs.-coarse-grained-access-control
- https://istio.io/latest/docs/reference/config/security/authorization-policy/
- https://istio.io/latest/docs/ops/best-practices/security/
- https://istio.io/latest/docs/ambient/getting-started/enforce-auth-policies/
- https://www.solo.io/blog/a-guide-to-authorization-policy-in-ambient-mesh
- https://istio.io/latest/docs/concepts/security/
- https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview
- https://istio.io/latest/blog/2019/v1beta1-authorization-policy/
- https://istio.io/latest/docs/ambient/usage/l4-policy/
- https://www.techtarget.com/searchsecurity/answer/Authentication-caching-How-it-reduces-enterprise-network-congestion
- https://dev.to/stevenstuartm/why-jwts-make-terrible-authorization-tokens-3c8g
- https://docs.oracle.com/cd/E12890_01/ales/docs32/policymanager/performance.html
- https://www.ory.sh/blog/perils-of-caching-in-iam
- https://www.cisco.com/c/en/us/td/docs/ios/12_2sb/feature/guide/sbcache.html
- https://www.saurabhmahajan.blog/aws-iam-policies-part-4-iam-evaluation-logic
- https://www.nextlabs.com/blogs/what-is-policy-decision-point-pdp/
