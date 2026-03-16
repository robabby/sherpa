# Studio UX Patterns: Vercel-Inspired Interaction Primitives

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add four cross-cutting interaction primitives — command palette, skeleton loading, functional empty states, and browser tab status — to all Studio pages.

**Architecture:** Each pattern is an independent primitive wired into the existing Studio shell. The command palette mounts in root layout as a client component alongside existing providers. Skeletons use Next.js `loading.tsx` convention with a CSS show-delay animation. Empty states use a compound component in studio-ui. Browser tab status uses a lightweight client hook with SVG data URI favicon swaps.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, Tailwind v4, shadcn/ui (cmdk Command, Skeleton), pnpm monorepo (`@sherpa/studio-core` for data, `@sherpa/studio-ui` for components)

**Skills referenced:**
- `@shadcn` — Command component composition, Skeleton usage, compound component conventions
- `@react-best-practices` — `async-parallel` (parallel data loading), `bundle-dynamic-imports` (lazy-load palette), `server-serialization` (minimize client payload)
- `@web-design-guidelines` — URL reflects state, honor `prefers-reduced-motion`, animate `transform`/`opacity` only
- `@vercel-composition-patterns` — Compound components for EmptyState, avoid boolean prop proliferation

**Initiative:** `docs/initiatives/studio-ux-patterns/`
**Shape:** 3-session appetite, each session independently shippable

---

## Session 1: Command Palette + Skeleton Loading CSS

### Task 1: Define skeleton show-delay animation in Tailwind theme

**Files:**
- Modify: `apps/studio/src/styles/globals.css`

The show-delay animation prevents skeletons from appearing on fast loads (<200ms). Uses `animation-fill-mode: both` to hold `opacity: 0` during the delay period.

**Step 1: Add the animation to the `@theme` block**

In `apps/studio/src/styles/globals.css`, add inside the existing `@theme { }` block (after the font definitions, before the closing `}`):

```css
  /* Skeleton show-delay: invisible for 200ms, then fades in over 150ms */
  --animate-skeleton-delayed: skeleton-delayed 150ms ease-out 200ms both;

  @keyframes skeleton-delayed {
    from { opacity: 0; }
    to { opacity: 1; }
  }
```

**Step 2: Add a reduced-motion override**

Add after the `.dark { }` block in the same file:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-skeleton-delayed {
    animation: none;
    opacity: 1;
  }
}
```

This satisfies the Web Interface Guidelines rule: "Honor `prefers-reduced-motion` with reduced variant or disable."

**Step 3: Verify the animation class works**

Run: `pnpm build`
Expected: Build succeeds. The class `animate-skeleton-delayed` is now available in Tailwind.

**Step 4: Commit**

```bash
git add apps/studio/src/styles/globals.css
git commit -m "feat(studio): add skeleton show-delay animation to Tailwind theme"
```

---

### Task 2: Create the command palette data server action

**Files:**
- Create: `apps/studio/src/app/actions/command-palette-items.ts`

A server action that aggregates all searchable items for the command palette. Returns a flat list grouped by category. Called once when the palette opens — cmdk handles client-side fuzzy filtering via `command-score`.

**Step 1: Create the server action**

```typescript
"use server"

import { getInitiatives } from "@sherpa/studio-core"
import { getTaskBoard } from "@sherpa/studio-core"
import { getSkills } from "@sherpa/studio-core"

// Per @react-best-practices async-parallel: parallelize independent data fetches
export async function getCommandPaletteItems() {
  const [initiatives, tasks, skills] = await Promise.all([
    Promise.resolve(getInitiatives()),
    Promise.resolve(getTaskBoard()),
    Promise.resolve(getSkills()),
  ])

  return {
    // Static routes — matches sidebar groups in StudioSidebar
    routes: [
      { label: "Process", href: "/process", group: "Operations", keywords: ["initiatives", "proposals"] },
      { label: "Tasks", href: "/tasks", group: "Operations", keywords: ["missions", "dispatch"] },
      { label: "Dispatch", href: "/dispatch", group: "Operations", keywords: ["queue", "agents", "backends"] },
      { label: "Workflow", href: "/workflow", group: "Operations", keywords: ["pipeline"] },
      { label: "Docs", href: "/docs", group: "Knowledge", keywords: ["documentation", "files"] },
      { label: "Conventions", href: "/conventions", group: "Knowledge", keywords: ["rules", "claude"] },
      { label: "Skills", href: "/skills", group: "Knowledge", keywords: ["commands", "slash"] },
      { label: "Playbooks", href: "/playbooks", group: "Knowledge", keywords: ["guides", "recipes"] },
      { label: "Workforce", href: "/workforce", group: "System", keywords: ["agents", "roles"] },
      { label: "Sessions", href: "/sessions", group: "System", keywords: ["context", "history"] },
      { label: "MCP", href: "/mcp", group: "System", keywords: ["server", "tools", "protocol"] },
      { label: "Activity", href: "/activity", group: "Activity", keywords: ["log", "timeline"] },
    ],
    // Per @react-best-practices server-serialization: only send what client needs
    initiatives: initiatives.map((i) => ({
      label: i.title,
      href: `/process/${i.slug}`,
      status: i.status,
      keywords: [i.slug, i.type, i.status],
    })),
    tasks: tasks.slice(0, 50).map((t) => ({
      label: t.title,
      href: `/tasks/${t.id}`,
      status: t.status,
      keywords: [t.id, t.status, t.initiative ?? "", t.backend ?? ""],
    })),
    skills: skills.map((s) => ({
      label: s.name,
      href: `/skills/${s.slug}`,
      keywords: [s.slug, s.description ?? ""],
    })),
  }
}
```

**Step 2: Commit**

```bash
git add apps/studio/src/app/actions/command-palette-items.ts
git commit -m "feat(studio): add server action for command palette data"
```

---

### Task 3: Create the CommandPalette client component

**Files:**
- Create: `apps/studio/src/components/studio/command-palette.tsx`

Built on the existing shadcn `Command` component (`apps/studio/src/components/ui/command.tsx`). Uses `CommandDialog` for the modal, `CommandGroup` for categories, `CommandItem` for each item.

Per `@shadcn` composition rules: items always inside their Group, Dialog always needs a Title.

Per `@vercel-composition-patterns` architecture-compound-components: the palette is a single self-contained component, not a provider + consumer split — the state is local (open/closed + items).

**Step 1: Create the component**

```tsx
"use client"

import { useEffect, useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  GitBranch,
  CheckSquare,
  Send,
  Workflow,
  FileText,
  BookOpen,
  Zap,
  Play,
  Users,
  Clock,
  Plug,
  Activity,
} from "lucide-react"
import { getCommandPaletteItems } from "@/app/actions/command-palette-items"

// Icon map for navigation routes — matches StudioSidebar
const ROUTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Process: GitBranch,
  Tasks: CheckSquare,
  Dispatch: Send,
  Workflow: Workflow,
  Docs: FileText,
  Conventions: BookOpen,
  Skills: Zap,
  Playbooks: Play,
  Workforce: Users,
  Sessions: Clock,
  MCP: Plug,
  Activity: Activity,
}

type PaletteItems = Awaited<ReturnType<typeof getCommandPaletteItems>>

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PaletteItems | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Fetch items when dialog opens
  useEffect(() => {
    if (open && !items) {
      startTransition(async () => {
        const data = await getCommandPaletteItems()
        setItems(data)
      })
    }
  }, [open, items])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Search across Studio">
      <CommandInput placeholder="Search pages, initiatives, tasks, skills..." />
      <CommandList>
        <CommandEmpty>
          {isPending ? "Loading..." : "No results found."}
        </CommandEmpty>

        {items && (
          <>
            {/* Navigation routes */}
            <CommandGroup heading="Navigation">
              {items.routes.map((route) => {
                const Icon = ROUTE_ICONS[route.label]
                return (
                  <CommandItem
                    key={route.href}
                    value={route.label}
                    keywords={route.keywords}
                    onSelect={() => handleSelect(route.href)}
                  >
                    {Icon ? <Icon /> : null}
                    <span>{route.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            <CommandSeparator />

            {/* Initiatives */}
            {items.initiatives.length > 0 && (
              <CommandGroup heading="Initiatives">
                {items.initiatives.map((init) => (
                  <CommandItem
                    key={init.href}
                    value={init.label}
                    keywords={init.keywords}
                    onSelect={() => handleSelect(init.href)}
                  >
                    <GitBranch />
                    <span>{init.label}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {init.status}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tasks */}
            {items.tasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {items.tasks.map((task) => (
                  <CommandItem
                    key={task.href}
                    value={task.label}
                    keywords={task.keywords}
                    onSelect={() => handleSelect(task.href)}
                  >
                    <CheckSquare />
                    <span>{task.label}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {task.status}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Skills */}
            {items.skills.length > 0 && (
              <CommandGroup heading="Skills">
                {items.skills.map((skill) => (
                  <CommandItem
                    key={skill.href}
                    value={skill.label}
                    keywords={skill.keywords}
                    onSelect={() => handleSelect(skill.href)}
                  >
                    <Zap />
                    <span>{skill.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
```

**Step 2: Commit**

```bash
git add apps/studio/src/components/studio/command-palette.tsx
git commit -m "feat(studio): create CommandPalette client component with cmdk"
```

---

### Task 4: Mount the command palette in root layout

**Files:**
- Modify: `apps/studio/src/app/layout.tsx`

Per `@react-best-practices` `bundle-dynamic-imports`: lazy-load the palette since it's not visible on initial render. This keeps it off the critical path.

**Step 1: Add the dynamic import and render**

Add the import at the top of `layout.tsx` (after existing imports):

```typescript
import dynamic from "next/dynamic"

const CommandPalette = dynamic(
  () => import("@/components/studio/command-palette").then((m) => ({ default: m.CommandPalette })),
  { ssr: false }
)
```

Then add `<CommandPalette />` inside the `<TooltipProvider>`, right before `<SidebarProvider>`:

```tsx
<TooltipProvider>
  <CommandPalette />
  <SidebarProvider>
```

**Step 2: Verify the palette works**

Run: `pnpm dev`
- Open browser to localhost:3000
- Press Cmd+K — the palette should open
- Type "tasks" — should filter to Tasks route and task items
- Select an item — should navigate to that page
- Press Escape — should close

**Step 3: Commit**

```bash
git add apps/studio/src/app/layout.tsx
git commit -m "feat(studio): mount CommandPalette in root layout with dynamic import"
```

---

### Task 5: Create skeleton loading templates

**Files:**
- Create: `apps/studio/src/components/skeletons/split-pane-skeleton.tsx`
- Create: `apps/studio/src/components/skeletons/card-grid-skeleton.tsx`
- Create: `apps/studio/src/components/skeletons/single-column-skeleton.tsx`
- Create: `apps/studio/src/components/skeletons/dispatch-skeleton.tsx`

Three composable skeleton templates matching the page archetypes identified in exploration. Uses the existing shadcn `Skeleton` component. Each wrapped in the show-delay animation class from Task 1.

Per `@shadcn` rules: use `Skeleton` for loading placeholders, no custom `animate-pulse` divs.

**Step 1: Create the split-pane skeleton** (for tasks, process)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function SplitPaneSkeleton() {
  return (
    <div className="flex h-[calc(100vh-53px)] animate-skeleton-delayed overflow-hidden border-t">
      {/* Left list pane */}
      <div className="flex w-80 shrink-0 flex-col gap-2 overflow-hidden border-r bg-[var(--color-obsidian)] p-3">
        {/* Filter bar */}
        <Skeleton className="h-7 w-full rounded-md" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        {/* List items */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
      {/* Right detail pane */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-4 h-40 w-full rounded-lg" />
      </div>
    </div>
  )
}
```

**Step 2: Create the card grid skeleton** (for dashboard, skills)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function CardGridSkeleton({ columns = 2 }: { columns?: 2 | 3 }) {
  const gridClass = columns === 3
    ? "grid-cols-1 lg:grid-cols-3"
    : "grid-cols-1 lg:grid-cols-2"

  return (
    <div className="mx-auto max-w-6xl animate-skeleton-delayed space-y-8 px-6 py-6">
      {/* Metric bar */}
      <Skeleton className="h-10 w-full rounded-md" />
      {/* Section header */}
      <Skeleton className="h-6 w-40" />
      {/* Card grid */}
      <div className={`grid gap-4 ${gridClass}`}>
        {Array.from({ length: columns === 3 ? 6 : 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border bg-card/30 p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Create the single-column skeleton** (for conventions, skills detail)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function SingleColumnSkeleton() {
  return (
    <div className="animate-skeleton-delayed space-y-10 p-6">
      {/* Section header */}
      <Skeleton className="h-7 w-48" />
      {/* Table or list */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
      {/* Second section */}
      <Skeleton className="h-7 w-36" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Create the dispatch skeleton** (3-column grid)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function DispatchSkeleton() {
  return (
    <div className="flex h-[calc(100vh-53px)] animate-skeleton-delayed flex-col overflow-hidden border-t">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-32 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      {/* 3-column grid */}
      <div className="grid flex-1 grid-cols-12 gap-0 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-2 border-r p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
        <div className="col-span-5 flex flex-col gap-2 border-r p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
        <div className="col-span-4 flex flex-col gap-2 p-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add apps/studio/src/components/skeletons/
git commit -m "feat(studio): add composable skeleton loading templates"
```

---

### Task 6: Apply loading.tsx files to all route groups

**Files:**
- Modify: `apps/studio/src/app/process/loading.tsx` (replace SacredSpinner)
- Create: `apps/studio/src/app/tasks/loading.tsx`
- Create: `apps/studio/src/app/loading.tsx` (dashboard)
- Create: `apps/studio/src/app/dispatch/loading.tsx`
- Create: `apps/studio/src/app/skills/loading.tsx`
- Create: `apps/studio/src/app/conventions/loading.tsx`

Each loading.tsx is a Server Component (no `"use client"` needed) that imports the appropriate skeleton template.

**Step 1: Replace the process loading.tsx**

Replace the full content of `apps/studio/src/app/process/loading.tsx`:

```tsx
import { SplitPaneSkeleton } from "@/components/skeletons/split-pane-skeleton"

export default function ProcessLoading() {
  return <SplitPaneSkeleton />
}
```

**Step 2: Create tasks loading.tsx**

```tsx
import { SplitPaneSkeleton } from "@/components/skeletons/split-pane-skeleton"

export default function TasksLoading() {
  return <SplitPaneSkeleton />
}
```

**Step 3: Create dashboard loading.tsx**

```tsx
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton"

export default function DashboardLoading() {
  return <CardGridSkeleton columns={2} />
}
```

**Step 4: Create dispatch loading.tsx**

```tsx
import { DispatchSkeleton } from "@/components/skeletons/dispatch-skeleton"

export default function DispatchLoading() {
  return <DispatchSkeleton />
}
```

**Step 5: Create skills loading.tsx**

```tsx
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton"

export default function SkillsLoading() {
  return <CardGridSkeleton columns={3} />
}
```

**Step 6: Create conventions loading.tsx**

```tsx
import { SingleColumnSkeleton } from "@/components/skeletons/single-column-skeleton"

export default function ConventionsLoading() {
  return <SingleColumnSkeleton />
}
```

**Step 7: Verify skeletons appear**

Run: `pnpm dev`
- Navigate between pages — skeletons should appear briefly (or not at all on fast loads due to the 200ms show-delay)
- Hard-refresh each page — skeleton should be visible for data-heavy pages

**Step 8: Commit**

```bash
git add apps/studio/src/app/process/loading.tsx \
       apps/studio/src/app/tasks/loading.tsx \
       apps/studio/src/app/loading.tsx \
       apps/studio/src/app/dispatch/loading.tsx \
       apps/studio/src/app/skills/loading.tsx \
       apps/studio/src/app/conventions/loading.tsx
git commit -m "feat(studio): add skeleton loading.tsx files for all major routes"
```

---

**Session 1 checkpoint:** At this point, two patterns are complete (command palette + skeleton loading). Both are independently shippable. Run `pnpm build` to verify no type errors.

---

## Session 2: Empty States + Browser Tab Status

### Task 7: Create the EmptyState compound component

**Files:**
- Create: `packages/studio-ui/src/empty-state.tsx`

Per `@vercel-composition-patterns` `architecture-compound-components`: use compound component pattern matching shadcn/ui Card convention. Per `@shadcn` rules: "Empty states use `Empty`" — but our studio-ui doesn't have one yet, and we need a domain-specific version.

Per `@frontend-design`: match Studio's existing aesthetic — dark mode, gold accent, JetBrains Mono for code, DM Sans for body.

**Step 1: Create the component**

```tsx
import * as React from "react"
import { cn } from "./lib/utils"

function EmptyState({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyStateIcon({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-lg border border-[var(--border-gold)]/20 bg-muted/30 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

function EmptyStateTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        "font-heading text-lg font-medium tracking-tight text-foreground/90",
        className
      )}
    >
      {children}
    </h3>
  )
}

function EmptyStateDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "max-w-sm text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}

function EmptyStateCommand({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <code
      className={cn(
        "mt-1 rounded-md border border-[var(--border-gold)]/20 bg-muted/30 px-3 py-1.5 font-mono text-xs text-[var(--color-gold)]",
        className
      )}
    >
      {children}
    </code>
  )
}

function EmptyStateAction({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "mt-2 text-sm font-medium text-[var(--color-gold)] underline underline-offset-4 hover:text-[var(--color-gold-bright)]",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateCommand,
  EmptyStateAction,
}
```

**Step 2: Verify the lib/utils import path exists in studio-ui**

Check: `packages/studio-ui/src/lib/utils.ts` — if it doesn't exist, use a local `cn` utility or import from the app's utils. The `cn` function is just `clsx` + `twMerge`.

If missing, add at the top of the file:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

**Step 3: Export from barrel**

Add to `packages/studio-ui/src/index.ts`:

```typescript
export * from "./empty-state"
```

**Step 4: Commit**

```bash
git add packages/studio-ui/src/empty-state.tsx packages/studio-ui/src/index.ts
git commit -m "feat(studio-ui): add EmptyState compound component"
```

---

### Task 8: Apply empty states to pages

**Files:**
- Modify: `apps/studio/src/app/tasks/page.tsx`
- Modify: `apps/studio/src/app/process/page.tsx`
- Modify: `apps/studio/src/app/dispatch/page.tsx`
- Modify: `apps/studio/src/app/skills/page.tsx`
- Modify: `apps/studio/src/app/conventions/page.tsx`

Each page needs its "no data" branch replaced with an EmptyState. The specific copy follows Polaris convention: verb+noun titles, under 10 words, CLI command as the primary pathway.

**Important:** Read each page file first to find the exact "no data" conditional. The pattern varies per page — some use ternaries, some use early returns, some inline "no items" text. Each replacement is a targeted edit, not a rewrite.

**Step 1: Read each target file**

Read each file listed above to find the current empty state handling. Look for patterns like:
- `tasks.length === 0`
- `initiatives.length === 0`
- `"No ... found"` or `"Nothing"` strings
- Conditional rendering with empty arrays

**Step 2: Apply per-page empty states**

For each page, replace the empty branch with the appropriate EmptyState composition. Examples of the copy for each:

**Tasks** (no tasks):
```tsx
<EmptyState>
  <EmptyStateIcon><CheckSquare className="size-5" /></EmptyStateIcon>
  <EmptyStateTitle>Create your first task</EmptyStateTitle>
  <EmptyStateDescription>
    Tasks are dispatched to AI agents for autonomous execution.
  </EmptyStateDescription>
  <EmptyStateCommand>./scripts/task-board.sh add my-task "description"</EmptyStateCommand>
  <EmptyStateAction href="/dispatch">Open Dispatch</EmptyStateAction>
</EmptyState>
```

**Process** (no initiatives):
```tsx
<EmptyState>
  <EmptyStateIcon><GitBranch className="size-5" /></EmptyStateIcon>
  <EmptyStateTitle>Start an initiative</EmptyStateTitle>
  <EmptyStateDescription>
    Initiatives track multi-session work from proposal through implementation.
  </EmptyStateDescription>
  <EmptyStateCommand>/propose</EmptyStateCommand>
</EmptyState>
```

**Dispatch** (no recent runs):
```tsx
<EmptyState>
  <EmptyStateIcon><Send className="size-5" /></EmptyStateIcon>
  <EmptyStateTitle>Dispatch a task</EmptyStateTitle>
  <EmptyStateDescription>
    Select tasks from the backlog and assign them to agent backends.
  </EmptyStateDescription>
  <EmptyStateCommand>./scripts/dispatch.sh planner</EmptyStateCommand>
</EmptyState>
```

**Skills** (no custom skills):
```tsx
<EmptyState>
  <EmptyStateIcon><Zap className="size-5" /></EmptyStateIcon>
  <EmptyStateTitle>Create a skill</EmptyStateTitle>
  <EmptyStateDescription>
    Skills extend Claude with specialized workflows and domain knowledge.
  </EmptyStateDescription>
  <EmptyStateCommand>.claude/skills/my-skill/SKILL.md</EmptyStateCommand>
</EmptyState>
```

**Conventions** (no rules):
```tsx
<EmptyState>
  <EmptyStateIcon><BookOpen className="size-5" /></EmptyStateIcon>
  <EmptyStateTitle>Add a convention</EmptyStateTitle>
  <EmptyStateDescription>
    Rules auto-load from .claude/rules/ based on file globs.
  </EmptyStateDescription>
  <EmptyStateCommand>.claude/rules/my-rule.md</EmptyStateCommand>
</EmptyState>
```

**Step 3: Import the components**

Each page needs:
```typescript
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateCommand,
  EmptyStateAction,
} from "@sherpa/studio-ui"
```

Plus the relevant Lucide icon imports.

**Step 4: Verify empty states render**

Run: `pnpm dev`
- Temporarily empty the data sources or test with a fresh docs/ directory to trigger empty states
- Verify each page shows the EmptyState with the correct copy and icon

**Step 5: Commit**

```bash
git add apps/studio/src/app/tasks/page.tsx \
       apps/studio/src/app/process/page.tsx \
       apps/studio/src/app/dispatch/page.tsx \
       apps/studio/src/app/skills/page.tsx \
       apps/studio/src/app/conventions/page.tsx
git commit -m "feat(studio): apply functional empty states to all major pages"
```

---

### Task 9: Create the usePageStatus hook

**Files:**
- Create: `apps/studio/src/hooks/use-page-status.ts`

A client hook that updates `document.title` and the favicon based on current page state. Uses the `replaceChild` pattern for cross-browser favicon reliability (especially Safari).

SVG data URIs are used instead of separate files to co-locate icons with the hook logic and avoid HTTP requests.

Per Web Interface Guidelines: `document.title` is set via `useEffect`, not server-side metadata (which is server-only in Next.js App Router).

**Step 1: Create the hook**

```typescript
"use client"

import { useEffect, useRef } from "react"

type PageStatus = "idle" | "building" | "success" | "error"

// SVG data URIs for each status — Sherpa logo shape with status-colored fill
const FAVICON_SVGS: Record<PageStatus, string> = {
  idle: "", // empty string = don't change favicon
  building: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23d4a574'/></svg>`,
  success: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2334d399'/></svg>`,
  error: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23ef4444'/></svg>`,
}

const STATUS_PREFIX: Record<PageStatus, string> = {
  idle: "",
  building: "\u25CF ", // filled circle
  success: "\u2713 ", // checkmark
  error: "\u2717 ", // cross mark
}

export function usePageStatus(title: string, status: PageStatus = "idle") {
  const originalFavicon = useRef<string | null>(null)

  useEffect(() => {
    // Update document.title
    const prefix = STATUS_PREFIX[status]
    document.title = prefix
      ? `${prefix}${title} — Sherpa Studio`
      : `${title} | Sherpa Studio`

    // Update favicon if status is not idle
    const svgUri = FAVICON_SVGS[status]
    if (svgUri) {
      const existingLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']")
      if (existingLink && !originalFavicon.current) {
        originalFavicon.current = existingLink.href
      }

      // replaceChild pattern for Safari compatibility
      const link = document.createElement("link")
      link.rel = "icon"
      link.href = svgUri
      const existing = document.querySelector("link[rel*='icon']")
      if (existing?.parentNode) {
        existing.parentNode.replaceChild(link, existing)
      } else {
        document.head.appendChild(link)
      }
    }

    // Cleanup: restore original favicon and title
    return () => {
      if (originalFavicon.current) {
        const link = document.createElement("link")
        link.rel = "icon"
        link.href = originalFavicon.current
        const existing = document.querySelector("link[rel*='icon']")
        if (existing?.parentNode) {
          existing.parentNode.replaceChild(link, existing)
        }
        originalFavicon.current = null
      }
    }
  }, [title, status])
}
```

**Step 2: Commit**

```bash
git add apps/studio/src/hooks/use-page-status.ts
git commit -m "feat(studio): add usePageStatus hook for dynamic favicon and title"
```

---

### Task 10: Apply usePageStatus to key pages

**Files:**
- Modify: `apps/studio/src/app/tasks/page.tsx` (or the client component it renders)
- Modify: `apps/studio/src/app/dispatch/page.tsx` (or its client component)

The hook needs to be used in client components since it calls `useEffect`. For Server Component pages, the hook goes in the nearest client component that knows the status.

**Step 1: Read the tasks and dispatch page structures**

Find where the task status is known in client-side code. The MissionWorkspace component likely has the selected task's status. That's where `usePageStatus` should be called.

**Step 2: Apply to tasks**

In the client component that has the selected task state (likely `MissionWorkspace` or similar), add:

```typescript
import { usePageStatus } from "@/hooks/use-page-status"

// Inside the component, derive status from selected task:
const pageStatus = selectedTask?.status === "dispatched" ? "building"
  : selectedTask?.status === "completed" ? "success"
  : selectedTask?.status === "failed" ? "error"
  : "idle"

usePageStatus(
  selectedTask ? selectedTask.title : "Tasks",
  pageStatus
)
```

**Step 3: Apply to dispatch**

In the dispatch client component, derive status from active dispatch state:

```typescript
usePageStatus("Dispatch", hasActiveDispatch ? "building" : "idle")
```

**Step 4: Verify**

Run: `pnpm dev`
- Navigate to Tasks, select a dispatched task — tab title and favicon should change
- Navigate away — favicon should restore to default

**Step 5: Commit**

```bash
git add apps/studio/src/app/tasks/ apps/studio/src/app/dispatch/
git commit -m "feat(studio): apply usePageStatus to tasks and dispatch pages"
```

---

**Session 2 checkpoint:** Empty states and browser tab status are complete. Run `pnpm build` to verify. Both patterns are independently shippable.

---

## Session 3: URL Filter State + Polish

### Task 11: Extend URL-persisted filter state to remaining pages

**Files:**
- Modify: `apps/studio/src/app/dispatch/page.tsx`
- Modify: `apps/studio/src/app/skills/page.tsx`
- Modify: `apps/studio/src/app/conventions/page.tsx`

Per Web Interface Guidelines: "URL reflects state — filters, tabs, pagination, expanded panels in query params."

The tasks and process pages already use `searchParams`. The pattern: read from `searchParams` in the Server Component, pass to client components. Use `router.replace` (not `router.push`) to update without creating history entries.

**Step 1: Read the existing searchParams implementation**

Read `apps/studio/src/app/tasks/page.tsx` and `apps/studio/src/app/process/page.tsx` to see how they use `searchParams`. Extract the pattern.

**Step 2: Apply to each page**

For each target page:
1. Add `searchParams` to the page component props (Next.js App Router convention)
2. Read filter values from `searchParams` (status, sort, search query)
3. Pass initial values to client components
4. In client components, update the URL when filters change via `useRouter().replace()`

The specific filters per page:
- **Dispatch:** `?mode=interactive|supervised|overnight`
- **Skills:** `?search=<query>`
- **Conventions:** `?search=<query>&section=rules|claude-md|ux`

**Step 3: Verify URL persistence**

Run: `pnpm dev`
- Apply a filter on each page
- Copy the URL, open in a new tab — filter should be preserved
- Refresh the page — filter should persist

**Step 4: Commit**

```bash
git add apps/studio/src/app/dispatch/page.tsx \
       apps/studio/src/app/skills/page.tsx \
       apps/studio/src/app/conventions/page.tsx
git commit -m "feat(studio): extend URL-persisted filter state to dispatch, skills, conventions"
```

---

### Task 12: Integration polish and verification

**Files:**
- Possibly modify: various files from previous tasks

**Step 1: Run full build**

Run: `pnpm build`
Expected: Build succeeds with no errors.

**Step 2: Run type check**

Run: `pnpm check`
Expected: No type errors.

**Step 3: Visual verification**

Run: `pnpm dev`
Verify each pattern across all pages:
- [ ] Cmd+K opens command palette everywhere
- [ ] Palette shows routes, initiatives, tasks, skills
- [ ] Selecting an item navigates correctly
- [ ] Skeleton loading appears on hard-refresh of each page
- [ ] Skeletons don't flash on fast navigations (show-delay works)
- [ ] Empty states render with correct copy when data is empty
- [ ] Browser tab reflects task/dispatch status
- [ ] URL preserves filter state on dispatch, skills, conventions
- [ ] Reduced-motion: skeletons appear instantly (no animation)

**Step 4: Fix any issues found**

Address issues in priority order: type errors > runtime errors > visual glitches > polish.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(studio): integration polish for UX patterns initiative"
```

---

## Reference: Key File Paths

| Concern | File |
|---------|------|
| Root layout | `apps/studio/src/app/layout.tsx` |
| Global CSS / Tailwind theme | `apps/studio/src/styles/globals.css` |
| shadcn Command | `apps/studio/src/components/ui/command.tsx` |
| shadcn Skeleton | `apps/studio/src/components/ui/skeleton.tsx` |
| Sidebar routes | `packages/studio-ui/src/studio-sidebar.tsx:50-81` |
| Initiatives API | `packages/studio-core/src/domain.ts:97` (`getInitiatives()`) |
| Tasks API | `packages/studio-core/src/tasks.ts:178` (`getTaskBoard()`) |
| Skills API | `packages/studio-core/src/domain.ts:370` (`getSkills()`) |
| studio-ui barrel | `packages/studio-ui/src/index.ts` |
| Existing loading.tsx | `apps/studio/src/app/process/loading.tsx` |
| SacredSpinner | `apps/studio/src/components/ui/sacred-spinner.tsx` |

## Reference: Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `--color-obsidian` | `#08080a` | Skeleton pane background |
| `--color-gold` | `#d4a574` | EmptyState command text, accent |
| `--color-gold-bright` | `#e8c49a` | EmptyState action hover |
| `--border-gold` | `rgba(212,165,116,0.10)` | EmptyState borders |
| `bg-card/30` | Card background, 30% opacity | Skeleton card shapes |
| `bg-muted/30` | Muted background, 30% opacity | EmptyState icon background |
| `font-heading` | Fraunces | EmptyState title |
| `font-mono` | JetBrains Mono | EmptyState command, palette metadata |

## Reference: Skills Applied

| Skill | Where Applied |
|-------|---------------|
| `@shadcn` | Command composition (Task 3), Skeleton usage (Task 5), items in groups |
| `@react-best-practices` | `async-parallel` (Task 2), `bundle-dynamic-imports` (Task 4), `server-serialization` (Task 2) |
| `@web-design-guidelines` | URL state (Task 11), `prefers-reduced-motion` (Task 1), animate transform/opacity |
| `@vercel-composition-patterns` | Compound EmptyState (Task 7), avoiding boolean props |
| `@frontend-design` | Dark-mode-first, gold accent system, monospace for code |
| `@feature-dev` | Structured per-session delivery, data API exploration |
