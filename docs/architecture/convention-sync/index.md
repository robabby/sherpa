---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: human
last-updated: 2026-03-16T00:00:00.000Z
last-verified: '2026-03-18'
source-initiatives: []
---

> **AI-generated** 2026-03-16 · Awaiting human review
> Sources: framework.md (design only — no integrated initiative has delivered this pillar)

# Convention Sync CLI

The `sherpa init` and `sherpa sync` commands that install and update conventions in adopter projects. Designed with three-way merge architecture for safely updating conventions while preserving local customizations.

## Overview

When a team adopts Sherpa, they need the convention files (rules, skills, CLAUDE.md templates) installed in their project. When Sherpa updates those conventions, the team needs a way to pull updates without losing their customizations. This pillar solves both problems.

## Designed Architecture

### Three-Way Merge

Three sources for every convention file:

| Source | Role |
|--------|------|
| **Upstream** | Framework defaults from `@sherpa/studio` package |
| **Local** | Project customizations made after init |
| **Current** | The resolved file on disk |

When `sherpa sync` runs, it computes a three-way diff: what changed upstream since last sync, what changed locally, and merges. Conflicts are surfaced for manual resolution.

### Provenance Tracking

Each synced file records its origin: which version of the framework it came from, whether it's been locally modified, and when it was last synced. This metadata enables safe updates and drift detection.

### Commands

| Command | Purpose |
|---------|---------|
| `sherpa init` | Scaffold project structure, install conventions, create `sherpa.config.ts`, generate documentation skeleton (via `/doc-bootstrap init`) |
| `sherpa sync` | Pull convention updates from framework, three-way merge with local changes |

## Current State

**Designed, not yet implemented.** The architecture is described in `docs/framework.md`. The `sherpa-framework-extraction` initiative (in-progress) is building the package extraction and CLI scaffolding that this pillar depends on.

When implemented, `sherpa init` will also scaffold the self-documenting system's documentation surface — the empty directoturtle skeleton that gets populated as initiatives complete.

## Related

- [Config-as-Code](../config-as-code/index.md) — `sherpa init` generates `sherpa.config.ts`
- [Executable Conventions](../executable-conventions/index.md) — the conventions that sync installs and updates
- [Governance Engine](../governance-engine/index.md) — initiative convention is one of the synced files

## Decisions

- None yet — decisions will emerge during implementation
