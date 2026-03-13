# Vector 2: Component Design

**Question:** Using Studio's existing hub panel system, design an `/app/studio/morning` page. What panels does it have? What data feeds each?
**Agent dispatched:** 2026-03-09

## Findings

### Existing Infrastructure

- **HubPanel**: Component with `variant`, `href`, `title`, `label`, `linkText` props. Renders a card with header, link, and children.
- **HubStagger/HubStaggerItem**: Animation orchestrator. Items animate in sequence with `variant: "fade"` or `variant: "panel"`.
- **HubOperationalPulse**: Aggregate status cards showing system-wide metrics (initiatives, workstreams, portfolio health).
- **12-column grid**: Studio hub uses `lg:grid-cols-12` with alternating 5/7 column panels.
- **URL-as-state**: Existing pattern via query params (see `event-browser-panel.tsx`).

### Page Layout

Three horizontal sections stacked vertically:

```
┌─────────────────────────────────────────────────────────────┐
│ Studio Header + "Morning Review" breadcrumb                 │
├─────────────────────────────────────────────────────────────┤
│ Status Cards (full-width, 4-up grid)                        │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │Completed │ Failed   │ Blocked  │ Stale    │              │
│  │ (green)  │ (red)    │ (amber)  │ (gray)   │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
├─────────────────────────────────────────────────────────────┤
│ Queue (5-col)        │ Detail Panel (7-col)                  │
│                      │                                       │
│ ▪ [urgent] task-1    │ Task: transit-content-batch-5         │
│ ▪ [high] task-2      │ Priority: High  Status: Completed    │
│   (selected) ───────►│ Verdict: approved                    │
│ ▪ [medium] init-1    │ [Approve] [Request Changes] [Reject] │
│ ▪ [low] task-3       │ [View Full Report]                   │
├─────────────────────────────────────────────────────────────┤
│ Activity Timeline (full-width)                              │
│ 6:45 AM ◆ task completed  · 6:12 AM ◆ session ended        │
└─────────────────────────────────────────────────────────────┘
```

### Panel Components

#### 1. `MorningStatusPanel` (full-width, server component)

```typescript
interface MorningStatusPanelProps {
  completedCount: number;
  failedCount: number;
  blockedCount: number;
  staleInitiativeCount: number;
  overnightTokens: number;
  overnightSessions: number;
}
```

Hero metric: "X tasks completed overnight, Y pending review". 4-up status card grid below.

#### 2. `MorningQueuePanel` (5-col, client component)

```typescript
interface MorningQueuePanelProps {
  queueItems: MorningQueueItem[];
  selectedId: string | null;      // from URL ?selected=<id>
}

interface MorningQueueItem {
  id: string;
  type: "task" | "initiative";
  title: string;
  priority: "urgent" | "high" | "medium" | "low";
  status: string;
  daysOld: number;
  action: string; // "Review", "Integrate", "Debug"
}
```

Keyboard-driven list. Up/down to navigate, Enter to select, A/R/D for verdicts. Auto-advance after action.

#### 3. `MorningDetailPanel` (7-col, client component)

```typescript
interface MorningDetailPanelProps {
  item: MorningQueueItem | null;
  task?: TaskBoardEntry;
  initiative?: Initiative;
  report?: string;          // Markdown content from log file
}
```

Shows full context for selected item. Task view: title, status, verdict, output preview, action buttons. Initiative view: summary, velocity, attention action.

#### 4. `MorningActivityPanel` (full-width, server component)

```typescript
interface MorningActivityPanelProps {
  activities: MorningActivity[];
}

interface MorningActivity {
  timestamp: string;
  type: "task-completed" | "task-failed" | "session-ended" | "workstream-updated";
  title: string;
  description: string;
  metadata?: { taskId?: string; sessionId?: string; workstreamSlug?: string };
}
```

Vertical timeline grouped by hour. Most recent at top.

### Data Flow

```
page.tsx (async server component)
  ├── getTaskBoard() → TaskBoardEntry[]
  ├── getSessions() → Session[]
  ├── getInitiatives() → Initiative[]
  ├── getWorkstreams() → Workstream[]
  └── buildAttentionNeeded() → AttentionItem[]
      ↓
  Filter to overnight (last 24h)
      ↓
  Transform into MorningQueueItem[] + MorningActivity[]
      ↓
  HubStagger animation wrapper
    ├── MorningStatusPanel (server, static cards)
    ├── MorningQueuePanel (client, keyboard nav)
    ├── MorningDetailPanel (client, selection state)
    └── MorningActivityPanel (server, timeline)
```

### Client vs Server Boundaries

- **Server:** `page.tsx`, `MorningStatusPanel`, `MorningActivityPanel`
- **Client:** `MorningQueuePanel` (keyboard nav, URL state), `MorningDetailPanel` (selection, scroll)
- URL state via `useRouter()` + `useSearchParams()`
- Verdict actions via Next.js server actions

### New HubPanel Variant

Add `"morning"` variant to `hub-panel.tsx` with softer copper accents (operational, not showcase).

## Implications

- Reuses existing Studio infrastructure (HubStagger, HubPanel, 12-column grid)
- No new data fetching needed for Tier 0 — all functions already exist
- Client components needed only for keyboard interaction and selection state
- Server actions needed for verdict mutations (approve/reject/iterate)
