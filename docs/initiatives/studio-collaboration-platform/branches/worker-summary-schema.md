---
status: seed
source-iteration: 1
spawned-from: studio-collaboration-platform
created: 2026-03-09
priority: medium
---

# Worker Summary Schema

## Context

Iteration 1 research converged on "artifacts over execution" — foreground what was produced, not what steps ran. GitHub Actions' job summary pattern (workers write their own Markdown summary) is the model. WavePoint already has `wavepoint/report@1` and `wavepoint/chart@1` JSON schemas for research deliverables. Workers need a structured output format that Studio can render.

## Question

What should the `wavepoint/task-result@1` JSON schema look like? How does it relate to session manifests, task file frontmatter, and existing Studio rendering components?

## Suggested Vectors

1. **Schema design** — What fields does a task result need? (artifacts produced, files changed, errors, token usage, duration, cost estimate, structured diff, human-readable summary)
2. **Rendering components** — What Studio components render task results? Can existing components (DocRenderer, ResearchDataTable) be reused?
3. **Session manifest integration** — Session manifests already have token data. Should task results reference manifests or duplicate their fields?
4. **Cost mapping** — Token counts → USD by model. What's the pricing table? Should it be hardcoded or fetched?

## Links

- Research: `docs/initiatives/studio-collaboration-platform/research/iteration-1/vector-5-background-job-transparency.md`
- GitHub Actions Job Summaries: https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/
- Temporal Event Groups: https://temporal.io/blog/the-dark-magic-of-workflow-exploration
- Existing schemas: `packages/studio-core/src/schemas.ts`
- Task convention: `docs/tasks/README.md`
