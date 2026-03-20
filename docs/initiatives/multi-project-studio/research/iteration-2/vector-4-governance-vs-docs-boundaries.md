# Vector 4: Governance vs Docs Boundaries

**Question:** Where should governance data (initiatives, tasks) live vs documentation (architecture, decisions)?
**Agent dispatched:** 2026-03-20

## Findings

### Nx — Ephemeral vs Committed, Not Operational vs Docs
- `.nx/` = ephemeral operational state (gitignored). `nx.json` + `project.json` = committed operational config
- Nx has **no documentation convention** — docs are an app concern, not a monorepo concern
- **Key insight:** The line is ephemeral vs committed, not operational vs documentation

### ADR Conventions
- `doc/adr/` is the canonical default (adr-tools). `docs/architecture/decisions/` is an alternative
- MADR v3 renamed to "Markdown **Any** Decision Records" — broadened scope
- ADRs are **immutable after acceptance** — append-only, new decisions supersede via status link
- **Hybrid nature:** governance (constrains future decisions) but documentation (explains rationale). Community consensus: `docs/` because primary consumer is human reader

### Backstage — The Cleanest Split
- **`catalog-info.yaml`** = operational metadata (structured YAML, machine-consumed): entity kind, lifecycle, owner, system
- **TechDocs** = documentation (prose Markdown, human-consumed): how it works, how to use it
- **The line:** catalog-info answers "what is this, who owns it, what state?" (operational). TechDocs answers "how does it work?" (documentation). Operational metadata *points to* docs but doesn't contain them

### GitHub — `.github/` = Tool-Consumed
- `.github/` = workflows, templates, CODEOWNERS, dependabot — all consumed by GitHub automation
- `docs/` = user-facing documentation, GitHub Pages
- **CODEOWNERS exception:** both operational (triggers reviews) and documentary (who owns what). Most teams put it in `.github/` — when something is both, the operational dotfolder wins

### Living vs Reference Documents
- **Living documents** change frequently as part of workflows: task boards, initiative status, risk registers
- **Reference documents** are stable after creation: architecture decisions, API references, design principles
- **The mapping:** living → governance (tool-consumed, workflow-driven). Reference → documentation (human-consumed, stable)

### RFC/Proposal Conventions
- **Rust:** separate `rust-lang/rfcs` repo. **Kubernetes KEPs:** dedicated `kubernetes/enhancements` repo with SIG subdirectories
- Large projects **separate proposals from docs** — proposals have a lifecycle (draft → approved → implemented) that differs from documentation's lifecycle
- **Key insight:** Proposals are governance artifacts; documentation is the output of completed governance

## Proposed Taxonomy

### `.sherpa/` — Governance Data (Operational, Tool-Consumed, Living)

| Content | Rationale |
|---------|-----------|
| Initiatives | Lifecycle-tracked, status-driven, consumed by MCP/Studio. Like Kubernetes KEPs |
| Tasks | Operational work units dispatched to agents. Pure workflow state |
| Activity logs | Living documents updated during execution. Operational telemetry |
| Agent roles | Consumed by dispatch pipeline. Operational config |
| Plans (inside initiatives) | Living documents tied to initiative lifecycle |
| Research (inside initiatives or standalone) | Initiative-scoped, consumed during lifecycle |

### `docs/` — Documentation (Reference, Human-Consumed, Stable)

| Content | Rationale |
|---------|-----------|
| Architecture | Reference material. Stable after creation |
| Decisions | Immutable after acceptance. Strong ADR community convention |
| UX guidelines | Reference material for design/content standards |
| Foundation stone, principles | Stable reference, rarely changed |
| Framework docs | Reference explanation |
| Roadmap, changelog | Strategic/historical reference |
| Templates | Reference patterns |

### Borderline Cases

| Content | Recommendation | Reasoning |
|---------|---------------|-----------|
| Decisions | Stay in `docs/` | Immutable, human-consumed. ADR convention strongly `docs/`-oriented |
| Research (completed) | Follow its initiative | If initiative is in `.sherpa/`, research stays with it |
| Standalone reports | `docs/reports/` | Reference output, human-consumed after completion |

## Sources

- [Nx Folder Structure](https://nx.dev/docs/concepts/decisions/folder-structure)
- [adr-tools](https://github.com/npryce/adr-tools)
- [MADR "Any Decision Records"](https://ozimmer.ch/practices/2021/04/23/AnyDecisionRecords.html)
- [Backstage Descriptor Format](https://backstage.io/docs/features/software-catalog/descriptor-format/)
- [Backstage Well-known Annotations](https://backstage.io/docs/features/software-catalog/well-known-annotations/)
- [GitHub CODEOWNERS](https://docs.github.com/articles/about-code-owners)
- [Rust RFC Process](https://rust-lang.github.io/rfcs/0002-rfc-process.html)
- [Kubernetes KEPs](https://www.kubernetes.dev/resources/keps/)
- [Living Documents (Bit.ai)](https://blog.bit.ai/living-document/)
- [Pragmatic Engineer — RFCs](https://blog.pragmaticengineer.com/rfcs-and-design-docs/)

## Implications

1. **Initiatives, tasks, agent roles move to `.sherpa/`** — they are tool-consumed governance data with lifecycle tracking
2. **Architecture, decisions, UX guidelines stay in `docs/`** — human-consumed reference material
3. **The Backstage model is the clearest line** — structured data for tools = dotfolder, prose for humans = docs
4. **`.sherpa/` should be committed** (like `.github/`), not gitignored (like `.nx/`). Exception: `db/` subdirectory gitignored
5. **`sherpa init` scaffolds `.sherpa/`** — like `terraform init` creates `.terraform/`

## Open Questions

1. Does dotfolder hidden-by-default create discoverability problems for high-traffic artifacts (initiatives)?
2. Should `defineConfig()` allow overriding governance data paths for projects preferring `docs/`?
3. When Studio starts consuming decisions programmatically, do they move to `.sherpa/`?
4. Multi-project: does `sherpa init` in a client project scaffold `.sherpa/` with framework defaults?
