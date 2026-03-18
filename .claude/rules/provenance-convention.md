---
description: Provenance metadata and review state tracking for all maintained documentation
globs:
  - "docs/architecture/**"
  - "docs/decisions/**"
  - "docs/changelog.md"
alwaysApply: false
---

# Provenance Convention

Every document maintained by the self-documenting system carries provenance metadata. Provenance tracks who authored a document, who reviewed it, and when it was last verified against reality. All provenance states are "live" — the document is the current truth as understood by its last author. Provenance tells you how much to trust it, not whether it's published.

## Frontmatter Schema

```yaml
---
doc-type: architecture | decision | changelog | ux | framework
maintained-by: self-documenting-system | human
authored-by: ai | human
reviewed-by: ai | human | null
last-updated: YYYY-MM-DD
last-verified: YYYY-MM-DD
source-initiatives:
  - <initiative slugs that informed this document>
---
```

### Field Definitions

| Field | Purpose |
|-------|---------|
| `doc-type` | Classification for Studio rendering and filtering |
| `maintained-by` | Who is responsible for keeping this current. `self-documenting-system` = the /integrate skill updates it. `human` = manual maintenance only (e.g., foundation-stone.md) |
| `authored-by` | Who wrote the current version |
| `reviewed-by` | Who validated the current version. `null` = awaiting review |
| `last-updated` | When the content was last changed |
| `last-verified` | When the content was last checked against the codebase. May equal `last-updated` or be later (if verified without changes) |
| `source-initiatives` | Which initiatives informed this document's content |

## Review States

All four states are live. The provenance metadata communicates trust level.

| authored-by | reviewed-by | Meaning |
|-------------|-------------|---------|
| `ai` | `null` | AI-generated, awaiting human review |
| `ai` | `human` | AI-generated, human-verified |
| `human` | `human` | Traditional human-authored doc |
| `human` | `ai` | Human-authored, AI-validated against codebase |

When the `/integrate` skill updates a previously human-verified doc, `reviewed-by` resets to `null` — the new content needs fresh review.

## Banner Convention

Every maintained document includes a human-readable banner immediately after the frontmatter, auto-generated from provenance fields. The banner is the rendering — frontmatter is the source of truth.

### Banner Formats

```markdown
> **AI-generated** 2026-03-16 · Awaiting human review
> Sources: dispatch-center, studio-agent-missions
```

```markdown
> **AI-generated** 2026-03-16 · **Human-verified** 2026-03-17
> Sources: dispatch-center, studio-agent-missions
```

```markdown
> **Human-authored** · **AI-verified** 2026-03-16
```

```markdown
> **AI-updated** 2026-03-18 · Awaiting human review · Previously verified 2026-03-16
> Sources: dispatch-center, studio-agent-missions, mcp-coordination-layer
```

### Staleness Banner

Added by drift detection when `last-verified` is old relative to relevant commits:

```markdown
> **Possibly stale** · Verified 2026-03-16 · 3 commits to related code since
> Sources: dispatch-center
```

## Rules

- **Never hand-edit banners.** Regenerate from frontmatter. Skills and hooks that modify provenance fields must also regenerate the banner.
- **`reviewed-by` resets on content change.** Any substantive edit to document content sets `reviewed-by: null` and updates `last-updated`. Typo fixes don't reset review state.
- **`source-initiatives` is append-only during updates.** When /integrate updates a doc based on a new initiative, it adds the initiative slug to the list. It never removes previous sources.
- **Human review sets `reviewed-by: human` and updates `last-verified`.** This is the only way to move from ai/null to ai/human state.
- **Documents without provenance frontmatter are not maintained.** `foundation-stone.md`, `roadmap.md` (until opted in), and any doc without the schema are human-owned and not touched by the self-documenting system.

## Opting Documents In

To bring an existing document under self-documenting maintenance:

1. Add provenance frontmatter with `maintained-by: self-documenting-system`
2. Set `authored-by` and `reviewed-by` to reflect current state
3. Add the banner
4. The `/integrate` skill will maintain it from the next initiative onward
