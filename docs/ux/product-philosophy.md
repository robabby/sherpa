---
type: ux-guide
updated: 2026-03-16
version: 0.1
---

# Product Philosophy

Sherpa is a Human + AI collaboration system. Not a developer tool that others can also use — a system designed so that every role on a team has AI working alongside them, governed by conventions appropriate to their work.

---

## The Substrate

Three layers, one truth:

| Layer | What | Who owns it |
|-------|------|-------------|
| **Filesystem** | Markdown files, YAML frontmatter, conventions, behavioral roles, skills | Anthropic's Claude + Sherpa's conventions |
| **Configuration** | `defineConfig()` — which tools, skills, roles, and quality gates load | The team or individual |
| **Surface** | How the substrate becomes visible — CLI, Studio, MCP, messaging | Sherpa's applications |

The filesystem is the source of truth. Configuration determines what each person sees. Surfaces make it legible.

This is not an abstraction — it's how the system works today. An initiative proposal is a markdown file with frontmatter. Whether you edit it in your terminal or approve it in Studio, the same file changes. One truth, multiple views.

---

## Same Artifacts, Different Entry Points

Every role interacts with the same governance artifacts:

- **Proposals** scope what gets built
- **Plans** break proposals into executable work
- **Tasks** dispatch work to AI agents or human workers
- **Activity logs** record what happened
- **Quality gates** evaluate whether work meets standards

The difference between roles is not *what they interact with* — it's *which artifacts they primarily create, which they consume, and how AI assists them in each*.

An engineer creates implementations and consumes proposals. A PM creates proposals and consumes implementation status. A designer creates specifications and evaluates whether implementations meet quality standards. All three use the same filesystem, the same governance lifecycle, the same convention system.

We don't build separate tools per role. We load different conventions, skills, and quality gates through configuration. The surface adapts. The substrate stays shared.

---

## Convention-at-Creation

The most effective multi-role systems embed governance into the act of creation, not the act of review.

What this means in practice:

- **Templates** deliver structure at creation time. A PM creating a product brief gets a template with frontmatter fields for appetite, success metrics, and no-gos pre-filled — not a blank file and a link to the convention docs.
- **Smart defaults** auto-apply rules. When a task dispatches and a worker picks it up, the status transitions automatically — governance happens as a side effect of work.
- **Forms** generate conformant artifacts. Studio renders forms from governance schemas so that people who don't write YAML can still create well-structured proposals.

The Judge still reviews. But convention-at-creation raises the floor — everything that arrives for review already meets structural requirements.

---

## The Node Model

An organization is made of nodes — cross-functional groups that collaborate on shared work. Each node has its own conventions, quality gates, and AI collaboration patterns, all running on the same substrate.

**Node Zero: Product Development**

The first node Sherpa serves is the product development triad:

| Role | Primary Mode | What they govern |
|------|-------------|------------------|
| Product Manager | Planner | Scope, appetite, investment |
| Engineer | Worker | Implementation, architecture |
| Designer | Judge | Visual quality, UX, accessibility |

Each role touches all three modes. PMs also do research (Worker) and review proposals (Judge). Engineers also plan architecture (Planner) and review code (Judge). Designers also write specifications (Planner) and build prototypes (Worker). But their *primary contribution* — the mode where their judgment matters most — is distinct.

This maps directly to Sherpa's existing Planner/Worker/Judge pipeline. The pipeline doesn't need restructuring to serve multiple roles. It needs role-aware configuration.

**Future Nodes**

Other organizational groups — marketing, operations, executive, legal — will develop their own conventions on the same substrate. Research shows:

- **Marketing** is the closest candidate. Content pipelines (brief → draft → review → approve → publish) map to Sherpa's lifecycle. Brand governance functions like linting.
- **DevOps/SRE** shares Engineering's substrate. Different behavioral roles and tools loaded via configuration, not a separate node.
- **Executive** is a consumer of governance data, not a producer. A Studio dashboard view, not a persona with conventions.

Each future node gets its own research cycle. The substrate is ready — the conventions aren't yet.

---

## The Tool Layer Defines the Persona

Across every multi-surface AI product — Claude, Microsoft Copilot, GitHub, Cursor — the same pattern holds: the AI model is shared; the tools each surface exposes determine who it's for.

For Sherpa, the tool layer is:

- **MCP tools** — which server capabilities are available
- **Skills** — which workflows can be invoked (`/rr`, `/shape`, `/design-critique`)
- **Behavioral roles** — which agent definitions are loaded
- **Quality gates** — which scorecard the Judge applies

`defineConfig()` is the mechanism. An engineer's configuration loads code-oriented skills, a Code Scorecard, and implementation-focused behavioral roles. A PM's loads planning skills, a Spec Scorecard, and scope-governance roles. Same framework, different experience.

---

## Quality Gates Scale Across Roles

Code review is a solved governance problem. Design review and spec review are not. This is genuine whitespace.

Sherpa's Judge role extends to non-code artifacts through a **scorecard registry** — multiple scorecards, each with criteria appropriate to the artifact type:

| Scorecard | For | Key criteria |
|-----------|-----|-------------|
| Code | Implementations | Types, tests, security, conventions, architecture |
| Spec | Product briefs, PRDs | Problem clarity, customer evidence, scope bounds, success metrics |
| Design | Component specs, DDRs | Token compliance, accessibility, hierarchy, interaction states |
| Research | `/rr` iterations, evidence | Source diversity, bias acknowledgment, methodology, actionability |
| Content | Docs, blog posts, proposals | Sourced claims, headline test, depth, readability, persona alignment |

**Artifact type determines scorecard, not author role.** An engineer writing documentation gets the Content Scorecard. A PM writing acceptance criteria gets the Spec Scorecard. The Judge selects based on what's being evaluated, not who wrote it.

---

## Anthropic Coupling

Sherpa is tightly coupled to Anthropic's ecosystem. Claude is the AI substrate. CLAUDE.md is the convention format. Claude Code is the primary engineering surface. Skills are portable across Claude's surfaces.

This is a deliberate choice, not a limitation. When another AI system demonstrates capabilities that warrant inclusion in Sherpa's governance, we'll integrate it. Until then, depth with one system beats shallow coverage of many.

What coupling means in practice:

- Sherpa conventions extend Claude's patterns, not replace them
- Same artifacts, not new artifact types — a Sherpa proposal is still a markdown file that Claude reads
- Skills work across Claude Code, Claude Desktop, and Claude Web
- Behavioral roles use Claude's behavioral constraint patterns

---

## Relationship to Business Personas

Sherpa has two persona systems:

| | Business Personas | Product Personas |
|---|---|---|
| **Question** | Who discovers, evaluates, and buys Sherpa? | Who uses Sherpa day-to-day? |
| **Defined in** | `docs/ux/personas.md` | `docs/ux/product-personas.md` |
| **Personas** | Practitioner, Technical Leader, Honest Executive | Engineer, Product Manager, Designer |
| **Used for** | Marketing, messaging, sales | Product design, feature planning, convention design |

They are orthogonal. A Practitioner could be an Engineer, PM, or Designer. A Technical Leader could be evaluating Sherpa for any of those roles. Both systems coexist.

---

*See also: [Product Personas](./product-personas.md) for role definitions, [Product Positioning](./product-positioning.md) for market framing, [Design Principles](./design-principles.md) for how we build.*
