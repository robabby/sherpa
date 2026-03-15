# Studio Agent Missions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Tasks page from a traditional task board into a full-viewport AI agent mission control with real-time SSE streaming.

**Architecture:** Split-pane layout (MissionWorkspace) mirroring ProcessWorkspace pattern. Left pane: scrollable MissionCard list with agent metadata. Right pane: MissionDetailPane with metric chips, tabbed content (Overview/Report/Verdict/Events), and MissionTimeline. SSE streaming via Next.js API route + fs.watch on NDJSON files. Client consumes via EventSource in useMissionEvents hook.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui, Motion (framer-motion), DM Sans + Fraunces + JetBrains Mono, pnpm monorepo.

**Shape:** `docs/initiatives/studio-agent-missions/shape.md` (4-session appetite)
**Design:** `docs/initiatives/studio-agent-missions/design.md` (16 files planned)
**Prototype:** `docs/initiatives/studio-agent-missions/prototype.html`

**Kill Criteria:**
- Split-pane takes >1 session → stop, component abstraction is wrong
- TaskBoardEntry extension breaks consumers → stop and assess
- <50% of NDJSON event files have usable events → defer timeline
- SSE can't detect new lines via fs.watch → fall back to 2s server-side poll
- Session 3 incomplete by end of session 3 → ship without live streaming

---

## Session 1: Layout + Split-Pane + Task Cards

Session 1 builds the structural shell: full-viewport layout, split-pane with ResizeHandle, task card list replacing the table, and shared style extraction. At the end of this session, `/tasks` renders the new mission control layout with clickable cards and a detail placeholder.

### Task 1: Extract shared badge styles

Extract duplicated `STATUS_STYLES`, `VERDICT_STYLES`, `PRIORITY_COLORS`, and formatting helpers into a shared module. This must happen first because every subsequent component imports from it.

**Files:**
- Create: `packages/studio-ui/src/lib/task-styles.ts`
- Modify: `packages/studio-ui/src/task-summary-widget.tsx`

**Reference:** Read `packages/studio-ui/src/tasks-content.tsx:20-69` and `packages/studio-ui/src/task-detail-content.tsx:19-68` for the badge maps being deduplicated.

**Step 1: Create the shared styles module**

```typescript
// packages/studio-ui/src/lib/task-styles.ts

import { BACKEND_META, type Backend } from "@sherpa/studio-core/dispatch-meta";

// ---------------------------------------------------------------------------
// Badge style maps
// ---------------------------------------------------------------------------

export const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "pending",
    className: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
  },
  dispatched: {
    label: "dispatched",
    className: "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  },
  completed: {
    label: "completed",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  },
  failed: {
    label: "failed",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  },
  reviewed: {
    label: "reviewed",
    className: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
};

export const STATUS_DOT: Record<string, string> = {
  pending: "bg-muted-foreground",
  dispatched: "bg-[var(--color-copper)]",
  completed: "bg-emerald-500",
  reviewed: "bg-[var(--color-gold)]",
  failed: "bg-rose-500",
};

export const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  approved: {
    label: "approved",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  },
  "needs-changes": {
    label: "needs changes",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  },
  rejected: {
    label: "rejected",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  },
  pending: {
    label: "pending",
    className: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground",
  },
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-[var(--color-gold)]",
  medium: "bg-[var(--color-copper)]",
  low: "bg-[var(--color-bronze)]",
};

// ---------------------------------------------------------------------------
// Formatting utilities
// ---------------------------------------------------------------------------

import { formatDistanceToNowStrict } from "date-fns";

/** Format ISO date to compact age string: "2h", "3d", "1mo" */
export function formatAge(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const d = isoDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ? new Date(isoDate + "T00:00:00")
      : new Date(isoDate);
    if (isNaN(d.getTime())) return "";
    const str = formatDistanceToNowStrict(d, { addSuffix: false });
    return str
      .replace(/ seconds?/, "s")
      .replace(/ minutes?/, "m")
      .replace(/ hours?/, "h")
      .replace(/ days?/, "d")
      .replace(/ months?/, "mo")
      .replace(/ years?/, "y");
  } catch {
    return "";
  }
}

/** Format seconds to human duration: "42s", "2m 34s", "1h 12m" */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "\u2014";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format token count to humanized string: "12.4K", "847" */
export function formatTokens(count: number | null): string {
  if (count === null) return "\u2014";
  if (count < 1000) return String(count);
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

/** Format cost to dollar string: "$0.03", "$1.24" */
export function formatCost(usd: number | null): string {
  if (usd === null) return "\u2014";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

/** Get backend meta safely */
export function getBackendMeta(backend: string) {
  return BACKEND_META[backend as Backend] ?? null;
}
```

**Step 2: Update task-summary-widget to use shared imports**

In `packages/studio-ui/src/task-summary-widget.tsx`, replace the local `STATUS_STYLES`, `STATUS_DOT`, `PRIORITY_COLORS` definitions (lines 11-49) with imports from the shared module. The component body stays the same.

**Step 3: Verify the build**

Run: `pnpm check`
Expected: No type errors. The shared module exports match the shapes consumed.

**Step 4: Commit**

```
feat(studio-ui): extract shared task badge styles to lib/task-styles
```

---

### Task 2: TaskBoardEntry extension + task-events module

Extend the data model with agent metrics and create the single-task event reader.

**Files:**
- Modify: `packages/studio-core/src/tasks.ts:4-26` (TaskBoardEntry interface)
- Modify: `packages/studio-core/src/tasks.ts:167-216` (getTaskBoard function)
- Create: `packages/studio-core/src/task-events.ts`
- Modify: `packages/studio-core/src/index.ts`

**Reference:** Read `packages/studio-core/src/mcp-dashboard.ts:162-192` for the `readAllEvents()` NDJSON parsing pattern to follow.

**Step 1: Create task-events module**

```typescript
// packages/studio-core/src/task-events.ts

import fs from "fs";
import path from "path";

export interface TaskEvent {
  timestamp: string;
  event: string;
  taskSlug: string;
  data: Record<string, unknown>;
}

export interface AgentMetrics {
  durationSeconds: number | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  costUsd: number | null;
}

interface TaskEventsOptions {
  tasksDir?: string;
  projectRoot?: string;
}

function resolveLogsDir(opts?: TaskEventsOptions): string {
  const root = opts?.projectRoot ?? process.cwd();
  const tasksDir = opts?.tasksDir ?? path.resolve(root, "docs/tasks");
  return path.join(tasksDir, "logs");
}

/** Read all NDJSON events for a single task. */
export function getTaskEvents(taskId: string, opts?: TaskEventsOptions): TaskEvent[] {
  const logsDir = resolveLogsDir(opts);
  const eventsFile = path.join(logsDir, `${taskId}-events.ndjson`);

  if (!fs.existsSync(eventsFile)) return [];

  const events: TaskEvent[] = [];
  const content = fs.readFileSync(eventsFile, "utf-8");

  for (const line of content.split("\n").filter(Boolean)) {
    try {
      const parsed = JSON.parse(line) as {
        timestamp?: string;
        ts?: string;
        event: string;
        [key: string]: unknown;
      };
      const { timestamp, ts, event, ...rest } = parsed;
      events.push({
        timestamp: timestamp ?? ts ?? "",
        event,
        taskSlug: taskId,
        data: rest as Record<string, unknown>,
      });
    } catch {
      // Skip malformed lines
    }
  }

  return events;
}

/** Extract agent metrics from a task's NDJSON events. */
export function extractAgentMetrics(taskId: string, opts?: TaskEventsOptions): AgentMetrics {
  const events = getTaskEvents(taskId, opts);
  let durationSeconds: number | null = null;
  let tokensInput: number | null = null;
  let tokensOutput: number | null = null;
  let costUsd: number | null = null;

  for (const ev of events) {
    // Duration from status_changed to completed
    if (ev.event === "status_changed" && ev.data.to === "completed") {
      const dur = ev.data.durationSeconds;
      if (typeof dur === "number" && dur > 0) durationSeconds = dur;
    }
    // Worker started may have timing
    if (ev.event === "worker_started") {
      // No tokens here yet — placeholder for future enrichment
    }
    // Look for token/cost data in any event (API backends may add these)
    if (typeof ev.data.tokensInput === "number") tokensInput = ev.data.tokensInput as number;
    if (typeof ev.data.tokensOutput === "number") tokensOutput = ev.data.tokensOutput as number;
    if (typeof ev.data.costUsd === "number") costUsd = ev.data.costUsd as number;
  }

  // If durationSeconds was negative (known bug in worker.sh), compute from timestamps
  if (durationSeconds !== null && durationSeconds < 0) {
    const first = events[0]?.timestamp;
    const last = events[events.length - 1]?.timestamp;
    if (first && last) {
      const diff = (new Date(last).getTime() - new Date(first).getTime()) / 1000;
      if (diff > 0) durationSeconds = Math.round(diff);
      else durationSeconds = null;
    } else {
      durationSeconds = null;
    }
  }

  return { durationSeconds, tokensInput, tokensOutput, costUsd };
}
```

**Step 2: Extend TaskBoardEntry**

Add 4 fields to the `TaskBoardEntry` interface in `packages/studio-core/src/tasks.ts`:

```typescript
// Add after hasBlockers field (line 25):
  durationSeconds: number | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  costUsd: number | null;
```

**Step 3: Populate metrics in getTaskBoard()**

In the `getTaskBoard()` function, after creating each task entry (around line 186), populate the new fields:

```typescript
// Add import at top of file:
import { extractAgentMetrics } from "./task-events";

// In the for loop, after the tasks.push({...}) call, compute metrics:
// Replace the tasks.push block to include the new fields:
    const metrics = extractAgentMetrics(id, opts);

    tasks.push({
      // ... all existing fields ...
      durationSeconds: metrics.durationSeconds,
      tokensInput: metrics.tokensInput,
      tokensOutput: metrics.tokensOutput,
      costUsd: metrics.costUsd,
    });
```

Do the same in `getTaskDetail()` — add the 4 fields to the return object, populated from `extractAgentMetrics`.

**Step 4: Export from barrel**

Add to `packages/studio-core/src/index.ts`:

```typescript
export * from "./task-events"
```

**Step 5: Verify the build**

Run: `pnpm check`
Expected: No type errors. Existing consumers of TaskBoardEntry (tasks-content, task-detail-content, task-summary-widget, hub-tasks-panel) should not break — the new fields are additive.

**Step 6: Commit**

```
feat(studio-core): add task-events module and agent metrics to TaskBoardEntry
```

---

### Task 3: Layout passthrough + MissionWorkspace shell

Convert the tasks layout to passthrough and create the MissionWorkspace split-pane shell.

**Files:**
- Modify: `apps/studio/src/app/tasks/layout.tsx`
- Create: `packages/studio-ui/src/mission-workspace.tsx`
- Modify: `apps/studio/src/app/tasks/page.tsx`
- Modify: `packages/studio-ui/src/index.ts`

**Reference:** Read `packages/studio-ui/src/process-workspace.tsx` — the entire file. MissionWorkspace mirrors its structure: `useStableSearchParams`, `listWidth` state with localStorage, `ResizeHandle`, keyboard nav, URL sync.

**Step 1: Convert tasks layout to passthrough**

Replace `apps/studio/src/app/tasks/layout.tsx` content:

```typescript
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**Step 2: Create MissionWorkspace**

Create `packages/studio-ui/src/mission-workspace.tsx`. This is the main client component. Structure:

- `"use client"` directive
- Import `ResizeHandle` from `./resize-handle`
- Constants: `LIST_MIN_WIDTH = 200`, `LIST_MAX_WIDTH = 500`, `LIST_DEFAULT_WIDTH = 360`, `STORAGE_KEY = "mission-list-width"`
- Props: `{ tasks: TaskBoardEntry[] }`
- State: `selectedId`, `focusIndex`, `searchTerm`, `listWidth`, `activeTab`, `mobileShowDetail`
- URL sync via `useSearchParams` (read `?node=`, `?status=`, `?backend=`, `?sort=`)
- Layout: `flex h-[calc(100vh-53px)] border-t border-[var(--color-dark-bronze)]`
  - Left pane: filter bar placeholder + scrollable list
  - `ResizeHandle`
  - Right pane: detail pane placeholder (or empty state)
- Keyboard: j/k for navigation, Enter for select, Escape to deselect, `/` to focus search

For this task, use placeholder `<div>` for the filter bar, card list, and detail pane. They'll be replaced by dedicated components in subsequent tasks.

**Step 3: Update tasks/page.tsx**

```typescript
import type { Metadata } from "next";
import { Suspense } from "react";
import path from "path";

import { MissionWorkspace } from "@/components/studio/mission-workspace";
import { getTaskBoard } from "@/lib/studio/tasks";

export const metadata: Metadata = {
  title: "Tasks | Studio",
  robots: "noindex, nofollow",
};

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

export default function TasksPage() {
  const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT });

  return (
    <Suspense>
      <MissionWorkspace tasks={tasks} />
    </Suspense>
  );
}
```

**Step 4: Add barrel export**

Add to `packages/studio-ui/src/index.ts`:

```typescript
export * from "./mission-workspace"
```

**Step 5: Verify visually**

Run: `pnpm dev`
Navigate to `http://localhost:3000/tasks`
Expected: Full-viewport split-pane layout. Left pane with placeholder content. Resize handle works. Right pane shows empty state. No max-w-6xl constraint.

**Step 6: Commit**

```
feat(studio-ui): add MissionWorkspace split-pane shell, convert tasks layout to passthrough
```

---

### Task 4: MissionCard + MissionList

Build the task card component and scrollable list.

**Files:**
- Create: `packages/studio-ui/src/mission-card.tsx`
- Create: `packages/studio-ui/src/mission-list.tsx`
- Modify: `packages/studio-ui/src/mission-workspace.tsx`
- Modify: `packages/studio-ui/src/index.ts`

**Reference:** Read the prototype HTML cards for the exact visual structure. Read `packages/studio-ui/src/process-item-list.tsx` for the virtualized list pattern (though MissionList doesn't need virtualization for <100 tasks).

**Step 1: Create MissionCard**

`packages/studio-ui/src/mission-card.tsx` — a presentational component:

Props: `{ task: TaskBoardEntry; selected: boolean; focused: boolean; onClick: () => void }`

Structure (matching prototype v2):
- Status dot (color from `STATUS_DOT`, `animate-pulse-dot` class when dispatched)
- Title (13px, truncated) + duration (right-aligned, mono tabular-nums)
- Initiative slug (text-dim)
- Badge row: CLI/API badge + backend + model + verdict (when present)
- Metrics row: humanized tokens + cost (omit row entirely when both are null)
- Selected state: `border-l-2 border-l-copper bg-copper/6`, title to `gold-bright`
- Hover state: `bg-copper/3`

Use `formatDuration`, `formatTokens`, `formatCost`, `getBackendMeta` from `lib/task-styles`.

**Step 2: Create MissionList**

`packages/studio-ui/src/mission-list.tsx`:

Props: `{ tasks: TaskBoardEntry[]; selectedId: string | null; focusIndex: number; onSelect: (id: string) => void }`

Simple scrollable div with `overflow-y-auto scrollbar-thin`. Maps tasks to MissionCard. Uses a ref to scroll the focused card into view.

**Step 3: Wire into MissionWorkspace**

Replace the left pane placeholder div with `<MissionList>`. Pass filtered tasks, selectedId, focusIndex, onSelect callback. Add filtering logic (status, backend, initiative, search term applied to task title).

**Step 4: Add barrel exports**

Add to `packages/studio-ui/src/index.ts`:

```typescript
export * from "./mission-card"
export * from "./mission-list"
```

**Step 5: Verify visually**

Run: `pnpm dev`
Navigate to `/tasks`
Expected: Task cards render in the left pane with status dots, badges, metrics. Clicking a card highlights it. j/k navigation works. Cards are scrollable.

**Step 6: Commit**

```
feat(studio-ui): add MissionCard and MissionList components
```

---

### Task 5: MissionFilterBar

Build the two-row filter bar for the left pane header.

**Files:**
- Create: `packages/studio-ui/src/mission-filter-bar.tsx`
- Modify: `packages/studio-ui/src/mission-workspace.tsx`
- Modify: `packages/studio-ui/src/index.ts`

**Reference:** Read `packages/studio-ui/src/tasks-content.tsx:225-314` for the existing FilterBar. Read `packages/studio-core/src/dispatch-meta.ts` for `BACKEND_META`.

**Step 1: Create MissionFilterBar**

Props: `{ tasks: TaskBoardEntry[]; searchTerm: string; onSearchChange: (term: string) => void; params: URLSearchParams; setParam: (key: string, value: string | null) => void; activeSort: string; onSortChange: (sort: string) => void }`

Structure (matching prototype v2):
- Row 1: Search input (with border, focus ring) + Status dropdown + Sort toggle group (Recent | A-Z | Status)
- Row 2: Backend toggles derived from `BACKEND_META`. "All" active button + dividers between CLI/API groups with tiny mono labels
- Stats bar: counts per status with colored numbers + total cost right-aligned

Backend toggles: iterate `Object.entries(BACKEND_META)`, group by `type`, render in order. Active filter state from `params.get("backend")`.

**Step 2: Wire into MissionWorkspace**

Replace filter placeholder with `<MissionFilterBar>`. Connect to URL params via the existing `setParam` helper.

**Step 3: Add barrel export**

**Step 4: Verify**

Run: `pnpm dev`
Expected: Filter bar renders. Clicking backend toggles filters the list. Search filters by title. Status dropdown works. Sort toggles reorder cards.

**Step 5: Commit**

```
feat(studio-ui): add MissionFilterBar with dynamic backend toggles
```

---

### Session 1 checkpoint

At this point, `/tasks` renders a full-viewport split-pane with:
- Two-row filter bar with dynamic backends, search, status filter, sort
- Scrollable task card list with agent metadata badges
- Working resize handle + keyboard navigation
- Stats bar with counts + aggregate cost
- Empty state in right pane

**Verify:** Run `pnpm check && pnpm build` — both must pass.

**Kill criterion check:** If session 1 took more than 1 session, stop. The split-pane pattern is proven — if it's fighting, the abstraction is wrong.

---

## Session 2: Detail Pane + Event Timeline (Static)

Session 2 fills the right pane: metadata header with metric chips, tabbed content, and the event timeline rendering static events from the server.

### Task 6: MissionDetailPane

Build the right-pane detail component with metadata header and tabbed content.

**Files:**
- Create: `packages/studio-ui/src/mission-detail-pane.tsx`
- Modify: `packages/studio-ui/src/mission-workspace.tsx`
- Modify: `packages/studio-ui/src/index.ts`

**Reference:** Read `packages/studio-ui/src/task-detail-content.tsx` for the existing detail view being replaced. Read `packages/studio-ui/src/process-detail-pane.tsx` for the inline detail pattern. Read the prototype v2 detail pane HTML for the metric chips layout.

**Step 1: Create MissionDetailPane**

Props: `{ task: TaskBoardEntry & { body: string; reportContent: string | null; verdictContent: string | null; blockerContent: string | null } | null; events: TaskEvent[]; isStreaming: boolean; activeTab: string; onTabChange: (tab: string) => void }`

When `task` is null, render the empty state (icon + "Select a mission" + keyboard hint).

When `task` is present:
- **Status line:** status dot (with pulse-glow when dispatched) + status badge + verdict badge
- **Title:** Fraunces display font, 20px
- **Metric chips row:** flex-wrap row of `.metric-chip` containers:
  - Backend (CLI/API badge + name)
  - Model
  - Duration (copper text when dispatched)
  - Tokens (full breakdown: "12,384 in / 3,201 out" — or "—" when null)
  - Cost (gold text — or "—" when null)
  - Mode
- **Context line:** initiative link + priority + age + role
- **Tabs:** Overview | Report | Verdict | Events. Use shadcn `Tabs` component.
  - Overview: Objective section + AcceptanceCriteria (copy the component from task-detail-content)
  - Report: `DocRenderer` with reportContent (or empty state)
  - Verdict: `DocRenderer` with verdictContent (or empty state)
  - Events: placeholder for MissionTimeline (wired in Task 7)
- Default tab: Report if `task.hasReport`, else Overview

**Step 2: Wire into MissionWorkspace**

The right pane renders `<MissionDetailPane>`. When a card is selected, MissionWorkspace needs full task detail data (body, reportContent, etc.). Two approaches:

- **For prototype:** Pass `TaskBoardEntry` from the list + fetch detail lazily
- **For production:** Server component passes full task data, or use a client-side fetch

For now: the server page.tsx passes `tasks` (list data) and optionally the selected task's detail via `getTaskDetail()` if `?node=` is in the URL. MissionWorkspace receives `{ tasks, initialDetail, initialEvents }`.

Update `apps/studio/src/app/tasks/page.tsx` to:
1. Read `searchParams.node` for initial selection
2. Call `getTaskDetail(node)` if present
3. Call `getTaskEvents(node)` if present
4. Pass all three to MissionWorkspace

**Step 3: Handle client-side task switching**

When user clicks a different card, MissionWorkspace needs detail data for the new task. Since `getTaskDetail` is server-only (uses `fs`), use `router.refresh()` with the new `?node=id` param. This triggers a server re-render with the new detail.

Alternatively, for instant feel: pass all tasks as list data, and only the body/report/verdict for the selected task. The click updates URL → Next.js re-renders the server component → passes new detail.

**Step 4: Add barrel export, verify visually**

Run: `pnpm dev`
Expected: Clicking a card shows its detail in the right pane — metric chips, objective, acceptance criteria. Tabs switch. Report tab shows worker output. Empty verdict shows placeholder.

**Step 5: Commit**

```
feat(studio-ui): add MissionDetailPane with metric chips and tabbed content
```

---

### Task 7: MissionTimeline (static)

Build the vertical event timeline component, rendering events loaded at page time (no SSE yet).

**Files:**
- Create: `packages/studio-ui/src/mission-timeline.tsx`
- Modify: `packages/studio-ui/src/mission-detail-pane.tsx` (wire into Events tab)
- Modify: `packages/studio-ui/src/index.ts`

**Reference:** Read the prototype v2 events tab HTML for the exact visual structure. Read `docs/tasks/logs/design-overnight-dashboard-events.ndjson` for real event data.

**Prerequisite check:** Before building, verify at least 3 completed tasks have usable NDJSON event files (kill criterion from shape):

Run: `ls docs/tasks/logs/*-events.ndjson | head -5`

If <50% have events, defer this task.

**Step 1: Create MissionTimeline**

Props: `{ events: TaskEvent[]; isStreaming: boolean }`

Structure:
- Streaming banner (when isStreaming): border-copper/15, ping-animated dot, "Streaming live events", 3 pulsing ellipsis dots
- Vertical timeline container with absolute vertical line
  - Static line: `w-px bg-dark-bronze`
  - Active line (when isStreaming): animated gradient class `timeline-line-active` (add CSS via a `<style>` tag or Tailwind plugin)
- For each event: render a timeline item with:
  - Icon: sized and colored per event type (see design.md event mapping table)
  - Significant events (dispatch_requested, worker_started, status_changed, dispatch_spawned): 14px dot, 2px border, glow shadow
  - Minor events (backend_delegating, task_updated): 10-12px dot, 1-1.5px border, no glow
  - Label: event name, colored by type
  - Timestamp: right-aligned, mono tabular-nums, formatted as HH:MM:SS
  - Detail line: contextual text from event data
- Time gap detection: if gap between consecutive events >30s, insert a gap indicator (clock icon + "Xm Ys elapsed")
- Streaming tail (when isStreaming): ping-animated dot + "Waiting for events..."

**Event detail text mapping:**

| Event | Detail format |
|-------|--------------|
| `dispatch_requested` | "Dispatched to {backend} ({mode}) via {source}" |
| `task_updated` | Key-value pairs from updates |
| `worker_started` | "{model} · {mode} · {taskType} · ${budgetUsd} budget" |
| `backend_delegating` | Script path (mono) |
| `dispatch_spawned` | "PID {pid} · {backend} · {agent} · {mode}" |
| `status_changed` | "Exit code {exitCode} · {durationSeconds}s duration" or "{from} → {to}" |
| `dispatch_failed` | Error message |

**Step 2: Wire into MissionDetailPane Events tab**

Replace the Events tab placeholder with `<MissionTimeline events={events} isStreaming={task.status === "dispatched"} />`.

**Step 3: Verify visually**

Navigate to `/tasks`, select a task with NDJSON events. Switch to Events tab.
Expected: Vertical timeline with colored dots, event labels, timestamps, detail text. Time gaps shown between distant events.

**Step 4: Commit**

```
feat(studio-ui): add MissionTimeline component with event type mapping
```

---

### Task 8: /tasks/[slug] standalone detail route

Update the direct-link route to use MissionDetailPane.

**Files:**
- Modify: `apps/studio/src/app/tasks/[slug]/page.tsx`

**Step 1: Update the route**

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";

import { MissionDetailPane } from "@/components/studio/mission-detail-pane";
import { getTaskDetail } from "@/lib/studio/tasks";
import { getTaskEvents } from "@/lib/studio/task-events";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const task = getTaskDetail(slug, { projectRoot: PROJECT_ROOT });
  return {
    title: task ? `${task.title} | Tasks` : "Task Not Found",
    robots: "noindex, nofollow",
  };
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const task = getTaskDetail(slug, { projectRoot: PROJECT_ROOT });
  if (!task) notFound();

  const events = getTaskEvents(slug, { projectRoot: PROJECT_ROOT });

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <MissionDetailPane
        task={task}
        events={events}
        isStreaming={false}
        activeTab={task.hasReport ? "report" : "overview"}
        onTabChange={() => {}}
      />
    </div>
  );
}
```

Note: Standalone route wraps in `max-w-4xl` for readability. No split-pane. `isStreaming` is false (SSE only works from the main `/tasks` workspace where the client hook lives).

**Step 2: Verify**

Navigate to `/tasks/design-overnight-dashboard` directly.
Expected: Full-width detail view with metric chips, tabs, timeline.

**Step 3: Commit**

```
feat(studio): update /tasks/[slug] route to use MissionDetailPane
```

---

### Session 2 checkpoint

At this point, `/tasks` is fully functional as a static mission control:
- Left pane: filter bar + task card list
- Right pane: metric chips header + tabbed content + event timeline
- `/tasks/[slug]` works as a standalone route
- All data loaded server-side, no SSE yet

**Verify:** `pnpm check && pnpm build`

---

## Session 3: SSE Streaming

Session 3 adds real-time: the SSE API route, the client EventSource hook, and live event updates in the timeline.

### Task 9: SSE API route

Build the streaming endpoint that tails NDJSON files.

**Files:**
- Create: `apps/studio/src/app/api/stream/tasks/[taskId]/route.ts`

**Reference:** Read `apps/studio/src/app/api/dispatch/run/route.ts` for the existing API route pattern and `PROJECT_ROOT` resolution.

**Step 1: Create the SSE route**

```typescript
// apps/studio/src/app/api/stream/tasks/[taskId]/route.ts

import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const eventsFile = path.join(PROJECT_ROOT, `docs/tasks/logs/${taskId}-events.ndjson`);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      // 1. Send existing events
      let lastSize = 0;
      if (fs.existsSync(eventsFile)) {
        const content = fs.readFileSync(eventsFile, "utf-8");
        lastSize = Buffer.byteLength(content, "utf-8");
        for (const line of content.split("\n").filter(Boolean)) {
          try {
            send("task-event", JSON.parse(line));
          } catch {
            // Skip malformed
          }
        }
      }
      send("control", { type: "caught-up" });

      // 2. Watch for new events (debounced)
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const readNewLines = () => {
        try {
          if (!fs.existsSync(eventsFile)) return;
          const stat = fs.statSync(eventsFile);
          if (stat.size <= lastSize) return;

          const fd = fs.openSync(eventsFile, "r");
          const buf = Buffer.alloc(stat.size - lastSize);
          fs.readSync(fd, buf, 0, buf.length, lastSize);
          fs.closeSync(fd);
          lastSize = stat.size;

          const newContent = buf.toString("utf-8");
          for (const line of newContent.split("\n").filter(Boolean)) {
            try {
              const parsed = JSON.parse(line);
              send("task-event", parsed);

              // Check for terminal events
              if (
                parsed.event === "status_changed" &&
                ["completed", "failed", "reviewed"].includes(parsed.data?.to ?? parsed.to)
              ) {
                send("control", { type: "done" });
                watcher?.close();
                controller.close();
                return;
              }
            } catch {
              // Skip malformed
            }
          }
        } catch {
          // File read error — non-fatal
        }
      };

      let watcher: fs.FSWatcher | null = null;
      try {
        watcher = fs.watch(eventsFile, { persistent: false }, () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(readNewLines, 100);
        });
      } catch {
        // File doesn't exist yet — fall back to polling
        const pollInterval = setInterval(() => {
          if (fs.existsSync(eventsFile)) {
            clearInterval(pollInterval);
            readNewLines();
            try {
              watcher = fs.watch(eventsFile, { persistent: false }, () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(readNewLines, 100);
              });
            } catch {
              // Give up on watching
            }
          }
        }, 2000);
      }

      // 3. Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        watcher?.close();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

**Step 2: Test manually**

1. Run `pnpm dev`
2. In a terminal: `curl -N http://localhost:3000/api/stream/tasks/design-overnight-dashboard`
3. Expected: SSE events stream out, ending with `event: control\ndata: {"type":"caught-up"}`
4. In another terminal, append a test line to the NDJSON file:
   ```
   echo '{"timestamp":"2026-03-15T00:00:00Z","event":"test_event","data":{}}' >> docs/tasks/logs/design-overnight-dashboard-events.ndjson
   ```
5. Expected: The curl output shows the new event. Remove the test line after.

**Step 3: Commit**

```
feat(studio): add SSE streaming API route for task events
```

---

### Task 10: useMissionEvents hook

Build the client-side EventSource consumer.

**Files:**
- Create: `packages/studio-ui/src/hooks/use-mission-events.ts`

**Step 1: Create the hook**

```typescript
// packages/studio-ui/src/hooks/use-mission-events.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TaskEvent } from "@sherpa/studio-core/task-events";

interface UseMissionEventsResult {
  events: TaskEvent[];
  isStreaming: boolean;
}

/**
 * Streams task events via SSE for dispatched tasks.
 * For non-dispatched tasks, uses the provided static events.
 */
export function useMissionEvents(
  taskId: string | null,
  taskStatus: string | null,
  staticEvents: TaskEvent[],
): UseMissionEventsResult {
  const [events, setEvents] = useState<TaskEvent[]>(staticEvents);
  const [isStreaming, setIsStreaming] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Close any existing connection
  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    // Reset when task changes
    cleanup();

    if (!taskId) {
      setEvents([]);
      return;
    }

    // Only stream for dispatched tasks
    if (taskStatus !== "dispatched") {
      setEvents(staticEvents);
      return;
    }

    // Open SSE connection
    setEvents([]); // Will be populated from stream
    setIsStreaming(true);

    const es = new EventSource(`/api/stream/tasks/${taskId}`);
    esRef.current = es;

    es.addEventListener("task-event", (e) => {
      try {
        const parsed = JSON.parse(e.data);
        const event: TaskEvent = {
          timestamp: parsed.timestamp ?? parsed.ts ?? "",
          event: parsed.event,
          taskSlug: taskId,
          data: parsed,
        };
        setEvents((prev) => [...prev, event]);
      } catch {
        // Skip malformed
      }
    });

    es.addEventListener("control", (e) => {
      try {
        const { type } = JSON.parse(e.data);
        if (type === "done") {
          cleanup();
        }
        // "caught-up" — no action needed, events are already accumulating
      } catch {
        // Skip
      }
    });

    es.addEventListener("error", () => {
      // EventSource auto-reconnects. If it fails permanently, just stop.
      cleanup();
    });

    return cleanup;
  }, [taskId, taskStatus, staticEvents, cleanup]);

  return { events, isStreaming };
}
```

**Step 2: Wire into MissionWorkspace**

In MissionWorkspace, use the hook:

```typescript
const selectedTask = tasks.find(t => t.id === selectedId) ?? null;
const { events, isStreaming } = useMissionEvents(
  selectedId,
  selectedTask?.status ?? null,
  initialEvents,
);
```

Pass `events` and `isStreaming` to MissionDetailPane, which passes them to MissionTimeline.

**Step 3: Verify**

1. Dispatch a task via `/dispatch` UI
2. Navigate to `/tasks`, select the dispatched task, switch to Events tab
3. Expected: Timeline shows events. Streaming banner visible. As new events are written to the NDJSON file by the worker, they appear in the timeline.

**Step 4: Commit**

```
feat(studio-ui): add useMissionEvents SSE hook for live event streaming
```

---

### Session 3 checkpoint

SSE streaming works end-to-end:
- API route tails NDJSON files with fs.watch
- Client connects via EventSource for dispatched tasks
- New events animate into the timeline in real-time
- Connection auto-closes when task completes

**Verify:** `pnpm check && pnpm build`

**Kill criterion check:** If SSE can't reliably detect new lines, the route already has a 2s polling fallback for when the file doesn't exist yet. If fs.watch itself is unreliable, convert the watcher to a 2s setInterval poll (server-side only — client still gets clean SSE).

---

## Session 4: Polish + Cleanup

Session 4: visual verification, edge cases, cleanup of old components, and final integration.

### Task 11: Visual verification via /ui-review

Use the ui-review skill to screenshot and verify the mission control layout.

**Step 1:** Run `/ui-review` on `/tasks`

Check:
- [ ] Full-viewport layout, no scroll on body
- [ ] Cards render with correct status dots, badges, metrics
- [ ] Selected card has copper left border + bg tint
- [ ] Detail pane shows metric chips row
- [ ] Tabs work (Overview, Report, Verdict, Events)
- [ ] Timeline renders with correct event type icons
- [ ] Streaming banner appears for dispatched tasks
- [ ] Empty state when no task selected
- [ ] Resize handle works
- [ ] `/tasks/[slug]` standalone route renders correctly

**Step 2:** Fix any visual issues found

**Step 3: Commit**

```
fix(studio-ui): visual polish for mission control layout
```

---

### Task 12: Remove old components

Delete the superseded components and clean up barrel exports.

**Files:**
- Delete: `packages/studio-ui/src/tasks-content.tsx`
- Delete: `packages/studio-ui/src/task-detail-content.tsx`
- Modify: `packages/studio-ui/src/index.ts` (remove old exports, add new ones)

**Step 1: Verify no remaining imports**

Run: `grep -r "tasks-content\|task-detail-content" apps/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".next"`

Expected: Only the barrel export lines and possibly Storybook stories (which can be removed too).

**Step 2: Remove files and exports**

Delete the two files. Remove their export lines from the barrel. Add any missing new component exports.

**Step 3: Verify build**

Run: `pnpm check && pnpm build`
Expected: Clean build. No broken imports.

**Step 4: Commit**

```
refactor(studio-ui): remove superseded tasks-content and task-detail-content
```

---

### Task 13: Edge cases and responsive behavior

Handle edge cases identified during visual review.

**Step 1: No tasks state**

When `tasks` array is empty, MissionWorkspace should show a full-page empty state (not split-pane with empty list + empty detail). Test by temporarily renaming `docs/tasks/` directory.

**Step 2: Task with no NDJSON events**

Events tab should show "No events recorded" message instead of empty timeline.

**Step 3: Long task titles**

Verify cards truncate properly. Verify detail pane wraps long titles.

**Step 4: Many tasks (>20)**

Verify scroll performance in the list. No virtualization needed but ensure smooth scrolling with stagger animations disabled after initial load.

**Step 5: Commit**

```
fix(studio-ui): handle edge cases in mission control (empty states, long titles)
```

---

### Task 14: Final integration test

End-to-end verification of the complete flow.

**Step 1: Full dispatch cycle**

1. Create a test task: `./scripts/task-board.sh add test-mission-control "Test mission control" --task-type research`
2. Navigate to `/tasks` — verify the new task appears as pending
3. Dispatch via `/dispatch` UI — verify card transitions to dispatched with pulsing dot
4. Switch to Events tab — verify events stream in live
5. Wait for completion — verify card transitions to completed, streaming stops
6. Check Report tab — verify worker output renders
7. Navigate to `/tasks/test-mission-control` — verify standalone route works

**Step 2: Cleanup test task**

Remove the test task file.

**Step 3: Final build check**

Run: `pnpm check && pnpm build`

**Step 4: Commit**

```
test(studio): verify end-to-end mission control flow
```

---

## Summary

| Session | Tasks | What ships |
|---------|-------|-----------|
| 1 | Tasks 1-5 | Layout, split-pane, cards, filter bar |
| 2 | Tasks 6-8 | Detail pane, metric chips, timeline (static), /tasks/[slug] |
| 3 | Tasks 9-10 | SSE route, EventSource hook, live streaming |
| 4 | Tasks 11-14 | Visual polish, cleanup, edge cases, integration test |

**New files:** 10
**Modified files:** 6 (+ barrel exports)
**Deleted files:** 2
**Total estimated new code:** ~1,200 lines
