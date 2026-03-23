# Dispatch Evolution Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the dispatch page to a two-panel layout with inline agent selection, add a Settings page for backend config, and replace dispatch modes with autonomy levels.

**Architecture:** Server components load settings and health data, passing them to client components. Settings persist in `.sherpa/settings.json` (gitignored, server-readable). The dispatch bar lives inside the backlog panel as an always-visible sticky footer. Agent selection is optional — "Default (no role)" is the pre-selected value.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind v4, shadcn/ui (new-york style, radix base), lucide-react, motion/react. pnpm monorepo: `packages/studio-core` (domain logic), `packages/studio-ui` (components), `apps/studio` (Next.js app).

**Reference docs:**
- Design: `docs/initiatives/dispatch-evolution/design.md`
- Prototype: `docs/initiatives/dispatch-evolution/prototype.html`
- Stress test: `docs/initiatives/dispatch-evolution/stress-test.md`
- Current dispatch: `packages/studio-ui/src/dispatch-content.tsx` (1196 lines)

**Conventions:**
- shadcn components at `apps/studio/src/components/ui/`
- Use `cn()` from `packages/studio-ui/src/lib/utils` for conditional classes
- Use `gap-*` not `space-y-*`, `size-*` for equal dimensions
- RSC is enabled — add `"use client"` to interactive components
- Use semantic color tokens (`bg-background`, `text-muted-foreground`), not raw values
- Design system colors use CSS custom properties: `var(--color-copper)`, `var(--color-gold)`, `var(--color-dark-bronze)`
- Imports use `@/` alias for `apps/studio/src/`, `@sherpa/studio-core` for core package

---

## Session 1: Settings Infrastructure + Page

### Task 1: Create settings module in studio-core

**Files:**
- Create: `packages/studio-core/src/settings.ts`
- Modify: `packages/studio-core/src/index.ts`

**Step 1: Create the settings module**

```typescript
// packages/studio-core/src/settings.ts
import fs from "fs"
import path from "path"

export interface SherpaSettings {
  activeBackend: "openclaw" | "claude"
}

export const DEFAULT_SETTINGS: SherpaSettings = {
  activeBackend: "openclaw",
}

const SETTINGS_DIR = ".sherpa"
const SETTINGS_FILE = "settings.json"

function settingsPath(projectRoot: string): string {
  return path.join(projectRoot, SETTINGS_DIR, SETTINGS_FILE)
}

export function getSettings(projectRoot: string): SherpaSettings {
  try {
    const raw = fs.readFileSync(settingsPath(projectRoot), "utf-8")
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function updateSettings(
  projectRoot: string,
  patch: Partial<SherpaSettings>,
): SherpaSettings {
  const current = getSettings(projectRoot)
  const updated = { ...current, ...patch }
  const dir = path.join(projectRoot, SETTINGS_DIR)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(settingsPath(projectRoot), JSON.stringify(updated, null, 2) + "\n")
  return updated
}
```

**Step 2: Export from index**

Add to `packages/studio-core/src/index.ts`:

```typescript
// Settings
export * from "./settings"
```

Add this after the existing `export * from "./dispatch"` line.

**Step 3: Verify typecheck**

Run: `pnpm check`
Expected: No new errors from the settings module.

**Step 4: Commit**

```bash
git add packages/studio-core/src/settings.ts packages/studio-core/src/index.ts
git commit -m "feat(core): add settings module with .sherpa/settings.json persistence"
```

---

### Task 2: Create settings API route

**Files:**
- Create: `apps/studio/src/app/(studio)/api/settings/route.ts`

**Step 1: Create the API route**

```typescript
// apps/studio/src/app/(studio)/api/settings/route.ts
import { NextResponse } from "next/server"
import path from "path"
import { getSettings, updateSettings } from "@sherpa/studio-core"

const PROJECT_ROOT = path.resolve(process.cwd(), "../..")

export async function GET() {
  const settings = getSettings(PROJECT_ROOT)
  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.activeBackend && !["openclaw", "claude"].includes(body.activeBackend)) {
    return NextResponse.json(
      { error: "activeBackend must be 'openclaw' or 'claude'" },
      { status: 400 },
    )
  }

  const updated = updateSettings(PROJECT_ROOT, body)
  return NextResponse.json(updated)
}
```

**Step 2: Verify route compiles**

Run: `pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/studio/src/app/(studio)/api/settings/route.ts
git commit -m "feat(api): add /api/settings route for reading and writing .sherpa/settings.json"
```

---

### Task 3: Create settings page content component

**Files:**
- Create: `packages/studio-ui/src/settings-content.tsx`

**Step 1: Create the client component**

Reference the prototype at `docs/initiatives/dispatch-evolution/prototype.html` (settings view section) for exact styling.

The component receives `settings` (current `SherpaSettings`) and `health` (array of `BackendHealth` for openclaw + claude only).

Key UI elements:
- **Active Backend** section: two radio cards (openclaw, claude) side by side. Active card has copper border + filled radio dot. Each shows name, health dot, status.
- **Backend Health** section: card per backend with connection status, model list, last checked. "Check Health" button.

Use these shadcn components (already installed): `Card` (CardHeader, CardTitle, CardDescription, CardContent), `Badge`, `Separator`, `Skeleton`.

Use `Settings` and `RefreshCw` from `lucide-react` for icons.

The component must:
- Be marked `"use client"`
- Optimistically update on backend switch (call `POST /api/settings`, update local state)
- Show copper accent (`var(--color-copper)`) for active selection
- Use the health dot pattern from the existing dispatch-content.tsx (green glow for available, red for offline)

Estimated size: ~180 lines.

**Step 2: Verify typecheck**

Run: `pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/studio-ui/src/settings-content.tsx
git commit -m "feat(ui): add SettingsContent component with backend toggle and health cards"
```

---

### Task 4: Create settings page route

**Files:**
- Create: `apps/studio/src/app/(studio)/settings/page.tsx`
- Create: `apps/studio/src/app/(studio)/settings/layout.tsx`
- Create: `apps/studio/src/app/(studio)/settings/loading.tsx`

**Step 1: Create the layout (passthrough)**

```typescript
// apps/studio/src/app/(studio)/settings/layout.tsx
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

**Step 2: Create the loading skeleton**

```typescript
// apps/studio/src/app/(studio)/settings/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Skeleton className="mb-4 h-6 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-32 flex-1 rounded-lg" />
        <Skeleton className="h-32 flex-1 rounded-lg" />
      </div>
      <Skeleton className="mt-8 mb-4 h-6 w-48" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  )
}
```

**Step 3: Create the page (server component)**

```typescript
// apps/studio/src/app/(studio)/settings/page.tsx
import type { Metadata } from "next"
import path from "path"
import { SettingsContent } from "@/components/studio/settings-content"
import { getSettings, getBackendHealth } from "@sherpa/studio-core"

export const metadata: Metadata = {
  title: "Settings | Studio",
  robots: "noindex, nofollow",
}

export const dynamic = "force-dynamic"

const PROJECT_ROOT = path.resolve(process.cwd(), "../..")

export default async function SettingsPage() {
  const settings = getSettings(PROJECT_ROOT)
  const allHealth = getBackendHealth(PROJECT_ROOT)
  // Only show health for the two primary backends
  const health = allHealth.filter(
    (h) => h.backend === "openclaw" || h.backend === "claude",
  )

  return <SettingsContent settings={settings} health={health} />
}
```

Note: `SettingsContent` import path may need adjustment depending on how `packages/studio-ui` components are re-exported in the app. Check the existing pattern at `apps/studio/src/app/(studio)/dispatch/page.tsx:5` — it imports from `@/components/studio/dispatch-content`. The settings content will follow the same pattern. There may be a barrel re-export or a direct import from the package.

**Step 4: Verify the page renders**

Run: `pnpm dev` and navigate to `http://localhost:3000/settings`
Expected: Settings page renders with backend toggle and health cards.

**Step 5: Commit**

```bash
git add apps/studio/src/app/(studio)/settings/
git commit -m "feat(studio): add /settings page with backend toggle and health cards"
```

---

### Task 5: Add Settings to sidebar

**Files:**
- Modify: `packages/studio-ui/src/studio-sidebar.tsx:11` (add Settings import)
- Modify: `packages/studio-ui/src/studio-sidebar.tsx:71-75` (add Settings nav item)

**Step 1: Add the Settings icon import**

Add `Settings` to the lucide-react import at line 5-18.

**Step 2: Add Settings nav item**

In the System group (line 70-75), add after the MCP entry:

```typescript
{ label: "Settings", href: "/settings", icon: Settings },
```

**Step 3: Verify sidebar renders**

Run: `pnpm dev`, check sidebar shows Settings under System group, link navigates to `/settings`.
Expected: Settings appears with gear icon, active state works.

**Step 4: Commit**

```bash
git add packages/studio-ui/src/studio-sidebar.tsx
git commit -m "feat(ui): add Settings link to sidebar System group"
```

---

## Session 2: Dispatch Bar Component

### Task 6: Create the dispatch bar component

**Files:**
- Create: `packages/studio-ui/src/dispatch-bar.tsx`

**Step 1: Create the component**

The dispatch bar is a `"use client"` component that sits at the bottom of the backlog panel. It is always visible. Reference the prototype dispatch bar section for exact styling.

Props interface:

```typescript
interface DispatchBarProps {
  selectedCount: number
  selectedTaskTypes: Set<string>
  activeBackend: string
  backendAvailable: boolean
  roles: AgentRole[]
  dispatching: boolean
  onDispatch: (agent: string | null) => void
}
```

Key elements:
- **Left:** selected count text + task-type badges (use the existing `TASK_TYPE_STYLES` pattern from dispatch-content.tsx)
- **Center:** `<select>` for agent. First option: `"Default (no role)"` with value `"none"`. Then a disabled separator option `"──────"`. Then agent roles from props. Use the existing `.agent-select` styling pattern from the prototype.
- **Right:** Dispatch button. Enabled when `selectedCount > 0`. Shows count: "Dispatch 3". Disabled state uses muted colors. Uses `Play` icon from lucide-react.
- **Far right:** Backend chip showing "via openclaw" or "via claude" with health dot. Read-only.

When `selectedCount === 0`: show "No tasks selected" in muted text, disable button.
When backend is offline: button shows warning state, text "Backend offline".

Use `cn()` for all conditional classes. Use `gap-*` for spacing.

Estimated size: ~120 lines.

**Step 2: Verify typecheck**

Run: `pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/studio-ui/src/dispatch-bar.tsx
git commit -m "feat(ui): add DispatchBar component with agent dropdown and backend indicator"
```

---

### Task 7: Update dispatch API route to read active backend from settings

**Files:**
- Modify: `apps/studio/src/app/(studio)/api/dispatch/run/route.ts`

**Step 1: Import settings**

Add import at top:

```typescript
import { getSettings } from "@sherpa/studio-core"
```

**Step 2: Read active backend from settings when not provided in request**

Replace the backend handling. Currently `backend` comes from request body (line 29, 54). Change so that:
- If `backend` is provided in request body, use it (explicit per-task override)
- If not, read from settings: `getSettings(PROJECT_ROOT).activeBackend`

Update the backend update logic (around line 54):

```typescript
const activeBackend = backend ?? getSettings(PROJECT_ROOT).activeBackend
if (activeBackend) updates.push(["backend", activeBackend])
```

**Step 3: Update log entries to reflect the resolved backend**

Ensure the dispatch event log (line 100) shows the actual backend used, not just what was in the request.

**Step 4: Verify typecheck**

Run: `pnpm check`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/studio/src/app/(studio)/api/dispatch/run/route.ts
git commit -m "feat(api): read active backend from .sherpa/settings.json in dispatch route"
```

---

## Session 3: Two-Panel Layout Rebuild

### Task 8: Update dispatch page server component

**Files:**
- Modify: `apps/studio/src/app/(studio)/dispatch/page.tsx`

**Step 1: Import settings, pass to DispatchContent**

Add `getSettings` import. Load settings. Pass `activeBackend` and scoped health (only the active backend's health) to `DispatchContent`.

Replace the current `DispatchMode` validation with `AutonomyLevel` validation (after Task 10 creates the type). For now, keep it as-is — it will be updated in Session 4.

The key change is:

```typescript
const settings = getSettings(PROJECT_ROOT)
const allHealth = getBackendHealth(PROJECT_ROOT)
const activeHealth = allHealth.find((h) => h.backend === settings.activeBackend)
```

Pass `activeBackend={settings.activeBackend}` and `backendHealth={activeHealth}` to DispatchContent.

**Step 2: Commit**

```bash
git add apps/studio/src/app/(studio)/dispatch/page.tsx
git commit -m "feat(dispatch): load settings and pass active backend to DispatchContent"
```

---

### Task 9: Rebuild dispatch-content.tsx as two-panel layout

**Files:**
- Modify: `packages/studio-ui/src/dispatch-content.tsx` (major rewrite, ~1196 → ~700 lines)

This is the largest task. The approach is to edit the existing file, not create a new one.

**Step 1: Update the props interface**

Add `activeBackend` and `backendHealth` props. Remove `health` (full backend list) prop.

```typescript
interface DispatchContentProps {
  tasks: TaskBoardEntry[]
  roles: AgentRole[]
  activeBackend: string
  backendHealth?: BackendHealth
  initialMode?: DispatchMode  // renamed to AutonomyLevel in Session 4
}
```

**Step 2: Remove WorkforcePanel and QueueControls**

Delete the `WorkforcePanel` component (~lines 599-836) and the `QueueControls` component (~lines 842-920). These are being replaced by the DispatchBar.

**Step 3: Remove workforce-related state**

In `DispatchContent`, remove:
- `selectedAgent` state
- `selectedBackend` state
- `handleAssignAgent` callback
- `handleSelectBackend` callback

The agent is now handled inside DispatchBar (local state, passed up via `onDispatch` callback).

**Step 4: Import and integrate DispatchBar**

Import `DispatchBar` from `./dispatch-bar`. Place it as the last child of the backlog panel (after the scrollable task groups, before the closing `</div>`).

Wire it up:

```typescript
<DispatchBar
  selectedCount={selectedIds.size}
  selectedTaskTypes={selectedTaskTypes}
  activeBackend={activeBackend}
  backendAvailable={backendHealth?.available ?? false}
  roles={roles}
  dispatching={dispatching}
  onDispatch={(agent) => handleDispatch(agent)}
/>
```

**Step 5: Update handleDispatch to accept agent parameter**

Currently `handleDispatch` reads `selectedAgent` from state. Change it to accept `agent: string | null` as a parameter from the DispatchBar callback.

```typescript
const handleDispatch = useCallback(async (agent: string | null) => {
  if (selectedIds.size === 0) return
  setDispatching(true)

  const ids = [...selectedIds]
  const results = await Promise.allSettled(
    ids.map((taskId) =>
      fetch("/api/dispatch/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          mode,
          agent: agent === "none" ? null : agent,
        }),
      })
    )
  )
  // ... rest stays the same
}, [selectedIds, mode, router])
```

Note: backend is no longer sent in the request body — the API reads it from settings.

**Step 6: Change grid layout from 3-panel to 2-panel**

Update the grid container (~line 1170):

```typescript
// Before: grid-cols-12 with 3 + 5 + 4 column spans
// After: grid-cols-12 with 5 + 7 column spans
<div className="grid flex-1 grid-cols-12 gap-0 overflow-hidden">
  <BacklogPanel ... />  {/* col-span-5 */}
  <AssignmentsPanel ... />  {/* col-span-7 */}
</div>
```

Update `BacklogPanel` from `col-span-3` to `col-span-5`.
Update `AssignmentsPanel` from `col-span-5` to `col-span-7`.

Remove the `<WorkforcePanel ... />` JSX.

**Step 7: Simplify the toolbar**

Remove `QueueControls` from the toolbar. Keep:
- Left: `ModeSelector` (renamed in Session 4)
- Right: stats display (active/failed/today counts)

```typescript
<div className="flex shrink-0 items-center justify-between border-b border-[var(--color-dark-bronze)] px-4 py-2">
  <ModeSelector mode={mode} onModeChange={handleModeChange} />
  <div className="flex items-center gap-3 text-xs">
    {/* ... stats, same as current */}
  </div>
</div>
```

**Step 8: Update BacklogPanel to include DispatchBar**

The backlog panel needs to render DispatchBar as its last child, after the scrollable area:

```typescript
function BacklogPanel({ groups, selectedIds, onToggle, blockedTypes, dispatchBar }: {
  groups: TaskGroup[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  blockedTypes: string[]
  dispatchBar: React.ReactNode
}) {
  // ... existing group rendering ...
  return (
    <div className="col-span-5 flex flex-col overflow-hidden border-r border-[var(--color-dark-bronze)]">
      {/* Panel header */}
      {/* ... same as current ... */}

      {/* Groups — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* ... same as current ... */}
      </div>

      {/* Dispatch bar — sticky bottom */}
      {dispatchBar}
    </div>
  )
}
```

Pass the `<DispatchBar>` as a `dispatchBar` prop — this keeps the composition pattern clean (children over render props per composition skill guidelines).

**Step 9: Remove unused imports**

Remove imports that were only used by the deleted components: `BackendType` type, `BACKEND_META`, and any other now-orphaned imports.

**Step 10: Verify the page renders**

Run: `pnpm dev`, navigate to `/dispatch`
Expected: Two-panel layout with backlog (wider) + assignments. Dispatch bar at bottom of backlog. No workforce panel. Toolbar shows mode selector + stats only.

**Step 11: Commit**

```bash
git add packages/studio-ui/src/dispatch-content.tsx
git commit -m "feat(dispatch): rebuild as two-panel layout with inline dispatch bar"
```

---

### Task 10: Update dispatch loading skeleton

**Files:**
- Modify: `apps/studio/src/app/(studio)/dispatch/loading.tsx`
- May need to modify: the `DispatchSkeleton` component (find via `dispatch-skeleton` grep)

**Step 1: Update the skeleton to match two-panel layout**

The skeleton should show two panels (5+7 cols) instead of three (3+5+4).

**Step 2: Commit**

```bash
git add apps/studio/src/app/(studio)/dispatch/loading.tsx
git commit -m "fix(dispatch): update loading skeleton for two-panel layout"
```

---

## Session 4: Autonomy Level + Migration + Cleanup

### Task 11: Replace DispatchMode with AutonomyLevel in studio-core

**Files:**
- Modify: `packages/studio-core/src/dispatch.ts:15-55`

**Step 1: Replace the type**

```typescript
// Before:
export type DispatchMode = 'interactive' | 'supervised' | 'overnight'

// After:
export type AutonomyLevel = 'supervised' | 'autonomous'
```

**Step 2: Update DispatchConfig**

```typescript
// Before:
overnight: { blocked: TaskType[] }

// After:
autonomous: { blocked: TaskType[] }
```

**Step 3: Update DEFAULT_DISPATCH**

```typescript
// Before:
overnight: { blocked: ['code-implementation', 'architect'] }

// After:
autonomous: { blocked: ['code-implementation', 'architect'] }
```

**Step 4: Update function signatures**

- `resolveRoute()`: remove `_mode: DispatchMode` parameter (backend resolved from settings now)
- `isTaskTypeAllowed()`: change `mode: DispatchMode` → `autonomyLevel: AutonomyLevel`, change `mode !== 'overnight'` → `autonomyLevel !== 'autonomous'`
- `matchTasksToAgents()`: change `mode: DispatchMode` → `autonomyLevel: AutonomyLevel`

**Step 5: Verify typecheck**

Run: `pnpm check`
Expected: Errors in dispatch-content.tsx and page.tsx (expected — fixed in next tasks).

**Step 6: Commit**

```bash
git add packages/studio-core/src/dispatch.ts
git commit -m "feat(core): replace DispatchMode with AutonomyLevel type"
```

---

### Task 12: Update dispatch-content.tsx for autonomy level

**Files:**
- Modify: `packages/studio-ui/src/dispatch-content.tsx`

**Step 1: Replace ModeSelector with AutonomySelector**

Rename the component internally. Change from three options to two:

```typescript
type AutonomyLevel = "supervised" | "autonomous"

function AutonomySelector({
  level,
  onLevelChange,
}: {
  level: AutonomyLevel
  onLevelChange: (level: AutonomyLevel) => void
}) {
  const levels: { value: AutonomyLevel; label: string }[] = [
    { value: "supervised", label: "supervised" },
    { value: "autonomous", label: "autonomous" },
  ]
  // ... same segmented control pattern, just two buttons
}
```

**Step 2: Update GuardRailBanner text**

```typescript
// Before:
Overnight mode: code-implementation and architect tasks are blocked

// After:
Autonomous mode: code-implementation and architect tasks require supervised mode
```

**Step 3: Update state and handlers**

Rename `mode` → `autonomyLevel`, `setMode` → `setAutonomyLevel`, `handleModeChange` → `handleAutonomyChange` throughout the component.

Update blocked types check:

```typescript
// Before:
const blockedTypes = mode === "overnight" ? OVERNIGHT_BLOCKED : []

// After:
const AUTONOMOUS_BLOCKED: string[] = ["code-implementation", "architect"]
const blockedTypes = autonomyLevel === "autonomous" ? AUTONOMOUS_BLOCKED : []
```

**Step 4: Update URL param**

```typescript
// Before:
params.set("mode", newMode)

// After:
params.set("autonomy", newLevel)
```

**Step 5: Update props interface**

```typescript
// Before:
initialMode?: DispatchMode

// After:
initialAutonomy?: AutonomyLevel
```

**Step 6: Verify typecheck**

Run: `pnpm check`
Expected: PASS (or errors only in page.tsx — fixed next).

**Step 7: Commit**

```bash
git add packages/studio-ui/src/dispatch-content.tsx
git commit -m "feat(dispatch): replace mode selector with supervised/autonomous autonomy levels"
```

---

### Task 13: Update dispatch page.tsx for autonomy level

**Files:**
- Modify: `apps/studio/src/app/(studio)/dispatch/page.tsx`

**Step 1: Update mode validation**

```typescript
// Before:
const VALID_MODES = ["interactive", "supervised", "overnight"] as const
type DispatchMode = (typeof VALID_MODES)[number]

// After:
const VALID_LEVELS = ["supervised", "autonomous"] as const
type AutonomyLevel = (typeof VALID_LEVELS)[number]
```

**Step 2: Update search params handling**

```typescript
// Before:
const mode: DispatchMode = ... params.mode ...

// After:
const autonomy: AutonomyLevel = (VALID_LEVELS as readonly string[]).includes(
  params.autonomy ?? ""
) ? (params.autonomy as AutonomyLevel) : "supervised"
```

**Step 3: Update DispatchContent props**

```typescript
<DispatchContent
  tasks={tasks}
  roles={roles}
  activeBackend={settings.activeBackend}
  backendHealth={activeHealth}
  initialAutonomy={autonomy}
/>
```

**Step 4: Verify full build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add apps/studio/src/app/(studio)/dispatch/page.tsx
git commit -m "feat(dispatch): update page to use AutonomyLevel"
```

---

### Task 14: Update shell scripts

**Files:**
- Modify: `scripts/worker.sh:60,66,94-98`
- Modify: `scripts/resolve-route.mjs:37,56`

**Step 1: Update worker.sh**

At line 60, the script extracts `mode` from frontmatter. Keep reading the field but rename the variable:

```bash
# Line 60: keep reading 'mode' from legacy frontmatter for backwards compat
AUTONOMY=$(extract mode)
# Line 66: default
AUTONOMY="${AUTONOMY:-supervised}"
```

At lines 94-98, update the guard rail:

```bash
# Before:
if [[ "$MODE" == "overnight" ]]; then
  if [[ "$TASK_TYPE" == "code-implementation" || "$TASK_TYPE" == "architect" ]]; then
    echo "ERROR: Mode 'overnight' cannot run task-type '$TASK_TYPE'..." >&2

# After:
if [[ "$AUTONOMY" == "autonomous" ]]; then
  if [[ "$TASK_TYPE" == "code-implementation" || "$TASK_TYPE" == "architect" ]]; then
    echo "ERROR: Autonomous mode cannot run task-type '$TASK_TYPE'. These types require supervised mode." >&2
```

Also update line 72 where MODE is passed to resolve-route.mjs — pass AUTONOMY instead.

**Step 2: Update resolve-route.mjs**

At line 37: `let mode = 'supervised'` → `let autonomy = 'supervised'`
At line 56: update the overnight check to autonomous.

**Step 3: Verify dispatch still works**

Run: `./scripts/worker.sh --help` (or a dry test if available)
Expected: No bash syntax errors.

**Step 4: Commit**

```bash
git add scripts/worker.sh scripts/resolve-route.mjs
git commit -m "feat(scripts): update worker and route resolver for autonomy levels"
```

---

### Task 15: Migrate task file frontmatter

**Files:**
- Modify: 24 task files in `docs/tasks/*.md`
- Modify: `docs/tasks/README.md`

**Step 1: Script the migration**

Run a sed command to update all task files. Since all 24 use `mode: supervised`:

```bash
# Preview first
grep -l "^mode: supervised" docs/tasks/*.md | head -5

# Apply
for f in docs/tasks/*.md; do
  sed -i '' 's/^mode: supervised/mode: supervised/' "$f"
done
```

Actually, the field value `supervised` stays the same — only the concept changed. The task files can keep `mode: supervised` for now (worker.sh reads the field as-is). If we want to rename the field to `autonomy-level:`, that's a larger migration touching task-scanner.mjs too.

**Decision: keep `mode:` field name in task frontmatter for backwards compatibility.** Worker.sh reads it regardless of the field name. The conceptual rename is in the UI and types only. This avoids touching 24 files + task-scanner.mjs.

**Step 2: Update README schema docs**

In `docs/tasks/README.md`, update the mode documentation:

```markdown
# Before:
mode: interactive | supervised | overnight

# After:
mode: supervised | autonomous
```

**Step 3: Commit**

```bash
git add docs/tasks/README.md
git commit -m "docs(tasks): update mode schema to supervised/autonomous"
```

---

### Task 16: End-to-end verification

**Step 1: Verify dispatch page**

Run: `pnpm dev`
Navigate to `/dispatch`:
- [ ] Two-panel layout renders (backlog left, assignments right)
- [ ] Dispatch bar is visible at bottom of backlog
- [ ] Dispatch bar shows "No tasks selected" with disabled button when nothing selected
- [ ] Selecting tasks updates count and enables button
- [ ] Agent dropdown defaults to "Default (no role)"
- [ ] Clicking Dispatch with default agent works (dispatches without agent)
- [ ] Autonomy selector shows supervised/autonomous
- [ ] Switching to autonomous dims code-impl and architect tasks
- [ ] Guard rail banner appears in autonomous mode
- [ ] Backend chip shows "via openclaw" (or active backend) with health dot

**Step 2: Verify settings page**

Navigate to `/settings`:
- [ ] Active backend section shows two radio cards
- [ ] Current active backend is highlighted
- [ ] Switching backend updates the setting
- [ ] Health section shows connection status for both backends
- [ ] Check Health button triggers re-probe

**Step 3: Verify sidebar**

- [ ] Settings link appears in System group
- [ ] Active state works when on /settings

**Step 4: Full build**

Run: `pnpm build`
Expected: Build succeeds with no errors.

**Step 5: Final commit**

```bash
git commit -m "test(dispatch): verify end-to-end dispatch evolution"
```

---

## Post-Implementation Seeds

These are out of scope for this initiative but surfaced during design and stress testing:

1. **Wire agent roles into worker.sh** — currently agent selection is metadata only. A follow-on initiative could inject behavioral role definitions into agent context at dispatch time.
2. **Auto-dispatch** — the current placeholder button was dropped. Build it as a separate feature when the matching algorithm (`matchTasksToAgents`) is validated.
3. **Settings page expansion** — add dispatch routing rules, agent defaults, and AI Gateway configuration as tabs when those initiatives land.
4. **Task frontmatter field rename** — rename `mode:` to `autonomy-level:` across all task files and task-scanner.mjs if we want full consistency. Low priority — the current approach works.
