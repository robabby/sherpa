# Studio Research Dashboard V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the Sherpa warm spatial glass design language to the research dashboard and add search/filter, inline markdown rendering, and coverage staleness indicators.

**Architecture:** Pure presentation layer pass — zero data model changes. New utility functions (`renderInlineMarkdown`, `getStaleness`) are pure and testable. Filter state managed in the dashboard orchestrator with URL persistence. All visual changes use existing design tokens from `globals.css`.

**Tech Stack:** React 19.2.3, Next.js 16.1.1, Tailwind v4, shadcn/ui (new-york/radix), Vitest, TypeScript

**Design reference:** `docs/initiatives/studio-research-dashboard-v2/prototype.html` — open this in a browser for visual reference throughout implementation.

**Key conventions:**
- `gap-*` not `space-*` for spacing (shadcn rule)
- `size-*` for equal width/height (shadcn rule)
- `cn()` for conditional classes (shadcn rule)
- CSS variables via `bg-[var(--color-gold)]` pattern (proven in 20+ components)
- Ternary for conditional rendering, not `&&` (Vercel best practice)
- `useDeferredValue` for search (React 19 pattern, not setTimeout debounce)
- Full Card composition: CardHeader/CardTitle/CardContent (shadcn rule)

---

## Session 2: Utilities + Core Glass Treatment

### Task 1: Create inline markdown utility

**Files:**
- Create: `apps/studio/src/lib/render-inline-markdown.tsx`
- Create: `apps/studio/src/lib/__tests__/render-inline-markdown.test.tsx`

**Step 1: Write the tests**

```tsx
// apps/studio/src/lib/__tests__/render-inline-markdown.test.tsx
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { renderInlineMarkdown } from "../render-inline-markdown"
import { createElement } from "react"

function render(text: string): string {
  const nodes = renderInlineMarkdown(text)
  return renderToStaticMarkup(createElement("span", null, ...nodes))
}

describe("renderInlineMarkdown", () => {
  it("returns plain text unchanged", () => {
    expect(render("hello world")).toBe("<span>hello world</span>")
  })

  it("renders bold", () => {
    expect(render("hello **bold** world")).toContain("<strong>bold</strong>")
  })

  it("renders italic", () => {
    expect(render("hello *italic* world")).toContain("<em>italic</em>")
  })

  it("renders inline code", () => {
    const result = render("use `useState` hook")
    expect(result).toContain("<code")
    expect(result).toContain("useState")
  })

  it("renders links", () => {
    const result = render("see [docs](https://example.com)")
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain("docs")
  })

  it("handles multiple patterns in one string", () => {
    const result = render("**bold** and *italic* and `code`")
    expect(result).toContain("<strong>bold</strong>")
    expect(result).toContain("<em>italic</em>")
    expect(result).toContain("<code")
  })

  it("handles unclosed bold gracefully", () => {
    const result = render("hello **unclosed")
    expect(result).toBe("<span>hello **unclosed</span>")
  })

  it("returns empty array for empty string", () => {
    expect(renderInlineMarkdown("")).toEqual([])
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sherpa/studio-app exec vitest run src/lib/__tests__/render-inline-markdown.test.tsx`

Expected: FAIL — module not found

> Note: If the studio app doesn't have vitest configured, run from studio-core instead by moving the test, or add vitest as a dev dep. Check `apps/studio/package.json` first. If no test runner in studio app, create the utility in `packages/studio-core/src/render-inline-markdown.tsx` and test alongside existing tests with `pnpm --filter @sherpa/studio-core test`.

**Step 3: Write the implementation**

```tsx
// apps/studio/src/lib/render-inline-markdown.tsx
import type { ReactNode } from "react"

/**
 * Renders inline markdown patterns (bold, italic, code, links) as React elements.
 * Unmatched patterns pass through as plain text. No dangerouslySetInnerHTML.
 */
export function renderInlineMarkdown(text: string): ReactNode[] {
  if (!text) return []

  const pattern = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g
  const result: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold**
      result.push(<strong key={key++} className="font-medium text-foreground">{match[2]}</strong>)
    } else if (match[3]) {
      // *italic*
      result.push(<em key={key++}>{match[4]}</em>)
    } else if (match[5]) {
      // `code`
      result.push(
        <code key={key++} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125em]">
          {match[6]}
        </code>
      )
    } else if (match[7]) {
      // [text](url)
      result.push(
        <a
          key={key++}
          href={match[9]}
          className="text-[var(--color-gold)] no-underline border-b border-[var(--border-gold)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[8]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result
}
```

**Step 4: Run tests to verify they pass**

Run: same command as Step 2
Expected: PASS — all 8 tests green

**Step 5: Commit**

```bash
git add apps/studio/src/lib/render-inline-markdown.tsx apps/studio/src/lib/__tests__/render-inline-markdown.test.tsx
git commit -m "feat(studio): add inline markdown renderer for research summaries"
```

---

### Task 2: Create staleness utility

This utility is used by the state panel to colorize coverage map dates. Pure function, testable.

**Files:**
- Create: `apps/studio/src/lib/staleness.ts`
- Test: alongside render-inline-markdown tests or in same `__tests__/` dir

**Step 1: Write the tests**

```typescript
// apps/studio/src/lib/__tests__/staleness.test.ts
import { describe, it, expect } from "vitest"
import { getStaleness } from "../staleness"

describe("getStaleness", () => {
  const now = "2026-03-21T16:00:00.000Z"

  it("returns fresh for dates within 2 days", () => {
    expect(getStaleness("2026-03-21", now)).toBe("fresh")
    expect(getStaleness("2026-03-20", now)).toBe("fresh")
  })

  it("returns aging for dates 2-7 days old", () => {
    expect(getStaleness("2026-03-18", now)).toBe("aging")
    expect(getStaleness("2026-03-15", now)).toBe("aging")
  })

  it("returns stale for dates older than 7 days", () => {
    expect(getStaleness("2026-03-12", now)).toBe("stale")
    expect(getStaleness("2026-03-01", now)).toBe("stale")
  })

  it("returns fresh for unparseable dates", () => {
    expect(getStaleness("not-a-date", now)).toBe("fresh")
    expect(getStaleness("", now)).toBe("fresh")
  })
})
```

**Step 2: Run tests — expect FAIL**

**Step 3: Write implementation**

```typescript
// apps/studio/src/lib/staleness.ts
export type Staleness = "fresh" | "aging" | "stale"

export function getStaleness(lastRun: string, nowISO: string): Staleness {
  const lastMs = new Date(lastRun).getTime()
  if (Number.isNaN(lastMs)) return "fresh"
  const nowMs = new Date(nowISO).getTime()
  const daysSince = (nowMs - lastMs) / (1000 * 60 * 60 * 24)
  if (daysSince <= 2) return "fresh"
  if (daysSince <= 7) return "aging"
  return "stale"
}

export const stalenessColor: Record<Staleness, string> = {
  fresh: "bg-emerald-500",
  aging: "bg-amber-400",
  stale: "bg-red-500 animate-[led-pulse_2s_ease-in-out_infinite]",
}
```

**Step 4: Run tests — expect PASS**

**Step 5: Commit**

```bash
git add apps/studio/src/lib/staleness.ts apps/studio/src/lib/__tests__/staleness.test.ts
git commit -m "feat(studio): add staleness utility for coverage map indicators"
```

---

### Task 3: Update page.tsx — add nowISO prop

Minimal change. Pass the current time as a serializable ISO string to the dashboard.

**Files:**
- Modify: `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx:45-46,73`

**Step 1: Add nowISO computation**

After line 38 (`}).format(now)`), the `now` variable already exists. Add one line to create the ISO string.

In the `ResearchDashboard` component call (around line 73), add the `nowISO` prop:

```diff
  <ResearchDashboard
    files={files}
    grouped={grouped}
    state={state}
    priorities={priorities}
    heartbeat={heartbeat}
    projectSlug={slug}
+   nowISO={now.toISOString()}
  />
```

**Step 2: Run typecheck**

Run: `pnpm check`

Expected: Type error on `ResearchDashboard` — `nowISO` not in props. This is expected and gets fixed in Task 6 when we update the dashboard orchestrator.

**Step 3: Commit (with note about pending type fix)**

```bash
git add apps/studio/src/app/(studio)/projects/[project]/research/page.tsx
git commit -m "feat(studio): pass nowISO to research dashboard for staleness computation"
```

---

### Task 4: Redesign heartbeat indicator — glass surface + gold LED

**Files:**
- Modify: `apps/studio/src/components/studio/research-heartbeat-indicator.tsx`

**Step 1: Read the current file and the prototype**

Read `research-heartbeat-indicator.tsx` (54 lines). Reference `prototype.html` Zone 1 (heartbeat bar) for the target visual.

**Step 2: Apply glass treatment**

Key changes to the component:

1. **Container**: Replace `bg-muted/30` with glass surface classes:
   ```
   bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] rounded-lg
   ```

2. **Active LED**: Add gold glow ring to the pulsing dot:
   ```tsx
   // Active state config update:
   active: {
     color: "bg-emerald-500",
     pingColor: "bg-emerald-400",
     ping: true,
     ringClass: "pulse-ring"  // gold glow ring from globals.css
   }
   ```

3. **Status text**: Add `led-active` class for subtle opacity pulse on the status message when active.

4. **Cycle count**: Style the number in gold: `text-[var(--color-gold)]`

5. **Separator dots**: Change from `text-muted-foreground/30` to copper: `text-[var(--color-copper)]/30`

**Step 3: Verify in dev server**

Run: `pnpm dev`

Navigate to `localhost:3000/projects/sherpa/research`. The heartbeat bar should show:
- Glass surface with subtle border and shadow
- Pulsing green LED with gold outer glow when active
- Gold-highlighted cycle count
- Copper dot separators

**Step 4: Commit**

```bash
git add apps/studio/src/components/studio/research-heartbeat-indicator.tsx
git commit -m "feat(studio): apply glass treatment to research heartbeat indicator"
```

---

### Task 5: Redesign priorities panel — glass card + accent bar + rail nodes

**Files:**
- Modify: `apps/studio/src/components/studio/research-priorities-panel.tsx`

**Step 1: Read current file (38 lines) and prototype priorities section**

**Step 2: Apply glass treatment and rail-node pattern**

Key changes:

1. **Card**: Replace `<Card className="py-4">` with glass surface:
   ```tsx
   <div className="glass relative pl-5">
   ```
   Where `.glass` is applied via utility classes:
   ```
   bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] rounded-lg
   ```

2. **Gold accent bar**: Add a `::before` pseudo-element or a positioned div:
   ```tsx
   <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm bg-gradient-to-b from-[var(--color-gold)]/50 to-transparent" />
   ```

3. **Title**: Keep the mono uppercase treatment.

4. **Narrative text**: Apply Fraunces italic in gold-muted:
   ```
   font-display italic text-sm text-[var(--color-gold-muted)] leading-relaxed
   ```

5. **Priority list**: Replace `<ol>` with rail-node pattern:
   ```tsx
   <div className="flex flex-col">
     {priorities.priorities.map((item, i) => (
       <div key={i} className={cn("rail-node flex items-start gap-3 py-1.5", i === priorities.priorities.length - 1 && "[&::before]:hidden")}>
         <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 font-mono text-[0.625rem] text-[var(--color-gold)]">
           {i + 1}
         </span>
         <span className="text-[0.8125rem] leading-snug pt-0.5">{item}</span>
       </div>
     ))}
   </div>
   ```

**Step 3: Verify in dev server**

Open operations panel → priorities should show gold accent bar, italic narrative, numbered rail nodes.

**Step 4: Commit**

```bash
git add apps/studio/src/components/studio/research-priorities-panel.tsx
git commit -m "feat(studio): apply glass + rail-node treatment to priorities panel"
```

---

### Task 6: Redesign state panel — glass cards + staleness + completion bar

**Files:**
- Modify: `apps/studio/src/components/studio/research-state-panel.tsx`

**Step 1: Read current file (110 lines) and prototype state section**

**Step 2: Update props to accept nowISO**

```diff
 interface ResearchStatePanelProps {
   state: ResearchState
+  nowISO: string
 }
```

Import the staleness utility:
```tsx
import { getStaleness, stalenessColor } from "@/lib/staleness"
```

**Step 3: Apply glass treatment to all three cards**

For each Card, replace with glass surface + copper accent bar:

```tsx
<div className="relative rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] p-4 pl-5">
  <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent" />
  {/* card content */}
</div>
```

**Step 4: Add staleness indicators to coverage map**

In the coverage map table, add a staleness dot before each `lastRun` date:

```tsx
<td className="py-1.5 font-mono text-xs">
  <span className="flex items-center gap-1.5">
    <span className={cn("size-1.5 rounded-full shrink-0", stalenessColor[getStaleness(entry.lastRun, nowISO)])} />
    <span className="text-muted-foreground">{entry.lastRun}</span>
  </span>
</td>
```

Add a legend below the table:

```tsx
<div className="mt-3 flex items-center gap-3 font-mono text-[0.625rem] text-dim">
  <span className="flex items-center gap-1"><span className="size-1 rounded-full bg-emerald-500" />&lt;2d</span>
  <span className="flex items-center gap-1"><span className="size-1 rounded-full bg-amber-400" />2–7d</span>
  <span className="flex items-center gap-1"><span className="size-1 rounded-full bg-red-500" />&gt;7d</span>
</div>
```

**Step 5: Add completion bar to research queue**

After the queue items list, add a progress indicator:

```tsx
{state.researchQueue.length > 0 ? (
  <>
    {/* existing queue items */}
    <div className="mt-3 h-[3px] rounded-full bg-[var(--glass-border)] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold-muted)] to-[var(--color-gold)]"
        style={{ width: `${(completed / state.researchQueue.length) * 100}%` }}
      />
    </div>
  </>
) : null}
```

Where `completed` is computed:
```tsx
const completed = state.researchQueue.filter(q => q.completed).length
```

**Step 6: Add completion count label**

In the queue card header, show `3/5` style count:
```tsx
<div className="flex items-center justify-between">
  <CardTitle>Research Queue</CardTitle>
  <span className="font-mono text-[0.625rem] text-[var(--color-gold-muted)]">
    {completed}/{state.researchQueue.length}
  </span>
</div>
```

**Step 7: Update severity badges**

- CRITICAL: Keep `variant="destructive"` but add subtle glow: `shadow-[0_0_8px_rgba(239,68,68,0.15)]`
- HIGH: Add amber badge variant: `className="bg-amber-500/12 text-amber-400 border border-amber-400/15"`
- MEDIUM/LOW: Keep `variant="secondary"` or use outline

**Step 8: Verify in dev server**

Open operations panel → state cards should show:
- Copper accent bars on all cards
- Staleness dots (green/amber/red) on coverage map
- Completion progress bar on queue
- Properly styled severity badges

**Step 9: Commit**

```bash
git add apps/studio/src/components/studio/research-state-panel.tsx
git commit -m "feat(studio): glass treatment + staleness indicators + completion bar on state panel"
```

---

### Task 7: Update dashboard orchestrator — filter state + layout + glass ops trigger

**Files:**
- Modify: `apps/studio/src/components/studio/research-dashboard.tsx`

**Step 1: Read current file (102 lines)**

**Step 2: Add nowISO to props and filter state**

```diff
 interface ResearchDashboardProps {
   files: ResearchFile[]
   grouped: Record<string, ResearchFile[]>
   state: ResearchState | null
   priorities: ResearchPriorities | null
   heartbeat: HeartbeatStatus
   projectSlug: string
+  nowISO: string
 }
```

Add filter state management:

```tsx
import { useDeferredValue, useMemo, useState, useCallback } from "react"

// Inside the component:
const rawQuery = searchParams.get("q") ?? ""
const rawCategories = searchParams.get("categories") ?? ""
const [query, setQuery] = useState(rawQuery)
const deferredQuery = useDeferredValue(query)

const selectedCategories = useMemo(
  () => rawCategories ? rawCategories.split(",").filter(Boolean) : [],
  [rawCategories],
)

const allCategories = useMemo(
  () => [...new Set(files.map(f => f.category).filter(Boolean))].sort(),
  [files],
)

const filteredFiles = useMemo(() => {
  let result = files
  if (deferredQuery) {
    const q = deferredQuery.toLowerCase()
    result = result.filter(f =>
      f.title.toLowerCase().includes(q) ||
      (f.summary?.toLowerCase().includes(q) ?? false) ||
      f.category.toLowerCase().includes(q)
    )
  }
  if (selectedCategories.length > 0 && selectedCategories.length < allCategories.length) {
    result = result.filter(f => selectedCategories.includes(f.category))
  }
  return result
}, [files, deferredQuery, selectedCategories, allCategories.length])

const filteredGrouped = useMemo(() => {
  const grouped: Record<string, ResearchFile[]> = {}
  for (const file of filteredFiles) {
    const key = file.category || "general"
    ;(grouped[key] ??= []).push(file)
  }
  return grouped
}, [filteredFiles])
```

Add URL sync callbacks:

```tsx
const setQueryParam = useCallback((q: string) => {
  setQuery(q)
  const params = new URLSearchParams(searchParams.toString())
  if (q) params.set("q", q)
  else params.delete("q")
  router.replace(`?${params.toString()}`, { scroll: false })
}, [router, searchParams])

const setCategories = useCallback((cats: string[]) => {
  const params = new URLSearchParams(searchParams.toString())
  if (cats.length > 0 && cats.length < allCategories.length) {
    params.set("categories", cats.join(","))
  } else {
    params.delete("categories")
  }
  router.replace(`?${params.toString()}`, { scroll: false })
}, [router, searchParams, allCategories.length])
```

**Step 3: Update Collapsible trigger styling**

Replace the plain trigger with warm glass treatment:

```tsx
<CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-[var(--glass-bg-hover)]">
  <ChevronRight className="shrink-0 text-[var(--color-dim)] transition-transform group-data-[state=open]:rotate-90" />
  <span className="font-mono text-xs uppercase tracking-[0.15em]">
    Research Operations
  </span>
  {state?.danglingThreads.some((t) => t.severity === "CRITICAL") ? (
    <span className="size-1.5 rounded-full bg-destructive" />
  ) : null}
</CollapsibleTrigger>
```

**Step 4: Pass nowISO to state panel and filtered data to views**

```tsx
{state ? <ResearchStatePanel state={state} nowISO={nowISO} /> : null}
```

Add `ResearchFilterBar` between ops and tabs:

```tsx
<ResearchFilterBar
  query={query}
  onQueryChange={setQueryParam}
  allCategories={allCategories}
  selectedCategories={selectedCategories}
  onCategoriesChange={setCategories}
  fileCounts={files.reduce((acc, f) => {
    const cat = f.category || "general"
    acc[cat] = (acc[cat] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)}
/>
```

Pass filtered data to views:

```diff
- <ResearchStreamView grouped={grouped} projectSlug={projectSlug} />
+ <ResearchStreamView grouped={filteredGrouped} projectSlug={projectSlug} />

- <ResearchTimelineView files={files} projectSlug={projectSlug} />
+ <ResearchTimelineView files={filteredFiles} projectSlug={projectSlug} />

- <ResearchTableView files={files} projectSlug={projectSlug} />
+ <ResearchTableView files={filteredFiles} projectSlug={projectSlug} />
```

**Step 5: Style Tabs with gold active indicator**

```tsx
<TabsTrigger
  value="stream"
  className="font-display data-[state=active]:text-[var(--color-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-gold)]"
>
  Streams
</TabsTrigger>
```

**Step 6: Run typecheck**

Run: `pnpm check`

Expected: Should pass now that nowISO is in both page.tsx and dashboard props. May fail on `ResearchFilterBar` import — that's created in Session 3 Task 8.

**Step 7: Commit**

```bash
git add apps/studio/src/components/studio/research-dashboard.tsx
git commit -m "feat(studio): add filter state management + glass ops trigger to dashboard"
```

---

## Session 3: Views + Filter Bar + Polish

### Task 8: Create filter bar component

**Files:**
- Create: `apps/studio/src/components/studio/research-filter-bar.tsx`

**Step 1: Write the component**

```tsx
"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ResearchFilterBarProps {
  query: string
  onQueryChange: (query: string) => void
  allCategories: string[]
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  fileCounts: Record<string, number>
}

export function ResearchFilterBar({
  query,
  onQueryChange,
  allCategories,
  selectedCategories,
  onCategoriesChange,
  fileCounts,
}: ResearchFilterBarProps) {
  const allSelected = selectedCategories.length === 0 || selectedCategories.length === allCategories.length

  function toggleCategory(cat: string) {
    if (allSelected) {
      // First toggle: select only this one
      onCategoriesChange([cat])
    } else if (selectedCategories.includes(cat)) {
      const next = selectedCategories.filter(c => c !== cat)
      onCategoriesChange(next.length === 0 ? [] : next) // empty = all
    } else {
      onCategoriesChange([...selectedCategories, cat])
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] px-4 py-2.5 flex-wrap">
      {/* Search input */}
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-dim)]" />
        <Input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search research..."
          className="pl-9 w-full max-w-[20rem] bg-transparent border-[var(--glass-border)] focus-visible:border-[var(--color-gold)]/30 focus-visible:ring-[var(--color-gold)]/8"
        />
        {query ? (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-dim)] hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="font-mono text-[0.625rem] text-[var(--color-dim)] uppercase tracking-[0.1em] mr-1">
          Streams:
        </span>
        {allCategories.map(cat => {
          const isActive = allSelected || selectedCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors",
                isActive
                  ? "text-[var(--color-gold)] bg-[var(--color-gold)]/6"
                  : "text-muted-foreground hover:bg-[var(--surface-hover)]"
              )}
            >
              <span className={cn(
                "size-1.5 rounded-full transition-all",
                isActive
                  ? "bg-[var(--color-gold)] shadow-[0_0_4px_var(--glow-gold)]"
                  : "border border-[var(--color-dim)]"
              )} />
              {cat}
              <span className="text-[0.625rem] text-[var(--color-dim)]">{fileCounts[cat] ?? 0}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Verify in dev server**

The filter bar should appear between operations and tabs. Search should filter across views. Category toggles should highlight in gold.

**Step 3: Commit**

```bash
git add apps/studio/src/components/studio/research-filter-bar.tsx
git commit -m "feat(studio): add glass research filter bar with search + category toggles"
```

---

### Task 9: Redesign stream view — glass cards + category accents + inline markdown

**Files:**
- Modify: `apps/studio/src/components/studio/research-stream-view.tsx`

**Step 1: Read current file (72 lines) and prototype streams section**

**Step 2: Apply glass treatment to stream cards**

Key changes:

1. **Card container**: Replace `border border-border/50 bg-card/30` with glass:
   ```
   bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] rounded-lg overflow-hidden
   ```

2. **Category accent line**: Add a left-edge gradient per stream. Rotate through gold, copper, bronze:
   ```tsx
   const accentColors = ["var(--color-gold)", "var(--color-copper)", "var(--color-bronze)", "#34d399", "var(--color-gold-muted)"]
   // In the header:
   <div
     className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm"
     style={{ background: `linear-gradient(to bottom, ${accentColors[i % accentColors.length]}, transparent)` }}
   />
   ```

3. **Stream name**: Use `font-display text-sm font-medium` (already using font-display).

4. **File count badge**: Switch from `variant="secondary"` to gold treatment:
   ```
   bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/15
   ```

5. **Summary**: Render inline markdown:
   ```tsx
   import { renderInlineMarkdown } from "@/lib/render-inline-markdown"
   // In the summary paragraph:
   <p className="line-clamp-1 text-xs text-muted-foreground">
     {latest?.summary ? renderInlineMarkdown(latest.summary) : null}
   </p>
   ```

6. **File list spine**: Keep the `border-l border-border/30` but change to gold:
   ```
   border-l border-[var(--border-gold)]
   ```

7. **File hover**: Add `hover:bg-[var(--surface-hover)]`

**Step 3: Verify in dev server — streams should show glass cards with colored accent lines**

**Step 4: Commit**

```bash
git add apps/studio/src/components/studio/research-stream-view.tsx
git commit -m "feat(studio): glass cards + category accents + inline markdown in stream view"
```

---

### Task 10: Redesign timeline view — copper spine + gold dots + staggered reveal

**Files:**
- Modify: `apps/studio/src/components/studio/research-timeline-view.tsx`

**Step 1: Read current file (72 lines) and prototype timeline section**

**Step 2: Add timeline spine and gold dots**

Key changes:

1. **Spine container**: Wrap entries in a container with a vertical copper line:
   ```tsx
   <div className="relative pl-8">
     {/* Vertical spine */}
     <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-copper)]/30 to-[var(--color-copper)]/8" />

     {sorted.map((file, i) => (
       <div
         key={file.slug}
         className="relative rounded-lg px-4 py-3 ml-2 transition-colors hover:bg-[var(--surface-hover)]"
         style={{ animationDelay: `${i * 50}ms` }}
       >
         {/* Dot on the spine */}
         <div className="absolute -left-[1.625rem] top-[1.125rem] size-[7px] rounded-full bg-[var(--color-copper)] border-2 border-[var(--bg)] shadow-[0_0_0_1px_rgba(196,154,108,0.3)] transition-all hover:scale-[1.3] hover:shadow-[0_0_6px_2px_var(--glow-gold)]" />

         {/* Entry content */}
         ...
       </div>
     ))}
   </div>
   ```

2. **Sort toggle**: Glass pill button:
   ```
   bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-md hover:bg-[var(--glass-bg-hover)]
   ```

3. **Category badges**: Add warm border: `border-[var(--border-gold)]`

4. **Summary**: Render inline markdown:
   ```tsx
   import { renderInlineMarkdown } from "@/lib/render-inline-markdown"
   // In summary:
   <p className="line-clamp-2 text-xs text-muted-foreground">
     {file.summary ? renderInlineMarkdown(file.summary) : null}
   </p>
   ```

5. **Stagger animation**: Add `panel-glow-in` animation class to each entry (CSS-only, first render):
   ```tsx
   className="... animate-[panel-glow-in_0.5s_ease-out_both]"
   style={{ animationDelay: `${i * 50}ms` }}
   ```

**Step 3: Verify in dev server — timeline should show copper spine with dots, staggered reveal**

**Step 4: Commit**

```bash
git add apps/studio/src/components/studio/research-timeline-view.tsx
git commit -m "feat(studio): copper timeline spine + gold dots + staggered reveal"
```

---

### Task 11: Redesign table view — glass table + warm headers

**Files:**
- Modify: `apps/studio/src/components/studio/research-table-view.tsx`

**Step 1: Read current file (101 lines) and prototype table section**

**Step 2: Apply glass treatment**

Key changes:

1. **Table container**: Wrap in glass surface:
   ```tsx
   <div className="rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] overflow-hidden">
     <table className="w-full text-sm">
   ```

2. **Header row**: Warm charcoal background with copper border:
   ```tsx
   <thead>
     <tr className="bg-[var(--color-warm-charcoal)]/50 border-b border-[var(--border-gold)]">
       <th className="cursor-pointer px-4 py-2.5 text-left font-mono text-xs font-normal uppercase tracking-[0.1em] text-[var(--color-dim)] transition-colors hover:text-[var(--color-copper)]">
   ```

3. **Sort arrows**: Gold when active:
   ```tsx
   const arrow = (key: SortKey) =>
     sortKey === key
       ? <span className="text-[var(--color-gold)]">{sortDir === "asc" ? " ↑" : " ↓"}</span>
       : null
   ```

4. **Row hover**: Warm transition with gold title:
   ```tsx
   <tr className="border-b border-[rgba(255,255,255,0.02)] transition-colors hover:bg-[var(--surface-hover)] group">
     {/* ... */}
     <td className="px-4 py-2.5">
       <Link className="text-foreground transition-colors group-hover:text-[var(--color-gold)]" ...>
   ```

5. **Summary column**: Render inline markdown:
   ```tsx
   <td className="max-w-xs truncate px-4 py-2.5 text-muted-foreground">
     {file.summary ? renderInlineMarkdown(file.summary) : "—"}
   </td>
   ```

6. **Category badges**: Warm outline: `border-[var(--border-gold)]`

**Step 3: Verify in dev server — table should show glass surface, warm header, gold hover titles**

**Step 4: Commit**

```bash
git add apps/studio/src/components/studio/research-table-view.tsx
git commit -m "feat(studio): glass table + warm headers + gold hover treatment"
```

---

### Task 12: Update page heading — display font with warm gradient

**Files:**
- Modify: `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx:63`

**Step 1: Update the h1 element**

Replace:
```tsx
<h1 className="font-display text-2xl text-foreground mb-6">Research</h1>
```

With warm gradient heading:
```tsx
<h1 className="font-display text-2xl mb-6">
  <span className="bg-gradient-to-r from-foreground to-[var(--color-gold)] bg-clip-text text-transparent">
    Research
  </span>
</h1>
```

**Step 2: Verify in dev server — heading should show warm gradient from cream to gold**

**Step 3: Commit**

```bash
git add apps/studio/src/app/(studio)/projects/[project]/research/page.tsx
git commit -m "feat(studio): warm gradient heading for research page"
```

---

### Task 13: Typecheck + build verification

**Step 1: Run typecheck**

Run: `pnpm check`

Expected: PASS — all types should resolve.

**Step 2: Run build**

Run: `pnpm build`

Expected: PASS — Next.js production build succeeds.

**Step 3: Run existing tests**

Run: `pnpm --filter @sherpa/studio-core test`

Expected: PASS — all 23 existing research tests still pass (no data layer changes).

**Step 4: Run new tests**

Run the inline markdown and staleness tests (location depends on Task 1 decision — either in studio app or studio-core).

Expected: PASS — all new tests pass.

**Step 5: Final visual verification**

Run: `pnpm dev`

Walk through:
- [ ] Heartbeat bar: glass surface, gold LED, copper separators
- [ ] Operations panel: collapsible, gold chevron, critical dot
- [ ] Priorities: gold accent bar, Fraunces italic, rail-node numbers
- [ ] State: copper accent bars, staleness dots, completion bar
- [ ] Filter bar: glass surface, gold focus ring, category toggles
- [ ] Search: filters across all views
- [ ] Streams: glass cards, category accents, inline markdown
- [ ] Timeline: copper spine, gold dots, staggered reveal
- [ ] Table: glass surface, warm headers, gold hover
- [ ] Tab switching: gold active underline
- [ ] URL params: ?view, ?q, ?categories all persist

**Step 6: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(studio): complete research dashboard V2 glass treatment"
```

---

## Post-Implementation

After all tasks complete:

1. Update `docs/initiatives/studio-research-dashboard-v2/proposal.md` status to `in-progress`
2. Create `docs/initiatives/studio-research-dashboard-v2/activity.md` with session log
3. Run `/superpowers:verification-before-completion` before marking done
4. Open PR from implementation branch into main
