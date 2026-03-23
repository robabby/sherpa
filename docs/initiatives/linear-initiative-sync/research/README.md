# Research: Linear Initiative Sync

## Summary

Iteration 1 surveyed the Linear SDK API surface, data model, pricing, and integration patterns. The key finding is that **Sherpa initiatives map to Linear Projects (not Linear Initiatives)** — Linear has a 3-level hierarchy (Initiative > Project > Issue) and Projects have the custom status granularity needed for Sherpa's 9-stage lifecycle.

## Iterations

1. [Iteration 1](iteration-1.md) — 2026-03-22: SDK API surface, data model, free tier access, lifecycle mapping patterns

## Open Questions

1. **Custom status management via API** — Can custom project statuses be created programmatically, or only in the UI?
2. **Project status webhooks** — Do webhooks fire for project status changes for reconciliation?
3. **`statusId` programmatic updates** — Can `projectUpdate` set custom statuses, or only category-level?
4. **`spawned-from` without sub-initiatives** — How to represent genealogy on free tier without Enterprise sub-initiatives?
5. **Content editor compatibility** — Can metadata blocks survive in Linear's Prosemirror `content` field?

## Related Initiatives

- `sherpa-linear-integration` (parent, integrated) — task migration to Linear
- `dispatch-evolution` (informed by this) — task backend simplification
