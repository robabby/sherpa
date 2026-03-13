# Vector 4: Progressive Enhancement Path

**Question:** How does the morning review evolve as the task pipeline matures? What works with just task files? What needs worker logs? What needs the Judge verdict system?
**Agent dispatched:** 2026-03-09

## Findings

### Design Principle: Data as Feature Flag

The morning page uses **data-availability detection**, not boolean feature flags. Each panel checks whether its data source has content, then renders one of three states:
1. **Active** — data exists, render fully
2. **Empty/educational** — data source exists but empty
3. **Not yet available** — infrastructure doesn't exist yet

Panel chrome (title, border, layout position) is always visible. Only interior content changes. This follows the GitHub Actions pattern: pipeline structure is always visible; status badges change.

### Research Sources

- **IBM Carbon**: Classifies empty states into first-use, no-results, error, and cleared. Each has distinct tone and CTA. Empty states are onboarding moments, not dead-ends. ([Carbon Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/))
- **Trigger.dev**: "Waiting for deploy" state — task enters liminal state, auto-activates when code exists. Analogous to showing task panels before workers run. ([Trigger.dev Runs](https://trigger.dev/docs/runs))
- **Temporal Web UI**: Shows table chrome (filters, columns, search) even when empty. Structure always visible, data area empty with explanation. ([Temporal Web UI](https://docs.temporal.io/web-ui))
- **AWS Builders' Library**: Design dashboards around decisions, not data availability. "What decision will this help me make?" ([AWS Dashboard Guide](https://aws.amazon.com/builders-library/building-dashboards-for-operational-visibility/))
- **Smashing Magazine**: "Why this alert?" explainers build trust in automated systems — applies to Judge verdicts. ([UX Strategies for Dashboards](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/))

### Tier Detection Function

```typescript
interface MorningTier {
  level: 0 | 1 | 2 | 3;
  hasSessionData: boolean;
  hasWorkstreams: boolean;
  hasInitiatives: boolean;
  hasTaskBoard: boolean;
  hasWorkerLogs: boolean;
  hasVerdicts: boolean;
  hasCostData: boolean;
  hasStructuredResults: boolean;
}

function detectMorningTier(): MorningTier {
  const tasks = getTaskBoard();
  const sessions = getSessions();
  const hasTaskBoard = tasks.length > 0;
  const hasWorkerLogs = tasks.some(t => t.hasReport);
  const hasVerdicts = tasks.some(t => t.hasVerdict);
  const hasCostData = sessions.some(s => s.tokens.input + s.tokens.output > 0);

  let level: 0 | 1 | 2 | 3;
  if (hasStructuredResults) level = 3;
  else if (hasWorkerLogs || hasVerdicts) level = 2;
  else if (hasTaskBoard) level = 1;
  else level = 0;

  return { level, hasSessionData: sessions.length > 0, hasWorkstreams: true,
    hasInitiatives: true, hasTaskBoard, hasWorkerLogs, hasVerdicts,
    hasCostData, hasStructuredResults: false };
}
```

### Tier 0: Orientation View (Works Today)

**Decision:** "What happened yesterday? What needs my attention?"

| Panel | Content | Data Source |
|-------|---------|-------------|
| **Session Recap** | Last N sessions: model, branch, duration, tokens, outcome | `getSessions()` |
| **Attention Queue** | Initiatives needing human action (needs-review, needs-integration) | `getInitiatives()` + `detectLifecycle()` |
| **Active Workstreams** | Active workstreams with focus area and last activity | `getWorkstreams()` |
| **Pipeline Health** | Summary counts: N pending, N approved, N in-progress | `getInitiatives()` + `getWorkstreams()` |
| **Quick Stats** | Sessions this week, total tokens, commits | `computeSessionStats()` |

**Educational empty states:**
- **Task Board** (dashed border): "No tasks dispatched yet. Use `/plan-tasks` to break an approved initiative into work items."
- **Worker Results** (dashed border): "Worker logs will appear here after tasks complete."

### Tier 1: Task Awareness (Task Files Exist)

**Trigger:** `getTaskBoard().length > 0`
**Decision:** "What's queued? What's running? Should I dispatch more?"

| Panel | Content | Data Source |
|-------|---------|-------------|
| **Task Board** (now active) | Table: slug, status badge, backend, priority, initiative, created | `getTaskBoard()` |
| **Dispatch Actions** | Per pending task: dispatch hint. Per dispatched: elapsed time. | `TaskBoardEntry` |
| **Pipeline Status** | Horizontal columns: Pending → Dispatched → Completed → Reviewed | `getTaskBoard()` grouped by status |

**Upgraded:** Session Recap links sessions to tasks via initiative. Pipeline Health adds task counts.

**Still greyed:** Worker Output ("Task output will appear in `docs/tasks/logs/` after workers complete"), Judge Verdicts.

### Tier 2: Worker Intelligence (Logs + Verdicts Exist)

**Trigger:** `tasks.some(t => t.hasReport)` or `tasks.some(t => t.hasVerdict)`
**Decision:** "Did overnight work succeed? Should I approve, iterate, or reject?"

| Panel | Content | Data Source |
|-------|---------|-------------|
| **Worker Output Viewer** | Expandable markdown from `docs/tasks/logs/<slug>-output.md` | Filesystem read |
| **Judge Verdict Panel** | Verdict badge + reasoning from `<slug>-verdict.md` | `TaskBoardEntry.hasVerdict` |
| **Blocker Report** | Surface `<slug>-blockers.md`, categorize failure type | `TaskBoardEntry.hasBlockers` |
| **Morning Review Table** | Task / Backend / Status / Verdict / Action (from `/morning` skill) | All task data + logs |

**Upgraded:** Task Board shows verdict badges inline. Pipeline adds Reviewed/Archived columns. Session Recap shows estimated USD cost.

### Tier 3: Full Pipeline Intelligence (Mature System)

**Trigger:** 10+ completed tasks with verdicts + structured result schema
**Decision:** "How efficient is the pipeline? What should I dispatch tonight?"

| Panel | Content | Data Source |
|-------|---------|-------------|
| **Cost Dashboard** | Spend by backend, by initiative, trend chart | Session tokens × rate table |
| **Pipeline Analytics** | Throughput, median time-to-completion, success rate by model | Historical task data |
| **Confidence Scoring** | Auto-triage based on verdict history | Structured results + patterns |
| **Overnight Planner** | Suggested batch for tonight, one-click dispatch | All pipeline data |
| **Multi-Model Comparison** | Which models pass which task types | Capability profiles + verdicts |

## Implementation Order

1. **Tier 0 (1 session):** Create page.tsx, reuse existing loaders, educational empty states, add to sidebar nav
2. **Tier 1 (1 session):** Import `getTaskBoard()`, build Pipeline Status, dispatch hints
3. **Tier 2 (1-2 sessions):** Add `readTaskLog()` utility, Morning Review Table, output viewer, verdict display
4. **Tier 3 (deferred):** Cost module, analytics, confidence scoring — needs 10+ completed tasks

## Sources

- [Carbon Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [Trigger.dev Runs](https://trigger.dev/docs/runs)
- [Temporal Web UI](https://docs.temporal.io/web-ui)
- [AWS Dashboard Visibility](https://aws.amazon.com/builders-library/building-dashboards-for-operational-visibility/)
- [Smashing Mag Dashboard UX](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)
- [Primer Progressive Disclosure](https://primer.style/product/ui-patterns/progressive-disclosure/)
- [Eleken Empty State UX](https://www.eleken.co/blog-posts/empty-state-ux)
- [UX Design Institute Skeleton Screens](https://www.uxdesigninstitute.com/blog/whats-a-skeleton-screen/)
- [GitHub Actions Queued State](https://github.com/orgs/community/discussions/147604)
- [Vercel Project Dashboard](https://vercel.com/docs/projects/project-dashboard)

## Raw Links

- https://carbondesignsystem.com/patterns/empty-states-pattern/
- https://trigger.dev/docs/runs
- https://trigger.dev/product/realtime
- https://docs.temporal.io/web-ui
- https://github.com/temporalio/ui
- https://aws.amazon.com/builders-library/building-dashboards-for-operational-visibility/
- https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/
- https://primer.style/product/ui-patterns/progressive-disclosure/
- https://www.eleken.co/blog-posts/empty-state-ux
- https://www.uxdesigninstitute.com/blog/whats-a-skeleton-screen/
- https://github.com/orgs/community/discussions/147604
- https://vercel.com/docs/projects/project-dashboard
- https://medium.com/@ignatovich.dm/implementing-feature-flags-in-react-a-comprehensive-guide-f85266265fb3
- https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/
- https://userpilot.com/blog/progressive-disclosure-examples/
- https://hanjing.medium.com/designing-empty-states-21fea0085697

## Open Questions

- Should Tier 0 show the task board panel at all, or hide it entirely until Tier 1?
- What's the right threshold for enabling Tier 3 analytics? (10 tasks? 20? Time-based?)
- Should the morning page live at `/app/studio/morning` or replace the Studio hub as the default landing page?
