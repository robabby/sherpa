# RBAC + Resource-Level Authority Composition Patterns

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** How do role-based permission systems (RBAC) compose with resource-level authority grants (leases, locks, ownership)? What patterns exist in production systems? What is the right composition model for Sherpa?

---

## Key Discoveries

### 1. AWS IAM Defines the Canonical Two-Layer Model: Identity-Based + Resource-Based Policies

AWS IAM is the clearest production example of composing "who you are" (role) with "what the resource allows" (resource policy). The evaluation logic is explicit and well-documented:

**Same-account composition uses UNION semantics:**
- If the identity-based policy allows, access is granted (even if resource policy is silent)
- If the resource-based policy allows, access is granted (even if identity policy is silent)
- An explicit Deny in EITHER layer overrides any Allow
- Default is Deny (if neither layer allows, access is denied)

| Identity Policy | Resource Policy | Result |
|----------------|----------------|--------|
| Allow | Allow | **ALLOW** |
| Allow | Silent | **ALLOW** |
| Silent | Allow | **ALLOW** |
| Allow | Deny | **DENY** |
| Deny | Allow | **DENY** |
| Silent | Silent | **DENY** (default) |

**Cross-account composition uses INTERSECTION semantics:**
- BOTH the identity-based policy AND the resource-based policy must allow access
- This is stricter: being a valid role-holder in Account A is necessary but not sufficient; the resource in Account B must also explicitly grant access

**Critical design lesson for Sherpa:** The same system uses different composition operators depending on the trust boundary. Within a single Sherpa workspace (same-account analog), UNION makes sense: either the role grants permission OR the resource explicitly allows the agent. Across workspaces or organizations, INTERSECTION is safer: the agent needs both role permission AND explicit resource-level grant.

Sources:
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [Identity-based vs. Resource-based Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)
- [Single-account Evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-basics.html)

### 2. Kubernetes Leases + RBAC: The Exact Two-Layer Pattern Sherpa Needs

Kubernetes provides the most directly applicable precedent. The composition works in exactly two layers:

**Layer 1 (RBAC): Gates API access.** A ServiceAccount must have a Role granting permission to `create`, `get`, `update` Lease objects in the `coordination.k8s.io` API group. Without this Role, the agent cannot even attempt to acquire a lease. RBAC answers: "Is this agent allowed to participate in coordination?"

```yaml
# Example: RBAC Role that permits lease creation
- apiGroups: ["coordination.k8s.io"]
  resources: ["leases"]
  verbs: ["create", "get", "update"]
# Deletion restricted to specific named lease
- apiGroups: ["coordination.k8s.io"]
  resources: ["leases"]
  resourceNames: ["demo-lock"]
  verbs: ["delete"]
```

**Layer 2 (Lease mechanism): Gates concurrent access.** Once RBAC permits API access, the lease itself enforces mutual exclusion. Multiple authorized agents may all have the RBAC permission to acquire leases, but only one succeeds at a time. The lease answers: "Does this agent currently hold exclusive access?"

**This creates defense-in-depth:** RBAC prevents unauthorized API calls, while leases prevent concurrent execution even among authorized actors. The two layers are orthogonal: RBAC is about authorization (who CAN), leases are about coordination (who CURRENTLY DOES).

Source: [Built-In Locks for Kubernetes Workloads](https://www.acritelli.com/blog/kubernetes-leases/)

### 3. Azure Blob Leases: RBAC Gates Lease Operations, Lease Gates Resource Mutations

Azure Blob Storage provides an extremely well-documented composition:

**RBAC requirement:** To call the `Lease Blob` API, an agent needs the `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write` RBAC action. The least-privileged built-in role is **Storage Blob Data Contributor**. Without this role assignment, the lease API call itself is rejected (403 Forbidden).

**Lease mechanism:** Once RBAC permits the API call, the lease provides exclusive write/delete access. While a lease is active:
- Write operations MUST include the active lease ID (or get 412 Precondition Failed)
- Read operations succeed without a lease ID
- `Break` can be called by any authorized request (no matching lease ID required)

**Five lease operations:** Acquire, Renew, Change, Release, Break
**Five lease states:** Available, Leased, Expired, Breaking, Broken

**Key design insight:** The `Break` operation is interesting for Sherpa. "Any authorized request can break the lease; the request isn't required to specify a matching lease ID." This maps to Sherpa's `override_authority` tool: a Planner (or human operator) with the right RBAC role can break any agent's authority without needing their fencing token.

Source: [Azure Lease Blob REST API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob)

### 4. Google Chubby: ACLs on Nodes Gate Lock Acquisition

Chubby (Google's distributed lock service, 2006) composes access control with locks through its file-system model:

**Layer 1: ACL on the node.** Each Chubby node has an ACL (stored as a separate file) with three permission types: read, write, change-ACL. Full access control checks are performed when a handle is opened (`Open()`).

**Layer 2: Lock on the node.** After successfully opening a handle (ACL permits), the client can call `Acquire()` or `TryAcquire()` to obtain the lock. The lock is a separate mechanism from the ACL.

**Composition:** ACLs answer "can this client interact with this node at all?" Locks answer "does this client have exclusive access right now?" An ACL check happens once (at handle creation), but the lock state changes dynamically. Permissions are per-file and do not depend on parents.

**Sequencers as fencing tokens:** Chubby's `GetSequencer()` returns an opaque byte-string describing the lock state. This is passed to resource servers via `SetSequencer()` and validated via `CheckSequencer()` -- the same fencing token pattern Sherpa uses.

Sources:
- [Chubby paper (Burrows, OSDI 2006)](https://research.google.com/archive/chubby-osdi06.pdf)
- [Chubby annotated paper](https://mwhittaker.github.io/papers/html/burrows2006chubby.html)

### 5. PostgreSQL GRANT + Row-Level Security: Two Layers with Explicit Composition Semantics

PostgreSQL provides the cleanest formal model of two-layer authorization composition:

**Layer 1: GRANT privileges (RBAC).** Standard SQL privileges control whether a user can SELECT, INSERT, UPDATE, DELETE on a table at all. This is classic role-based access control.

**Layer 2: Row-Level Security (resource-level).** RLS policies further restrict which specific rows a user can access, even if they have table-level GRANT privileges.

**Composition is AND (intersection):**
- A user must FIRST pass the GRANT check (table-level privilege)
- THEN pass the RLS policy check (row-level filter)
- RLS cannot grant access that GRANT denies
- But RLS CAN restrict access that GRANT allows

**Multiple RLS policy composition:**
- **Permissive policies** (default) combine with OR: any matching permissive policy grants access
- **Restrictive policies** combine with AND: ALL restrictive policies must pass
- Mixed: at least one permissive must pass AND all restrictive must pass

**Evaluation order:** RLS policy expressions are evaluated for each row BEFORE user-specified WHERE clauses, preventing data leakage through user-defined functions.

**Bypass:** Superusers and roles with BYPASSRLS always bypass row security. Table owners bypass by default unless forced to comply via `FORCE ROW LEVEL SECURITY`.

**Implication for Sherpa:** This maps directly. RBAC (role-based table of permissions) determines "can this agent type modify proposals at all?" RLS-equivalent (authority state) determines "can this specific agent modify THIS specific proposal right now?"

Sources:
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)

### 6. Google Zanzibar / SpiceDB: Relationships Subsume Both Roles and Ownership

Zanzibar (Google's global authorization system) and its open-source implementation SpiceDB take a different approach: they unify RBAC and resource-level ownership into a single relationship graph.

**Core model:** Everything is a relationship tuple: `object#relation@user`. For example:
- `document:readme#owner@alice` (ownership)
- `org:acme#member@bob` (role membership)
- `folder:shared#viewer@org:acme#member` (role-based access through group membership)

**Permissions compose via set operations:**
- UNION: `permission view = viewer + editor + owner` (any of these relationships grants view)
- INTERSECTION: require multiple conditions simultaneously
- EXCLUSION: `permission view = viewer - banned` (viewer unless banned)

**Caveats add ABAC-style conditions to relationships:**
SpiceDB caveats attach conditional logic directly to relationship edges: a relationship grants access only when the caveat evaluates to true. Example: `relation viewer: user with temporal_grant` -- the viewer relationship only applies during a time window.

**Netflix's production usage:** Netflix combined multiple attribute checks in a single caveat attached to resource-level relationships:
```
caveat match_fine(expected_accounts list<string>,
  expected_regions list<string>, ...) {
  observed_account in expected_accounts &&
  observed_region in expected_regions && ...
}
```

**Implication for Sherpa:** Zanzibar suggests that the RBAC layer and authority layer could be unified into a single relationship model. Rather than two separate systems, authority becomes a relationship: `scope:src/foo.ts#authority_holder@agent:worker-42`. The role check becomes another relationship: `workspace#worker@agent:worker-42`. Both are evaluated through the same graph traversal.

However, this unification adds complexity. The two-layer model (RBAC gates who CAN request, authority gates who CURRENTLY HOLDS) is simpler to reason about and implement.

Sources:
- [Google Zanzibar paper](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/)
- [SpiceDB / AuthZed Zanzibar introduction](https://authzed.com/learn/google-zanzibar)
- [ABAC meets Zanzibar with SpiceDB Caveats](https://authzed.com/blog/abac-example)

### 7. XACML Policy Combining Algorithms: Formal Composition Operators

XACML (eXtensible Access Control Markup Language) defines formal algorithms for combining multiple authorization policy layers:

| Algorithm | Behavior | Use Case |
|-----------|----------|----------|
| **Deny-overrides** | Any Deny wins, regardless of other Allows | Safety-critical: "if anything says no, the answer is no" |
| **Permit-overrides** | Any Permit wins, regardless of other Denies | Availability-critical: "if anything says yes, the answer is yes" |
| **First-applicable** | First policy that returns a definitive result wins | Ordered priority: check most specific rule first |
| **Only-one-applicable** | Exactly one policy must apply; error if multiple match | Strict non-overlapping policy domains |

**Sherpa implication:** The RBAC layer and authority layer should use **deny-overrides** (AND with deny precedence): RBAC Deny always blocks, authority Deny always blocks, access requires both to Allow. This is the safest composition and matches PostgreSQL's GRANT+RLS model.

Sources:
- [XACML Combining Algorithms (Axiomatics)](https://www.axiomatics.com/blog/understanding-xacml-combining-algorithms/)
- [XACML 3.0 Core Spec](https://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-cd-03-en.html)

### 8. NIST ABAC (SP 800-162): Attributes Subsume Roles

NIST SP 800-162 formalizes ABAC as a superset of RBAC:

- RBAC is a special case of ABAC where the only attribute considered is "role"
- ABAC adds object attributes (resource properties), environment attributes (time, location), and action attributes
- The key difference: RBAC assigns privileges at role-assignment time; ABAC determines privileges "just in time" based on current attribute values

**Four functional components (PEP/PDP/PIP/PAP):**
- **PEP** (Policy Enforcement Point): intercepts requests, enforces decisions
- **PDP** (Policy Decision Point): evaluates policies against attributes, returns allow/deny
- **PIP** (Policy Information Point): provides attribute values to the PDP
- **PAP** (Policy Administration Point): manages policies

**Sherpa mapping:** The MCP server is the PEP. The RBAC table + authority state machine together form the PDP. The agent registry and scope database are PIPs. The Sherpa config is the PAP.

Sources:
- [NIST SP 800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)
- [SP 800-162 Full PDF](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-162.pdf)

### 9. Oso / Cerbos: Layered Authorization as an Explicit Pattern

Modern authorization libraries (Oso, Cerbos) explicitly name the pattern of layering role checks with resource-level checks:

**Cerbos articulation:** "By layering resource-specific checks on top of role checks, you add an extra defense layer. Even if roles are misassigned or an account is compromised, the attacker might still be limited by resource-level restrictions."

**Four concrete patterns from Cerbos:**
1. **Ownership verification**: Allow editing only if `user == resource.author`
2. **Status-dependent access**: Allow editing only if `resource.status == 'draft'`
3. **Tenant isolation**: Require `resource.tenant == user.tenant`
4. **Role + condition combination**: Allow action if user has role AND condition is met

**Oso's resource-specific roles:** Users are granted roles on specific resources, not globally. A user might be `editor` on Document A but `viewer` on Document B. This naturally merges RBAC with resource-level scoping.

**Oso's composition guidance:** "Avoid using both relationship and role permissions simultaneously on the same resource. Instead, use parent-child implied roles." If someone holds a role on a parent, they automatically inherit implied roles on children.

**Evaluation order (from Oso ReBAC academy):**
1. Direct relationship check first (ownership)
2. Role-based fallback (does the user have a role on this resource?)
3. Parent escalation (does the user have access via a parent resource?)

Sources:
- [Cerbos: Resource-Based Authorization](https://www.cerbos.dev/blog/how-to-implement-resource-based-authorization)
- [Oso Authorization Academy: ReBAC](https://www.osohq.com/academy/relationship-based-access-control-rebac)
- [Oso Resource-Specific Roles](https://www.osohq.com/docs/modeling-in-polar/role-based-access-control-rbac/resourcespecific)

### 10. Game Networking: Authority Is Orthogonal to Player Roles

Game networking systems separate authority (who controls an entity's state) from roles (what a player is allowed to do):

**Unity Netcode:** Each networked object has exactly one authority holder. The server decides who holds authority. Authority determines who can mutate state, not who is "allowed" to -- it's a coordination mechanism, not an access control mechanism. Authority can be server-held (default for NPCs, items) or client-held (player's own character).

**coherence split authority model:**
- **State Authority**: Can change synced properties (writes)
- **Input Authority**: Can send commands to the State Authority holder
- **Full Authority**: Both state and input

**Three transfer modes:** Request (two-step handshake, holder can deny), Steal (immediate takeover), NotTransferable (permanent ownership)

**Key insight:** Game servers do NOT typically have RBAC layers gating authority requests. Authority is a runtime coordination problem, not an access control problem. The "who is allowed to request authority" question is answered by game logic (e.g., "only the host can transfer NPCs"), not by a permission system.

**Implication for Sherpa:** Games can get away without RBAC because they have fixed player types and trusted clients (or an authoritative server). Sherpa's agent ecosystem is more dynamic: agents can have different roles, and the set of roles/agents changes over time. This is why Sherpa needs an explicit RBAC layer that games don't.

Sources:
- [Unity Netcode Authority](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/terms-concepts/authority.html)
- [coherence Authority Overview](https://docs.coherence.io/manual/authority)
- [coherence Authority Transfer](https://docs.coherence.io/manual/authority/authority-transfer)

### 11. NIST RBAC Standard (INCITS 359): Constrained RBAC and Separation of Duties

The ANSI/INCITS 359-2012 standard defines four RBAC models:

| Model | Description |
|-------|-------------|
| **Core RBAC** | Users, roles, permissions, sessions. Users assigned to roles; roles granted permissions. |
| **Hierarchical RBAC** | Roles inherit permissions from parent roles. Senior roles automatically acquire junior role permissions. |
| **Constrained RBAC** | Adds Separation of Duty (SoD) constraints. |
| **Symmetric RBAC** | Adds permission-role review (reverse lookup). |

**Static Separation of Duty (SSD):** Prevents conflicting role assignments. If a user has the `worker` role, they cannot also have the `reviewer` role on the same resource. This is enforced at role-assignment time.

**Dynamic Separation of Duty (DSD):** Allows conflicting role assignments but prevents activating both in the same session. A user CAN be both `worker` and `reviewer`, but cannot activate both roles simultaneously.

**Sherpa implication:** DSD is more appropriate for Sherpa. An agent might have both `worker` and `reviewer` capabilities, but should not review its own work. The constraint is: "cannot hold authority as reviewer on a scope where you previously held authority as worker within the same task lifecycle."

Sources:
- [ANSI INCITS 359-2012 RBAC Standard](https://blog.ansi.org/ansi/role-based-access-control-rbac-incits-359/)
- [NIST RBAC Standard Draft](https://csrc.nist.gov/csrc/media/projects/role-based-access-control/documents/rbac-std-draft.pdf)

### 12. etcd: RBAC on Key Ranges + Leases as Orthogonal Systems

etcd provides both RBAC and leases but treats them as completely orthogonal:

**RBAC controls key access:** Roles grant read/write permissions on key ranges (e.g., role `app1` has readwrite on `/app1/` prefix). RBAC is disabled by default. The `root` user/role has full permissions.

**Leases control coordination:** `LeaseGrant(TTL)` creates a lease. Keys are attached to leases. When the lease expires, attached keys are auto-deleted. `LeaseKeepAlive` renews.

**Composition:** There is no formal coupling between RBAC and leases. If a client has RBAC permission to write to `/locks/my-lock`, they can create a key there with a lease. The RBAC system doesn't know or care that the key is being used as a lock. The lease system doesn't know or care about the client's RBAC role.

**Implication for Sherpa:** etcd's approach (orthogonal, no coupling) is the simplest but also the least safe. It means any agent with write permission can create locks on any key in their permitted range, regardless of whether that makes semantic sense. Sherpa should be more opinionated: the RBAC layer should explicitly gate which agents can request authority on which scope types.

Sources:
- [etcd RBAC](https://etcd.io/docs/v3.5/learning/why/)
- [etcd Lease API](https://etcd.io/docs/v3.5/learning/api/#lease-api)

---

## The Composition Model for Sherpa

### The Answer: RBAC Gates WHO Can Request Authority; Authority Machine Gates WHEN/HOW

Yes, the intuition in the research question is correct, and it's validated by every production system examined. The composition follows a two-layer AND (deny-overrides) pattern:

```
Access Decision = RBAC_check(agent_role, operation, resource_type)
                  AND
                  Authority_check(agent_id, scope, fencing_token)
```

**Layer 1: RBAC (static, role-based)**
- Evaluated FIRST
- Answers: "Is an agent with this role permitted to perform this operation on this type of resource?"
- Independent of specific resource instances
- Changes infrequently (configuration-time)
- Example: "Can a `worker` role call `acquire_authority` on `implementation_files` scopes?"

**Layer 2: Authority State Machine (dynamic, resource-instance-level)**
- Evaluated SECOND (only if RBAC passes)
- Answers: "Does this specific agent currently hold authority over this specific scope?"
- Depends on runtime state (who holds the lease, fencing token validity)
- Changes frequently (every heartbeat, every task dispatch)
- Example: "Does agent-42 hold a valid lease on `src/components/foo.tsx`?"

### Why AND (Deny-Overrides), Not OR (Union)

Unlike AWS IAM's same-account union semantics, Sherpa should use intersection (AND):

1. **RBAC Deny always blocks.** Even if an agent somehow holds authority over a scope, if its role doesn't permit the operation type, the operation fails. This prevents privilege escalation through authority acquisition.

2. **Authority absence always blocks.** Even if an agent's role permits the operation type, without current authority (valid fencing token), the operation fails. This prevents concurrent modification.

3. **Both must Allow for access.** This is the PostgreSQL GRANT+RLS model: table privilege (RBAC) is necessary but not sufficient; row policy (authority) is also required.

### The Concrete Composition Table

| RBAC Check | Authority Check | Result | Example |
|-----------|----------------|--------|---------|
| Allow | Holds authority | **ALLOW** | Worker with `worker` role holds lease on `src/foo.ts`, writes to it |
| Allow | No authority | **DENY** | Worker has right role but hasn't acquired authority on this scope |
| Deny | Holds authority | **DENY** | Researcher role holds authority (shouldn't happen -- RBAC should prevent acquisition) |
| Deny | No authority | **DENY** | Researcher cannot modify shared config |

### Where Each System Answers Which Question

| Question | Answered By | Example |
|----------|-------------|---------|
| Can a `worker` create proposals? | RBAC | Yes: workers can create proposals (additive) |
| Can a `researcher` modify shared config? | RBAC | No: researchers have read-only on config |
| Can a `reviewer` approve proposals? | RBAC | Yes: reviewers can approve |
| Can agent-42 write to `src/foo.ts` RIGHT NOW? | Authority | Only if agent-42 holds a valid lease with matching fencing token |
| Can agent-42 acquire authority on task T7? | RBAC + Authority | RBAC: does agent-42's role allow acquiring authority on task scopes? Authority: is the scope currently available (UNASSIGNED/EXPIRED)? |
| Can agent-42 break agent-99's authority? | RBAC | Only if agent-42 has `operator` or `integrator` role (which permits `override_authority`) |

### The RBAC Table for Sherpa

Based on the five roles and five resource types from the research question:

| | proposals | shared-artifacts | tasks | config | agents |
|---|---|---|---|---|---|
| **researcher** | create, read | read | read | read | read |
| **worker** | create, read | read | execute, read | read | read |
| **reviewer** | create, read, approve | read | read, approve | read | read |
| **integrator** | create, read, approve, modify | modify | create, execute, read, approve | modify | read |
| **operator** | create, read, approve, modify | modify | create, execute, read, approve, modify | modify | modify |

**Critical RBAC constraints for authority operations:**

| Authority Operation | Required RBAC Permission |
|--------------------|-----------------------|
| `acquire_authority` | `execute` on the target resource type |
| `release_authority` | Implicit (holder can always release) |
| `transfer_authority` | `execute` on source + target scopes |
| `override_authority` | `modify` on the target resource type (operator/integrator only) |
| `heartbeat_authority` | Implicit (holder can always heartbeat) |

### Separation of Duty Constraints

Following NIST INCITS 359's Dynamic SoD model:

1. **Worker/Reviewer SoD:** An agent cannot hold `reviewer` authority on a scope where it previously held `worker` authority within the same task lifecycle. (Prevents self-review.)
2. **Researcher/Integrator SoD:** A researcher's proposals cannot be integrated by the same agent acting as integrator. (Prevents rubber-stamping.)
3. **Operator override audit:** All `override_authority` calls must include a reason string and are logged immutably. (Audit trail for emergency actions.)

---

## Implications for Sherpa's RBAC + Authority Design

1. **Keep the two layers separate.** Every production system examined (AWS IAM, Kubernetes, Azure Blob, PostgreSQL, Chubby, etcd) maintains a clear separation between "who is authorized" (RBAC/ACL) and "who currently holds access" (lease/lock/authority). Merging them (Zanzibar-style) is more powerful but significantly more complex. Start with the two-layer model.

2. **RBAC is evaluated once at operation start; authority is checked continuously.** Like Chubby's ACL check at `Open()` time, RBAC can be checked when an MCP tool call arrives. Authority (fencing token validation) must be checked on every mutation. This keeps the RBAC layer lightweight.

3. **The `Break`/`Override` operation is the crucial composition point.** Azure Blob's `Break` demonstrates that "any authorized request" (RBAC-gated) can break a lease without the holder's token. Sherpa's `override_authority` should follow this: the RBAC layer determines who can break anyone's authority (operators, integrators), while the authority layer tracks the consequences (grace period, state preservation).

4. **Fencing tokens are orthogonal to RBAC.** The fencing token validates that the current holder is still the legitimate authority. It does NOT encode role information. Roles are checked separately. This matches every system examined: tokens/sequencers/lease-IDs contain coordination state, not permission state.

5. **SoD constraints bridge the two layers.** Separation of Duty is the one place where RBAC must be aware of authority history. "This agent held worker authority on this scope" is an authority-layer fact that creates an RBAC-layer constraint ("therefore this agent cannot hold reviewer authority on this scope"). This is the only coupling point between the two layers.

6. **Start with five roles, not ten.** The five proposed roles (researcher, worker, reviewer, integrator, operator) map cleanly to the standard RBAC hierarchy. Adding more roles should be driven by SoD constraints that can't be expressed with the current five.

---

## Open Questions

1. **Role hierarchy:** Should `operator` inherit all `integrator` permissions, which inherits all `reviewer` permissions? Or should roles be flat/independent? Hierarchical RBAC (NIST model) reduces configuration but makes SoD constraints harder to express.

2. **Scope-level RBAC:** Should RBAC permissions vary by scope? (e.g., a `worker` can acquire authority on `src/**` but not on `docs/initiatives/**`). This adds a third dimension to the permission table but would prevent workers from accidentally modifying governance artifacts.

3. **Implicit authority acquisition:** When a task is dispatched to a worker, should authority be implicitly acquired (current design), or should the worker explicitly call `acquire_authority`? Implicit is simpler but obscures the RBAC check point.

4. **RBAC storage:** Should the RBAC table live in the same SQLite database as the authority state machine, or in a separate configuration file (e.g., `sherpa.config.ts`)? Config-file approach is simpler and matches the "changes infrequently" nature of RBAC.

5. **Cross-workspace authority:** If Sherpa is ever used across multiple workspaces, the composition model needs to shift from UNION to INTERSECTION (AWS cross-account model). Should this be designed for now or deferred?

6. **Agent identity vs. role:** Is the RBAC check against the agent's declared role at session start, or against a persistent identity? If an agent claims to be a `worker`, how is that verified? This connects to the broader agent identity/trust problem.

---

## Sources

### Primary Sources (deeply analyzed)
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) -- Canonical two-layer authorization composition with explicit union/intersection semantics
- [AWS Identity-based vs. Resource-based Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html) -- How the two policy types interact
- [Azure Lease Blob REST API](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob) -- Complete lease state machine with RBAC requirements for each operation
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) -- GRANT + RLS two-layer composition with permissive/restrictive policy semantics
- [Built-In Locks for Kubernetes Workloads (Critelli)](https://www.acritelli.com/blog/kubernetes-leases/) -- Explicit RBAC + Lease two-layer pattern with concrete Role definitions
- [Google Zanzibar Paper](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/) -- Unified relationship-based authorization at scale
- [SpiceDB Zanzibar Introduction (AuthZed)](https://authzed.com/learn/google-zanzibar) -- Relationship tuples, set operations, and permission evaluation
- [SpiceDB Caveats / ABAC Example (AuthZed)](https://authzed.com/blog/abac-example) -- Composing ABAC conditions with ReBAC relationships, Netflix production usage
- [Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) -- Fencing tokens, lease semantics, lock service vs. resource separation
- [Chubby Paper (Burrows, OSDI 2006)](https://research.google.com/archive/chubby-osdi06.pdf) -- ACL-gated lock service, sequencers as fencing tokens
- [NIST SP 800-162: ABAC Guide](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) -- ABAC as superset of RBAC, PEP/PDP/PIP/PAP architecture
- [ANSI INCITS 359-2012 RBAC Standard](https://blog.ansi.org/ansi/role-based-access-control-rbac-incits-359/) -- Core/Hierarchical/Constrained RBAC, SSD/DSD separation of duties
- [Oso Authorization Academy: ReBAC](https://www.osohq.com/academy/relationship-based-access-control-rebac) -- Composing relationships with roles, evaluation order
- [Cerbos: Resource-Based Authorization](https://www.cerbos.dev/blog/how-to-implement-resource-based-authorization) -- Layered authorization patterns with concrete examples

### Secondary Sources (referenced but not deeply analyzed)
- [OPA Access Control Systems Comparison](https://www.openpolicyagent.org/docs/comparisons/access-control-systems) -- OPA as a unified policy engine for RBAC/ABAC/ReBAC
- [XACML Combining Algorithms (Axiomatics)](https://www.axiomatics.com/blog/understanding-xacml-combining-algorithms/) -- Deny-overrides, permit-overrides, first-applicable
- [Kubernetes RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) -- Role, ClusterRole, RoleBinding, ClusterRoleBinding
- [Kubernetes Leases](https://kubernetes.io/docs/concepts/architecture/leases/) -- Lease objects for coordination
- [etcd RBAC and Leases](https://etcd.io/docs/v3.5/learning/why/) -- Orthogonal RBAC + lease systems
- [Unity Netcode Authority](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/terms-concepts/authority.html) -- Server authority vs distributed authority
- [coherence Authority Transfer](https://docs.coherence.io/manual/authority/authority-transfer) -- Request/Steal/NotTransferable transfer modes
- [NIST RBAC FAQs](https://csrc.nist.gov/projects/role-based-access-control/faqs) -- NIST RBAC project overview
- [NIST SP 800-178: ABAC vs RBAC Comparison](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-178.pdf) -- Formal comparison

### Raw Links (all URLs encountered, including unexplored)
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-basics.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/access_controlling.html
- https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob
- https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-lease
- https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access
- https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- https://www.postgresql.org/docs/current/sql-createpolicy.html
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://pgdash.io/blog/exploring-row-level-security-in-postgres.html
- https://satoricyber.com/postgres-security/postgres-row-level-security/
- https://www.tangramvision.com/blog/hands-on-with-postgresql-authorization-part-2-row-level-security
- https://kubernetes.io/docs/reference/access-authn-authz/rbac/
- https://kubernetes.io/docs/concepts/architecture/leases/
- https://www.acritelli.com/blog/kubernetes-leases/
- https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/
- https://authzed.com/learn/google-zanzibar
- https://authzed.com/blog/abac-example
- https://authzed.com/blog/check-it-out
- https://authzed.com/docs/spicedb/modeling/access-control-management
- https://authzed.com/blog/writing-relationships-to-spicedb
- https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
- https://research.google.com/archive/chubby-osdi06.pdf
- https://mwhittaker.github.io/papers/html/burrows2006chubby.html
- https://csrc.nist.gov/pubs/sp/800/162/upd2/final
- https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-162.pdf
- https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-178.pdf
- https://blog.ansi.org/ansi/role-based-access-control-rbac-incits-359/
- https://csrc.nist.gov/csrc/media/projects/role-based-access-control/documents/rbac-std-draft.pdf
- https://csrc.nist.gov/projects/role-based-access-control/faqs
- https://www.openpolicyagent.org/docs/comparisons/access-control-systems
- https://www.osohq.com/academy/relationship-based-access-control-rebac
- https://www.osohq.com/docs/modeling-in-polar/role-based-access-control-rbac/resourcespecific
- https://www.osohq.com/learn/rbac-role-based-access-control
- https://www.cerbos.dev/blog/how-to-implement-resource-based-authorization
- https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/terms-concepts/authority.html
- https://docs.coherence.io/manual/authority
- https://docs.coherence.io/manual/authority/authority-transfer
- https://etcd.io/docs/v3.5/learning/why/
- https://etcd.io/docs/v3.5/learning/api/
- https://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-cd-03-en.html
- https://www.axiomatics.com/blog/understanding-xacml-combining-algorithms/
- https://en.wikipedia.org/wiki/Role-based_access_control
- https://en.wikipedia.org/wiki/Google_Zanzibar
- https://www.permit.io/blog/what-is-google-zanzibar
- https://www.permit.io/blog/authorization-with-open-policy-agent-opa
- https://medium.com/@mehrdadmohsenizadeh/aws-iam-policy-evaluation-logic-0ba377e8fdaf
- https://medium.com/coinmonks/chubby-a-centralized-lock-service-for-distributed-applications-390571273052
- https://medium.com/@umasudheeryadala/spicedb-the-modern-approach-to-authorization-in-your-applications-de5d2f349f24
- https://brunokrebs.com/2024-08-31-spicedb-in-action/
- https://docs.fga.dev/authorization-concepts
- https://www.zanzibar.academy/
- https://thenewstack.io/role-based-access-control-five-common-authorization-patterns/
- https://surfingcomplexity.blog/2025/03/03/locks-leases-fencing-tokens-fizzbee/
- https://levelup.gitconnected.com/beyond-the-lock-why-fencing-tokens-are-essential-5be0857d5a6a
- https://microservices.io/post/architecture/2025/04/25/microservices-authn-authz-part-1-introduction.html
- https://link.springer.com/content/pdf/10.1007/1-4020-8128-6_16.pdf
- https://ceur-ws.org/Vol-180/paper05.pdf
- https://agingdeveloper.com/article/2022-06-18-distributed-authorization
- https://profsandhu.com/journals/tissec/ANSI+INCITS+359-2004.pdf
- https://www.cs.purdue.edu/homes/ninghui/papers/aboutRBACStandard.pdf
- https://sre.google/sre-book/managing-critical-state/
