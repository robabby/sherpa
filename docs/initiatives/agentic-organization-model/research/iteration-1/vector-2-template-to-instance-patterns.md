# Vector 2: Template-to-Instance Architecture Patterns

**Question:** How do established software systems handle the split between a definition/template and a persistent instance that accumulates state? What's the universal pattern?
**Agent dispatched:** 2026-03-12

## Findings

### 1. Kubernetes: Spec (Template) vs Status (Instance State)

- Kubernetes codifies the template/instance split as the **spec/status pattern**. Every object has a `spec` (desired state, set by the user) and a `status` (observed state, set by the system). Controllers continuously reconcile the two.
- **PodTemplates** are embedded inside workload resources (Deployment, StatefulSet, Job). Modifying the template does not update existing Pods — it creates new ones.
- **Template has:** container images, resource requests/limits, volume mounts, env vars, labels, restart policy.
- **Instance accumulates:** phase (Pending/Running/Succeeded/Failed/Unknown), conditions, Pod IP, node assignment, container statuses, restart counts, timestamps, UID.
- **StatefulSets** add stable identity — ordinal index, stable DNS hostname, persistent volume claims bound 1:1 to pod identity.
- **Lineage tracking:** Pods carry `metadata.ownerReferences` — pointer to parent controller, enabling instance → template tracing.
- **Audit/history:** Kubernetes itself doesn't keep pod history. Audit logging is external via kube-apiserver audit backend.

### 2. Cloud IAM: Role (Template) vs Principal/Session (Instance)

- **AWS IAM** separates Role (template) from Role Session (instance). When a principal assumes the role via `AssumeRole`, AWS STS issues temporary session credentials with configurable TTL. Session permissions can narrow but not widen the role.
- **Azure Entra ID** has the most explicit template/instance architecture. Microsoft's docs say: *"An application object is used as a template or blueprint to create one or more service principal objects. Similar to a class in object-oriented programming."* One Application Object → many Service Principals (one per tenant).
- **Application Object (template):** appId, display name, redirect URIs, API permissions requested, app roles defined.
- **Service Principal (instance):** own id, accountEnabled, credentials, appRoleAssignments, oauth2PermissionGrants, notes, custom security attributes, owners.
- **Google Cloud IAM** uses Role Bindings. Service accounts get short-lived credentials (1-hour OAuth2 tokens). Audit logs track impersonation chains.
- **RBAC pattern across all three clouds:** Role Definition (template) → Role Assignment/Binding (instantiation) → Principal (entity that accumulates state).

### 3. Game Servers / MMOs: Class (Template) vs Character (Instance)

- **AzerothCore/TrinityCore** (WoW server emulators): **ChrClasses.dbc** is the class template (~60 fields, static game data, never modified at runtime). The **characters** table is the instance (80+ columns of accumulated state).
- **Template references in instance:** `race` → ChrRaces.dbc, `class` → ChrClasses.dbc. Instance state: `level`, `xp`, `money`, `health`, `position_x/y/z`, `totaltime`, `totalKills`, `equipmentCache`, `creation_date`, `logout_time`.
- **Separate databases enforce the split:** `world` database (templates, read-only at runtime) and `characters` database (mutable instance state).
- **Type Object pattern** (Robert Nystrom's Game Programming Patterns): Type Object holds shared invariant data, Typed Instance holds runtime state + reference to type. Type objects can be defined in JSON/data files, enabling non-programmers to create new types. Types can inherit from parent types with selective override.
- **Write-back caching:** Character state written to DB every ~10 minutes, not every change.

### 4. HR/People Systems: Job Profile (Template) vs Position vs Worker (Instance)

- **Workday three-tier model:** Job Profile → Position → Worker. Job Profile is template, Position is intermediate instance (bound to org chart, not a person), Worker is final instance (specific person).
- **Job Profile (template):** pay rate type, FLSA status, compliance classifications, qualifications, compensation grade, generic job description.
- **Position (intermediate):** inherits from Job Profile, plus position-specific overrides ("Position Restrictions"), hiring dates, compensation amounts, location. Position persists even when vacant. Security roles attach to position, not worker.
- **Worker (instance):** hire date, employment history, compensation history, performance reviews, time-off balances, training records.
- **BambooHR** uses simpler two-tier model. Employment objects created on every change, building history trail via `effective_date` ordering.

### 5. OOP: Class vs Instance

- Class defines shared behavior and structure. Instance holds per-entity state and reference to class.
- **Metaclasses** add a layer: metaclass → class → instance mirrors Job Profile → Position → Worker.
- **Key insight:** Instance variables hold current state (health=42); class variables hold defaults and constraints (max_health=100). Class defines shape of state; instance holds values.

### 6. Docker: Image (Template) vs Container (Instance)

- Images are immutable layered templates. Containers add a writable layer via copy-on-write.
- **Container lifecycle:** Created → Running → Paused → Stopped → Removed. Writable layer persists through all states except Removal.
- **Volumes** separate persistent state from ephemeral state — data that must survive container removal lives in Docker Volumes.
- **Terraform** adds drift detection: `.tf` files are templates, state file tracks instances, `terraform plan` detects divergence.

## Synthesis: Universal Patterns

### Pattern 1: Template Defines Shape, Instance Holds State

| Domain | Template | Instance | Reference |
|--------|----------|----------|-----------|
| Kubernetes | Pod spec | Running Pod | ownerReferences |
| Azure IAM | Application Object | Service Principal | appId |
| AWS IAM | IAM Role | Role Session | AssumeRole ARN |
| MMO Games | ChrClasses.dbc | characters table | class column (FK) |
| Workday | Job Profile | Position + Worker | Position → Job Profile link |
| OOP | Class | Instance | Hidden class pointer |
| Docker | Image | Container | Image ID reference |

### Pattern 2: Instances Reference Templates, Not Vice Versa
Templates are unaware of their instances. This enables one-to-many and keeps templates stable.

### Pattern 3: Layered Override with Defaults
Templates provide defaults; instances override specific fields but inherit everything else. Appears in Workday (Position Restrictions), Type Object (Parent → Child breed), Azure (Application → Service Principal), Docker (Image layers → writable layer).

### Pattern 4: Template Immutability, Instance Mutability
Templates change slowly through controlled processes. Instances are continuously mutable. When template changes, existing instances typically continue with old version.

### Pattern 5: Instance State Falls Into Three Categories
1. **Identity** — unique ID, name, creation timestamp, lineage reference
2. **Operational state** — current status, position, resource consumption, credentials
3. **Accumulated history** — total time, actions taken, audit trail, performance metrics

### Pattern 6: Physical Separation of Template and Instance Data
Game servers: separate databases. Docker: separate filesystem layers. Kubernetes: separate API objects.

## Sources

- [Kubernetes: Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
- [Kubernetes: Objects](https://kubernetes.io/docs/concepts/overview/working-with-objects/)
- [Kubernetes: StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Kubernetes: ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)
- [Kubernetes: Auditing](https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/)
- [Kubernetes: RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [AWS: IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [AWS: How IAM works](https://docs.aws.amazon.com/IAM/latest/UserGuide/intro-structure.html)
- [AWS: CloudTrail IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/cloudtrail-integration.html)
- [Microsoft: Apps & service principals](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals)
- [Microsoft: ServicePrincipal resource type](https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal)
- [Azure RBAC overview](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- [Google Cloud: Service accounts](https://cloud.google.com/iam/docs/service-account-overview)
- [AzerothCore: characters table](https://www.azerothcore.org/wiki/characters)
- [AzerothCore: ChrClasses.dbc](https://www.azerothcore.org/wiki/chrclasses)
- [TrinityCore: characters table](https://trinitycore.info/database/335/characters/characters)
- [Game Programming Patterns: Type Object](https://gameprogrammingpatterns.com/type-object.html)
- [MMO Architecture: Source of truth](https://prdeving.wordpress.com/2023/09/29/mmo-architecture-source-of-truth-dataflows-i-o-bottlenecks-and-how-to-solve-them/)
- [Workday Position Management](https://www.suretysystems.com/insights/workday-position-management-101/)
- [Texas A&M: Edit Position Restrictions](https://employees.tamu.edu/compensation/job-changes/edit-position-restrictions.html)
- [BambooHR API](https://documentation.bamboohr.com/reference/get-employee-1)
- [Docker: Image layers](https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/)
- [Docker Container Lifecycle](https://last9.io/blog/docker-container-lifecycle/)
- [Terraform: Resource drift](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift)
- [Python Metaclasses](https://realpython.com/python-metaclasses/)
- [Refactoring Guru: Factory Method](https://refactoring.guru/design-patterns/factory-method)

## Raw Links

```
https://kubernetes.io/docs/concepts/workloads/pods/
https://kubernetes.io/docs/concepts/overview/working-with-objects/
https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/
https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/
https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/
https://kubernetes.io/docs/reference/access-authn-authz/rbac/
https://dev-k8sref-io.web.app/docs/workloads/podtemplate-v1/
https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html
https://docs.aws.amazon.com/IAM/latest/UserGuide/intro-structure.html
https://docs.aws.amazon.com/IAM/latest/UserGuide/cloudtrail-integration.html
https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_control-access_monitor.html
https://aws.amazon.com/blogs/security/how-to-audit-cross-account-roles-using-aws-cloudtrail-and-amazon-cloudwatch-events/
https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals
https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal
https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
https://cloud.google.com/iam/docs/service-account-overview
https://cloud.google.com/iam/docs/audit-logging/examples-service-accounts
https://www.azerothcore.org/wiki/characters
https://www.azerothcore.org/wiki/chrclasses
https://trinitycore.info/database/335/characters/characters
https://gameprogrammingpatterns.com/type-object.html
https://gameprogrammingpatterns.com/flyweight.html
https://gameprogrammingpatterns.com/state.html
https://prdeving.wordpress.com/2023/09/29/mmo-architecture-source-of-truth-dataflows-i-o-bottlenecks-and-how-to-solve-them/
https://gamedev.net/forums/topic/690002-database-structure-for-mmos/
https://www.suretysystems.com/insights/workday-position-management-101/
https://employees.tamu.edu/compensation/job-changes/edit-position-restrictions.html
https://americanchase.com/data-structure-and-business-objects-in-workday/
https://documentation.bamboohr.com/reference/get-employee-1
https://documentation.bamboohr.com/docs/list-of-field-names
https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/
https://aws.amazon.com/compare/the-difference-between-docker-images-and-containers/
https://spacelift.io/blog/docker-image-layers
https://last9.io/blog/docker-container-lifecycle/
https://developer.hashicorp.com/terraform/tutorials/state/resource-drift
https://www.hashicorp.com/en/blog/detecting-and-managing-drift-with-terraform
https://en.wikipedia.org/wiki/Class_(programming)
https://realpython.com/python-metaclasses/
https://refactoring.guru/design-patterns/factory-method
https://refactoring.guru/design-patterns/prototype
https://en.wikipedia.org/wiki/Entity_component_system
```

## Implications

1. **Maintain role definitions as immutable templates** — equivalent of ChrClasses.dbc, Application Objects, Job Profiles.
2. **Create separate agent instance entity** with identity (ID, name, creation date), template reference (role: engineer), configuration overrides (layered on defaults), operational state (active/paused/retired), accumulated history (tasks, tokens, errors).
3. **Use Azure Application/ServicePrincipal as primary analog** — one-to-many, own credentials, own audit trail.
4. **Implement Type Object pattern** — data-driven, YAML/JSON, non-programmer creation of new agents.
5. **Enforce physical separation** — role definitions (read-only catalog) vs agent instances (mutable state store).
6. **Consider three-tier hierarchy** — Role Definition → Team/Project Slot → Agent Instance (Workday pattern).
7. **Instance lifecycle:** Created → Active → Paused → Retired → Archived (Docker-inspired).

## Open Questions

1. Where do agent instances live? YAML files vs SQLite database vs hybrid?
2. Do we need the middle tier (Position/Slot) like Workday?
3. How do template changes propagate to existing instances?
4. What's the credential model for agent instances?
5. Should instance reference be versioned (role: engineer@v2)?
6. Should history be append-only or mutable with snapshots?
7. What's the agent instance persistence boundary — per-initiative, per-project, or permanent?
