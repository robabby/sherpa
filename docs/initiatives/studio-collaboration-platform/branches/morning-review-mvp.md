---
status: launched
sub-initiative: sub-initiatives/morning-review-mvp
source-iteration: 1
spawned-from: studio-collaboration-platform
created: 2026-03-09
priority: high
---

# Morning Review MVP

## Context

Iteration 1 research identified the morning review as Studio's killer feature — the primary interaction model for a solo operator managing an AI agent fleet. The `docs/tasks/` convention and worker scripts now exist. Studio already has sessions, workstreams, and initiative data. The question is: what's the minimum viable morning review that works before the full Planner/Worker/Judge pipeline matures?

## Question

What is the smallest useful Studio page that enables a morning review workflow? What existing data sources (task files, session manifests, workstream files) can it read today? What new components does it need?

## Suggested Vectors

1. **Existing data audit** — What data is already available in `docs/tasks/`, `docs/sessions/`, `docs/workstreams/` that a morning review page could surface? What fields are present in task file frontmatter?
2. **Component design** — Using Studio's existing hub panel system, design an `/app/studio/morning` page. What panels does it have? What data feeds each?
3. **Keyboard interaction spec** — Design the review queue keyboard shortcuts. What happens on approve/reject/iterate? What downstream effects (merge PR, create iteration task, archive)?
4. **Progressive enhancement path** — How does the morning review evolve as the task pipeline matures? What works with just task files? What needs worker logs? What needs the Judge verdict system?

## Links

- Research: `docs/initiatives/studio-collaboration-platform/research/iteration-1.md`
- Linear Triage pattern: https://linear.app/docs/triage
- Superhuman Split Inbox: https://blog.superhuman.com/email-triage/
- HITL Green/Amber/Red: https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows
- Task convention: `docs/tasks/README.md`
- Planner/Worker/Judge plan: `docs/plans/2026-03-09-planner-worker-judge.md`
