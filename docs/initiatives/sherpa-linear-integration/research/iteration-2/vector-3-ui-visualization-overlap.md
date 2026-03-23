# Vector 3: Studio UI Visualization Overlap

**Question:** Which Studio UI surfaces duplicate Linear's views vs provide governance-specific visualization?
**Agent dispatched:** 2026-03-21

## Summary

Studio UI is overwhelmingly governance-specific. The task list/card views have some redundancy with Linear, but dispatch telemetry, judge verdicts, lifecycle stages, and initiative governance views have no Linear equivalent.

## Component Analysis

### Dispatch Center (dispatch-content.tsx ~1196 lines)

| Panel | Classification | Notes |
|-------|---------------|-------|
| Backlog (lines 243-360) | REDUNDANT + governance-lite | List of pending tasks is a Linear board. But grouping by Sherpa task-type is governance-specific. |
| Assignments (lines 365-578) | GOVERNANCE | Active/failed/completed tasks with backend, model, dispatchedAt, elapsed time. Linear has no dispatch-to-backend routing visibility. |
| Workforce (lines 599-823) | GOVERNANCE | Backend health (available/offline), task type eligibility, agent role filtering. Pure dispatch infrastructure. |
| Mode Selector (lines 173-212) | GOVERNANCE | Interactive/supervised/overnight with guard rail blocking. |
| Guard Rail Banner (lines 218-232) | GOVERNANCE | Warns that overnight blocks code-impl/architect. |

**Verdict:** ~25% redundant (backlog list), ~75% governance.

### Tasks Page (tasks-content.tsx ~549 lines, mission components)

| Element | Classification | Notes |
|---------|---------------|-------|
| Task list with status dots | REDUNDANT | Linear's issue list |
| Judge verdict display | GOVERNANCE | Linear has no post-execution review gate |
| Backend + model badges | GOVERNANCE | Dispatch routing metadata |
| Event timeline (mission-timeline.tsx ~489 lines) | GOVERNANCE | 8+ event types (dispatch_requested, worker_started, agent_output, status_changed, dispatch_failed) with visual mapping. Linear's activity feed shows comments — Sherpa's shows execution events. |
| Metric chips (duration, tokens, cost) | GOVERNANCE | Dispatch telemetry |
| Log viewer (raw agent output) | GOVERNANCE | No Linear equivalent |
| Report tab (task deliverable) | GOVERNANCE | No Linear equivalent |

**Verdict:** Task list is redundant. Everything else is governance.

### Task Detail (task-detail-content.tsx ~376 lines)

| Section | Classification |
|---------|---------------|
| Task body (objective, criteria) | REDUNDANT |
| Judge verdict + backend/model/duration | GOVERNANCE |
| Timeline events | GOVERNANCE |
| Log viewer | GOVERNANCE |
| Report tab | GOVERNANCE |

**Verdict:** ~20% redundant (task body display), ~80% governance.

### Initiative Views

| Component | Classification | Notes |
|-----------|---------------|-------|
| initiative-lifecycle-bar.tsx | GOVERNANCE (100%) | 5-step progress (Research→Proposal→Plan→Active→Integrated). Maps 8 internal stages to visual. Next action + actor designation. Suggested prompt buttons. |
| initiative-metadata-grid.tsx | GOVERNANCE (100%) | Type, risk, momentum (active/cooling/stale), iterations, vectors, sessions, tokens. None exist in Linear. |
| initiative-overview-section.tsx | GOVERNANCE (100%) | Lifecycle hero, playbook, approve/decline buttons gated by lifecycle stage, role assignment pills, charts section. |
| initiative-file-tree.tsx | GOVERNANCE (100%) | Directoturtle with semantic annotations (proposal/plan/research/seed/deliverable). Inline prompt buttons. |
| initiative-action-bar.tsx | GOVERNANCE (100%) | Context-sensitive buttons gated by lifecycle stage (canPlanTasks = status === "approved" or "in-progress"). |

**Verdict:** 100% governance. No overlap with Linear UI.

### Dashboard & Sidebar

| Component | Classification |
|-----------|---------------|
| studio-sidebar.tsx (~193 lines) | GOVERNANCE — routes (Process, Dispatch, Workflow, Conventions, Skills, Workforce, Sessions) have no Linear equivalent |
| Process dashboard | GOVERNANCE — totalInitiatives, activeWorkstreams, totalIterations, totalOpenQuestions, lifecycle pipeline |

**Verdict:** 100% governance.

## Overlap Summary

| Surface | % Redundant | % Governance | Redundant Elements |
|---------|-------------|-------------|-------------------|
| Dispatch Center | 25% | 75% | Backlog task list |
| Tasks Page | 15% | 85% | Task list, status dots |
| Task Detail | 20% | 80% | Task body display |
| Initiative Views | 0% | 100% | None |
| Dashboard/Sidebar | 0% | 100% | None |
| **Overall** | **~12%** | **~88%** | Task lists and status badges only |

## What This Means

Studio's UI is not a project management dashboard that Linear replaces — it's a **governance console** that Linear can't render. The only redundancy is basic task listing/filtering, which represents ~12% of the UI surface.

If Linear becomes the task state backend, Studio's task list panels could optionally pull from Linear's API, but the governance overlays (verdicts, telemetry, timelines, lifecycle stages, convention compliance) remain Studio-native.
