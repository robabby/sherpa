# Morning Review MVP — Research

## Iteration History

| # | Date | Focus | Vectors |
|---|------|-------|---------|
| 1 | 2026-03-09 | Data audit, component design, keyboard spec, progressive enhancement | 4 |

## Summary

Iteration 1 established that the morning review page is buildable today using existing Studio data infrastructure. Four research vectors converged on: a three-section layout (status cards → queue+detail → timeline), keyboard-driven triage (Linear Triage pattern), educational empty states as pipeline onboarding, and server actions that close the review→action loop without leaving the page.

## Open Questions

1. **Should `/app/studio` redirect to `/app/studio/morning` when pending reviews exist?** The morning review may be Studio's primary interaction model.
2. **What structured summary format should workers produce?** Consider `wavepoint/task-result@1` schema.
3. **How should cost data aggregate?** Token→USD rate table needed in `@/lib/studio/cost.ts`.
4. **Should the web page integrate with the `/morning` CLI skill?** Same workflow, different interfaces.
5. **What's the right queue density?** Items visible without scrolling on a 1080p screen.
