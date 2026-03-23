# Studio Research Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat research file listing with an operational dashboard featuring three view modes, research state visibility, heartbeat indicators, and a priorities panel.

**Architecture:** Server component page loads all data (research files, state, priorities, heartbeat status) and passes serialized props to a client `ResearchDashboard` component. The dashboard uses shadcn `Tabs` with URL-persisted view state (`?view=stream|timeline|table`) and composes dedicated view components plus operational panels. Data refreshes via 5-minute `setInterval` + tab-focus `RefreshOnFocus`.

**Tech Stack:** Next.js 16 (App Router, server components), shadcn/ui (Tabs, Card, Badge, Collapsible), Tailwind v4, `gray-matter`, native `Intl.DateTimeFormat`, existing `markdown.ts` utilities from `@sherpa/studio-core`.

---

## Task 0: Fix scanResearchFiles to Exclude Operational Files

> **Stress-test finding:** `scanResearchFiles()` includes ALL root-level `.md` files including `RESEARCH_STATE.md` and `PRIORITIES.md`. These operational files would appear as malformed research entries with broken dates. This is a load-bearing bug — must be fixed first.

**Files:**
- Modify: `packages/studio-core/src/research-files.ts:44-50` (scanResearchFiles root-level filter)
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Step 1: Write the failing test**

Add to `packages/studio-core/src/__tests__/research-files.test.ts`:

```typescript
it("excludes operational files (ALL_CAPS names) at root level", () => {
  const researchDir = path.join(tmpDir, ".sherpa", "research")
  fs.mkdirSync(researchDir, { recursive: true })
  fs.writeFileSync(
    path.join(researchDir, "RESEARCH_STATE.md"),
    "## Last Updated\n\n2026-03-21T14:30:00-07:00\n",
  )
  fs.writeFileSync(
    path.join(researchDir, "PRIORITIES.md"),
    "## Current Priorities\n\n1. Ship Studio\n",
  )
  fs.writeFileSync(
    path.join(researchDir, "2026-03-21.md"),
    "---\ntitle: Real Research\ndate: 2026-03-21\n---\nContent.",
  )
  const files = scanResearchFiles(tmpDir)
  expect(files).toHaveLength(1)
  expect(files[0]!.title).toBe("Real Research")
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: FAIL — returns 3 files instead of 1.

**Step 3: Write minimal implementation**

In `packages/studio-core/src/research-files.ts`, update the root-level file check at line 46:

```typescript
if (!entry.isDirectory()) {
  // Skip operational files (ALL_CAPS names like RESEARCH_STATE.md, PRIORITIES.md)
  if (entry.name.endsWith(".md") && !/^[A-Z_]+\.md$/.test(entry.name)) {
    const file = parseResearchFile(path.join(researchDir, entry.name), entry.name, "")
    if (file) files.push(file)
  }
  continue
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: All tests PASS (including existing tests — this is a filter addition, not a behavior change for valid files).

**Step 5: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts
git commit -m "fix(studio-core): exclude operational files from scanResearchFiles"
```

---

## Task 1: Extend ResearchFile Type with Summary and Trigger

**Files:**
- Modify: `packages/studio-core/src/research-files.ts:5-11` (ResearchFile interface)
- Modify: `packages/studio-core/src/research-files.ts:19-35` (parseResearchFile function)
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Step 1: Write the failing test**

Add to `packages/studio-core/src/__tests__/research-files.test.ts`:

```typescript
it("extracts summary and trigger from frontmatter", () => {
  const catDir = path.join(tmpDir, ".sherpa", "research", "heartbeat")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(
    path.join(catDir, "2026-03-21-1030-test-topic.md"),
    "---\ntitle: Test Topic\ndate: 2026-03-21\ncategory: heartbeat\ntrigger: >\n  priority queue item\nsummary: >\n  Found three key insights about the topic.\n---\n# Test Topic\nContent.",
  )
  const files = scanResearchFiles(tmpDir)
  expect(files).toHaveLength(1)
  expect(files[0]).toMatchObject({
    summary: "Found three key insights about the topic.",
    trigger: "priority queue item",
  })
})

it("returns undefined summary and trigger when not in frontmatter", () => {
  const researchDir = path.join(tmpDir, ".sherpa", "research")
  fs.mkdirSync(researchDir, { recursive: true })
  fs.writeFileSync(
    path.join(researchDir, "plain.md"),
    "---\ntitle: Plain\ndate: 2026-03-21\n---\nContent.",
  )
  const files = scanResearchFiles(tmpDir)
  expect(files[0]!.summary).toBeUndefined()
  expect(files[0]!.trigger).toBeUndefined()
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: FAIL — `summary` and `trigger` properties not on ResearchFile.

**Step 3: Write minimal implementation**

In `packages/studio-core/src/research-files.ts`, update the interface:

```typescript
export interface ResearchFile {
  title: string
  date: string
  category: string
  slug: string
  relativePath: string
  summary?: string
  trigger?: string
}
```

In `parseResearchFile`, after the existing `date` and `slug` assignments, add:

```typescript
const summary = typeof data.summary === "string" ? data.summary.trim() : undefined
const trigger = typeof data.trigger === "string" ? data.trigger.trim() : undefined
return { title, date, category, slug, relativePath, summary, trigger }
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts
git commit -m "feat(studio-core): add summary and trigger fields to ResearchFile"
```

---

## Task 2: Add parseResearchState Function

**Files:**
- Modify: `packages/studio-core/src/research-files.ts` (add types + function)
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Context:** `RESEARCH_STATE.md` lives at `{projectRoot}/.sherpa/research/RESEARCH_STATE.md`. It has sections: `## Last Updated`, `## Coverage Map` (markdown table), `## Dangling Threads` (numbered list with severity markers), `## Research Queue` (numbered list, some items struck through with `~~` and marked `✅`), `## Notes for Future Me`.

**Step 1: Write the failing tests**

```typescript
import { scanResearchFiles, parseResearchState } from "../research-files"

describe("parseResearchState", () => {
  it("returns null when RESEARCH_STATE.md does not exist", () => {
    expect(parseResearchState(tmpDir)).toBeNull()
  })

  it("parses last updated timestamp", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Coverage Map\n\n| Stream | Last Run | Findings |\n|---|---|---|\n| job-market | 2026-03-21 | Strong demand |\n\n## Dangling Threads\n\n1. CRITICAL: API rate limits hitting ceiling\n2. Monitor competitor pricing changes\n\n## Research Queue\n\n1. ~~Deep dive on Stripe~~ ✅\n2. Analyze consulting market trends\n3. ~~Review network contacts~~ ✅\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state).not.toBeNull()
    expect(state!.lastUpdated).toBe("2026-03-21T14:30:00-07:00")
  })

  it("parses coverage map table", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Coverage Map\n\n| Stream | Last Run | Findings |\n|---|---|---|\n| job-market | 2026-03-21 | Strong demand |\n| competitive | 2026-03-20 | New entrants |\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state!.coverageMap).toHaveLength(2)
    expect(state!.coverageMap[0]).toEqual({
      stream: "job-market",
      lastRun: "2026-03-21",
      findings: "Strong demand",
    })
  })

  it("parses dangling threads with severity", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Dangling Threads\n\n1. CRITICAL: API rate limits hitting ceiling\n2. Monitor competitor pricing changes\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state!.danglingThreads).toHaveLength(2)
    expect(state!.danglingThreads[0]).toEqual({
      text: "CRITICAL: API rate limits hitting ceiling",
      severity: "CRITICAL",
    })
    expect(state!.danglingThreads[1]).toEqual({
      text: "Monitor competitor pricing changes",
      severity: null,
    })
  })

  it("parses research queue with completion status", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "RESEARCH_STATE.md"),
      "## Last Updated\n\n2026-03-21T14:30:00-07:00\n\n## Research Queue\n\n1. ~~Deep dive on Stripe~~ ✅\n2. Analyze consulting market trends\n",
    )
    const state = parseResearchState(tmpDir)
    expect(state!.researchQueue).toHaveLength(2)
    expect(state!.researchQueue[0]).toEqual({
      text: "Deep dive on Stripe",
      completed: true,
    })
    expect(state!.researchQueue[1]).toEqual({
      text: "Analyze consulting market trends",
      completed: false,
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: FAIL — `parseResearchState` not exported.

**Step 3: Write minimal implementation**

Add types and function to `packages/studio-core/src/research-files.ts`:

```typescript
import { extractSection, parseMarkdownTable, extractNumberedItems } from "./markdown"

export interface CoverageEntry {
  stream: string
  lastRun: string
  findings: string
}

export interface DanglingThread {
  text: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null
}

export interface QueueItem {
  text: string
  completed: boolean
}

export interface ResearchState {
  lastUpdated: string | null
  coverageMap: CoverageEntry[]
  danglingThreads: DanglingThread[]
  researchQueue: QueueItem[]
}

export function parseResearchState(projectRoot: string): ResearchState | null {
  const filePath = path.join(projectRoot, ".sherpa", "research", "RESEARCH_STATE.md")
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, "utf-8")

    const lastUpdatedSection = extractSection(raw, "Last Updated")
    const lastUpdated = lastUpdatedSection?.trim() ?? null

    const coverageSection = extractSection(raw, "Coverage Map")
    const coverageRows = coverageSection ? parseMarkdownTable(coverageSection) : []
    const coverageMap: CoverageEntry[] = coverageRows.map(
      ([stream = "", lastRun = "", findings = ""]) => ({ stream, lastRun, findings })
    )

    const threadsSection = extractSection(raw, "Dangling Threads")
    const threadItems = threadsSection ? extractNumberedItems(threadsSection) : []
    const danglingThreads: DanglingThread[] = threadItems.map((text) => ({
      text,
      severity: /CRITICAL/i.test(text) ? "CRITICAL"
        : /HIGH/i.test(text) ? "HIGH"
        : /MEDIUM/i.test(text) ? "MEDIUM"
        : /LOW/i.test(text) ? "LOW"
        : null,
    }))

    const queueSection = extractSection(raw, "Research Queue")
    const queueItems = queueSection ? extractNumberedItems(queueSection) : []
    const researchQueue: QueueItem[] = queueItems.map((text) => ({
      text: text.replace(/~~(.+?)~~/g, "$1").replace(/✅/g, "").trim(),
      completed: /✅/.test(text) || /~~.+~~/.test(text),
    }))

    return { lastUpdated, coverageMap, danglingThreads, researchQueue }
  } catch {
    console.warn(`[sherpa] Failed to parse RESEARCH_STATE.md: ${filePath}`)
    return null
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts
git commit -m "feat(studio-core): add parseResearchState for RESEARCH_STATE.md"
```

---

## Task 3: Add parseResearchPriorities Function

**Files:**
- Modify: `packages/studio-core/src/research-files.ts` (add types + function)
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Context:** `PRIORITIES.md` lives at `{projectRoot}/.sherpa/research/PRIORITIES.md`. Sections: `## The Narrative`, `## Current Priorities` (ordered list), `## What Research Should Focus On` (ordered list).

**Step 1: Write the failing tests**

```typescript
import { scanResearchFiles, parseResearchState, parseResearchPriorities } from "../research-files"

describe("parseResearchPriorities", () => {
  it("returns null when PRIORITIES.md does not exist", () => {
    expect(parseResearchPriorities(tmpDir)).toBeNull()
  })

  it("parses narrative, priorities, and focus areas", () => {
    const researchDir = path.join(tmpDir, ".sherpa", "research")
    fs.mkdirSync(researchDir, { recursive: true })
    fs.writeFileSync(
      path.join(researchDir, "PRIORITIES.md"),
      "## The Narrative\n\nBuilding the platform while landing first clients.\n\n## Current Priorities\n\n1. Ship Studio v1\n2. Close first consulting engagement\n3. Build content pipeline\n\n## What Research Should Focus On\n\n1. Competitor pricing models\n2. Job market for AI roles\n",
    )
    const priorities = parseResearchPriorities(tmpDir)
    expect(priorities).not.toBeNull()
    expect(priorities!.narrative).toBe("Building the platform while landing first clients.")
    expect(priorities!.priorities).toEqual([
      "Ship Studio v1",
      "Close first consulting engagement",
      "Build content pipeline",
    ])
    expect(priorities!.focusAreas).toEqual([
      "Competitor pricing models",
      "Job market for AI roles",
    ])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: FAIL — `parseResearchPriorities` not exported.

**Step 3: Write minimal implementation**

```typescript
export interface ResearchPriorities {
  narrative: string | null
  priorities: string[]
  focusAreas: string[]
}

export function parseResearchPriorities(projectRoot: string): ResearchPriorities | null {
  const filePath = path.join(projectRoot, ".sherpa", "research", "PRIORITIES.md")
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, "utf-8")

    const narrative = extractSection(raw, "The Narrative")?.trim() ?? null

    const prioritiesSection = extractSection(raw, "Current Priorities")
    const priorities = prioritiesSection ? extractNumberedItems(prioritiesSection) : []

    const focusSection = extractSection(raw, "What Research Should Focus On")
    const focusAreas = focusSection ? extractNumberedItems(focusSection) : []

    return { narrative, priorities, focusAreas }
  } catch {
    console.warn(`[sherpa] Failed to parse PRIORITIES.md: ${filePath}`)
    return null
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts
git commit -m "feat(studio-core): add parseResearchPriorities for PRIORITIES.md"
```

---

## Task 4: Add getHeartbeatStatus Function

**Files:**
- Modify: `packages/studio-core/src/research-files.ts` (add types + function)
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Context:** Heartbeat files live at `.sherpa/research/heartbeat/YYYY-MM-DD-HHmm-{slug}.md`. Status depends on `RESEARCH_STATE.md`'s `## Last Updated` timestamp, current Pacific Time, and active hours (8am–11pm PT exclusive). This function is **pure** — it takes a `now` parameter for testability. The page component provides the real `Date.now()`.

**Step 1: Write the failing tests**

```typescript
import {
  scanResearchFiles,
  parseResearchState,
  parseResearchPriorities,
  getHeartbeatStatus,
} from "../research-files"

describe("getHeartbeatStatus", () => {
  it("returns active when last updated within 35 minutes", () => {
    const now = new Date("2026-03-21T15:00:00-07:00")
    const lastUpdated = "2026-03-21T14:30:00-07:00"
    const status = getHeartbeatStatus(lastUpdated, 0, now)
    expect(status.status).toBe("active")
  })

  it("returns pending with next-heartbeat time during active hours", () => {
    const now = new Date("2026-03-21T15:00:00-07:00") // 3 PM PT
    const lastUpdated = "2026-03-21T14:00:00-07:00" // 60 min ago
    const status = getHeartbeatStatus(lastUpdated, 0, now)
    expect(status.status).toBe("pending")
    expect(status.minutesUntilNext).toBeGreaterThan(0)
    expect(status.minutesUntilNext).toBeLessThanOrEqual(30)
  })

  it("returns offline outside active hours", () => {
    const now = new Date("2026-03-21T23:30:00-07:00") // 11:30 PM PT
    const lastUpdated = "2026-03-21T22:00:00-07:00"
    const status = getHeartbeatStatus(lastUpdated, 0, now)
    expect(status.status).toBe("offline")
  })

  it("returns offline at exactly 23:00 PT (exclusive cutoff)", () => {
    const now = new Date("2026-03-21T23:00:00-07:00") // exactly 11 PM PT
    const lastUpdated = "2026-03-21T22:55:00-07:00"
    const status = getHeartbeatStatus(lastUpdated, 0, now)
    expect(status.status).toBe("offline")
  })

  it("includes today's heartbeat count", () => {
    const now = new Date("2026-03-21T15:00:00-07:00")
    const lastUpdated = "2026-03-21T14:30:00-07:00"
    const status = getHeartbeatStatus(lastUpdated, 4, now)
    expect(status.heartbeatCountToday).toBe(4)
  })

  it("returns offline with null lastUpdated", () => {
    const now = new Date("2026-03-21T15:00:00-07:00")
    const status = getHeartbeatStatus(null, 0, now)
    expect(status.status).toBe("pending") // during active hours, no data = pending
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: FAIL — `getHeartbeatStatus` not exported.

**Step 3: Write minimal implementation**

```typescript
export type HeartbeatState = "active" | "pending" | "offline"

export interface HeartbeatStatus {
  status: HeartbeatState
  minutesUntilNext: number | null
  heartbeatCountToday: number
  lastUpdated: string | null
  message: string
}

function getPacificTime(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10)
  return { hour: get("hour") % 24, minute: get("minute") }
}

export function getHeartbeatStatus(
  lastUpdated: string | null,
  heartbeatCountToday: number,
  now: Date = new Date(),
): HeartbeatStatus {
  const { hour, minute } = getPacificTime(now)
  const isActiveHours = hour >= 8 && hour < 23

  if (!isActiveHours) {
    return {
      status: "offline",
      minutesUntilNext: null,
      heartbeatCountToday,
      lastUpdated,
      message: "Heartbeats resume at 8:00 AM PT",
    }
  }

  if (lastUpdated) {
    const elapsed = now.getTime() - new Date(lastUpdated).getTime()
    if (elapsed < 35 * 60 * 1000) {
      return {
        status: "active",
        minutesUntilNext: null,
        heartbeatCountToday,
        lastUpdated,
        message: "Research active",
      }
    }
  }

  const minutesUntilNext = 30 - (minute % 30)
  return {
    status: "pending",
    minutesUntilNext,
    heartbeatCountToday,
    lastUpdated,
    message: `Next heartbeat in ~${minutesUntilNext}m`,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts
git commit -m "feat(studio-core): add getHeartbeatStatus with timezone-aware Pacific Time logic"
```

---

## Task 5: Add countTodayHeartbeats Helper

**Files:**
- Modify: `packages/studio-core/src/research-files.ts` (add function)
- Test: `packages/studio-core/src/__tests__/research-files.test.ts`

**Context:** The page component needs to count heartbeat files for today's date to pass into `getHeartbeatStatus`. This reads the `heartbeat/` directory and counts files matching `YYYY-MM-DD-*`.

**Step 1: Write the failing test**

```typescript
import {
  scanResearchFiles,
  parseResearchState,
  parseResearchPriorities,
  getHeartbeatStatus,
  countTodayHeartbeats,
} from "../research-files"

describe("countTodayHeartbeats", () => {
  it("returns 0 when heartbeat directory does not exist", () => {
    expect(countTodayHeartbeats(tmpDir, "2026-03-21")).toBe(0)
  })

  it("counts files matching today's date prefix", () => {
    const hbDir = path.join(tmpDir, ".sherpa", "research", "heartbeat")
    fs.mkdirSync(hbDir, { recursive: true })
    fs.writeFileSync(path.join(hbDir, "2026-03-21-1030-topic-a.md"), "---\ntitle: A\n---\n")
    fs.writeFileSync(path.join(hbDir, "2026-03-21-1400-topic-b.md"), "---\ntitle: B\n---\n")
    fs.writeFileSync(path.join(hbDir, "2026-03-20-0900-old.md"), "---\ntitle: Old\n---\n")
    expect(countTodayHeartbeats(tmpDir, "2026-03-21")).toBe(2)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: FAIL — `countTodayHeartbeats` not exported.

**Step 3: Write minimal implementation**

```typescript
export function countTodayHeartbeats(projectRoot: string, todayDate: string): number {
  const hbDir = path.join(projectRoot, ".sherpa", "research", "heartbeat")
  if (!fs.existsSync(hbDir)) return 0

  try {
    const entries = fs.readdirSync(hbDir)
    return entries.filter((name) => name.startsWith(todayDate) && name.endsWith(".md")).length
  } catch {
    return 0
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/research-files.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/research-files.ts packages/studio-core/src/__tests__/research-files.test.ts
git commit -m "feat(studio-core): add countTodayHeartbeats helper"
```

---

## Task 6: Add AutoRefreshInterval Client Component

**Files:**
- Create: `apps/studio/src/components/auto-refresh-interval.tsx`

**Context:** Zero-render client component that calls `router.refresh()` on a 5-minute interval. Complements the existing `RefreshOnFocus` component. Follows the same pattern — null render, side-effect only.

**Step 1: Write the component**

Create `apps/studio/src/components/auto-refresh-interval.tsx`:

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Periodically re-runs server components on a fixed interval. */
export function AutoRefreshInterval({ intervalMs = 300_000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to auto-refresh-interval.

**Step 3: Commit**

```bash
git add apps/studio/src/components/auto-refresh-interval.tsx
git commit -m "feat(studio): add AutoRefreshInterval component for periodic server refresh"
```

---

## Task 7: Build ResearchHeartbeatIndicator Component

**Files:**
- Create: `apps/studio/src/components/studio/research-heartbeat-indicator.tsx`

**Context:** Displays heartbeat status with a pulsing dot (active), static amber dot (pending), or muted dot (offline). Uses Tailwind's `animate-ping` for the active state. Pure client component — receives `HeartbeatStatus` data as props.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-heartbeat-indicator.tsx`:

```tsx
"use client"

import type { HeartbeatStatus } from "@sherpa/studio-core"
import { cn } from "@/lib/utils"

interface ResearchHeartbeatIndicatorProps {
  status: HeartbeatStatus
}

const stateConfig = {
  active: { color: "bg-emerald-500", pingColor: "bg-emerald-400", ping: true },
  pending: { color: "bg-amber-400", pingColor: "", ping: false },
  offline: { color: "bg-zinc-400", pingColor: "", ping: false },
} as const

export function ResearchHeartbeatIndicator({ status }: ResearchHeartbeatIndicatorProps) {
  const config = stateConfig[status.status]

  return (
    <div
      className="flex items-center gap-3 rounded-md bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground"
      role="status"
      aria-label={`Research ${status.status}: ${status.message}`}
    >
      <span className="relative flex size-2.5">
        {config.ping ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
              config.pingColor,
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex size-2.5 rounded-full", config.color)} />
      </span>

      <span>{status.message}</span>

      {status.heartbeatCountToday > 0 ? (
        <>
          <span className="text-muted-foreground/30">·</span>
          <span>
            <span className="text-foreground/60">{status.heartbeatCountToday}</span>{" "}
            {status.heartbeatCountToday === 1 ? "cycle" : "cycles"} today
          </span>
        </>
      ) : null}

      <span className="text-muted-foreground/30">·</span>
      <span>Every 30m · 8am–11pm PT</span>
    </div>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-heartbeat-indicator.tsx
git commit -m "feat(studio): add ResearchHeartbeatIndicator with pulsing status dot"
```

---

## Task 8: Build ResearchPrioritiesPanel Component

**Files:**
- Create: `apps/studio/src/components/studio/research-priorities-panel.tsx`

**Context:** Compact panel showing the narrative throughline and ordered priorities from PRIORITIES.md. Uses Card composition pattern from shadcn/ui.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-priorities-panel.tsx`:

```tsx
"use client"

import type { ResearchPriorities } from "@sherpa/studio-core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResearchPrioritiesPanelProps {
  priorities: ResearchPriorities
}

export function ResearchPrioritiesPanel({ priorities }: ResearchPrioritiesPanelProps) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0">
        <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {priorities.narrative ? (
          <p className="text-sm text-muted-foreground italic">
            {priorities.narrative}
          </p>
        ) : null}

        {priorities.priorities.length > 0 ? (
          <ol className="flex flex-col gap-1.5 list-decimal list-inside">
            {priorities.priorities.map((item, i) => (
              <li key={i} className="text-sm text-foreground">
                {item}
              </li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-priorities-panel.tsx
git commit -m "feat(studio): add ResearchPrioritiesPanel component"
```

---

## Task 9: Build ResearchStatePanel Component

**Files:**
- Create: `apps/studio/src/components/studio/research-state-panel.tsx`

**Context:** Renders dangling threads (with severity coloring), research queue (with completion styling), and coverage map from RESEARCH_STATE.md. Uses Card, Badge.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-state-panel.tsx`:

```tsx
"use client"

import type { ResearchState } from "@sherpa/studio-core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ResearchStatePanelProps {
  state: ResearchState
}

export function ResearchStatePanel({ state }: ResearchStatePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Dangling Threads */}
      {state.danglingThreads.length > 0 ? (
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Dangling Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {state.danglingThreads.map((thread, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {thread.severity ? (
                    <Badge
                      variant={thread.severity === "CRITICAL" ? "destructive" : "secondary"}
                      className="mt-0.5 shrink-0"
                    >
                      {thread.severity}
                    </Badge>
                  ) : null}
                  <span className="text-foreground">{thread.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Research Queue */}
      {state.researchQueue.length > 0 ? (
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Research Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1.5">
              {state.researchQueue.map((item, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    item.completed ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  <span className={cn("shrink-0", item.completed ? "text-emerald-500" : "text-muted-foreground/40")}>
                    {item.completed ? "✓" : "○"}
                  </span>
                  <span className={cn(item.completed && "line-through")}>{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Coverage Map */}
      {state.coverageMap.length > 0 ? (
        <Card className="py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Coverage Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground/60">
                    <th className="pb-2 text-left font-normal">Stream</th>
                    <th className="pb-2 text-left font-normal">Last Run</th>
                    <th className="pb-2 text-left font-normal">Findings</th>
                  </tr>
                </thead>
                <tbody>
                  {state.coverageMap.map((entry) => (
                    <tr key={entry.stream} className="border-b border-border/10">
                      <td className="py-2 font-mono text-xs">{entry.stream}</td>
                      <td className="py-2 font-mono text-xs text-muted-foreground">{entry.lastRun}</td>
                      <td className="py-2 text-muted-foreground">{entry.findings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Last Updated */}
      {state.lastUpdated ? (
        <p className="font-mono text-xs text-muted-foreground/60">
          State updated: {state.lastUpdated}
        </p>
      ) : null}
    </div>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-state-panel.tsx
git commit -m "feat(studio): add ResearchStatePanel with threads, queue, and coverage map"
```

---

## Task 10: Build ResearchStreamView Component

**Files:**
- Create: `apps/studio/src/components/studio/research-stream-view.tsx`

**Context:** Default view. Renders research files grouped by category as collapsible card sections. Each section shows stream name, file count, most recent date, latest summary. Expands to show file links.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-stream-view.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ResearchFile } from "@sherpa/studio-core"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface ResearchStreamViewProps {
  grouped: Record<string, ResearchFile[]>
  projectSlug: string
}

function formatStreamName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "General"
}

export function ResearchStreamView({ grouped, projectSlug }: ResearchStreamViewProps) {
  const entries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([category, files]) => {
        const latest = files[0]
        return (
          <Collapsible key={category} defaultOpen={files.length <= 5}>
            <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg border border-border/50 bg-card/30 px-4 py-3 text-left transition-colors hover:bg-card/50">
              <ChevronRight className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-medium text-foreground">
                    {formatStreamName(category)}
                  </span>
                  <Badge variant="secondary">{files.length}</Badge>
                </div>
                {latest?.summary ? (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {latest.summary}
                  </p>
                ) : null}
              </div>
              {latest ? (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {latest.date}
                </span>
              ) : null}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-7 flex flex-col gap-0.5 border-l border-border/30 pl-4 pt-1">
                {files.map((file) => (
                  <Link
                    key={file.slug}
                    href={`/projects/${projectSlug}/research/${file.slug}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-card/50"
                  >
                    <span className="text-foreground">{file.title}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {file.date}
                    </span>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-stream-view.tsx
git commit -m "feat(studio): add ResearchStreamView with collapsible category cards"
```

---

## Task 11: Build ResearchTimelineView Component

**Files:**
- Create: `apps/studio/src/components/studio/research-timeline-view.tsx`

**Context:** Reverse-chronological feed of all research files interleaved across streams. Each entry shows date, category badge, title, and summary.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-timeline-view.tsx`:

```tsx
"use client"

import Link from "next/link"
import type { ResearchFile } from "@sherpa/studio-core"
import { Badge } from "@/components/ui/badge"

interface ResearchTimelineViewProps {
  files: ResearchFile[]
  projectSlug: string
}

export function ResearchTimelineView({ files, projectSlug }: ResearchTimelineViewProps) {
  return (
    <div className="flex flex-col gap-1">
      {files.map((file) => (
        <Link
          key={file.slug}
          href={`/projects/${projectSlug}/research/${file.slug}`}
          className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-card/50"
        >
          <span className="shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
            {file.date}
          </span>
          {file.category ? (
            <Badge variant="outline" className="shrink-0 mt-px">
              {file.category}
            </Badge>
          ) : null}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{file.title}</span>
            {file.summary ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {file.summary}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-timeline-view.tsx
git commit -m "feat(studio): add ResearchTimelineView chronological feed"
```

---

## Task 12: Build ResearchTableView Component

**Files:**
- Create: `apps/studio/src/components/studio/research-table-view.tsx`

**Context:** Dense sortable table with columns: Date, Category, Title, Summary (truncated). Client-side sorting via useState. No TanStack Table dependency — this is a simple 4-column table.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-table-view.tsx`:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import type { ResearchFile } from "@sherpa/studio-core"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SortKey = "date" | "category" | "title"
type SortDir = "asc" | "desc"

interface ResearchTableViewProps {
  files: ResearchFile[]
  projectSlug: string
}

export function ResearchTableView({ files, projectSlug }: ResearchTableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const sorted = [...files].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1
    const aVal = a[sortKey] ?? ""
    const bVal = b[sortKey] ?? ""
    return aVal.localeCompare(bVal) * dir
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "date" ? "desc" : "asc")
    }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground/60">
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("date")}
            >
              Date{arrow("date")}
            </th>
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("category")}
            >
              Category{arrow("category")}
            </th>
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("title")}
            >
              Title{arrow("title")}
            </th>
            <th className="pb-2 text-left font-normal">Summary</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((file) => (
            <tr key={file.slug} className="border-b border-border/10">
              <td className="py-2 font-mono text-xs">{file.date}</td>
              <td className="py-2">
                {file.category ? (
                  <Badge variant="outline">{file.category}</Badge>
                ) : null}
              </td>
              <td className="py-2">
                <Link
                  href={`/projects/${projectSlug}/research/${file.slug}`}
                  className="text-foreground hover:underline"
                >
                  {file.title}
                </Link>
              </td>
              <td className={cn("py-2 text-muted-foreground", "max-w-xs truncate")}>
                {file.summary ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-table-view.tsx
git commit -m "feat(studio): add ResearchTableView with client-side sorting"
```

---

## Task 13: Build ResearchDashboard Client Component

**Files:**
- Create: `apps/studio/src/components/studio/research-dashboard.tsx`

**Context:** Top-level client component that composes all panels and views. Uses shadcn Tabs with URL-persisted view state via `useRouter` and `useSearchParams`. Receives all data as serialized props from the server component.

**Important:** Wrap `useSearchParams` usage in a `Suspense` boundary in the parent page, not here — this component expects to be rendered inside one.

**Step 1: Write the component**

Create `apps/studio/src/components/studio/research-dashboard.tsx`:

```tsx
"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type {
  ResearchFile,
  ResearchState,
  ResearchPriorities,
  HeartbeatStatus,
} from "@sherpa/studio-core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResearchHeartbeatIndicator } from "./research-heartbeat-indicator"
import { ResearchPrioritiesPanel } from "./research-priorities-panel"
import { ResearchStatePanel } from "./research-state-panel"
import { ResearchStreamView } from "./research-stream-view"
import { ResearchTimelineView } from "./research-timeline-view"
import { ResearchTableView } from "./research-table-view"

type ViewMode = "stream" | "timeline" | "table"
const VALID_VIEWS: ViewMode[] = ["stream", "timeline", "table"]

interface ResearchDashboardProps {
  files: ResearchFile[]
  grouped: Record<string, ResearchFile[]>
  state: ResearchState | null
  priorities: ResearchPriorities | null
  heartbeat: HeartbeatStatus
  projectSlug: string
}

export function ResearchDashboard({
  files,
  grouped,
  state,
  priorities,
  heartbeat,
  projectSlug,
}: ResearchDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawView = searchParams.get("view")
  const view: ViewMode = VALID_VIEWS.includes(rawView as ViewMode)
    ? (rawView as ViewMode)
    : "stream"

  const setView = useCallback(
    (v: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("view", v)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Heartbeat indicator */}
      <ResearchHeartbeatIndicator status={heartbeat} />

      {/* Operational panels — priorities + state side by side on larger screens */}
      {(priorities || state) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {priorities ? <ResearchPrioritiesPanel priorities={priorities} /> : null}
          {state ? <ResearchStatePanel state={state} /> : null}
        </div>
      ) : null}

      {/* View modes */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="stream">Streams</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <ResearchStreamView grouped={grouped} projectSlug={projectSlug} />
        </TabsContent>

        <TabsContent value="timeline">
          <ResearchTimelineView files={files} projectSlug={projectSlug} />
        </TabsContent>

        <TabsContent value="table">
          <ResearchTableView files={files} projectSlug={projectSlug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 2: Verify no build errors**

Run: `cd apps/studio && pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-dashboard.tsx
git commit -m "feat(studio): add ResearchDashboard with tabbed views and operational panels"
```

---

## Task 14: Rewrite the Research Page Server Component

**Files:**
- Modify: `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx` (full rewrite)

**Context:** This is the final wiring task. The server component loads all data, computes heartbeat status (calling `await connection()` before `Date.now()`), groups files, and renders the `ResearchDashboard` inside a `Suspense` boundary. Retains `RefreshOnFocus` and adds `AutoRefreshInterval`.

**Step 1: Rewrite the page**

Replace `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`:

```tsx
import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import {
  getProject,
  scanResearchFiles,
  parseResearchState,
  parseResearchPriorities,
  getHeartbeatStatus,
  countTodayHeartbeats,
} from "@/lib/studio"
import type { ResearchFile } from "@/lib/studio"
import { RefreshOnFocus } from "@/components/refresh-on-focus"
import { AutoRefreshInterval } from "@/components/auto-refresh-interval"
import { ResearchDashboard } from "@/components/studio/research-dashboard"

export const metadata: Metadata = {
  title: "Research | Studio",
  robots: "noindex, nofollow",
}

export default async function ProjectResearchPage({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const { project: slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  // Opt into dynamic rendering before accessing Date.now()
  await connection()
  const now = new Date()
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(now) // YYYY-MM-DD in Pacific

  // Load all data in parallel
  const files = scanResearchFiles(project.root)
  const state = parseResearchState(project.root)
  const priorities = parseResearchPriorities(project.root)
  const heartbeatCount = countTodayHeartbeats(project.root, todayDate)
  const heartbeat = getHeartbeatStatus(
    state?.lastUpdated ?? null,
    heartbeatCount,
    now,
  )

  // Group by category for stream view (server-side)
  const grouped: Record<string, ResearchFile[]> = {}
  for (const file of files) {
    const key = file.category || "general"
    ;(grouped[key] ??= []).push(file)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <RefreshOnFocus />
      <AutoRefreshInterval intervalMs={300_000} />

      <h1 className="font-display text-2xl text-foreground mb-6">Research</h1>

      {files.length === 0 && !state && !priorities ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            No research files found in .sherpa/research/
          </p>
        </div>
      ) : (
        <Suspense fallback={null}>
          <ResearchDashboard
            files={files}
            grouped={grouped}
            state={state}
            priorities={priorities}
            heartbeat={heartbeat}
            projectSlug={slug}
          />
        </Suspense>
      )}
    </div>
  )
}
```

**Step 2: Verify build succeeds**

Run: `pnpm build 2>&1 | tail -30`
Expected: Build completes without errors. The research page renders with `force-dynamic` behavior due to `await connection()`.

**Step 3: Verify typecheck passes**

Run: `pnpm check 2>&1 | tail -20`
Expected: No type errors.

**Step 4: Commit**

```bash
git add apps/studio/src/app/(studio)/projects/[project]/research/page.tsx
git commit -m "feat(studio): rewrite research page as operational dashboard with views, state, and heartbeat"
```

---

## Task 15: Verify with Dev Server

**Step 1: Start dev server**

Run: `pnpm dev`

**Step 2: Navigate to research page**

Open `http://localhost:3000/projects/sherpa/research` in browser. Verify:
- Heartbeat indicator renders at top (will show offline/pending since no local `.sherpa/research/` data)
- Tabs render (Streams, Timeline, Table)
- Empty state shows when no research files exist
- URL updates when switching tabs (`?view=timeline`, `?view=table`)
- No console errors

**Step 3: Test with sample data (if available)**

If `.sherpa/research/` exists locally with test data, verify:
- Stream view groups files by category with collapsible sections
- Timeline view shows reverse-chronological feed
- Table view renders sortable columns
- State panel shows dangling threads and queue
- Priorities panel shows narrative and ordered list
- Heartbeat indicator reflects state file timestamp

**Step 4: Commit any fixes**

If any issues found, fix and commit with descriptive message.

---

## Summary: File Manifest

| File | Action | Task |
|------|--------|------|
| `packages/studio-core/src/research-files.ts` | Modify | 0, 1, 2, 3, 4, 5 |
| `packages/studio-core/src/__tests__/research-files.test.ts` | Modify | 0, 1, 2, 3, 4, 5 |
| `apps/studio/src/components/auto-refresh-interval.tsx` | Create | 6 |
| `apps/studio/src/components/studio/research-heartbeat-indicator.tsx` | Create | 7 |
| `apps/studio/src/components/studio/research-priorities-panel.tsx` | Create | 8 |
| `apps/studio/src/components/studio/research-state-panel.tsx` | Create | 9 |
| `apps/studio/src/components/studio/research-stream-view.tsx` | Create | 10 |
| `apps/studio/src/components/studio/research-timeline-view.tsx` | Create | 11 |
| `apps/studio/src/components/studio/research-table-view.tsx` | Create | 12 |
| `apps/studio/src/components/studio/research-dashboard.tsx` | Create | 13 |
| `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx` | Rewrite | 14 |
